// a prototype-placement ctor claim over a CHAIN-ASSIGN root harvests the kept assignment
// exactly like a sequence prefix (`(k++, _Map).prototype`): the fallback used to bail on the
// assignment and strand the raw proxy hop (`.self` unponyfilled off-engine). distinct
// constructors per line
let n;
export const nonOptionalKept = (n = globalThis.window).self.Map.prototype.has.name;
