import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// A string index does not constrain a subtype's symbol properties. A string-only key does.
export function first<T extends {
  [key: string]: number[];
}>(value: T[keyof T]) {
  return value.at(0);
}
export function has<T extends Record<string, string>, K extends keyof T>(value: T[K]) {
  return value.includes('a');
}
export class Store<T extends Record<string, number[]>> {
  find(value: T[keyof T]) {
    return value.find(x => x > 0);
  }
}
export function stringKey<T extends Record<string, number[]>>(value: T[keyof T & string]) {
  return value.at(0);
}