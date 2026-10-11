import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
// a body that returns only after a conditional `break` out of a label around it can fall off its end,
// so the call may yield undefined and the `||` keeps its right operand. a conditional `return` in the
// same place is an exit like the one after it, so that call always yields an array. distinct method
// per line
function mayFallOff(c) {
  l: {
    if (c) break l;
    return [1];
  }
}
export const a = (mayFallOff(x) || 'ab').at(0);
function returnsEarly(c) {
  l: {
    if (c) return [2];
    return [1];
  }
}
export const b = (returnsEarly(x) || 'ab').includes(1);