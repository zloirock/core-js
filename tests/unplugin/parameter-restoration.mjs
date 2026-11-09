// Printing and TS lowering must retain both signature syntax and parameter-property effects.
import { createRequire } from 'node:module';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import createPlugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';

const require = createRequire(import.meta.url);
const { transformAsync } = require('@babel/core');

const { check, checkTruthy, finish } = createChecker('unplugin-parameter-restoration');
const root = join(import.meta.dirname, '../transpiler-differential/tmp');
await mkdir(root, { recursive: true });
const dir = await mkdtemp(join(root, 'parameters-'));
let fileIndex = 0;
try {
  for (const [name, source, want] of [
    ['rest', 'const xs = [(n: number) => n + 1]; export const r = (xs as Array<(...args: number[]) => number>).at(-1)!(2);', 3],
    ['array', 'const make = ([a, b]: number[]) => [a, b]; export const r = (make as ([a, b]: number[]) => number[])([3, 4]).at(-1);', 4],
    ['object', 'const make = ({ value }: { value: number }) => [value]; export const r = (make as ({ value }: { value: number }) => number[])({ value: 5 }).at(-1);', 5],
    ['nested', 'const xs = [(f: (...args: number[]) => number) => f(2)];'
      + ' export const r = (xs as Array<(f: (...args: number[]) => number) => number>).at(0)!((x: number) => x + 1);', 3],
    ['property', 'export const r = new (class { constructor(public readonly xs: number[] '
      + '= (effects.push("default"), Array.from([1, 2]))) {} })().xs.at(-1);', 2],
  ]) {
    const input = `export const effects: string[] = []; ${ source }`;
    scenarioSource(input);
    const expected = `OK|${ want }|${ name === 'property' ? '["default"]' : '[]' }`;
    for (const phase of ['native', 'single', 'pre+post']) {
      let output = input;
      if (phase !== 'native') {
        const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
        for (const pass of phase === 'single' ? ['single'] : ['pre', 'post']) {
          output = plugin.transform(output, '/params.ts', pass)?.code ?? output;
        }
        checkTruthy(`${ name }/${ phase }/injection`, output.includes('@core-js/pure/'));
        if (name === 'array') checkTruthy(`${ name }/${ phase }/type pattern`, /as\s*\(\[a, b\]: number\[\]\)/.test(output));
        else if (name === 'object') checkTruthy(`${ name }/${ phase }/type pattern`, /as\s*\(\{\s*value\s*\}/.test(output));
      }
      const lowered = await transformAsync(output, {
        configFile: false, babelrc: false, filename: 'params.ts', plugins: [require.resolve('@babel/plugin-transform-typescript')],
      });
      const file = join(dir, `case-${ fileIndex++ }.mjs`);
      await writeFile(file, lowered.code);
      check(`${ name }/${ phase }/runtime`, await runInWorker(file, { strip: false }), expected);
      if (phase !== 'native') check(`${ name }/${ phase }/stripped runtime`, await runInWorker(file, { strip: true }), expected);
    }
  }
} finally {
  await rm(dir, { recursive: true, force: true });
}
finish();
