// parameter destructure default is a NESTED proxy-global member (`globalThis.self.Array`) with
// a polyfilled key (`from`) and a ...rest sibling. body-extract hoists `from` and keeps the
// receiver as the param default, so the intermediate `self` proxy hop must COLLAPSE to the
// polyfilled root (`_globalThis.Array`): keeping `.self` reads an undefined property off the
// global object on hosts without it (ie:11 pure, non-browser), throwing when the default fires
function f({ from, ...rest } = globalThis.self.Array) { return [from, rest]; }
f();
