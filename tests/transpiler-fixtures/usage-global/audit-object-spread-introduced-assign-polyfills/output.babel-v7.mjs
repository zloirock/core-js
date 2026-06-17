import "core-js/modules/es.object.assign";
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// babel's object-rest-spread transform runs AFTER this plugin and, under setSpreadProperties,
// INLINES a raw `Object.assign(...)` for the spread - a node our pre-pass never sees. usage-global
// must still inject the `es.object.assign` global polyfill so the native call works on a runtime
// without native Object.assign (IE 11)
const o = {
  a: 1
};
const x = _extends(_extends({}, o), {}, {
  b: 2
});
export { x };