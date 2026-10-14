import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// An assignment pattern reads an instance leaf off a user object by the type the object proves: a slot
// holding an array dispatches on that slot, the host leaving with the claim, while a slot whose type
// lacks the method claims nothing and keeps its default native.
let at, absent;
const source = {
  y: [1, 2]
};
at = _atMaybeArray(source.y);
const plain = {
  y: {}
};
({
  y: {
    includes: absent = () => -1
  }
} = plain);
export { at, absent };