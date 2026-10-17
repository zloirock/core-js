// Each selected receiver evaluates in its own branch; instance reads remain in parameter order.
// Falsy selecting operands retain their value so logical fallbacks choose the same receiver.
const arr = [1, [2]];
const nul = null;
// An effect prefix stays ahead of its selected receiver and runs once.
export const log = [];
export const viaEffectArm = (function ({ at } = nul || (log.push('x'), arr)) {
  return typeof at;
})();
