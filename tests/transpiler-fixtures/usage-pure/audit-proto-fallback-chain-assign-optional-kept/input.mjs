// the OPTIONAL twin keeps its root guard; the ctor claim rides the receiver-independent
// body verbatim (`_Map.prototype.has`) - the kept assign lives once, in the guard memo
let o;
export const optionalKept = (o = globalThis.window)?.self.Map.prototype.has.name;
