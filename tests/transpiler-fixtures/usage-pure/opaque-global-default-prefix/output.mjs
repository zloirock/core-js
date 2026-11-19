import _AggregateError from "@core-js/pure/actual/aggregate-error";
import _globalThis from "@core-js/pure/actual/global-this";
effect();
// A defined global claim drops its default without losing the initializer prefix or residual.
const AE = _AggregateError;
const {
  other
} = _globalThis;
use(AE, other);