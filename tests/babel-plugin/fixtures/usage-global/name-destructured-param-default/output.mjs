import "core-js/modules/es.array.at";
import "core-js/modules/es.function.name";
import "core-js/modules/es.string.at";
function process({
  name
} = {
  name: 'hello'
}) {
  name.at(0);
}