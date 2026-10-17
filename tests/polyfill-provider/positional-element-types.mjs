// The element's type and each nested receiver survive capture and loop-head relocation.
// Rebinding a name preserves its captured value; writes and handouts keep field flow wide.
// Opaque names stand for untyped inputs; incompatible writes deliberately test legal JS
// that TypeScript rejects. Positive receiver families were checked against TypeScript.
import { createChecker } from './harness.mjs';
import { collectFileCensus } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';

const { checkDeep, finish, runBoth } = createChecker('positional-element-types');
const rows = [
  ['array constructor loop', 'for (const R of [Array]) { const { prototype: { at } } = R; R.prototype.includes; }', ['Array', 'Array']],
  ['string constructor loop', 'for (const R of [String]) { const { prototype: { at } } = R; R.prototype.includes; }', ['String', 'String']],
  ['repeated constructor', 'for (const R of [Array, Array]) R.prototype.at;', ['Array']],
  ['different constructors', 'for (const R of [Array, String, Array]) R.prototype.at;', [null]],
  ['rebound loop name', 'for (let R of [Array]) { R = String; R.prototype.at; }', ['String']],
  ['conditional loop write', 'for (let R of [Array]) { if (flag) R = String; R.prototype.at; }', [null]],
  ['shadowed constructor', 'const Array = unknown; for (const R of [Array]) R.prototype.at;', [null]],
  ['constructor hop', 'for (const { w: { prototype: { at, includes } } } of [{ w: Array }]) {}', ['Array', 'Array']],
  ['realm hop', 'for (const { Array: { prototype: { at, includes } } } of [globalThis]) {}', ['Array', 'Array']],
  ['assignment head', 'let at, includes; for ({ Array: { prototype: { at, includes } } } of [globalThis]) {}', ['Array', 'Array']],
  ['mixed constructor hops', 'for (const { w: { prototype: { at } } } of [{ w: Array }, { w: String }, { w: Array }]) {}', [null]],
  ['written loop element field', 'const row = { w: [0, 2] }; row.w = "02"; for (const { w: { at, includes } } of [row]) {}', [null, null]],
  ['written loop element field alias', 'const row = { w: [0, 2] }; const alias = row; alias.w = "02"; for (const { w: { at, includes } } of [row]) {}', [null, null]],
  ['written missing field default', 'const row = {}; row.w = "02"; for (const { w: { at, includes } = [0, 2] } of [row]) {}', [null, null]],
  ['hole in loop elements', 'for (const { w: { prototype: { at } } } of [{ w: Array }, , { w: Array }]) {}', [null]],
  ['spread in loop elements', 'for (const { w: { prototype: { at } } } of [{ w: Array }, ...unknown]) {}', [null]],
  ['both positional receivers', 'const rows = [[1], [2]]; for (const [{ at }, { includes }] of [rows]) {}', ['Array', 'Array']],
  ['different positional receivers', 'const rows = [[1], "xy"]; for (const [{ at }, { includes }] of [rows]) {}', ['Array', 'string']],
  ['captured replaced root', 'let box = { y: { at: 1 } }; const [{ y: { at } }, tail] = [box, box = { y: { at: 9 } }]; tail.y.includes;', ['Object', 'Object']],
  ['captured array before string rebind', 'let value = [1]; const [saved] = [value]; value = "xy"; saved.at;', ['Array']],
  ['captured string before array rebind', 'let value = "xy"; const [saved] = [value]; value = [1]; saved.includes;', ['string']],
  ['captured value read in a closure', 'let value = [1]; const [saved] = [value]; value = "xy"; function read() { saved.at; }', ['Array']],
  ['capture across a loop back edge', 'let value = [1]; for (let i = 0; i < 2; i++) { const [saved] = [value]; saved.includes; value = "xy"; }', [null]],
  ['capture across repeated calls', 'let value = [1]; function read() { const [saved] = [value]; value = "xy"; saved.includes; } read(); read();', [null]],
  ['write before capture', 'let value = [1]; value = "xy"; const [saved] = [value]; saved.at;', ['string']],
  ['captured field write', 'const value = { y: [1] }; const [saved] = [value]; saved.y = "xy"; saved.y.at;', [null]],
  ['captured alias write', 'const value = { y: [1] }; const [saved] = [value]; const alias = saved; alias.y = "xy"; saved.y.at;', [null]],
  ['captured escape', 'const value = { y: [1] }; const [saved] = [value]; mutate(saved); saved.y.at;', [null]],
  ['defaulted capture', 'const [saved = [1]] = [maybe]; saved.at;', [null]],
  ['shifted capture', 'const [saved] = [...unknown, [1]]; saved.at;', [null]],
  ['written element source', 'const rows = [[1]]; rows[0] = "xy"; const [saved] = rows; saved.at;', [null]],
  ['source write reaches alias read', 'const rows = [[1]]; const alias = rows; rows[0] = "xy"; alias[0].at;', ['string']],
  ['alias write reaches source read', 'const rows = [[1]]; const alias = rows; alias[0] = "xy"; rows[0].at;', ['string']],
  ['source write replaces a string', 'const rows = ["xy"]; const alias = rows; rows[0] = [1]; alias[0].includes;', ['Array']],
  ['alias write replaces a string', 'const rows = ["xy"]; const alias = rows; alias[0] = [1]; rows[0].includes;', ['Array']],
  ['alias read before and after a write', 'const rows = [[1]]; const alias = rows; alias[0].at; rows[0] = "xy"; alias[0].includes;', ['Array', 'string']],
  ['unwritten alias element', 'const rows = [[1]]; const alias = rows; alias[0].at;', ['Array']],
  ['write to another own alias element', 'const rows = [[1], "xy"]; const alias = rows; rows[1] = [2]; alias[0].at;', ['Array']],
];

