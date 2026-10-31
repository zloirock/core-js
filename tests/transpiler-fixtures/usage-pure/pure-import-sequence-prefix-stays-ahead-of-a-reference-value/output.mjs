import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// a pure import the build respells a sequence's prefix to performs nothing and leaves, save where the value
// alone would read differently in the sequence's slot: a callee would bind its object, `eval` would turn
// direct, a `delete` would delete and a `typeof` would stop throwing; a call's result takes the sequence's place
const box = {
  slot: 1,
  read() {
    return this;
  }
};
export const unbound = (_Set, box.read)();
export const indirect = (_Promise, eval)('this');
export const deleted = [delete (_Map, box.slot), box.slot];
export const kind = () => typeof (_Array$from, undeclaredName);
export const called = box.read();