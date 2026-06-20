import _Array$from from "@core-js/pure/actual/array/from";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// the same element / value destructure alias drives usage-pure substitution: `const [A] = [Array]`
// makes A the global Array, so the later static call folds to the pure polyfill. distinct
// constructors on distinct lines show the receiver resolves per binding, not by method name
const [A] = [Array];
export const r = _Array$from([1, 2]);
const {
  y: B
} = {
  y: Object
};
export const s = _Object$fromEntries([["k", 1]]);

// a slot whose value resolves to more than one global (a runtime-conditional element) cannot be
// pinned to a single receiver, so the static call stays unfolded - the resolver bails rather than
// guess one branch
const flag = Date.now() % 2;
const [C] = [flag ? Array : Object];
export const t = C.of?.(1, 2);