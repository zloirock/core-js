import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// Decided operands keep their effects; a user arm keeps its own member.
function selected(other) {
  trace('left');
  const from = _Array$from;
  return from;
}
function shared(flag) {
  const {
    of,
    length
  } = flag ? (Array, {
    of: _Array$of,
    get length() {
      return Array.length;
    }
  }) : (Array, {
    of: _Array$of,
    get length() {
      return Array.length;
    }
  });
  return [of, length];
}
function user(flag, shim) {
  const {
    Array: {
      [(trace('key'), 'from')]: from
    }
  } = flag ? {
    Array: {
      from: _Array$from
    }
  } : shim;
  return from;
}