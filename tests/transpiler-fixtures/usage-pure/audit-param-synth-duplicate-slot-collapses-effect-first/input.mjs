// the collapse must not depend on WHICH spelling comes first, and an effect-bearing spelling keeps
// its effect on the pattern either way - the literal only ever carries the resolved name once
let effects = 0;
const effectFirst = (function ({ [(effects++, 'assign')]: a1, assign: a2 } = Object) {
  return [a1, a2];
})();
export { effectFirst };
export { effects };
