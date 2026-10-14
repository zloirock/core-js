import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// an object literal container whose nested leaf holds an effect-keyed claim beside a nested pattern,
// written beside other declarators: the residual keeps the key where the source wrote it and the claim
// joins after it, reading the value the slot holds - spelled again, or memoized when it is a literal
const x0 = 1,
  {
    y: {
      other: {
        q
      },
      [(e(), 'at')]: _unused
    }
  } = {
    y: s
  },
  a = _at(s);
let {
    y: {
      more: {
        r
      },
      [(e(), 'includes')]: _unused2
    }
  } = {
    y: 'ab'
  },
  b = _includesMaybeString('ab'),
  x1 = 2;
var x2 = 3;
const _ref = [1];
var {
    y: {
      last: {
        t
      },
      [(e(), 'fill')]: _unused3,
      [(e(), 'flat')]: _unused4
    }
  } = {
    y: _ref
  },
  c = _fillMaybeArray(_ref),
  d = _flatMaybeArray(_ref);
use(x0, q, a, r, b, x1, x2, t, c, d);