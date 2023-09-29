<p align="center">
   <b>Using this package?</b> Please consider <a href="https://github.com/sponsors/arthurfiorette" target="_blank">donating</a> to support my open source work ❤️
  <br />
  <sup>
   Help @kitajs/ts-html-plugin grow! Star and share this amazing repository with your friends and co-workers!
  </sup>
</p>

<br />

<p align="center" >
  <a href="https://kita.js.org" target="_blank" rel="noopener noreferrer">
    <img src="https://kita.js.org/logo.png" width="180" alt="Kita JS logo" />
  </a>
</p>

<br />

<div align="center">
  <a title="MIT license" target="_blank" href="https://github.com/kitajs/ts-html-plugin/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/github/license/kitajs/ts-html-plugin"></a>
  <a title="NPM Package" target="_blank" href="https://www.npmjs.com/package/@kitajs/ts-html-plugin"><img alt="Downloads" src="https://img.shields.io/npm/dw/@kitajs/ts-html-plugin?style=flat"></a>
  <a title="Bundle size" target="_blank" href="https://bundlephobia.com/package/@kitajs/ts-html-plugin@latest"><img alt="Bundlephobia" src="https://img.shields.io/bundlephobia/minzip/@kitajs/ts-html-plugin/latest?style=flat"></a>
  <a title="Last Commit" target="_blank" href="https://github.com/kitajs/ts-html-plugin/commits/master"><img alt="Last commit" src="https://img.shields.io/github/last-commit/kitajs/ts-html-plugin"></a>
  <a href="https://github.com/kitajs/ts-html-plugin/stargazers"><img src="https://img.shields.io/github/stars/kitajs/ts-html-plugin?logo=github&label=Stars" alt="Stars"></a>
</div>

<br />
<br />

<h1>🏛️ KitaJS TypeScript Html Plugin</h1>

<p align="center">
  <code>@kitajs/ts-html-plugin</code> is a CLI tool & TypeScript LSP for finding XSS vulnerabilities in your TypeScript code.
  <br />
  <br />
</p>

<br />

- [Installing](#installing)
- [Getting Started](#getting-started)
- [Running as CLI](#running-as-cli)
- [Vscode](#vscode)
- [JSX](#jsx)

<br />
<br />

## Installing

```sh
npm install @kitajs/ts-html-plugin
```

<br />

## Getting Started

Install `@kitajs/ts-html-plugin` alongside with `@kitajs/ts-html-plugin` with your
favorite package manager, and put this inside your `tsconfig.json`.

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

[Make sure to understand what language service plugins can and cannot do.](https://github.com/microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin#whats-a-language-service-plugin)

<br />

## Running as CLI

You can also run this project as a CLI tool. Which is a great way to ensue project-wide
security. Also it's a great way to integrate with your CI/CD pipeline.

```sh
npm install -g @kitajs/ts-html-plugin
```

```sh
ts-html-plugin v1.1.1 - A CLI tool & TypeScript LSP for finding XSS vulnerabilities in your TypeScript code.

Usage: xss-scan         [options]
       ts-html-plugin   [options]

Options:
  --cwd <path>      The current working directory to use (defaults to process.cwd())
  --project <path>  The path to the tsconfig.json file to use (defaults to 'tsconfig.json')
  --help            Show this help message
  --version         Show the version number
  <file> <file>...  The files to check (defaults to all files in tsconfig.json)

Examples:
  $ xss-scan
  $ xss-scan --cwd src
  $ xss-scan --project tsconfig.build.json
  $ xss-scan src/index.tsx src/App.tsx

Exit codes:
  0 - No XSS vulnerabilities were found
  1 - XSS vulnerabilities were found
  2 - Only XSS warnings were found
```

<br />

## Vscode

If you are using vscode and this plugin is not working properly, make sure to use the
current project's typescript version.

```jsonc
// .vscode/settings.json

{
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

<br />

## JSX

For JSX support, please go to [kitajs/html](https://github.com/kitajs/html) for more
information.

<br />
