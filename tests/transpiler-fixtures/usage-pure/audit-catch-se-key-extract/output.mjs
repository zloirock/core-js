import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
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