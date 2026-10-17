// the `in` carrier crosses reachable KEYS with reachable branch OBJECTS like the member
// form: each key x object pair that names a real static injects, an impossible pair
// (`Map.fromEntries` / `Map.hasOwn`) just resolves to no polyfill
const forInCross = globalThis.cond ? Map : Object;
let inCrossKey = 'fromEntries';
if (globalThis.other) inCrossKey = 'hasOwn';
export const viaInCross = inCrossKey in forInCross;
