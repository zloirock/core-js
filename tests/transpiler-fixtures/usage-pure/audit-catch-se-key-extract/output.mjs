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
// Instance reads preserve receiver, key and default order across host forms.
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
  let f = null == _ref3 ? _ref3[""] : (e2(), _flatMaybeArray(_ref3)),
    {
      message
    } = _ref3;
  console.log(typeof f, message);
}
try {
  risky();
} catch (_ref4) {
  var _ref6;
  let _ref5 = _ref4,
    i = null == _ref5 ? _ref5[""] : (e3(), (_ref6 = _includes(_ref5)) === void 0 ? dflt() : _ref6);
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
} catch (_ref7) {
  let _ref8 = _ref7,
    r = null == _ref8 ? _ref8[""] : ((e5(), 'toRevers') + 'ed', _toReversedMaybeArray(_ref8));
  console.log(typeof r);
}
// In a multi-property catch pattern, the first default runs before the second key.
try {
  risky();
} catch (_ref9) {
  var _ref10;
  let ts = null == _ref9 ? _ref9[""] : (e6(), (_ref10 = _toSortedMaybeArray(_ref9)) === void 0 ? dflt2() : _ref10),
    _ref11 = _ref9,
    tsp = null == _ref11 ? _ref11[""] : (e7(), _toSplicedMaybeArray(_ref11));
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
} catch (_ref12) {
  var _ref13, _ref15;
  let fli = null == _ref12 ? _ref12[""] : (e9(), (_ref13 = _findLastIndexMaybeArray(_ref12)) === void 0 ? dflt4() : _ref13),
    _ref14 = _ref12,
    w10 = null == _ref14 ? _ref14[""] : (e10(), (_ref15 = _withMaybeArray(_ref14)) === void 0 ? dflt5() : _ref15);
  console.log(fli, w10);
}

// A plain key also keeps its default lazy when the selected instance value is undefined.
try {
  risky();
} catch (_ref16) {
  let _ref17,
    en = (_ref17 = _entries(_ref16)) === void 0 ? dflt6() : _ref17;
  console.log(en);
}

// An ordinary sibling read stays between the preceding default and the following key.
try {
  risky();
} catch (_ref18) {
  var _ref19;
  let ks = null == _ref18 ? _ref18[""] : (e11(), (_ref19 = _keys(_ref18)) === void 0 ? dflt7() : _ref19),
    {
      message
    } = _ref18,
    _ref20 = _ref18,
    fi = null == _ref20 ? _ref20[""] : (e12(), _fillMaybeArray(_ref20));
  console.log(ks, message, fi);
}

// A nested pattern under Symbol.iterator reads the selected iterator method once, then
// resolves the function-name binding from that value.
try {
  risky();
} catch (_ref21) {
  let name = _nameMaybeFunction(_getIteratorMethod(_ref21));
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