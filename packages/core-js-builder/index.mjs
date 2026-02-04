/* eslint-disable no-console -- output */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { styleText } from 'node:util';
import { build } from 'rolldown';
import { transform } from '@swc/core';
import compat from '@core-js/compat/compat.js';
import { banner, getRolldownOptions, MinifyOptions, ModernSyntax } from './config.mjs';

function normalizeSummary(unit = {}) {
  let size, modules;
  if (typeof unit != 'object') {
    size = modules = !!unit;
  } else {
    size = !!unit.size;
    modules = !!unit.modules;
  } return { size, modules };
}

function importIt(it) {
  return `import 'core-js/modules/${ it }.js';\n`;
}

function requireIt(it) {
  return `require('core-js/modules/${ it }');\n`;
}

function importModules(modules, format = 'esm') {
  return modules.map(format === 'esm' ? importIt : requireIt).join('');
}

export default async function ({
  modules = null,
  exclude = [],
  targets = null,
  format = 'bundle',
  minify = true,
  filename = null,
  summary = {},
} = {}) {
  if (!['bundle', 'cjs', 'esm'].includes(format)) throw new TypeError('Incorrect output type');

  summary = { comment: normalizeSummary(summary.comment), console: normalizeSummary(summary.console) };

  const TITLE = filename ?? '`core-js`';

  if (typeof TITLE != 'string') throw new TypeError('Incorrect filename');

  let script = banner;
  let code = '\n';

  const { list, targets: compatTargets } = compat({ targets, modules, exclude });

  if (list.length) {
    if (format === 'bundle') {
      const tempDir = join(dirname(fileURLToPath(import.meta.url)), '__tmp__');
      const tempFile = join(tempDir, `core-js-${ Math.random().toString(36).slice(2) }.js`);
      const templateFile = `${ tempFile }-template.js`;

      try {
        await mkdir(tempDir, { recursive: true });
        await writeFile(templateFile, importModules(list));

        await build(getRolldownOptions(templateFile, tempFile));

        code = String(await readFile(tempFile, 'utf8'));
      } finally {
        await rm(templateFile, { force: true });
        await rm(tempFile, { force: true });
      }

      const swcOptions = {};

      // rolldown helpers / wrappers contain es2015 syntax
      let syntax = ModernSyntax;

      if (targets) {
        syntax = compat({ targets, modules: syntax, __external: true }).list;
      }

      const swcTransforms = syntax.map(it => `transform-${ it }`);

      if (swcTransforms.length) Object.assign(swcOptions, {
        env: {
          include: swcTransforms,
        },
      });

      if (minify) Object.assign(swcOptions, MinifyOptions);

      if (swcTransforms.length || minify) {
        code = (await transform(code, swcOptions)).code;
      }

      // swc and rolldown considers output code as a module and drops 'use strict'
      code = `!function () { 'use strict'; ${ code } }();\n`;
    } else {
      code = importModules(list, format);
    }
  }

  if (summary.comment.size) script += `/*\n * size: ${ (code.length / 1024).toFixed(2) }KB */`;
  if (summary.comment.modules) script += `/*\n * modules:\n${ list.map(it => ` * ${ it }\n`).join('') } */`;
  if (code) script += `\n${ code }`;

  if (summary.console.size) {
    console.log(styleText('green', `bundling ${ styleText('cyan', TITLE) }, size: ${
      styleText('cyan', (script.length / 1024).toFixed(2))
    }KB`));
  }

  if (summary.console.modules) {
    console.log(styleText('green', `bundling ${ styleText('cyan', TITLE) }, modules:`));
    if (list.length) for (const it of list) {
      console.log(styleText('cyan', `${ it + (targets ? styleText('green', ` for ${ styleText('cyan', JSON.stringify(compatTargets[it])) }`) : '') }`));
    } else console.log(styleText('green', 'nothing'));
  }

  if (filename !== null && filename !== undefined) {
    await mkdir(dirname(filename), { recursive: true });
    await writeFile(filename, script);
  }

  return { script };
}
