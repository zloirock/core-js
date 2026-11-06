import _Array$from from "@core-js/pure/actual/array/from";
// Same-line siblings keep each annotation inside its original conditional.
// The static call is served; its comment must not move to the declaration.
// Entering the source block must not print either comment a second time.
let value;
if (enabled) {
  /* branch */value = /* value */_Array$from(input);
}
use(value);