for (const [name, code, expected] of rows) runBoth(name, code, (adapter, program, label) => {
  const census = collectFileCensus(program.node, [mutationShapesReducer()]);
  const reader = (adapter.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    getWrittenContainerSlots: () => census.writtenContainerSlots,
    getContainerSlotIndex: () => census.containerSlotIndex,
  });
  const resolver = adapter.makeResolver({ isWrittenContainerSlot: (...args) => reader.isWrittenContainerSlot(...args) });
  const properties = adapter.collectPaths(program, adapter.name === 'babel' ? 'ObjectProperty' : 'Property',
    p => p.parentPath.node.type === 'ObjectPattern' && ['at', 'includes'].includes(p.node.key?.name));
  const members = adapter.collectPaths(program, 'MemberExpression', p => ['at', 'includes'].includes(p.node.property?.name));
  const actual = [...properties, ...members].map(p => {
    const type = resolver.resolvePropertyObjectType(p);
    return type ? type.primitive ? type.type : type.constructor : null;
  });
  checkDeep(label, actual, expected);
});

for (const [name, source, pristine] of [
  ['direct returned parameter', '((value) => value)(...[[1]]).at;', 'Array'],
  ['returned default', '((value = []) => value)(...[undefined]).at;', 'Array'],
  ['inferred generic', 'function read<T>(value: T): T { return value; } read(...([[1]] as [number[]])).at;', 'Array'],
  ['known argument directive', 'Object.freeze(...[[1]]).at;', 'Array'],
]) runBoth(`returned argument iterator provenance/${ name }`, source, (parser, program, label) => {
  const property = parser.pickPath(program, 'MemberExpression', p => p.node.property?.name === 'at');
  for (const mutated of [false, true]) {
    const resolver = parser.makeResolver({ isMutatedStatic: (owner, key) => mutated && owner === 'Array.prototype' && key === 'Symbol.iterator' });
    const type = resolver.resolveNodeType(property.get('object'));
    checkDeep(`${ label }/${ mutated }`, type ? type.primitive ? type.type : type.constructor : null, mutated ? null : pristine);
  }
});

