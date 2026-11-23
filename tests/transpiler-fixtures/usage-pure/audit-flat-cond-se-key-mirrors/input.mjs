// a SIDE-EFFECTING computed key whose receiver is a CONSTRUCTOR directly (`Array`), behind a diverging
// ternary. the proxy branch mirrors to a synth literal under the resolved static key, the user branch
// stays native (no corruption). the effect stays in the residual LHS key and runs exactly once - so
// the proxy branch polyfills instead of bailing to native
const userObj = { of: () => 'user' };
export function read(cond) {
  let keys = 0;
  const { [(keys++, "of")]: of } = cond ? Array : userObj;
  return [of(3), keys];
}
