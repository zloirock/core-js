import "core-js/modules/es.array.at";
import "core-js/modules/es.regexp.exec";
import "core-js/modules/es.string.replace";
import "core-js/modules/es.string.replace-all";
export interface Data {
  items: string[];
}
function foo(d: Data) {
  d.items.at(-1).replaceAll('x', 'y');
}