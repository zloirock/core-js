import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A dynamic sibling keeps its native key read while a relocated realm head
// still supplies the nested static in realms without the globalThis slot.
export function read(key) {
  for (const _ref of [{
    globalThis: _globalThis
  }]) {
    const from = _Array$from;
    const {
      globalThis: {
        [key]: value
      }
    } = _ref;
    return [value, from];
  }
}