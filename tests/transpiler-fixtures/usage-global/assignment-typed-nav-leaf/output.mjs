import "core-js/modules/es.array.at";
// An assignment pattern reads an instance leaf off a user object by the type the object proves: a slot
// holding an array dispatches on that slot, the host leaving with the claim, while a slot whose type
// lacks the method claims nothing and keeps its default native.
let at, absent;
const source = {
  y: [1, 2]
};
({
  y: {
    at
  }
} = source);
const plain = {
  y: {}
};
({
  y: {
    includes: absent = () => -1
  }
} = plain);
export { at, absent };