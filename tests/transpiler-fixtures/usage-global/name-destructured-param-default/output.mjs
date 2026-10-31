import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A function with no external callers retains the type of its object parameter default.
function process({
  name
} = {
  name: 'hello'
}) {
  name.at(0);
}