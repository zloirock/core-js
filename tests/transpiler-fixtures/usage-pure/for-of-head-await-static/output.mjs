import _Map from "@core-js/pure/actual/map";
// A static read through an awaited head still needs that method's polyfill.
// Global injects the named method; pure must keep it on the substituted constructor.
async function use() {
  for await (const value of [_Map]) value.groupBy([1], x => x);
}
use();