import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// `T[keyof T]` written as a type reads like `t[k]` with `k: keyof T`: a constraint with a `string`
// index signature bounds the value at every key a subtype may add, so it folds to that value type -
// the index-signature and `Record` spellings, a `K extends keyof T` index and a class parameter alike
export function first<T extends {
  [key: string]: number[];
}>(value: T[keyof T]) {
  return _atMaybeArray(value).call(value, 0);
}
export function has<T extends Record<string, string>, K extends keyof T>(value: T[K]) {
  return _includesMaybeString(value).call(value, 'a');
}
export class Store<T extends Record<string, number[]>> {
  find(value: T[keyof T]) {
    return _findMaybeArray(value).call(value, x => x > 0);
  }
}