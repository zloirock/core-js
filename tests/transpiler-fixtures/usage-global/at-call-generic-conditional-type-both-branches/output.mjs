import "core-js/modules/es.array.at";
function toArray<T>(x: T): T extends string ? string[] : T[] {
  return [x] as any;
}
toArray('hello').at(0);