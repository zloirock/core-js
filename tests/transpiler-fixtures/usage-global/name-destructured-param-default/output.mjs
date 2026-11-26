import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A default supplies a string only when the caller omits the argument.
function process({
  name
} = {
  name: 'hello'
}) {
  name.at(0);
}