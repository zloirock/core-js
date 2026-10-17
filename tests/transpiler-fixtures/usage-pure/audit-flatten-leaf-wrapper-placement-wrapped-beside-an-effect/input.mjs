// A nested instance read through an array wrapper shares its selected slot with surviving
// leaf siblings. The method keeps the same receiver-family narrowing as the flat spelling.
const box = { y: [1, [2]] };
function effect() { return 1; }
// An effectful neighbor element or leading declarator must finish before the nested read.
// The wrapper's elements are evaluated once, and surviving bindings keep their values.
const wrappedBesideAnEffect = (function () {
  const [{ y: { at, other } }, zn] = [box, effect()];
  return [at, other, zn];
})();
export { wrappedBesideAnEffect };
