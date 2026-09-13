// Keeping a read permits the global method to retain the literal's possible slot value.
// A receiver-dropping caller still needs an authoritative key and an effect-free getter.
import { findNamespaceMemberValue } from '../../packages/core-js-polyfill-provider/helpers/class-walk.js';
import { collectFileCensus, unwrapRuntimeExpr, walkAstNodes } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import { staticContainerReceiverName } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { adapters, createChecker } from './harness.mjs';

const { check, checkDeep, finish } = createChecker('kept-container-slot-values');

const rows = [
  ['data slot', '({ w: Array })', 'Array', 'Array'],
  ['pure getter', '({ get w() { return globalThis; } })', 'globalThis', 'globalThis'],
  ['effectful getter', '({ get w() { mark(); return globalThis; } })', 'globalThis', null],
  ['branching getter', '({ get w() { if (flag) return globalThis; return other; } })', null, null],
  ['unknown later key', '({ w: Array, [key]: Map })', 'Array', null],
  ['unknown earlier key', '({ [key]: Map, w: Array })', 'Array', 'Array'],
  ['known later key', '({ w: Array, ["other"]: Map })', 'Array', 'Array'],
  ['last duplicate wins', '({ w: Array, w: String })', 'String', 'String'],
  ['setter wins', '({ w: Array, set w(value) {} })', null, null],
  ['setter preserves getter', '({ get w() { mark(); return Array; }, set w(value) {} })', 'Array', null],
  ['getter after setter', '({ set w(value) {}, get w() { mark(); return Array; } })', 'Array', null],
  ['repeated setter preserves getter', '({ get w() { return Array; }, set w(value) {}, set w(value) {} })', 'Array', null],
  ['data replaces accessor pair', '({ get w() { return Array; }, set w(value) {}, w: String })', 'String', 'String'],
  ['data before setter clears getter', '({ get w() { return Array; }, w: String, set w(value) {} })', null, null],
  ['method before setter clears getter', '({ get w() { return Array; }, w() {}, set w(value) {} })', null, null],
  ['trailing spread', '({ w: Array, ...other })', 'Array', null],
  ['class effectful getter', '(class { static get w() { mark(); return globalThis; } })', 'globalThis', null],
  ['class unknown later key', '(class { static w = Array; static [key] = Map; })', 'Array', null],
  ['class later static block', '(class { static w = Array; static { this.w = other; } })', null, null],
];
const candidateRows = [
  ['later object key', '({ w: Array, [key]: Map })', ['Map']],
  ['earlier object key', '({ [key]: Map, w: Array })', []],
  ['later effectful getter', '({ w: Array, get [key]() { mark(); return Map; } })', ['Map']],
  ['later setter', '({ w: Array, set [key](value) {} })', []],
  ['later class key', '(class { static w = Array; static [key] = Map; })', ['Map']],
  ['earlier class key', '(class { static [key] = Map; static w = Array; })', []],
];
let checked = 0;
for (const adapter of adapters) {
  for (const [name, expression, globalName, pureName] of rows) {
    const program = adapter.parseAndScope(`const container = ${ expression };`);
    const container = unwrapRuntimeExpr(adapter.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'container').node.init);
    for (const [method, expected] of [['usage-global', globalName], ['usage-pure', pureName]]) {
      const value = findNamespaceMemberValue(container, 'w', null, { method }, ({ node, computed }) => {
        return computed ? node.value ?? null : node.name ?? node.value ?? null;
      }, { spreadVetoes: method === 'usage-pure' });
      check(`${ adapter.name }: ${ method }: ${ name }`, value?.name ?? null, expected);
      checked++;
    }
  }
  for (const [name, expression, expected] of candidateRows) {
    const program = adapter.parseAndScope(`const container = ${ expression };`);
    const container = unwrapRuntimeExpr(adapter.pickPath(program, 'VariableDeclarator').node.init);
    const candidates = [];
    const value = findNamespaceMemberValue(container, 'w', null, { method: 'usage-pure' }, ({ node, computed }) => {
      return computed ? node.value ?? null : node.name ?? node.value ?? null;
    }, { spreadVetoes: false, candidateSink: candidates });
    check(`${ adapter.name }: ${ name }: literal candidate`, value?.name ?? null, 'Array');
    checkDeep(`${ adapter.name }: ${ name }: alternatives`, candidates.map(candidate => candidate.name), expected);
    checked += 2;
  }
}
check('all rows were checked', checked, adapters.length * (rows.length + candidateRows.length) * 2);
check('the suite keeps its coverage floor', checked >= 76, true);

