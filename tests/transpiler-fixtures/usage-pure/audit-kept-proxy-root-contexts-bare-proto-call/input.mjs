// the remaining syntactic contexts, each reaching the migration through its own visitor
let c = 0;
// bare-probe INSTANCE guard-memo spellings: the prototype-method call keeps the raw nav in
// the guard body (the locked alias/kept canon), the call-argument SE stays put; the SE-key
// claimless `new`-callee renders the pony guard inside the callee parens
export const bareProtoCall = globalThis.window?.[(c++, 'self')].Array.prototype.find.call([5], v => v === (c++, 5));
