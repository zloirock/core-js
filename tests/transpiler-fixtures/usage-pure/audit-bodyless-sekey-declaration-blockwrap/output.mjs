import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// an SE-key destructure (`{ [(eff(), 'k')]: v } = R`) keeps the key in place (its effect runs once) and binds
// the polyfill as a statement BEFORE the surviving residual. when the host is a bodyless control body the
// binding and the residual must share a `{ }` block, else the residual escapes the guard and runs the key
// effect even when the control is not taken. block-wrapped to match babel's bodyless-body auto-block

// bodyless `if`: a static extract - the key effect must run only when `c` is taken
if (c) {
  var f = _Array$from;
  var {
    [(log(), 'from')]: _unused
  } = Array;
}

// bodyless for-of BODY: an instance method, distinct from above - the for-of/in HEAD bail must not catch the
// body (keying on the node type alone dropped the polyfill, mistaking the body for the head binding)
for (item of items) {
  var m = _flatMaybeArray(rows);
  var {
    [(log(), 'flat')]: _unused2
  } = rows;
}

// bodyless do-while: an instance method on a CONSTANT-literal receiver - the memoized `_ref` hoist also runs
// before the residual, so all three statements share the block (this shape previously crashed the build)
do {
  var _ref = [1, 2, 3];
  var a = _atMaybeArray(_ref);
  var {
    [(log(), 'at')]: _unused3
  } = _ref;
} while (c);