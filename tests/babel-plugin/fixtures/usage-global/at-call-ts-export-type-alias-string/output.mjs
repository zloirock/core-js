import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-end";
import "core-js/modules/es.array.at";
export type Strings = string[];
function foo(x: Strings) {
  x.at(-1).padEnd(5);
}