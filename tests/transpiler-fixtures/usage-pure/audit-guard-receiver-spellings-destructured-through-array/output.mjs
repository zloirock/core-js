import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// A native array-wrapped self extraction still identifies the realm for a later static read.
// Promise.resolve receives its dedicated import.
const [{
  self: fromArray
}] = [_globalThis];
export const destructuredThroughArray = _Promise$resolve(1);