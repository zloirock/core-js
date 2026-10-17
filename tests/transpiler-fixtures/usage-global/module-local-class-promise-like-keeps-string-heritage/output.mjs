import "core-js/modules/es.string.at";
export {};
class PromiseLike<T> extends String {}
export function read(value: PromiseLike<string>) {
  return value.at(0);
}