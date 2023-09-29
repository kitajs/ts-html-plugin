#!/usr/bin/env node

import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { recursiveDiagnoseJsxElements } from './util';

const { version } = require('../package.json');

const help = `

ts-html-plugin v${version} - A CLI tool & TypeScript LSP for finding XSS vulnerabilities in your TypeScript code.

Usage: xss-scan         [options] <file> <file>...
       ts-html-plugin   [options] <file> <file>...

Options:
  --cwd <path>          The current working directory to use (defaults to process.cwd())
  -p, --project <path>  The path to the tsconfig.json file to use (defaults to 'tsconfig.json')
  -h, --help            Show this help message
  --version             Show the version number
  <file> <file>...      The files to check (defaults to all files in tsconfig.json)

Examples:
  $ xss-scan
  $ xss-scan --cwd src
  $ xss-scan --project tsconfig.build.json
  $ xss-scan src/index.tsx src/App.tsx

Exit codes:
  0 - No XSS vulnerabilities were found
  1 - XSS vulnerabilities were found
  2 - Only XSS warnings were found
`.trim();

function readCompilerOptions(tsconfigPath: string) {
  const { config, error } = ts.readConfigFile(tsconfigPath, ts.sys.readFile);

  if (error) {
    throw error;
  }

  const { options, errors, fileNames } = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    path.dirname(tsconfigPath),
    undefined,
    tsconfigPath
  );

  if (errors.length) {
    return { errors };
  }

  return { options, fileNames, errors: undefined };
}

function prettyPrintDiagnostics(diagnostics: ts.Diagnostic[], root: string) {
  // Prints an error message in the same way as tsc does

  for (const diagnostic of diagnostics) {
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

    if (!diagnostic.file) {
      console.error(diagnostic);
      continue;
    }

    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
      diagnostic.start!
    );

    let error = '';

    error += chalk.cyan(path.relative(root, diagnostic.file.fileName));
    error += ':';
    error += chalk.yellow(line + 1);
    error += ':';
    error += chalk.yellow(character + 1);
    error += ' - ';
    error += chalk.red('error');
    error += ' ';
    error += chalk.grey(`TS${diagnostic.code}:`);
    error += ' ';
    error += message;
    error += '\n\n';
    error += chalk.bgWhite.black(line + 1);
    error += ' ';
    error += diagnostic.file.text.split('\n')[line];
    error += '\n';
    error += chalk.bgWhite.black(' '.repeat((line + 1).toString().length));
    error += ' '.repeat(character + 1);
    error += chalk.red('~'.repeat(diagnostic.length!));
    error += '\n';

    console.error(error);
  }
}

function prettyPrintErrorCount(diagnostics: ts.Diagnostic[], root: string) {
  const files = new Map<string, number>();

  // Counts the amount of errors per file
  for (const diagnostic of diagnostics) {
    if (!diagnostic.file) {
      continue;
    }

    const file = files.get(diagnostic.file.fileName)!;

    if (file !== undefined) {
      files.set(diagnostic.file.fileName, file + 1);
      continue;
    }

    files.set(diagnostic.file.fileName, 1);
  }

  if (files.size > 1) {
    console.error(
      chalk.red(`Found a total of ${diagnostics.length} errors in ${files.size} files\n`)
    );
  }

  for (const [file, amount] of files.entries()) {
    console.error(
      chalk.red(
        `Found ${amount} error${amount === 1 ? '' : 's'} in ${path.relative(root, file)}`
      )
    );
  }
}

function fileExists(p: string) {
  try {
    fs.statSync(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = await yargs(hideBin(process.argv)).help(false).argv;

  if (args.help || args.h) {
    console.log(help);
    return process.exit(0);
  }

  // Detects unknown arguments
  for (const key in args) {
    if (key === '_' || key === '$0') {
      continue;
    }

    switch (key) {
      case 'cwd':
      case 'project':
      case 'p':
        continue;
      default:
        console.error(`Unknown argument: ${key}. Run --help for more information.`);
        return process.exit(1);
    }
  }

  const root = args.cwd ? String(args.cwd) : process.cwd();

  const tsconfigPath = String(args.project || args.p || 'tsconfig.json');

  if (!fileExists(tsconfigPath)) {
    console.error(`Could not find ${tsconfigPath}`);
    return process.exit(1);
  }

  const tsconfig = readCompilerOptions(tsconfigPath);

  if (tsconfig.errors) {
    prettyPrintDiagnostics(tsconfig.errors, root);
    return process.exit(1);
  }

  let files = tsconfig.fileNames;

  if (args._.length) {
    // Prefer the files passed as arguments, otherwise use the files in tsconfig.json
    files = [];

    for (let i = 0; i < args._.length; i++) {
      let file = String(args._[i]);

      if (!fileExists(file)) {
        console.error(chalk.red(`Could not find provided '${file}' file.`));
        return process.exit(1);
      }

      if (!file.match(/(t|j)sx$/)) {
        console.warn(chalk.yellow(`Provided '${file}' file is not a TSX/JSX file.`));
        continue;
      }

      files.push(file);
    }
  }

  const program = ts.createProgram(files, tsconfig.options);
  const typeChecker = program.getTypeChecker();
  const sources = program.getSourceFiles();

  const diagnostics: ts.Diagnostic[] = [];

  for (const source of sources) {
    const filename = source.fileName;

    // Not a tsx file, so don't do anything
    if (!filename.match(/(t|j)sx$/)) {
      continue;
    }

    ts.forEachChild(source, function loopSourceNodes(node) {
      recursiveDiagnoseJsxElements(ts as any, node, typeChecker, diagnostics);
    });
  }

  console.log();

  if (diagnostics.length) {
    const exitCode = diagnostics.some(
      (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error
    )
      ? 1
      : 2;

    prettyPrintDiagnostics(diagnostics, root);
    prettyPrintErrorCount(diagnostics, root);
    process.exit(exitCode);
  }

  console.log(chalk.green(`No XSS vulnerabilities found in ${files.length} files!`));
  process.exit(0);
}

main().catch(console.error);
