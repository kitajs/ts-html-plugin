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
    if (ts.isJsxElement(node)) {
      // Diagnose the node
      diagnoseJsxElement(ts, node, typeChecker, original);
    }
  });
}

export function diagnoseJsxElement(
  ts: typeof TS,
  node: JsxElement,
  typeChecker: TypeChecker,
  diagnostics: Diagnostic[]
): void {
  const file = node.getSourceFile();

  const safeAttribute = getSafeAttribute(node.openingElement);

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
      // JSX Element inside safe
      if (ts.isJsxElement(exp)) {
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
          exp.expression!
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
    if (isSafeAttribute(ts, type, exp.expression)) {
      continue;
    }

    // Arrays should be handled by the recursive function
    if (typeChecker.isArrayLikeType(type)) {
      let hasInnerJsx = false;

      ts.forEachChild(exp.expression, function loopSourceNodes(node) {
        // Check first to early exit
        if (ts.isJsxElement(node)) {
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

    diagnostics.push({
      category: ts.DiagnosticCategory.Error,
      code: Errors.Xss.code,
      file,
      length: exp.end - exp.pos,
      messageText: Errors.Xss.message,
      start: exp.pos
    });
  }

  return;
}

export function isSafeAttribute(ts: typeof TS, type: Type, expression: Node) {
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

  // Variables starting with safe are suppressed
  if (expression.getText().startsWith('safe')) {
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
