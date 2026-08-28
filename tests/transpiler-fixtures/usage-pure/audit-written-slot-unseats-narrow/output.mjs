import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
// a WRITE to the slot unseats the narrow for every spelling that reads it: the fold sees the init
// and the write, and a union of two families answers no family at all. what makes this a fixture
// rather than a note is that the nested spelling used to miss the write - the reference standing in
// a declarator's init was dropped as an ALIAS, which it is only when the id is a plain name, so the
// write was never bounded and the claim narrowed to the init's array while its flat twins did not
const box = {
  y: [1, [2]]
};
box.y = 'str';
const nested = function () {
  const at = _at(box.y);
  return at;
}();
const flat = function () {
  const at = _at(box.y);
  return at;
}();
const member = function () {
  return _at(box.y);
}();
// ... and with no write in sight the narrow stands, which is the control the rule is carved out of
const unwritten = {
  y: [1, [2]]
};
const narrowed = function () {
  const at = _atMaybeArray(unwritten.y);
  return at;
}();
export { nested, flat, member, narrowed };