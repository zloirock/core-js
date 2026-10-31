// A computed destructure key branching over more arms than the retired five-arm budget: the arm fan
// is the SOURCE's nesting, so a budget stopped enumerating past it and usage-global silently dropped
// the polyfill of every key beyond - here the trailing arm, which names a DIFFERENT method than its
// siblings so the import set shows whether the fan reached it. usage-pure leaves this shape raw by
// design (a branching key resolves to no single receiver), so it is the negative control.
export function pick(c0, c1, c2, c3, c4, c5, c6, c7) {
  const {
    [c7 ? 'flat' : c6 ? 'flat' : c5 ? 'flat' : c4 ? 'flat' : c3 ? 'flat' : c2 ? 'flat' : c1 ? 'flat' : c0 ? 'flat' : 'at']: m
  } = [1, [2]];
  return m;
}