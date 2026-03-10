import "core-js/modules/es.object.freeze";
function identity(x) {
  x = {};
  return x;
}
Object.freeze(identity(42));