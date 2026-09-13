import _Array$from from "@core-js/pure/actual/array/from";
// Replacing the wrapper slot changes the wrapper alone. It does not write into the object
// previously captured there, so the original typed static remains eligible for injection.
const original = {
  x: Array
};
const local = original;
const alias = {
  box: local
};
alias.box = {
  x: {
    from: () => 'custom'
  }
};
_Array$from([1]);