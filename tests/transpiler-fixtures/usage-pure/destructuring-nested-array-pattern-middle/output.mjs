import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const {
  a: [{
    b
  }]
} = {
  a: [{
    b: [1, 2, 3]
  }]
};
_atMaybeArray(b).call(b, 0);