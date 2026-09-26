import _includes from "@core-js/pure/actual/instance/includes";
// catch param array-destructure binds `first` / `second`; using `first.includes(...)`
// inside the body still routes through the instance-method polyfill on the binding.
try {} catch ([first, second]) {
  _includes(first).call(first, "x");
}