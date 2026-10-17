// A nested instance read through an array wrapper shares its selected slot with surviving
// leaf siblings. The method keeps the same receiver-family narrowing as the flat spelling.
const box = { y: [1, [2]] };
function effect() { return 1; }
// A loop header can capture wrapper elements and lower the following bindings in the same
// declaration. The bodyless variable declaration remains a separate native boundary.
const wrappedInLoopHead = (function () {
  let out;
  for (const [{ y: { at, other } }, zn] = [box, effect()]; !out;) out = [at, other, zn];
  return out;
})();
export { wrappedInLoopHead };
