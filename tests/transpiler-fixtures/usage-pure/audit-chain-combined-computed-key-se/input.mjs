// A computed-key sequence on an optional inner call evaluates the receiver before the key effect.
// The key effect runs once, and the method lookup and call use that same receiver.
// The trailing map consumes the inner call result only when the optional call continues.
declare const arr: { flat?: () => number[] };
declare const eff: () => 'flat';
arr[(eff(), 'flat')]?.().map((x: number) => x);
