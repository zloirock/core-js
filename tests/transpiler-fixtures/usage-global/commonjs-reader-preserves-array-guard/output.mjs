require("core-js/modules/es.array.includes");
// The module helper reads the local value; the guard is in an independent function.
var read = this && this.read || function (value) {
  return value;
};
function keep(value) {
  return value;
}
exports.copy = function (input) {
  var errors = keep(input);
  return read(errors);
};
exports.has = function (refs, parent) {
  return Array.isArray(refs) && refs.includes(parent);
};