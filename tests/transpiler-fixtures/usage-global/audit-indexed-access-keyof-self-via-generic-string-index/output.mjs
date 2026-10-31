import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
// a constraint with a `string` index signature bounds the value at every key a subtype may add,
// so `t[k]` with `k: keyof T` folds to that value type - the index-signature and `Record`
// spellings alike - where named members alone leave it generic
function f<T extends {
  [key: string]: string[];
}>(t: T, k: keyof T) {
  return t[k].at(0);
}
function g<T extends Record<string, string>>(t: T, k: keyof T) {
  return t[k].includes('a');
}