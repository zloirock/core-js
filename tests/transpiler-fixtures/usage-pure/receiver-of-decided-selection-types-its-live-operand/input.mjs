// A selection this build decides is the operand it yields, held or read in place: a presence test
// the build always answers picks its arm or leaves `||` to its right, and a served static left of
// `||` is the callee. An undecided selection keeps both arms.
function toArray(value) {
  return value;
}

export function ternary() {
  const value = typeof Promise != 'undefined' ? 'abc' : [1];
  return value.at(0);
}

export function falseTest() {
  const value = typeof Promise == 'undefined' || 'abc';
  return value.slice(1);
}

export function callee(source) {
  return (Array.from || toArray)(source).includes(1);
}

export function undecided() {
  return (globalThis.flag ? 'abc' : [1]).concat('d');
}
