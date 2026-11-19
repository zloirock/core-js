import _globalThis from "@core-js/pure/actual/global-this";
// A dead chain wrapper and its plain twin expose the same realm. Neither reshapes an
// unclaimed constructor hop; a property name shared with an instance method is not a claim.
let fromMarked, fromPlain, named;
// Unknown leaves retain their nested source pattern.
({
  Array: {
    unknownKey: fromMarked
  }
} = _globalThis);
({
  Array: {
    unknownKey: fromPlain
  }
} = _globalThis);
// A name match on a different receiver also stays native.
({
  Array: {
    keys: named
  }
} = _globalThis);
// A declaration host makes the same choice.
const {
  Array: {
    unknownDecl
  }
} = _globalThis;
export { fromMarked, fromPlain, named, unknownDecl };