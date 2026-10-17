// the remaining syntactic contexts, each reaching the migration through its own visitor
let c = 0;
export const bareProtoUnpolyfilled = globalThis.window?.[(c++, 'self')].Array.prototype.indexOf.call([5], 5);
