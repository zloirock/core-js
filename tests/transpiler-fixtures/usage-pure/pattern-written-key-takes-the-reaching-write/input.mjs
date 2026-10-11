// a key a pattern writes takes the value of the write that reaches the read, as one only plain writes reach
// does - in either order of the pattern and the plain write, through a hoisted `var` and a parameter alike.
// what a pattern writes is the slot it names (`iterator` off `Symbol`), so a later write of another symbol
// is what the read sees, and a write on one path only leaves no single value - those reads stay native
let patternFirst;
({ iterator: patternFirst } = Symbol);
patternFirst = Symbol.iterator;
export const readPatternFirst = target => target[patternFirst];
let plainFirst;
plainFirst = Symbol.iterator;
({ iterator: plainFirst } = Symbol);
export const readPlainFirst = target => target[plainFirst];
var hoisted;
({ asyncIterator: hoisted } = Symbol);
hoisted = Symbol.iterator;
export const readHoisted = target => target[hoisted];
export function readParameter(target, key) {
  ({ iterator: key } = Symbol);
  return target[key];
}
let replaced;
replaced = Symbol.iterator;
({ asyncIterator: replaced } = Symbol);
export const readReplaced = target => target[replaced];
let oneArm;
oneArm = Symbol.iterator;
if (flag) ({ asyncIterator: oneArm } = Symbol);
export const readOneArm = target => target[oneArm];
