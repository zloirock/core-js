import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref2;
// user declares `_ref` inside a nested function - lexically invisible at module top-level.
// name reservation for plugin-generated refs must still see nested user names to avoid
// reusing them (the plugin's rename pass could otherwise allocate `_ref` at module scope
// and collide). both plugins normalise this and emit the same ref numbering
function inner() {
  var _ref = 'user';
  return _ref;
}
_atMaybeArray(_ref2 = [1, 2, 3]).call(_ref2, 0);
inner();