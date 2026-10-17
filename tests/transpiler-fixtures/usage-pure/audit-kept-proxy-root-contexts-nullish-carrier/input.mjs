// the remaining syntactic contexts, each reaching the migration through its own visitor
let c = 0;
// a nullish-coalescing carrier over the probe chain: the guarded render is the left operand
export const nullishCarrier = globalThis.window?.[(c++, 'self')].JSON ?? 'absent';
