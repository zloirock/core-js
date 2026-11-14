import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Optional symbol keys retain their nullish result.
export function read(choice) {
  const effects = [];
  const list = {
    undefined: 23,
    [_Symbol$iterator]() {
      return 31;
    }
  };
  return typeof list[null == _globalThis.window ? void 0 : _Symbol$iterator];
}