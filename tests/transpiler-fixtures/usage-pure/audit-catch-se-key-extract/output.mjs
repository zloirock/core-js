import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
import _includes from "@core-js/pure/actual/instance/includes";
import _keys from "@core-js/pure/actual/instance/keys";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Object-rest keeps the affected catch pattern native, including its named method slots.
// Independent reads and key/default expressions still receive their own polyfills.
try {
  risky();
} catch (_ref) {
  let _ref2 = _ref,
    v = null == _ref2 ? _ref2[""] : (e1(), _at(_ref2));
  console.log(typeof v);
}
try {
  risky();
} catch (_ref3) {
  let _ref4 = _ref3,
    _ref5 = _ref4,
    f = null == _ref5 ? _ref5[""] : (e2(), _flatMaybeArray(_ref5)),
    {
      message
    } = _ref4;
  console.log(typeof f, message);
}
try {
  risky();
} catch (_ref6) {
  var _ref8;
  let _ref7 = _ref6,
    i = null == _ref7 ? _ref7[""] : (e3(), (_ref8 = _includes(_ref7)) === void 0 ? dflt() : _ref8);
  console.log(typeof i);
}
try {
  risky();
} catch ({
  [(e4(), 'flatMap')]: m,
  ...rest
}) {
  console.log(typeof m, rest);
}
// A concatenated constant key retains its effect just like a sequence key.
try {
  risky();
} catch (_ref9) {
  let _ref10 = _ref9,
    r = null == _ref10 ? _ref10[""] : ((e5(), 'toRevers') + 'ed', _toReversedMaybeArray(_ref10));
  console.log(typeof r);
}
// In a multi-property catch pattern, the first default runs before the second key.
try {
  risky();
} catch (_ref11) {
  var _ref14;
  let _ref12 = _ref11,
    _ref13 = _ref12,
    ts = null == _ref13 ? _ref13[""] : (e6(), (_ref14 = _toSortedMaybeArray(_ref13)) === void 0 ? dflt2() : _ref14),
    _ref15 = _ref12,
    tsp = null == _ref15 ? _ref15[""] : (e7(), _toSplicedMaybeArray(_ref15));
  console.log(typeof ts, typeof tsp);
}
try {
  risky();
} catch ({
  [(e8(), 'findLast')]: fnl = dflt3(),
  ...restA
}) {
  console.log(typeof fnl, restA);
}

// Two defaulted properties retain key, read, default order independently.
try {
  risky();
} catch (_ref16) {
  var _ref19, _ref21;
  let _ref17 = _ref16,
    _ref18 = _ref17,
    fli = null == _ref18 ? _ref18[""] : (e9(), (_ref19 = _findLastIndexMaybeArray(_ref18)) === void 0 ? dflt4() : _ref19),
    _ref20 = _ref17,
    w10 = null == _ref20 ? _ref20[""] : (e10(), (_ref21 = _withMaybeArray(_ref20)) === void 0 ? dflt5() : _ref21);
  console.log(fli, w10);
}

// A plain key also keeps its default lazy when the selected instance value is undefined.
try {
  risky();
} catch (_ref22) {
  let _ref23,
    en = (_ref23 = _entries(_ref22)) === void 0 ? dflt6() : _ref23;
  console.log(en);
}

// An ordinary sibling read stays between the preceding default and the following key.
try {
  risky();
} catch (_ref24) {
  var _ref27;
  let _ref25 = _ref24,
    _ref26 = _ref25,
    ks = null == _ref26 ? _ref26[""] : (e11(), (_ref27 = _keys(_ref26)) === void 0 ? dflt7() : _ref27),
    {
      message
    } = _ref25,
    _ref28 = _ref25,
    fi = null == _ref28 ? _ref28[""] : (e12(), _fillMaybeArray(_ref28));
  console.log(ks, message, fi);
}

// A nested pattern under Symbol.iterator reads the selected iterator method once, then
// resolves the function-name binding from that value.
try {
  risky();
} catch (_ref29) {
  let name = _nameMaybeFunction(_getIteratorMethod(_ref29));
  console.log(name);
}
try {
  risky();
} catch ({
  [_Symbol$iterator]: {
    name
  },
  ...rest
}) {
  console.log(name, rest);
}