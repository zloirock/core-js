const G = globalThis;
@(function () {
  { let G = 1; }
  return G.Array.from([1]);
})
class ViaAlias {}
export { ViaAlias };
