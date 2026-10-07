import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _DisposableStack from "@core-js/pure/actual/disposable-stack";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _queueMicrotask from "@core-js/pure/actual/queue-microtask";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// A presence test this build always answers - `typeof` over a global it serves (either operand order,
// parenthesized or not), a global or a static read as a truth value - folds in pure to the operand it
// yields, the test's own import and the dead branch gone. A probe (`window`) keeps its test, so does a
// function global the root resolver does not name (`queueMicrotask`), and an `if` keeps its shape:
// pure folds no statement.
export const resolved = _Promise$resolve(1);
export const viaStatic = _Array$from(list);
export const fallbackOf = _Array$of;
export const symbolic = _Symbol('x');
export const legacy = new _Map();
export const grouped = new _Set(list);
export const reversed = _Promise$try(task);
export const probed = typeof window !== 'undefined' ? _WeakMap : _DisposableStack;
export const queued = typeof _queueMicrotask === 'function' ? _queueMicrotask(task) : new Float32Array(value);
if (typeof _Iterator !== 'undefined') use(_Iterator$from(list));else use(new _WeakSet());