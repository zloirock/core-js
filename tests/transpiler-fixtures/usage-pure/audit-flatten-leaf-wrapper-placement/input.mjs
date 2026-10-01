// A nested instance read through an array wrapper shares its selected slot with surviving
// leaf siblings. The method keeps the same receiver-family narrowing as the flat spelling.
const box = { y: [1, [2]] };
function effect() { return 1; }
const wrapped = (function () {
  const [{ y: { at, other } }] = [box];
  return [at, other];
})();
// An effectful neighbor element or leading declarator must finish before the nested read.
// The wrapper's elements are evaluated once, and surviving bindings keep their values.
const wrappedBesideAnEffect = (function () {
  const [{ y: { at, other } }, zn] = [box, effect()];
  return [at, other, zn];
})();
const wrappedAfterAnEffect = (function () {
  const zLead = effect(), [{ y: { at, other } }] = [box];
  return [zLead, at, other];
})();
// A loop header can capture wrapper elements and lower the following bindings in the same
// declaration. The bodyless variable declaration remains a separate native boundary.
const wrappedInLoopHead = (function () {
  let out;
  for (const [{ y: { at, other } }, zn] = [box, effect()]; !out;) out = [at, other, zn];
  return out;
})();
const wrappedInBodylessSlot = (function () {
  let out;
  if (out === undefined) var [{ y: { at, other } }, zn] = [box, effect()];
  return [at, other, zn];
})();
export { wrapped, wrappedBesideAnEffect, wrappedAfterAnEffect, wrappedInLoopHead, wrappedInBodylessSlot };
