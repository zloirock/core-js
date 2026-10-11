// a `||` / `??` selecting between a value and a container reads a static off whichever operand ran, so
// the container's constructor is a candidate of the identity guard, and an operand nothing names stays
// the guard's raw branch - in place, through a pattern and through a binding holding the selection
export const made = (shim || { C: Array }).C.from(items);
export const { C: { of } } = opts.ctors ?? { C: Array };
export const { C: { groupBy } } = shim || { C: Object };
const box = shim || { C: Number };
export const whole = box.C.isInteger(value);
