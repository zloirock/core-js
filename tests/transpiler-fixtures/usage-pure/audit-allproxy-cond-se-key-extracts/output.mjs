import _Array$from from "@core-js/pure/actual/array/from";
// Both arms select supported pure realm bindings.
// The receiver is captured before the key effect and the method binding follows it.
const cond = false;
const {
  Array: {
    [(eff(), "from")]: from
  }
} = {
  Array: {
    from: _Array$from
  }
};
typeof from;