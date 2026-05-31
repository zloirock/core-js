// Flat side-effect-prefixed destructure off a global lifts `fx()` between the import header and
// the `var _ref;` memo from a separate instance call. That memo var is scope-pushed with a
// block-hoist tag the end-of-pipeline pass would otherwise lift ABOVE the imports (import/first
// violation); it must stay below them. unplugin keeps the dead `(fx(), Array)` receiver babel
// drops to `fx();` - pre-existing cosmetic divergence in SE-prefix destructure (output-unplugin).
const { from } = (fx(), Array);
getObj().flat();
