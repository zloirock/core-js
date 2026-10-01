import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.regexp.to-string";
function spread<T>(x: T): [string, ...T[]] {
  return [x.toString(), x];
}
spread('hello').at(-1).toFixed(2);