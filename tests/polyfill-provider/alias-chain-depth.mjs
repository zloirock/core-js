// An alias chain opens one object-name, binding, reachable-value or branch-flatten walk per link, and a chain
// past the alias-chain ceiling names nothing more instead of exhausting the stack. The chains below run
// through both emitters past the depth the stack ran out at in each usage method - plain aliases off the
// realm, a realm hop per link, selections over the realm, a member path off a container. The decision itself
// answers per parser: a link within the ceiling names what the chain's root holds, one past it names nothing
import { transformAsync } from '@babel/core';
import plugin from '../../packages/core-js-babel-plugin/index.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { resolveObjectName } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { adapters, createChecker } from './harness.mjs';

const { check, checkTruthy, finish } = createChecker('alias-chain-depth');

const LINKS = 1500;
function links(count, link) {
  return Array.from({ length: count }, (unused, index) => link(index + 1, index)).join('\n');
}
const plain = `var a0 = globalThis;\n${ links(LINKS, (k, j) => `var a${ k } = a${ j };`) }\nexport const r = a${ LINKS }.Array.from(list);`;
const realmHop = `var a0 = globalThis;\n${ links(LINKS, (k, j) => `var a${ k } = a${ j }.self;`) }\nexport const r = a${ LINKS }.Array.from(list);`;
const realmSelection = `const s0 = globalThis;\n${ links(LINKS, (k, j) => `const s${ k } = c ? s${ j } : self;`) }
export const r = (s${ LINKS } || Object).fromEntries(list);`;
// a member path costs the most per link, so it runs shorter
const PATH_LINKS = 1200;
const memberPath = `const box = {};\nconst p0 = box.k;\n${ links(PATH_LINKS, (k, j) => `const p${ k } = p${ j }.k;`) }
p${ PATH_LINKS }.C = Map;\nArray.from(list);`;
// the census walks - the names an alias closure stands for, the values a name stores - recurse per link as
// well, and past this depth they ran out of stack
const CENSUS_LINKS = 3000;
const containerAlias = `const box = { C: Map };\nconst q0 = box;\n${ links(CENSUS_LINKS, (k, j) => `const q${ k } = q${ j };`) }
q${ CENSUS_LINKS }.D = Set;\nexport default box;`;
const storedAlias = `var m0 = Map;\n${ links(CENSUS_LINKS, (k, j) => `var m${ k } = m${ j };`) }
export const grouped = m${ CENSUS_LINKS }.groupBy(list, pick);`;
// each chain where its walk ran out of stack, in the method whose transform stays linear on it
const CASES = [
  ['usage-pure', 'plain', plain],
  ['usage-global', 'plain', plain],
  ['usage-global', 'realmHop', realmHop],
  ['usage-global', 'realmSelection', realmSelection],
  ['usage-global', 'memberPath', memberPath],
  ['usage-pure', 'containerAlias', containerAlias],
  ['usage-global', 'containerAlias', containerAlias],
  ['usage-pure', 'storedAlias', storedAlias],
  ['usage-global', 'storedAlias', storedAlias],
];

async function transformBoth(source, method) {
  const options = { method, version: '4.0', targets: { ie: 11 } };
  const babel = (await transformAsync(source, {
    filename: 'chain.mjs', configFile: false, babelrc: false, plugins: [[plugin, options]],
  })).code;
  const unplugin = createUnplugin(options).transform(source, 'chain.mjs')?.code ?? source;
  return { babel, unplugin };
}

for (const [method, name, source] of CASES) {
  let outputs;
  try {
    outputs = await transformBoth(source, method);
  } catch (error) {
    checkTruthy(`${ method }/${ name }: both emitters finish`, false, error.message.split('\n', 1)[0]);
    continue;
  }
  checkTruthy(`${ method }/${ name }: both emitters finish`, outputs.babel && outputs.unplugin);
}

function detectionAdapter(parser) {
  return parser.name === 'babel' ? createBabelAdapter({ method: 'usage-pure' }) : createEstreeAdapter({ method: 'usage-pure' });
}

for (const parser of adapters) for (const [count, expected] of [[16, 'Array'], [256, null]]) {
  const program = parser.parseAndScope(`const a0 = globalThis;\n${ links(count, (k, j) => `const a${ k } = a${ j };`) }\na${ count }.Array;`);
  const read = parser.collectPaths(program, 'MemberExpression').at(-1);
  check(`${ parser.name }/plain chain of ${ count }`, resolveObjectName({
    objectNode: read.node, scope: read.scope, adapter: detectionAdapter(parser), path: read,
  }), expected);
}

finish();
