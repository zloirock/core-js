// a preserved sibling holding an ArrayPattern-WRAPPED nested proxy destructure is flatten-eligible
// like the bare object form; the outer sibling-walk must skip its receiver, or a queued transform
// survives the inner flatten overwrite and crashes text composition
const { Array: { from } } = globalThis,
      val = (function () {
        const [{ Array: { of } }] = [globalThis];
        return of;
      })();
export { from, val };
