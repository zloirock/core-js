import "core-js/modules/es.array.at";
function wrap<T>(value: T = null as any): T[] {
  return [value];
}
wrap('hello').at(0);