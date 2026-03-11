import "core-js/modules/es.function.name";
import "core-js/modules/es.string.at";
interface Data {
  name: string;
}
function foo(d: Data) {
  d.name.at(-1);
}