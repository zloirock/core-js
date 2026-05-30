// parameter destructure default is a NESTED proxy-global member (`globalThis.self.Array`) with
// one polyfilled key (`from`) and one unpolyfilled key (`other`). the unpolyfilled key's fallback
// must COLLAPSE the proxy navigation to the polyfilled root (`_globalThis.Array.other`), dropping
// the intermediate `self` hop. keeping `.self` would read an undefined property off the global
// object on hosts where `self` is absent (ie:11 pure, non-browser), so it is not runtime-safe
// across the target range; the constructor (`Array`) is read off the global object directly
function f({ from, other } = globalThis.self.Array) { return [from, other]; }
f();
