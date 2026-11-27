import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A string index does not constrain a subtype's symbol properties. A string-only key does.
export function first<T extends {
  [key: string]: number[];
}>(value: T[keyof T]) {
  return _at(value).call(value, 0);
}
export function has<T extends Record<string, string>, K extends keyof T>(value: T[K]) {
  return _includes(value).call(value, 'a');
}
export class Store<T extends Record<string, number[]>> {
  find(value: T[keyof T]) {
    return _findMaybeArray(value).call(value, x => x > 0);
  }
}
export function stringKey<T extends Record<string, number[]>>(value: T[keyof T & string]) {
  return _atMaybeArray(value).call(value, 0);
}