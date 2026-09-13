import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// Object-rest keeps the affected pattern native, including inside an array wrapper.
// Independent reads and key/default expressions still receive their own polyfills.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const [{
  Object: {
    keys,
    ...restA
  }
}] = ([_globalThis]);
const {
  Object: {
    values,
    ...restB
  }
} = _globalThis;
const [{
  Object: {
    entries,
    ...restC
  }
}] = ([(eff('a'), _globalThis)]);
export { keys, restA, values, restB, entries, restC, seen };