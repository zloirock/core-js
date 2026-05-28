// multiple SwitchCases each with a minifier-shape destructure: every case's consequent
// statement list must be visited by the sequence-split pre-pass so the destructure
// emitter can extract the per-case polyfill independently
function dispatch(n) {
  let from, of;
  switch (n) {
    case 1:
      (0, ({ from } = Array));
      return from;
    case 2:
      (0, ({ of } = Array));
      return of;
    default:
      return null;
  }
}
[dispatch(1)([1, 2]), dispatch(2)(3, 4)];
