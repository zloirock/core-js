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

finish();
