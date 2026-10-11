// a sole-key object hop reads the value standing in the slot it names - a literal's, a container alias's,
// a pure getter's return, either arm of a selection - so usage-global loads the constructor or the static
// the leaf names there
const other = {};
const { w: { Map: hopCtor } } = { w: globalThis };
const src = { P: Array };
const { P: { from: hopStatic } } = src;
const { w: { WeakMap: hopThroughGetter } } = { get w() { return globalThis; } };
const { w: { Promise: viaBranch } } = { w: other ? globalThis : globalThis };
export default [hopCtor, hopStatic, hopThroughGetter, viaBranch];
