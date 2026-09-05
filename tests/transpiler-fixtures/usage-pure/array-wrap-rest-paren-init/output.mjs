import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// a REST host whose init the parser keeps PARENTHESIZED: the rest carrier reads the init through the
// runtime peel, so the residual anchors exactly as it does for the bare spelling - on both the
// wrapped and the flat host, with a prefix lifted or kept inside the same way
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const keys = _Object$keys;
const [{
  Object: {
    keys: _unused,
    ...restA
  }
}] = ([_globalThis]);
const values = _Object$values;
const {
  values: _unused2,
  ...restB
} = _globalThis.Object;
eff('a');
const entries = _Object$entries;
const [{
  Object: {
    entries: _unused3,
    ...restC
  }
}] = [_globalThis];
export { keys, restA, values, restB, entries, restC, seen };