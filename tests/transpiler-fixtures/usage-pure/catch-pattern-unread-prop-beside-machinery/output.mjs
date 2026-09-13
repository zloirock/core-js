import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _includes from "@core-js/pure/actual/instance/includes";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Object-rest keeps the affected catch pattern native, including its named method slots.
// Independent reads and key/default expressions still receive their own polyfills.
// a catch pattern whose computed key forces the receiver extraction: whether a SIBLING prop is
// worth its own `_ref`-bound rewrite is asked per prop. a binding the body never reads keeps a
// native read in the residual instead of an import and a dispatcher call nothing observes
try {
  risky1();
} catch (_ref) {
  let it1 = _getIteratorMethod(_ref);
  let {
    at
  } = _ref;
  console.log(it1);
}
try {
  risky2();
} catch (_ref2) {
  let it2 = _getIteratorMethod(_ref2);
  let includes = _includes(_ref2);
  console.log(it2, includes);
}
try {
  risky3();
} catch ({
  [_Symbol$iterator]: it3,
  at: at3,
  ...rest
}) {
  console.log(it3, rest);
}