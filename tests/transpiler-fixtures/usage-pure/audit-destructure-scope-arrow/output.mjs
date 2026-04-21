import _includes from "@core-js/pure/actual/instance/includes";
// Destructure inside arrow expression body - scopeSnapshot captures `state.arrow`
// so state.genRef(scopeSnapshot) places the ref into arrowVars for the wrapping
// `{ var _ref; return ...; }`. Tests default + instance method interaction.
const f = () => {
  var _ref;
  const includes = (_ref = _includes(getArr())) === void 0 ? fallback : _ref;
  return includes;
};