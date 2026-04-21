// Destructure inside arrow expression body - scopeSnapshot captures `state.arrow`
// so state.genRef(scopeSnapshot) places the ref into arrowVars for the wrapping
// `{ var _ref; return ...; }`. Tests default + instance method interaction.
const f = () => { const { includes = fallback } = getArr(); return includes; };
