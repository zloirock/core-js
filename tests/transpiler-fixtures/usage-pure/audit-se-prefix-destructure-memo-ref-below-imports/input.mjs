// Flat side-effect-prefixed destructure off a global lifts `fx()` between the import header and
// the `var _ref;` memo from a separate instance call. That memo var is scope-pushed with a
// block-hoist tag the end-of-pipeline pass would otherwise lift ABOVE the imports (import/first
// violation); it must stay below them. both emitters drop the dead `(fx(), Array)` receiver to a
// bare `fx();` statement, so the outputs converge and there is no sidecar.
const { from } = (fx(), Array);
getObj().flat();
