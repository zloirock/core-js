// A string index does not constrain a subtype's symbol properties. A string-only key does.
export function first<T extends { [key: string]: number[] }>(value: T[keyof T]) {
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
