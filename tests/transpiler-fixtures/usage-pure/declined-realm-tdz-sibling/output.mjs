import _globalThis from "@core-js/pure/actual/global-this";
// An unknown child key stays in its TDZ, after the realm root becomes available.
// A later native sibling must not read ahead of that key.
const {
  globalThis: {
    [key]: {
      prototype
    }
  },
  key,
  tail
} = {
  globalThis: _globalThis,
  get key() {
    return _globalThis.key;
  },
  get tail() {
    return _globalThis.tail;
  }
};