export const Xss = {
  code: 27022005,
  message:
    'Usage of JSX expression without safe attribute. This could lead to XSS vulnerabilities. Please use the safe attribute on the JSX element or prepend your variable with `safe`.'
};

export const DoubleEscape = {
  code: 16061999,
  message:
    'You are using the safe attribute on a JSX element whose children contains other JSX elements. It will lead to double escaping. If this is intended behavior, please extract the children into a separate variable and use that instead.'
};

export const UnusedSafe = {
  code: 17091977,
  message:
    'You are using the safe attribute on expressions that does not contain any XSS vulnerabilities. Please remove the safe attribute or prepend your variable with `unsafe`.'
};

export const ComponentXss = {
  code: 27061977,
  message:
    'You are using a xss-prone element as a children of a component. Please wrap it into a Html.escapeHtml() call or prepend it as a variable starting with `safe`.'
};
