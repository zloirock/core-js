// a receiver that reaches a BRANCHING static value through SAFE indirection enumerates the
// same branch statics as the inline form: a const-alias init, a bound zero-arg callee (arrow
// and function declaration), and an alias-of-alias chain all resolve to the branching value,
// so each branch's static dep is injected (usage-global under-inject here broke the reachable
// branch on old engines). the destructure and `in` forms ride the same resolution
const aliasInit = globalThis.cond ? Promise : Map;
export const viaAliasInit = aliasInit.any;

const boundCallee = () => (globalThis.cond ? Promise : Map);
export const viaBoundCallee = boundCallee().race;

function pickCtor() { return globalThis.cond ? Promise : Map; }
export const viaFnDecl = pickCtor().allSettled;

const chainA = globalThis.cond ? Array : Iterator;
const chainB = chainA;
export const viaAliasOfAlias = chainB.from;

const forDestructure = globalThis.cond ? Array : Iterator;
const { of } = forDestructure;
export const viaDestructure = of;

const forIn = globalThis.cond ? Map : Object;
export const viaIn = 'groupBy' in forIn;

// reachable KEYS cross with reachable branch OBJECTS: a computed key that may hold either
// name dispatches every branch x key pair, through the alias exactly like inline
const forCross = globalThis.cond ? Array : Iterator;
let crossKey = 'from';
if (globalThis.other) crossKey = 'of';
export const viaKeyCross = forCross[crossKey];

// an SE-prefixed branching init follows through its tail - usage-global never rewrites,
// so the effect stays in source and only the branch statics are added
function tick() { return null; }
const seInit = (tick(), globalThis.cond ? Map : Object);
export const viaSeInit = seInit.groupBy;

// an identity-param callee flows its branching ARGUMENT to the return - the shared callee
// inliner resolves it like the zero-arg forms
const identity = x => x;
export const viaIdentityParam = identity(globalThis.cond ? Array : Iterator).of;

// a NON-dominating reassignment keeps the branching init live at the use, so the branch
// statics still inject; only a dominating one bails (see the negatives fixture)
let lateReassigned = globalThis.cond ? Array : Iterator;
if (globalThis.late) lateReassigned = {};
export const viaLateReassign = lateReassigned.from;

// the `in` carrier crosses reachable KEYS with reachable branch OBJECTS like the member
// form: each key x object pair that names a real static injects, an impossible pair
// (`Map.fromEntries` / `Map.hasOwn`) just resolves to no polyfill
const forInCross = globalThis.cond ? Map : Object;
let inCrossKey = 'fromEntries';
if (globalThis.other) inCrossKey = 'hasOwn';
export const viaInCross = inCrossKey in forInCross;
