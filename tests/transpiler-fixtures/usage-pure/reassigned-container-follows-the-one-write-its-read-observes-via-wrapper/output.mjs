import _Promise from "@core-js/pure/actual/promise";
// A reassigned array wrapper supplies its replacement element to destructuring.
// The native race read uses the full Promise constructor in that element.
let rw5 = [{
  p: Object
}];
rw5 = [{
  p: _Promise
}];
const [{
  p: {
    race: viaWrapper
  }
}] = rw5;
export { viaWrapper };