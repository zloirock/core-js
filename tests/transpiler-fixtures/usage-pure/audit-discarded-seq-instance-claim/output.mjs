import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
// an assignment DISCARDED as a non-tail sequence element: nobody reads the value it yields, so the
// position is as free as a statement's, and both legs claim there on the same terms. the rewrite
// lands in the ELEMENT rather than in a statement - reaching for the enclosing statement instead
// replaced whatever the sequence held after this element, dropping the tail the source wrote
let m, taken;
const zd = (m = _flatMaybeArray(_globalThis.Array.prototype), 7);
taken = zd;
let at2, rest2, keep2;
const src2 = [1, 2];
const zr = ({
  at: at2,
  ...rest2
} = src2, 8);
const zs = ({
  flat: keep2,
  other: taken
} = {
  flat: [3],
  other: 9
}, 10);
export { m, taken, at2, rest2, keep2, zd, zr, zs };