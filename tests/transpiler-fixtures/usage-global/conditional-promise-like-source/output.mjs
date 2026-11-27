import "core-js/modules/es.array.at";
// A thenable has an awaited value but need not implement all Promise methods.
type Content<T> = T extends Promise<infer V> ? string : number[];
function read(value: Content<PromiseLike<number>>) {
  return value.at(0);
}
export const result = read([42]);