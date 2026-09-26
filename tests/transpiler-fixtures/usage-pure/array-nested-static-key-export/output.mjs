import _Object$is from "@core-js/pure/actual/object/is";
// An exported static binding under an object key retains both array iterations
// and its native property read before the pure method is exported.
const wrapped = [{
  k: [Object]
}];
const [{
  k: [{
    is: _unused
  }]
}] = wrapped;
export const is = _Object$is;