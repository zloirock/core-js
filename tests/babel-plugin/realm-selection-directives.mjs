// A source directive owns the selecting host, including the early destructuring pass.
// Keep its absence fallback through printing, lowering and a second plugin pass.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { transformPrePost } from '../unplugin/phase-imports.mjs';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('realm-selection-directives');
const options = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const tmp = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(tmp);
const dir = await fs.mkdtemp(path.join(tmp, 'realm-selection-'));
let serial = 0;

async function checkOutput(name, directive, hostName, output) {
  check(`${ name }/${ directive }/${ hostName }/no self import`, /from ["'][^"']*\/self["']/.test(output), false);
  const { code: lowered } = await transformAsync(output, {
    configFile: false, babelrc: false, plugins: [requireBabel.resolve('@babel/plugin-transform-nullish-coalescing-operator')],
  });
  for (const [form, code] of [['printed', output], ['lowered', lowered]]) for (const present of [false, true]) {
    const setup = `${ directive === 'file' ? 'const realm = Function("return this")();' : '' }
Object.defineProperty(Function('return this')(), 'self', { configurable: true,
  value: ${ present ? "Function('return this')()" : 'undefined' } });\n`;
    const file = path.join(dir, `case-${ serial++ }.mjs`);
    await fs.outputFile(file, setup + code);
    for (const strip of [false, true]) {
      check(`${ name }/${ directive }/${ hostName }/${ form }/${ present }/${ strip }`,
        await runInWorker(file, { strip }), 'OK|3|[]');
    }
  }
}

try {
  for (const [name, selection] of [
    ['or', 'realm.self || realm'],
    ['nullish', 'realm.self ?? realm'],
    ['presence', 'typeof self !== "undefined" ? self : realm'],
  ]) for (const directive of ['next-line', 'line', 'file']) {
    const host = directive === 'line'
      ? `let M; ({ Math: M } = ${ selection }); // core-js-disable-line`
      : `${ directive === 'next-line' ? '// core-js-disable-next-line\n' : '' }const { Math: M } = ${ selection };`;
    // The file directive leaves even its root native, so a foreign prelude supplies that root.
    const source = `${ directive === 'file' ? '// core-js-disable-file\n' : 'const realm = globalThis;\n' }
export const effects = [];
function read() { ${ host }
  return M.max(1, 3);
}
export const r = read();`;
    scenarioSource(source);
    const { code: babel } = await transformAsync(source, {
      configFile: false, babelrc: false, filename: 'input.js', plugins: [[babelPlugin, options]],
    });
    const unplugin = createUnplugin(options).transform(source, 'input.js')?.code ?? source;
    const prepost = transformPrePost(createUnplugin(options), source, 'input.js')?.code ?? source;
    for (const [hostName, output] of [['babel', babel], ['unplugin', unplugin], ['prepost', prepost]]) {
      await checkOutput(name, directive, hostName, output);
    }
  }
} finally {
  await fs.remove(dir);
}
finish();
