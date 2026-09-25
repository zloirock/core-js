import _includes from "@core-js/pure/actual/instance/includes";
// a for-of head destructuring INTO a member target: the target is a WRITE the loop performs, never a
// read asking for a polyfill, while the KEY is read off each element like its binding twin's
// (`for ({ includes: f } of rows)`) - the write-target skip must not swallow that read
const obj = {};
for ({
  a: obj.flat
} of items) {
  noop(obj.flat);
}
for (const _ref2 of rows) {
  var _ref;
  _ref = _ref2, obj.includes = _includes(_ref), _ref;
  noop(obj.includes);
}