import "core-js/modules/es.array.at";
import "core-js/modules/es.string.anchor";
function toArray<T>(x: T): T extends string ? string[] : number[] {
  return [] as any;
}
toArray('hello').at(0).anchor('x');