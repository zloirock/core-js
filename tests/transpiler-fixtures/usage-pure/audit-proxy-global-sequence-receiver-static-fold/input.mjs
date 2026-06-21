// proxy-global in a sequence receiver ahead of a receiver-dropping static fold. line one keeps a
// side-effecting prefix and folds the tail proxy-chain (`(eff(), globalThis.Array).from` ->
// `(eff(), _Array$from)`): the tail globalThis must be marked subsumed so it does not queue a
// parallel substitution overlapping the eliminated receiver range (which crashed the text compose).
// line two drops a pure non-tail proxy operand entirely (`(globalThis.foo, Promise).resolve`).
const a = (eff(), globalThis.Array).from([1]);
const b = (globalThis.foo, Promise).resolve(2);
a;
b;
