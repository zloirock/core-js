import _Object$assign from "@core-js/pure/actual/object/assign";
function _extends() { return _extends = _Object$assign.bind(), _extends.apply(null, arguments); }
// babel's object-rest-spread transform runs AFTER this plugin and, under setSpreadProperties,
// INLINES a raw `Object.assign(...)` for the spread - a node our pre-pass never sees. the post-pass
// must still substitute it with the polyfilled assign, else a runtime without native Object.assign
// (IE 11) throws on the spread
const o = {
  a: 1
};
const x = _extends(_extends({}, o), {}, {
  b: 2
});
export { x };