// A definitely replaced slot loses its initial constructor candidate. A write that may not
// have run, or that may put the same constructor back, must keep that candidate in global.
const slotRows = [
  ['fresh object', 'slot[0] = { from: value => value };', '', false],
  ['fresh array', 'slot[0] = [];', '', false],
  ['effectful replacement', 'slot[0] = (effect(), { from: value => value });', '', false],
  ['constant alias', 'const alias = slot; alias[0] = {};', '', false],
  ['alias replaced after its write', 'let alias = slot; alias[0] = {}; alias = external();', '', false],
  ['alias chain', 'const first = slot; let alias = first; alias[0] = {}; alias = external();', '', false],
  ['alias replaced before its write', 'let alias = slot; alias = external(); alias[0] = {};', '', true],
  ['conditional alias replacement', 'let alias = slot; if (flag) alias = external(); alias[0] = {};', '', true],
  ['conditional alias write', 'let alias = slot; if (flag) alias[0] = {}; alias = external();', '', true],
  ['later write through opaque alias', 'let alias = slot; alias[0] = {}; alias = external(); alias[0] = Array;', '', true],
  ['escape before alias replacement', 'let alias = slot; alias[0] = {}; mutate(alias); alias = external();', '', true],
  ['escape after alias replacement', 'let alias = slot; alias[0] = {}; alias = external(); mutate(slot);', '', true],
  ['source replaced after capture', 'const alias = slot; slot = [Array]; alias[0] = {};', '', true],
  ['shadow at write', 'let alias = slot; { const alias = other; alias[0] = {}; } alias = external();', '', true],
  ['loop-carried alias replacement', 'let alias = slot; for (; flag;) { alias[0] = {}; alias = external(); }', '', true],
  ['deferred alias write', 'let alias = slot; function replace() { alias[0] = {}; } alias = external();', '', true],
  ['conditional write', 'if (flag) slot[0] = {};', '', true],
  ['logical write', 'slot[0] &&= {};', '', true],
  ['write after read', '', 'slot[0] = {};', true],
  ['unlocated write', '', 'slot[0] = {};', true],
  ['deferred write', 'function replace() { slot[0] = {}; }', '', true],
  ['same value', 'slot[0] = slot[0];', '', true],
  ['opaque value', 'slot[0] = replacement;', '', true],
  ['opaque later write', 'slot[0] = {}; slot[0] = replacement;', '', true],
  ['held original value', 'slot[0] = { saved: slot[0] };', '', true],
  ['getter holds an alias', 'const saved = slot[0]; slot[0] = { get from() { return saved.from; } };', '', true],
  ['property holds an alias', 'const saved = slot[0]; slot[0] = { from: saved.from };', '', true],
  ['call supplies a property', 'slot[0] = { from: lookup() };', '', true],
  ['branch supplies a property', 'slot[0] = { from: flag ? first : second };', '', true],
  ['spread holds an alias', 'const saved = slot[0]; slot[0] = { ...saved };', '', true],
  ['inherited static', 'slot[0] = { __proto__: Array };', '', true],
  ['escaped container', 'slot[0] = {}; mutate(slot);', '', true],
  ['dynamic later write', 'slot[0] = {}; slot[key] = replacement;', '', true],
  ['fresh binding value', 'slot[0] = {}; slot = [Array];', '', true],
  ['different declaration', 'function replace() { const slot = [Array]; slot[0] = {}; }', '', true],
];
const nestedSlotRows = [
  ['direct nested write', '', 'slot.part.x = {};', false],
  ['member capture', 'const alias = slot.part;', 'alias.x = {};', false],
  ['member capture then opaque value', 'let alias = slot.part;', 'alias.x = {}; alias = external();', false],
  ['member capture chain', 'const local = slot.part; const alias = local;', 'alias.x = {};', false],
  ['wrapper holds member capture', 'const local = slot.part; const alias = { box: local };', 'alias.box.x = {};', false],
  ['array holds member capture', 'const local = slot.part; const alias = [local];', 'alias[0].x = {};', false],
  ['nested wrapper holds member capture', 'const local = slot.part; const alias = { a: { box: local } };', 'alias.a.box.x = {};', false],
  ['wrapper replaced after write', 'const local = slot.part; let alias = { box: local };', 'alias.box.x = {}; alias = external();', false],
  ['member alias replaced before write', 'let alias = slot.part;', 'alias = external(); alias.x = {};', true],
  ['wrapper slot replaced before write', 'const local = slot.part; const alias = { box: local };', 'alias.box = external(); alias.box.x = {};', true],
  ['source slot replaced after capture', 'const alias = slot.part;', 'slot.part = { x: Array }; alias.x = {};', true],
  ['source slot replaced after write', 'const alias = slot.part;', 'alias.x = {}; slot.part = { x: Array };', true],
  ['source binding replaced after capture', 'const alias = slot.part;', 'slot = { part: { x: Array } }; alias.x = {};', true],
  ['conditional member write', 'const alias = slot.part;', 'if (flag) alias.x = {};', true],
  ['deferred member write', 'const alias = slot.part;', 'function replace() { alias.x = {}; }', true],
  ['escaped member capture', 'let alias = slot.part;', 'alias.x = {}; hand(alias); alias = external();', true],
  ['escaped wrapper', 'const local = slot.part; const alias = { box: local };', 'alias.box.x = {}; hand(alias);', true],
  ['later opaque member write', 'let alias = slot.part;', 'alias.x = {}; alias = external(); alias.x = Array;', true],
  ['member getter', 'const holder = { get part() { return flag ? slot.part : {}; } }; const alias = holder.part;', 'alias.x = {};', true],
  ['wrapper getter', 'const local = slot.part; const alias = { get box() { return flag ? local : {}; } };', 'alias.box.x = {};', true],
  ['wrapper spread', 'const local = slot.part; const alias = { box: local, ...other };', 'alias.box.x = {};', true],
  ['wrapper unknown key', 'const local = slot.part; const alias = { box: local, [key]: other };', 'alias.box.x = {};', true],
];
const sourceRows = [
  ...slotRows.map(([name, before, after, expected]) => [name,
    `let slot = [globalThis.Array]; ${ before } slot[0].from([1]); ${ after }`, expected]),
  ...nestedSlotRows.map(([name, capture, write, expected]) => [name,
    `let slot = { part: { x: Array } }; ${ capture } ${ write } slot.part.x.from([1]);`, expected]),
  ['source getter returns a fresh object', 'const slot = { get part() { return { x: Array }; } };'
    + 'const alias = slot.part; alias.x = {}; slot.part.x.from([1]);', true],
  ['direct write through a source getter', 'const slot = { get part() { return { x: Array }; } };'
    + 'slot.part.x = {}; slot.part.x.from([1]);', true],
  ['source spread may replace the member', 'const slot = { part: { x: Array }, ...other };'
    + 'const alias = slot.part; alias.x = {}; slot.part.x.from([1]);', true],
  ['source computed key may replace the member', 'const slot = { part: { x: Array }, [key]: other };'
    + 'const alias = slot.part; alias.x = {}; slot.part.x.from([1]);', true],
];
for (const parser of adapters) for (const [name, source, keepsInitial] of sourceRows) {
  const program = parser.parseAndScope(source);
  if (name === 'unlocated write') walkAstNodes({ root: program.node, visit(node) {
    delete node.start;
    delete node.end;
  } });
  const read = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === 'from');
  const census = collectFileCensus(program.node, [mutationShapesReducer()]);
  const options = {
    method: 'usage-global',
    getWrittenContainerSlots: () => census.writtenContainerSlots,
    getContainerSlotIndex: () => census.containerSlotIndex,
  };
  const adapter = parser.name === 'babel' ? createBabelAdapter(options) : createEstreeAdapter(options);
  const candidates = [];
  const primary = staticContainerReceiverName({
    node: read.node.object, scope: read.scope, adapter, path: read, unionSink: candidates,
  });
  check(`${ parser.name }: written slot: ${ name }`, primary === 'Array' || candidates.includes('Array'), keepsInitial);
}
finish();
