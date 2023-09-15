<br />

[![Issues](https://img.shields.io/github/issues/kitajs/ts-html-plugin?logo=github&label=Issues)](https://github.com/kitajs/ts-html-plugin/issues)
[![Stars](https://img.shields.io/github/stars/kitajs/ts-html-plugin?logo=github&label=Stars)](https://github.com/kitajs/ts-html-plugin/stargazers)
[![License](https://img.shields.io/github/license/kitajs/ts-html-plugin?logo=githu&label=License)](https://github.com/kitajs/ts-html-plugin/blob/master/LICENSE)
[![Speed Blazing](https://img.shields.io/badge/speed-blazing%20%F0%9F%94%A5-brightgreen.svg)](https://twitter.com/acdlite/status/974390255393505280)

[![Latest Version](https://img.shields.io/npm/v/@kitajs/ts-html-plugin)](https://www.npmjs.com/package/@kitajs/ts-html-plugin)
[![Downloads](https://img.shields.io/npm/dw/@kitajs/ts-html-plugin)](https://www.npmjs.com/package/@kitajs/ts-html-plugin)
[![JsDelivr](https://data.jsdelivr.com/v1/package/npm/@kitajs/ts-html-plugin/badge?style=rounded)](https://www.jsdelivr.com/package/npm/@kitajs/ts-html-plugin)
[![Bundlephobia](https://img.shields.io/bundlephobia/minzip/@kitajs/ts-html-plugin/latest?style=flat)](https://bundlephobia.com/package/@kitajs/ts-html-plugin@latest)
[![Packagephobia](https://packagephobia.com/badge?p=@kitajs/ts-html-plugin@latest)](https://packagephobia.com/result?p=@kitajs/ts-html-plugin@latest)

<br />

<div align="center">
  <pre>
  <h1>🏛️<br />KitaJS Html TS Plugin</h1>
  </pre>
  <br />
</div>

<h3 align="center">
  <code>@kitajs/ts-html-plugin</code> provides a Typescript LSP plugin to catch XSS vulnerabilities.
  <br />
  <br />
</h3>

<br />

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Installing](#installing)
- [Getting Started](#getting-started)
- [JSX](#jsx)

<br />

## Installing

```sh
npm install @kitajs/html @kitajs/ts-html-plugin # or yarn add @kitajs/html @kitajs/ts-html-plugin
```

<br />

## Getting Started

Install `@kitajs/ts-html-plugin` alongside with `@kitajs/html` with your favorite package
manager, and put this inside your `tsconfig.json`.

```jsonc
// tsconfig.json

{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "Html.createElement",
    "jsxFragmentFactory": "Html.Fragment",
    "plugins": [{ "name": "@kitajs/ts-html-plugin" }]
  }
}
```

<br />

## JSX

For JSX support, please go to [kitajs/html](https://github.com/kitajs/html) for more
information.

<br />
