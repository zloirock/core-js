// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const box = { keep: 7 };
Object.defineProperty(box, 'inner', {
  get() { box.reads = (box.reads ?? 0) + 1; return [1, [2]]; },
  enumerable: true,
});
const withRest = (function () {
  const { inner: { flat }, ...rest } = box;
  return [flat, rest.keep];
})();
const withoutRest = (function () {
  const { inner: { flat }, keep } = box;
  return [flat, keep];
})();
let assignedFlat, assignedRest;
[{ inner: { flat: assignedFlat }, ...assignedRest }] = [box];
export { withRest, withoutRest, assignedFlat, assignedRest };
