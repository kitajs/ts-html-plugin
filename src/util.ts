import { JsxFragment } from 'typescript';
import type {
  Diagnostic,
  JsxElement,
  JsxOpeningElement,
  Node,
  default as TS,
  Type,
  TypeChecker
} from 'typescript/lib/tsserverlibrary';
import * as Errors from './errors';

const UPPERCASE = /[A-Z]/;
const ESCAPE_HTML_REGEX = /^(\w+\.)?escapeHtml/i;

/**
 * If the node is a JSX element or fragment
 */
export function isJsx(ts: typeof TS, node: TS.Node): node is JsxElement | JsxFragment {
  return (
    node.kind === ts.SyntaxKind.JsxElement || node.kind === ts.SyntaxKind.JsxFragment
  );
}

export function recursiveDiagnoseJsxElements(
  ts: typeof TS,
  node: Node,
  typeChecker: TypeChecker,
  original: Diagnostic[]
) {
  ts.forEachChild(node, function loopSourceNodes(node) {
    // Recurse through children first
    ts.forEachChild(node, loopSourceNodes);

    // Adds children to the array
    if (isJsx(ts, node)) {
      // Diagnose the node
      diagnoseJsxElement(ts, node, typeChecker, original);
    }
  });
}

export function diagnoseJsxElement(
  ts: typeof TS,
  node: JsxElement | JsxFragment,
  typeChecker: TypeChecker,
  diagnostics: Diagnostic[]
): void {
  const file = node.getSourceFile();

  const safeAttribute = ts.isJsxElement(node) && getSafeAttribute(node.openingElement);

  // Safe mode warnings
  if (safeAttribute) {
    if (
      // Empty element
      node.children.length === 0 ||
      // Only text elements
      (node.children.length === 1 && node.children[0]!.kind === ts.SyntaxKind.JsxText)
    ) {
      diagnostics.push({
        category: ts.DiagnosticCategory.Warning,
        code: Errors.UnusedSafe.code,
        file,
        length: safeAttribute.end - safeAttribute.pos - 1,
        messageText: Errors.UnusedSafe.message,
        start: safeAttribute.pos + 1
      });

      return;
    }

    for (const exp of node.children) {
      if (
        // JSX Element inside safe
        ts.isJsxElement(exp) ||
        // Element is using safe with escapeHtml
        (ts.isJsxExpression(exp) && exp.expression?.getText().match(ESCAPE_HTML_REGEX))
      ) {
        diagnostics.push({
          category: ts.DiagnosticCategory.Error,
          code: Errors.DoubleEscape.code,
          file,
          length: exp.end - exp.pos,
          messageText: Errors.DoubleEscape.message,
          start: exp.pos
        });

        continue;
      }

      // Warn on unnecessary safe attributes
      if (
        ts.isJsxExpression(exp) &&
        // has inner expression
        exp.expression &&
        // is expression safe
        isSafeAttribute(
          ts,
          typeChecker.getTypeAtLocation(exp.expression!),
          exp.expression!,
          typeChecker
        ) &&
        // does not starts with unsafe
        !exp.expression.getText().startsWith('unsafe') &&
        // Avoids double warnings
        !diagnostics.some((d) => d.start === safeAttribute.pos + 1 && d.file === file)
      ) {
        diagnostics.push({
          category: ts.DiagnosticCategory.Warning,
          code: Errors.UnusedSafe.code,
          file,
          length: safeAttribute.end - safeAttribute.pos - 1,
          messageText: Errors.UnusedSafe.message,
          start: safeAttribute.pos + 1
        });

        continue;
      }
    }

    return;
  }

  // Look for expressions
  for (const exp of node.children) {
    if (!ts.isJsxExpression(exp)) {
      continue;
    }

    // Should always have an expression
    if (!exp.expression) {
      continue;
    }

    const type = typeChecker.getTypeAtLocation(exp.expression);

    // Safe can be ignored
    if (isSafeAttribute(ts, type, exp.expression, typeChecker)) {
      continue;
    }

    // Arrays should be handled by the recursive function
    if (typeChecker.isArrayLikeType(type)) {
      let hasInnerJsx = false;

      ts.forEachChild(exp.expression, function loopSourceNodes(node) {
        // Check first to early exit
        if (isJsx(ts, node)) {
          hasInnerJsx = true;
          return;
        }

        ts.forEachChild(node, loopSourceNodes);
      });

      // Skips diagnostics if there is an inner JSX element
      if (hasInnerJsx) {
        continue;
      }
    }

    // Switch between component and element xss errors
    const error =
      ts.isJsxFragment(node) || node.openingElement.tagName.getText().match(UPPERCASE)
        ? Errors.ComponentXss
        : Errors.Xss;

    diagnostics.push({
      category: ts.DiagnosticCategory.Error,
      code: error.code,
      file,
      length: exp.end - exp.pos,
      messageText: error.message,
      start: exp.pos
    });
  }

  return;
}

export function isSafeAttribute(
  ts: typeof TS,
  type: Type | undefined,
  expression: Node,
  checker: TypeChecker
): boolean {
  // Nothing to do if type cannot be resolved
  if (!type) {
    return true;
  }

  // Any type is never safe
  if (type.flags & ts.TypeFlags.Any) {
    return false;
  }

  if (type.aliasSymbol) {
    // Allows JSX.Element
    if (
      type.aliasSymbol.escapedName === 'Element' &&
      // @ts-expect-error - Fast way of checking
      type.aliasSymbol.parent?.escapedName === 'JSX' &&
      // Only allows in .map() or other method calls
      ts.isCallExpression(expression)
    ) {
      return true;
    }

    // Allows Html.Children
    if (
      type.aliasSymbol.escapedName === 'Children' &&
      // @ts-expect-error - Fast way of checking
      type.aliasSymbol.parent?.escapedName === 'Html'
    ) {
      return true;
    }
  }

  // Union types should be checked recursively
  if (type.isUnion()) {
    return (type as TS.UnionType).types.every((t) =>
      isSafeAttribute(ts, t, expression, checker)
    );
  }

  // For Array or Promise, we check the type of the first generic
  if (checker.isArrayType(type) || type.symbol?.escapedName === 'Promise') {
    return isSafeAttribute(
      ts,
      (type as any).resolvedTypeArguments?.[0],
      expression,
      checker
    );
  }

  // We allow literal string types here, as if they have XSS content,
  // the user has explicitly written it
  if (
    // Non string types cannot have XSS values
    !(type.flags & ts.TypeFlags.String) &&
    // Objects may have toString() overridden
    !(type.flags & ts.TypeFlags.Object)
  ) {
    return true;
  }

  const text = expression.getText();

  if (
    // Variables starting with safe are suppressed
    text.startsWith('safe') ||
    // Starts with a call to a escapeHtml function name
    text.match(ESCAPE_HTML_REGEX)
  ) {
    return true;
  }

  return false;
}

export function getSafeAttribute(element: JsxOpeningElement) {
  for (const attribute of element.attributes.properties) {
    if (attribute.getText() === 'safe') {
      return attribute;
    }
  }

  return undefined;
}

export function proxyObject<T extends object>(obj: T): T {
  const proxy: T = Object.create(null);

  for (let k of Object.keys(obj) as Array<keyof T>) {
    const x = obj[k]!;
    // @ts-expect-error - JS runtime trickery which is tricky to type tersely
    proxy[k] = (...args: Array<{}>) => x.apply(obj, args);
  }

  return proxy;
}
