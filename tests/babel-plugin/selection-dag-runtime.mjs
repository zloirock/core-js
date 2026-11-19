// A selected callee returning nested containers keeps its native static read.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('selection-dag-native-control');
const tmp = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(tmp);
const dir = await fs.mkdtemp(path.join(tmp, 'selection-dag-'));
let serial = 0;
try {
  for (const flag of [false, true]) for (const rebuilt of [false, true]) {
    let setup = 'function x0() { return { a: Array }; } function x1() { return { a: Array }; }';
    for (let index = 0; index < 4; index++) setup += `function x${ index + 2 }() { return { a: (flag ? x${ index + 1 } : x${ index })() }; }`;
    const claim = 'x5().a.a.a.a.a.from((log.push("argument"), [3]))[0]';
    const source = `const log = []; const flag = JSON.parse('${ flag }'); ${ setup }
      let r; try { ${ rebuilt ? `const out = []; out.push(${ claim }); r = out[0];` : `r = ${ claim };` } }
      catch (error) { r = error.name; } export { r }; export const effects = log;`;
    scenarioSource(source);
    const outputs = [['native', source]];
    for (const method of ['usage-global', 'usage-pure']) {
      const options = { method, version: '4.0', targets: { ie: 11 } };
      const { code } = await transformAsync(source, { configFile: false, babelrc: false, plugins: [[babelPlugin, options]] });
      const plugin = createUnplugin(options);
      const single = createUnplugin(options).transform(source, 'input.mjs')?.code ?? source;
      const pre = plugin.transform(source, 'input.mjs', 'pre')?.code ?? source;
      const post = plugin.transform(pre, 'input.mjs', 'post')?.code ?? pre;
      outputs.push([`${ method }/babel`, code], [`${ method }/unplugin`, single], [`${ method }/pre+post`, post]);
    }
    for (const [host, output] of outputs) {
      const file = path.join(dir, `case-${ serial++ }.mjs`);
      await fs.writeFile(file, output);
      const effects = JSON.stringify(flag ? ['argument'] : []);
      check(`${ flag }/${ rebuilt }/${ host }/full`, await runInWorker(file, { strip: false }),
        `OK|${ JSON.stringify(flag ? 3 : 'TypeError') }|${ effects }`);
      check(`${ flag }/${ rebuilt }/${ host }/stripped`, await runInWorker(file), `OK|"TypeError"|${ effects }`);
    }
  }
} finally {
  await fs.remove(dir);
}
finish();
