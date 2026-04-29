// catch param array-destructure binds `first` / `second`; using `first.includes(...)`
// inside the body still routes through the instance-method polyfill on the binding.
try {} catch ([first, second]) { first.includes("x"); }
