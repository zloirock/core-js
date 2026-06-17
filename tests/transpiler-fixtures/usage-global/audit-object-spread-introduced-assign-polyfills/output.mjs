import "core-js/modules/es.object.assign";
// babel's object-rest-spread transform runs AFTER this plugin and, under setSpreadProperties,
// INLINES a raw `Object.assign(...)` for the spread - a node our pre-pass never sees. usage-global
// must still inject the `es.object.assign` global polyfill so the native call works on a runtime
// without native Object.assign (IE 11)
const o = {
  a: 1
};
const x = Object.assign(Object.assign({}, o), {}, {
  b: 2
});
export { x };