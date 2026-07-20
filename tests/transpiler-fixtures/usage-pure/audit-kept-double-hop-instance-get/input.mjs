// a DOUBLE proxy hop under a kept assignment with an instance-GET tail: the erase-refusal claim
// fires INSIDE outer instance wrappers already built over the member, so the guard must climb
// above the whole wrapper stack - guarding only the wrapper's argument would hand `void 0` to the
// helper (a throw where native short-circuits the chain). a plugin helper wrap, its memoized
// dispatch and the optional-call spelling all lift; a USER consumer of the claim does not (it
// legitimately receives the short-circuited value)
let n;
let t;
let c;
let u;
let s;
let k = 0;
export const doubleHopName = (n = globalThis.window)?.self?.self.Set.name;
export const doubleHopCallTail = (t = globalThis.window)?.self?.self.Map.name.at(0);
export const doubleHopOptCall = (c = globalThis.window)?.self?.self.WeakMap.name.at?.(0);
export function keep(x) {
  return x;
}
export const userConsumer = keep((u = globalThis.window)?.self?.self.Set);
// a computed key-SE rides the guard's non-null branch (native evaluates the key only when the
// chain does not short-circuit), ordered after the claim like the source reads it
export const doubleHopKeySe = (s = globalThis.window)?.self?.self.Set[(k++, 'name')];
// STACKED computed key-SE: the outer key evaluates AFTER the full inner receiver (ECMA
// receiver-before-key), so the inner rewrite's memo hoists ahead of the outer folded SE
let v;
export const doubleHopKeyStack = (v = globalThis.window)?.self?.self.Map[(k++, 'name')][(k += 10, 'at')](0);
// a user-written sequence stays put - only plugin-built wrappers lift into the guard
export function readName(x) {
  return (k++, x).name;
}
