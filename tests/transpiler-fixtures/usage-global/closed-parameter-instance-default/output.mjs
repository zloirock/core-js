import "core-js/modules/es.array.at";
// A closed caller census proves every invocation uses the inert array default.
// Both usage methods select only the array family.
function f({
  at
} = [[1, 2]][0]) {
  return at;
}
use(f().call([3, 4], -1));