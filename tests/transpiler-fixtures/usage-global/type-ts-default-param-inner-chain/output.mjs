import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
function f(arr: string[] = []) {
  arr.at(0).includes('x');
}