// destructure init is a logical expression - for `??` / `||` the primary operand
// is the left side (fallback right); for `&&` the primary is the right side
// (left is only the gate). Polyfills resolve against the primary operand
const { from } = Array ?? Stub;
const { keys } = Stub ?? Object;
const { entries } = Array && Map;
