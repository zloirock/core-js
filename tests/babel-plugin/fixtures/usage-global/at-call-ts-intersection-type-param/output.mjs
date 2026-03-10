import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
function foo(x: number[] & {
  extra: boolean;
}) {
  x.at(-1);
}