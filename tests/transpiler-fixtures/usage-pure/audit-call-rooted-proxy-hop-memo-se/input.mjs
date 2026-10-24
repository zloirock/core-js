// A quiet call-rooted receiver retains synthesis and its call effect.
// Effectful realm keys keep native parameter receivers, defaults and unresolved siblings.
let c = 0;
function rootCall({ of, length } = (() => {
  c++;
  return globalThis;
})().self.Array) {
  return [of(1), length];
}
function hopAndRootCall({ from, name } = (() => {
  c += 10;
  return globalThis;
})()[(c++, 'self')].Array) {
  return [from([1]), name];
}
function bareRootNonPure({ of, byteLength } = globalThis[(c += 100, 'self')].Array) {
  return [of(1), byteLength];
}
function bareRootCtor({ get, size } = globalThis[(c += 1000, 'self')].Map) {
  return [get, size];
}
export { rootCall, hopAndRootCall, bareRootNonPure, bareRootCtor, c };
