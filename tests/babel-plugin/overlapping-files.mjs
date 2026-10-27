/* eslint-disable node/no-sync -- synchronous nested transforms test re-entry without async scheduling */
// Babel can interleave pre/traversal/post for files using the same cached plugin instance.
// Each file must keep its own late helper imports, directives and teardown state.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import corejsPlugin from '../../packages/core-js-babel-plugin/index.js';
import { createChecker } from '../polyfill-provider/harness.mjs';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { loadPartialConfigAsync, transformAsync, transformSync } = requireBabel('@babel/core');
const { check, checkDeep, finish } = createChecker('overlapping-files');
const lowerings = ['destructuring', 'block-scoping', 'modules-commonjs'].map(name => requireBabel.resolve(`@babel/plugin-transform-${ name }`));
const sources = [
  ['outer.mjs', 'export const [value] = new Set([41]);', 41],
  ['inner.mjs', 'export const value = [1, 2].includes(2);', true],
  ['disabled.mjs', '// core-js-disable-file\nexport const value = 3;', 3],
];

for (const method of ['usage-pure', 'usage-global', 'entry-global']) {
  const pluginOptions = { method, version: '4.0', targets: { ie: 11 } };
  const settings = { configFile: false, babelrc: false, plugins: [[corejsPlugin, pluginOptions], ...lowerings] };
  function sourceAt(index) {
    const [, source] = sources[index];
    if (method !== 'entry-global' || index === 2) return source;
    return `import 'core-js/es/${ index ? 'array/includes' : 'set' }';\n${ source }`;
  }
  async function transform(index) {
    const config = await loadPartialConfigAsync({ ...settings, filename: sources[index][0] });
    return (await transformAsync(sourceAt(index), config.options)).code;
  }
  const expected = [];
  for (let index = 0; index < sources.length; index++) expected.push(await transform(index));
  for (const order of [[0, 1, 2], [2, 1, 0]]) {
    const outputs = await Promise.all(order.map(transform));
    for (const [slot, index] of order.entries()) {
      check(`${ method }/${ order }/${ index }/output`, outputs[slot], expected[index]);
      const exports = {};
      runInNewContext(outputs[slot], { exports, require: requireBabel });
      check(`${ method }/${ order }/${ index }/runtime`, exports.value, sources[index][2]);
    }
  }
  checkDeep(`${ method }/reused state`, await Promise.all(sources.map((_, index) => transform(index))), expected);

  // A synchronous nested transform interrupts the same lifetime without async timing.
  let entered = false;
  let inner;
  function reentrant() {
    return { pre() {
      if (entered) return;
      entered = true;
      inner = transformSync(sourceAt(1), { ...nestedSettings, filename: 'inner.mjs' }).code;
    } };
  }
  const nestedSettings = { ...settings, plugins: [...settings.plugins, reentrant] };
  const outer = transformSync(sourceAt(0), { ...nestedSettings, filename: 'outer.mjs' }).code;
  check(`${ method }/nested outer`, outer, expected[0]);
  check(`${ method }/nested inner`, inner, expected[1]);

  function afterPost(api, options) {
    const state = corejsPlugin(api, options);
    const { exit } = state.visitor.Program;
    return { ...state, post(...args) {
      state.post.apply(this, args);
      exit.call(this, this.file.path, this);
    } };
  }
  const revisited = transformSync(sourceAt(0), { ...settings, filename: 'outer.mjs', plugins: [[afterPost, pluginOptions], ...lowerings] }).code;
  check(`${ method }/exit after teardown is inert`, revisited, expected[0]);

  for (const phase of ['pre', 'post']) {
    let fail = true;
    function failingSibling() {
      return { [phase]() { if (fail) throw new Error('sibling failure'); } };
    }
    const failedSettings = { ...settings, plugins: [...settings.plugins, failingSibling] };
    let message = '';
    try {
      transformSync(sourceAt(0), { ...failedSettings, filename: 'outer.mjs' });
    } catch (error) { message = error.message; }
    check(`${ method }/${ phase } failure reached`, message.includes('sibling failure'), true);
    fail = false;
    const recovered = transformSync(sourceAt(1), { ...failedSettings, filename: 'inner.mjs' }).code;
    check(`${ method }/${ phase } failure keeps the next file isolated`, recovered, expected[1]);
  }
}

// A context created after config evaluation uses the same inherited Babel targets.
const inherited = { configFile: false, babelrc: false, targets: { ie: '11' }, plugins: [[corejsPlugin, { method: 'usage-pure', version: '4.0' }], ...lowerings] };
async function inheritedOutput(index) {
  const config = await loadPartialConfigAsync({ ...inherited, filename: sources[index][0] });
  return (await transformAsync(sources[index][1], config.options)).code;
}
const expectedInherited = [await inheritedOutput(0), await inheritedOutput(1)];
checkDeep('concurrent contexts inherit targets', await Promise.all([inheritedOutput(0), inheritedOutput(1)]), expectedInherited);
check('inherited targets need the late helper', expectedInherited[0].includes('get-iterator-method'), true);

finish();
