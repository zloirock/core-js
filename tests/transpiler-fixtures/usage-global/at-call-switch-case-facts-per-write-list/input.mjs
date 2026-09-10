// the case-order facts a switch answers with are derived per (switch, write list), not per switch:
// two bindings guarded across one switch ask it separately, and only the one whose write sits in a
// preceding case test loses its narrow. the second read of that binding asks the same pair again and
// must get the same answer - each read spells its own method, or in usage-global the two would fold
// into one import and either could go wide unseen
export function f(v, w) {
  let x = v;
  let y = w;
  if (typeof y !== 'string') return null;
  switch (typeof x) {
    case (x = [1, 2], 'number'): break;
    case 'string':
      globalThis.a = x.keys();
      globalThis.b = y.includes('a');
      return y.at(0);
  }
  y = w;
  return null;
}
