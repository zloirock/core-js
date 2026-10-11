// A write through a chain of wrappers re-homes onto the container the chain ends at one wrapper level per round,
// and a chain longer than the rounds the census takes names nothing past them: the containers its records would
// still reach are left unnamed instead of serving their literal's stale slot. The chains below run through both
// emitters in both usage methods - within the ceiling, just past it and far past it - and the read off the chain's
// end owes the written constructor whichever way: usage-global loads its static, usage-pure leaves the read
// unserved and the constructor on the entry that carries its statics. A chain no record moves along stays named
import { transformAsync } from '@babel/core';
import plugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { createChecker } from './harness.mjs';

const { check, finish } = createChecker('wrapper-chain-depth');

// `c<n>` wraps `c<n - 1>` down to `c0`, which holds `Object`; the write either goes down the whole chain or lands
// on a container no chain holds
function chain(levels, writeThrough) {
  const lines = ['const c0 = { C: Object };', 'const spare = { C: Object };'];
  for (let level = 1; level <= levels; level++) lines.push(`const c${ level } = { next: c${ level - 1 } };`);
  lines.push(
    writeThrough ? `c${ levels }${ '.next'.repeat(levels) }.C = Map;` : 'spare.C = Map;',
    'export const grouped = c0.C.groupBy(list, pick);',
    'export const kept = spare.C;',
  );
  return lines.join('\n');
}

async function transformBoth(source, method) {
  const options = { method, version: '4.0', targets: { ie: 11 } };
  const babel = (await transformAsync(source, {
    filename: 'chain.mjs', configFile: false, babelrc: false, plugins: [[plugin, options]],
  })).code;
  const unplugin = createUnplugin(options).transform(source, 'chain.mjs')?.code ?? source;
  return { babel, unplugin };
}

for (const levels of [16, 65, 130]) {
  const global = await transformBoth(chain(levels, true), 'usage-global');
  const pure = await transformBoth(chain(levels, true), 'usage-pure');
  for (const [emitter, code] of Object.entries(global)) {
    check(`usage-global/${ emitter }: a write down ${ levels } wrappers loads the written static`,
      code.includes('import "core-js/modules/es.map.group-by";'), true);
  }
  for (const [emitter, code] of Object.entries(pure)) {
    check(`usage-pure/${ emitter }: a read off the end of ${ levels } written wrappers is not served by name`,
      code.includes('_Object$groupBy'), false);
    check(`usage-pure/${ emitter }: the constructor written down ${ levels } wrappers keeps its statics`,
      /import _Map from "@core-js\/pure\/actual\/map";/.test(code), true);
  }
}

// ... and a chain past the ceiling that carries no write keeps its literal's slot named
const unwritten = await transformBoth(chain(130, false), 'usage-pure');
for (const [emitter, code] of Object.entries(unwritten)) {
  check(`usage-pure/${ emitter }: a read off the end of 130 unwritten wrappers is served by name`,
    code.includes('export const grouped = _Object$groupBy(list, pick);'), true);
}

finish();
