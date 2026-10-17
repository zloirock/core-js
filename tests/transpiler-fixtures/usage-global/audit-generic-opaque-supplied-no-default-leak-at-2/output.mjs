import "core-js/modules/es.array.at";
// channel: explicit type-arg, present but unresolvable
function makeExplicit<T = number[]>(): T {
  return [] as any;
}
makeExplicit<string[]>().at(0);