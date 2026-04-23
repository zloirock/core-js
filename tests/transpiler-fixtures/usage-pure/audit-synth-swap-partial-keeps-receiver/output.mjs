import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Promise from "@core-js/pure/actual/promise/constructor";
// synth-swap with a non-polyfillable sibling (`custom` - no pure variant for it): the
// emitted object still needs `_Promise.custom` to preserve the live reference, so the
// receiver pure import must be injected. contrast with the all-polyfilled fixture where
// the receiver would be a dead import
(({
  resolve,
  custom
}) => [resolve, custom])({
  resolve: _Promise$resolve,
  custom: _Promise.custom
});