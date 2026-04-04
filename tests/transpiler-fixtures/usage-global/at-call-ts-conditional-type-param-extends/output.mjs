import "core-js/modules/es.array.at";
import "core-js/modules/es.string.bold";
function test<T>(x: T): number extends T ? string[] : number[] {
  return [] as any;
}
test(0 as number).at(0).bold();