let s;
let k = 0;
// a computed key-SE rides the guard's non-null branch (native evaluates the key only when the
// chain does not short-circuit), ordered after the claim like the source reads it
export const doubleHopKeySe = (s = globalThis.window)?.self?.self.Set[(k++, 'name')];