// The hook models an installed runtime iterator; annotation lanes remain independently trusted.
for (const [name, source, changed] of [
  ['binding', 'const [value] = [[1]]; value.at;', null],
  ['assignment', 'let value; [value] = [[1]]; value.at;', null],
  ['nested object array binding', 'const { w: [value] } = { w: [[1]] }; value.at;', null],
  ['loop element', 'for (const value of [[1]]) value.at;', null],
  ['numeric property', 'const { 0: value } = [[1]]; value.at;', 'Array'],
  ['nested numeric property', 'const { w: { 0: value } } = { w: [[1]] }; value.at;', 'Array'],
  ['annotation', 'const [value]: number[][] = [[1]]; value.at;', 'Array'],
]) runBoth(`iterator projection differs from indexed access/${ name }`, source, (parser, program, label) => {
  const property = parser.pickPath(program, 'MemberExpression', p => p.node.property?.name === 'at');
  for (const mutated of [false, true]) {
    const resolver = parser.makeResolver({ isMutatedStatic: (owner, key) => mutated && owner === 'Array.prototype' && key === 'Symbol.iterator' });
    const type = resolver.resolveNodeType(property.get('object'));
    checkDeep(`${ label }/${ mutated }`, type ? type.primitive ? type.type : type.constructor : null, mutated ? changed : 'Array');
  }
});

// A changed runtime iterator can yield an unrelated element, so a nested loop slot cannot inherit
// the source array literal's family.
runBoth('changed iterator keeps a nested loop slot open',
  'for (const { value: { at } } of [{ value: [1] }]) {}', (parser, program, label) => {
    const property = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
      path => path.node.key?.name === 'at');
    const resolver = parser.makeResolver({
      isMutatedStatic: (owner, key) => owner === 'Array.prototype' && key === 'Symbol.iterator',
    });
    checkDeep(label, resolver.resolvePropertyObjectType(property), null);
  });

runBoth('an unrelated Array iterator write preserves a generic String rest argument',
  "function first<T>(...values: T[]): T { return values[0]; } first(...'ab').at;", (parser, program, label) => {
    const property = parser.pickPath(program, 'MemberExpression', p => p.node.property?.name === 'at');
    for (const mutated of [false, true]) {
      const resolver = parser.makeResolver({ isMutatedStatic: (owner, key) => mutated && owner === 'Array.prototype' && key === 'Symbol.iterator' });
      const type = resolver.resolveNodeType(property.get('object'));
      checkDeep(`${ label }/${ mutated }`, type ? type.primitive ? type.type : type.constructor : null, 'string');
    }
  });

for (const [name, source] of [
  ['direct', 'const Reflect = { apply(value) { return value; } }; Reflect.apply([1]).at;'],
  ['default', 'const Reflect = { apply(value = [1]) { return value; } }; Reflect.apply(undefined).at;'],
  ['generic', 'const Reflect = { apply<T>(value: T): T { return value; } }; Reflect.apply([1]).at;'],
]) runBoth(`local invoker spelling keeps its own arguments/${ name }`, source, (parser, program, label) => {
  const property = parser.pickPath(program, 'MemberExpression', path => path.node.property?.name === 'at');
  const resolver = parser.makeResolver();
  checkDeep(label, resolver.resolveNodeType(property.get('object'))?.constructor, 'Array');
});

// Stored array iteration can select a different literal slot, while retained call paths still
// need their source call role after an emitter replaces the live callee.
for (const [name, source, expected, rewire, dropParentStart] of [
  ['stored custom iterator', `const box = { data: [1] }; const wrap = [box, {}];
    wrap[Symbol.iterator] = function* () { yield this[1]; yield this[0]; };
    const [, alias] = wrap; alias.data = "xy"; box.data.includes("xy");`, null],
  ['spread loses literal position', 'const box = { data: [1] }; const [alias] = [...other, box]; alias.data = "xy"; box.data.at(0);', null],
  ['reassigned array alias', 'const rows = [[1]]; let alias = rows; alias = other; alias[0] = "xy"; rows[0].at(0);', null],
  ['retained rewritten call', 'const rows = [[1]]; rows.includes(rows[0]); rows[0].at(0);', 'Array', true, false],
  ['retained rewritten call without parent start', 'const rows = [[1]]; rows.includes(rows[0]); rows[0].at(0);', 'Array', true, true],
]) runBoth(`positional child/${ name }`, source, (adapter, program, label) => {
  if (rewire) {
    const callMember = adapter.pickPath(program, 'MemberExpression', path => path.node.property?.name === 'includes');
    if (dropParentStart) delete callMember.parent.start;
    callMember.parent.callee = { type: 'Identifier', name: 'dispatch' };
  }
  const method = name === 'stored custom iterator' ? 'includes' : 'at';
  const member = adapter.pickPath(program, 'MemberExpression', path => path.node.property?.name === method);
  const type = adapter.makeResolver().resolveNodeType(member.get('object'));
  checkDeep(label, type ? type.primitive ? type.type : type.constructor : null, expected);
});

