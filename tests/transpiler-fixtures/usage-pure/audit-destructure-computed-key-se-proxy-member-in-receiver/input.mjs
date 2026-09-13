// a proxy-global member chain nested in a literal receiver makes the receiver unsafe to emit twice.
// Capture the literal once, keep the computed-key effect in place, and dispatch the instance method
// from that captured value; the constructor member still rewrites to `_Map`.
const { [(eff(), 'flat')]: m } = [1, globalThis.Map];
