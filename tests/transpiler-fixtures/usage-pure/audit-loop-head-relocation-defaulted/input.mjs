// ... and a claim carrying its OWN default: `const` cannot carry the guard's test ref as an
// initializer-less declarator, so under a relocated `const` it takes the hoisted `var` every
// `const` declaration's guard takes
const defaulted = (function () {
  let seen;
  for (const { at = fb } of [[1, 2]]) seen = at;
  return seen;
})();
export { defaulted };
