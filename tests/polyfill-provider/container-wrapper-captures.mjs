// A wrapper captures names in each installed literal's scope. Writes follow those captured
// aliases and their paths to the original container, while replacing the wrapper slot does not.
import { adapters, createChecker } from './harness.mjs';
import { collectFileCensus } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';

const { check, checkDeep, finish } = createChecker('container-wrapper-captures');

const original = 'const original = { x: Array };';
const replacement = 'alias.box.x = Map;';
const rows = [
  ['a held alias reaches its original', `${ original } const local = original; const alias = { box: local }; ${ replacement }`,
    ['alias.box.x', 'original.x']],
  ['a later literal belongs to its assigned binding', `${ original } let alias = {}; { alias = { box: original }; ${ replacement } }`,
    ['alias.box.x', 'original.x']],
  ['a later literal keeps its block capture', `${ original } let alias = {}; { const local = original; alias = { box: local }; ${ replacement } }`,
    ['alias.box.x', 'original.x']],
  ['a capture survives its defining block', `${ original } let alias = {}; { const local = original; alias = { box: local }; } ${ replacement }`,
    ['alias.box.x', 'original.x']],
  ['a capture survives its defining function', `${ original } let alias = {}; function install() { const local = original; alias = { box: local }; } install(); ${ replacement }`,
    ['alias.box.x', 'original.x']],
  ['a captured alias retains its member path', `const original = { part: { x: Array } }; const local = original.part; const alias = { box: local }; ${ replacement }`,
    ['alias.box.x', 'original.part.x']],
  ['an array wrapper follows its captured alias', `${ original } const local = original; const alias = [local]; alias[0].x = Map;`,
    ['alias.0.x', 'original.x']],
  ['nested wrappers propagate to the same original', `${ original } const local = original; const inner = { box: local }; const alias = { inner }; alias.inner.box.x = Map;`,
    ['alias.inner.box.x', 'inner.box.x', 'original.x']],
  ['replacing a wrapper slot does not write its previous contents', `${ original } const local = original; const alias = { box: local }; alias.box = Map;`,
    ['alias.box']],
  ['a captured member that escapes poisons only that member', 'const original = { part: { x: Array } }; const local = original.part; const alias = { box: local }; hand(alias);',
    ['alias.*', 'original.part.*']],
];
let checked = 0;
for (const adapter of adapters) {
  for (const [name, code, expected] of rows) {
    const program = adapter.parseAndScope(code).node;
    const { writtenContainerSlots } = collectFileCensus(program, [mutationShapesReducer()]);
    const actual = writtenContainerSlots.keys().map(key => key.replace(/#\d+/u, '')).toArray().sort();
    checkDeep(`${ adapter.name }: ${ name }`, actual, [...expected].sort());
    checked++;
  }
  const program = adapter.parseAndScope(`${ original } let alias = {};
    { const original = { x: Array }; alias = { box: original }; ${ replacement } }`);
  const { writtenContainerSlots, containerSlotIndex } = collectFileCensus(program.node, [mutationShapesReducer()]);
  const declarations = adapter.collectPaths(program, 'VariableDeclarator', path => path.node.id.name === 'original');
  const [outer, inner] = declarations.map(path => containerSlotIndex.owners.get(path.node));
  check(`${ adapter.name }: separate binding identities`, outer === inner, false);
  check(`${ adapter.name }: outer original stays clean`, writtenContainerSlots.has(`${ outer }.x`), false);
  check(`${ adapter.name }: inner original receives the write`, writtenContainerSlots.has(`${ inner }.x`), true);
  checked += 3;

  const multi = adapter.parseAndScope(`${ original } const local = original;
    const alias = { box: local }; original.x = Set; alias.box.x = Map;`).node;
  const { writtenContainerSlots: writes } = collectFileCensus(multi, [mutationShapesReducer()]);
  const [, values] = [...writes].find(([key]) => /^original#\d+\.x$/u.test(key));
  checkDeep(`${ adapter.name }: all installed values reach an existing record`,
    values.map(value => value.name).sort(), ['Map', 'Set']);
  checked++;
}
check('all rows were checked', checked, adapters.length * (rows.length + 4));
finish();
