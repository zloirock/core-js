// parameter destructure default is a NESTED proxy-global member (`globalThis.self.Array`) with
// one polyfilled key (`from`) and one unpolyfilled key (`other`). the unpolyfilled key's fallback
// must COLLAPSE the proxy navigation to the polyfilled root (`_globalThis.Array.other`), dropping
// the `self` hop - keeping `.self` reads undefined off the global on self-less hosts (ie:11 pure).
function f({ from, other } = globalThis.self.Array) { return [from, other]; }
f();
