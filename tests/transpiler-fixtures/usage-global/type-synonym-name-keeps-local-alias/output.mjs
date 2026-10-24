import "core-js/modules/es.string.at";
// A local alias keeps its body before a built-in synonym is normalized.
// The written String receiver requires String instance dispatch.
export {};
type PromiseLike<T> = string;
export function read(value: PromiseLike<number>) {
  return value.at(0);
}