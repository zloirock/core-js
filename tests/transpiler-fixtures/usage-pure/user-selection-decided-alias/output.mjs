import _DisposableStack from "@core-js/pure/actual/disposable-stack";
import _DOMException from "@core-js/pure/actual/dom-exception/constructor";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _Symbol from "@core-js/pure/actual/symbol";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
import _URL from "@core-js/pure/actual/url";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// An alias or a receiver of a selection a presence test decides is the operand the test always takes:
// pure reads that operand directly - the realm-detection idiom, a reassigned realm alias, a flat or rest
// realm slot included - and an operand only the dead arm offered is no guard candidate. A test that
// may answer both ways keeps the selection, both operands live.
const root = _globalThis;
export const viaRealm = _Iterator;
const P = _Symbol;
export const viaAlias = _Symbol$for('key');
export const viaReceiver = _Map$groupBy(list, key);
const U = maybePromise;
export const viaUserArm = U.resolve(2);
let g = _globalThis;
if (flag) g = _globalThis;
export const viaReassigned = _URL;
export const viaFlatSlot = _DisposableStack;
export const viaRest = _WeakMap;
const {
  WeakMap: _unused,
  ...realmRest
} = _globalThis;
export { realmRest };
const C = pick() ? _Reflect : _DOMException;
export const undecided = C.has(value, key);