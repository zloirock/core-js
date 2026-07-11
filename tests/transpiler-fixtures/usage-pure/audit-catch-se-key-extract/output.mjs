import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a side-effecting computed key in a catch param extracts the dispatcher binding while the
// key survives in the residual (effect once, in order); the user default is dead code
try {
  risky();
} catch (_ref) {
  let v = _at(_ref);
  let {
    [(e1(), 'at')]: _unused
  } = _ref;
  console.log(typeof v);
}
try {
  risky();
} catch (_ref2) {
  let f = _flatMaybeArray(_ref2);
  let {
    [(e2(), 'flat')]: _unused2,
    message
  } = _ref2;
  console.log(typeof f, message);
}
try {
  risky();
} catch (_ref3) {
  let i = _includes(_ref3);
  let {
    [(e3(), 'includes')]: _unused3
  } = _ref3;
  console.log(typeof i);
}
try {
  risky();
} catch (_ref4) {
  let m = _flatMapMaybeArray(_ref4);
  let {
    [(e4(), 'flatMap')]: _unused4,
    ...rest
  } = _ref4;
  console.log(typeof m, rest);
}
// plus-fold computed key routes through the same SE gate as a sequence key
try {
  risky();
} catch (_ref5) {
  let r = _toReversedMaybeArray(_ref5);
  let {
    [(e5(), 'toRevers') + 'ed']: _unused5
  } = _ref5;
  console.log(typeof r);
}
// a pattern-valued symbol prop in a catch param destructures the helper result off the
// relocated ref, dropping the dead residual (the catch-born declaration is synthesized, so
// the dead-residual gate must not depend on source positions)
try {
  risky();
} catch (_ref6) {
  let {
    name
  } = _getIteratorMethod(_ref6);
  console.log(name);
}
// with a rest sibling the consumed symbol key keeps a sentinel so rest still excludes it
try {
  risky();
} catch (_ref7) {
  let {
    name
  } = _getIteratorMethod(_ref7);
  let {
    [_Symbol$iterator]: _unused6,
    ...rest
  } = _ref7;
  console.log(name, rest);
}