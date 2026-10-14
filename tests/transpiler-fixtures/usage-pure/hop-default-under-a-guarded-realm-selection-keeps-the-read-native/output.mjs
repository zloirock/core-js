import _globalThis from "@core-js/pure/actual/global-this";
// A hop's own default under an `&&` guard is live: a falsy guard reads that default instead of the
// realm's constructor, so the static under the hop may be the default's and not the constructor's.
// The read stays as written - in a declaration, beside a rest and in an assignment whose value is read.
let w, isInteger, read;
const {
  Array: {
    from
  } = {}
} = w = m && _globalThis;
const {
  Object: {
    hasOwn,
    ...objects
  } = {}
} = guard && _globalThis;
read = {
  Number: {
    isInteger
  } = {}
} = flag && _globalThis;
export { from, hasOwn, objects, isInteger, read, w };