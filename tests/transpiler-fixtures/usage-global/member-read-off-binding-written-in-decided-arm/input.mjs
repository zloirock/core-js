// A member read off a binding written in an arm this build always takes reads the value that write
// stores, as a direct read of the binding does - braced in an `if` or spelled as a ternary arm. An
// undecided test keeps every value.
export function branch(source) {
  let box = source;
  if (typeof Promise != 'undefined') box = { data: 'abc' };
  else box = { data: [1] };
  return box.data.at(0);
}

export function ternary(source) {
  let box = source;
  typeof Promise != 'undefined' ? (box = { data: 'abc' }) : (box = { data: [1] });
  return box.data.includes('b');
}

export function undecided(source) {
  let box = source;
  globalThis.flag ? (box = { data: 'abc' }) : (box = { data: [1] });
  return box.data.slice(1);
}
