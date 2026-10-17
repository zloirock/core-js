import "core-js/modules/es.string.includes";
export {};
class Thenable<T> extends String {}
export function read(value: Thenable<string>) {
  return value.includes('y');
}