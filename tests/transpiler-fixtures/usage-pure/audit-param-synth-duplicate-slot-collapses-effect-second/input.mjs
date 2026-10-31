// the collapse must not depend on WHICH spelling comes first, and an effect-bearing spelling keeps
// its effect on the pattern either way - the literal only ever carries the resolved name once
let effects = 0;
const effectSecond = (function ({ getOwnPropertyNames: g1, [(effects++, 'getOwnPropertyNames')]: g2 } = Object) {
  return [g1, g2];
})();
export { effectSecond };
export { effects };