// A default does not turn an unknown iterated value into the default's family. Presence
// also needs an ordinary iterator and an unshadowed missing slot; an own undefined wins.
for (const [name, source, mutation, expected] of [
  ['iterated binding default', 'const [value = [1]] = []; value.at;', ['Array.prototype', 'Symbol.iterator'], null],
  ['iterated assignment default', 'let value; [value = [1]] = []; value.at;', ['Array.prototype', 'Symbol.iterator'], null],
  ['iterated parameter default', 'function read([value = [1]]) { value.at; } read([]);', ['Array.prototype', 'Symbol.iterator'], null],
  ['numeric property stays indexed', 'const { 0: value = [1] } = {}; value.at;', ['Array.prototype', 'Symbol.iterator'], 'Array'],
  ['inherited hole', 'const [value = [1]] = [,]; value.at;', ['Array.prototype', '0'], null],
  ['iterator done precedes inherited slot', 'const [value = [1]] = []; value.at;', ['Array.prototype', '0'], 'Array'],
  ['own undefined masks inherited index', 'const [value = [1]] = [void 0]; value.at;', ['Array.prototype', '0'], 'Array'],
  ['inherited object slot', 'const { value = [1] } = {}; value.at;', ['Object.prototype', 'value'], null],
  ['own undefined masks inherited object slot', 'const { value = [1] } = { value: void 0 }; value.at;', ['Object.prototype', 'value'], 'Array'],
  ['spread inherits its source index', 'const [, value = [1]] = [...[, ,]]; value.at;', ['Array.prototype', '1'], null],
  ['spread prefix inherits the source index', 'const [,, value = [1]] = [0, ...[, ,]]; value.at;', ['Array.prototype', '1'], null],
  ['spread prefix has a different source index', 'const [, value = [1]] = [0, ...[, ,]]; value.at;', ['Array.prototype', '1'], 'Array'],
  ['typed String element', 'declare const unknown: any; const [value]: [string] = unknown; value.at;', ['Array.prototype', 'Symbol.iterator'], 'string'],
  ['typed Array element', 'declare const unknown: any; const [value]: [number[]] = unknown; value.at;', ['Array.prototype', 'Symbol.iterator'], 'Array'],
]) runBoth(`default slot certainty/${ name }`, source, (parser, program, label) => {
  const member = parser.pickPath(program, 'MemberExpression', path => path.node.property?.name === 'at');
  const resolver = parser.makeResolver({ isMutatedStatic: (owner, key) => owner === mutation[0] && key === mutation[1] });
  const answer = resolver.resolveNodeType(member.get('object'));
  checkDeep(label, answer ? answer.primitive ? answer.type : answer.constructor : null, expected);
});

// A failed iterative projection cannot retry the same raw literal as an indexed union.
for (const [name, source, expected] of [
  ['runtime default', 'const [{ at } = [1]] = [];', null],
  ['String assertion', 'declare const input: unknown; const [{ at } = "fallback"] = input as [string];', 'string'],
  ['Array assertion', 'declare const input: unknown; const [{ at } = [1]] = input as [number[]];', 'Array'],
]) runBoth(`nested default receiver hints/${ name }`, source, (parser, program, label) => {
  const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', path => path.node.key?.name === 'at');
  const resolver = parser.makeResolver({ isMutatedStatic: (owner, key) => owner === 'Array.prototype' && key === 'Symbol.iterator' });
  const hints = resolver.resolvePropertyUnionHints(prop);
  checkDeep(`${ label }/hints`, hints ? [...hints].sort() : null, null);
  const answer = resolver.resolvePropertyObjectType(prop);
  checkDeep(`${ label }/scalar priority`, answer ? answer.primitive ? answer.type : answer.constructor : null, expected);
});

finish();
