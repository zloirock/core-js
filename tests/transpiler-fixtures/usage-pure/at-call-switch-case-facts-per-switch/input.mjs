// the case-order facts are per SWITCH: one binding read across two of them asks each on its own, and
// a write in a preceding case test of the second must not reach the first - nor may the first
// switch's clean answer be handed back for the second, which would keep a narrow the write breaks
export function f(v) {
  let x = v;
  switch (typeof x) {
    case 'number': break;
    case 'string': globalThis.a = x.includes('a'); break;
  }
  switch (typeof x) {
    case (x = [1, 2], 'number'): break;
    case 'string': return x.at(0);
  }
  return null;
}
