// An alias or a receiver of a selection a presence test decides is the operand the test always takes:
// pure reads that operand directly - the realm-detection idiom, a reassigned realm alias, a flat or rest
// realm slot included - and an operand only the dead arm offered is no guard candidate. A test that
// may answer both ways keeps the selection, both operands live.
const root = typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : window;
export const viaRealm = root.Iterator;
const P = typeof Symbol === 'function' ? Symbol : WeakSet;
export const viaAlias = P.for('key');
export const viaReceiver = (typeof Map === 'undefined' ? Set : Map).groupBy(list, key);
const U = typeof Symbol === 'function' ? maybePromise : Promise;
export const viaUserArm = U.resolve(2);
let g = typeof globalThis !== 'undefined' ? globalThis : window;
if (flag) g = globalThis;
export const viaReassigned = g.URL;
export const { DisposableStack: viaFlatSlot } = typeof globalThis !== 'undefined' ? globalThis : window;
export const { WeakMap: viaRest, ...realmRest } = typeof globalThis !== 'undefined' ? globalThis : window;
const C = pick() ? Reflect : DOMException;
export const undecided = C.has(value, key);
