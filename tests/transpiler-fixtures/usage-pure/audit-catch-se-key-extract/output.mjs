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
  let _ref4 = _ref3,
    f = null == _ref4 ? _ref4[""] : (e2(), _flatMaybeArray(_ref4)),
    {
      message
    } = _ref4;
  console.log(typeof f, message);
}
try {
  risky();
} catch (_ref5) {
  var _ref7;
  let _ref6 = _ref5,
    i = null == _ref6 ? _ref6[""] : (e3(), (_ref7 = _includes(_ref6)) === void 0 ? dflt() : _ref7);
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
} catch (_ref8) {
  let _ref9 = _ref8,
    r = null == _ref9 ? _ref9[""] : ((e5(), 'toRevers') + 'ed', _toReversedMaybeArray(_ref9));
  console.log(typeof r);
}
// In a multi-property catch pattern, the first default runs before the second key.
try {
  risky();
} catch (_ref10) {
  var _ref12;
  let _ref11 = _ref10,
    ts = null == _ref11 ? _ref11[""] : (e6(), (_ref12 = _toSortedMaybeArray(_ref11)) === void 0 ? dflt2() : _ref12),
    _ref13 = _ref11,
    tsp = null == _ref13 ? _ref13[""] : (e7(), _toSplicedMaybeArray(_ref13));
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
} catch (_ref14) {
  var _ref16, _ref18;
  let _ref15 = _ref14,
    fli = null == _ref15 ? _ref15[""] : (e9(), (_ref16 = _findLastIndexMaybeArray(_ref15)) === void 0 ? dflt4() : _ref16),
    _ref17 = _ref15,
    w10 = null == _ref17 ? _ref17[""] : (e10(), (_ref18 = _withMaybeArray(_ref17)) === void 0 ? dflt5() : _ref18);
  console.log(fli, w10);
}

// A plain key also keeps its default lazy when the selected instance value is undefined.
try {
  risky();
} catch (_ref19) {
  let _ref20,
    en = (_ref20 = _entries(_ref19)) === void 0 ? dflt6() : _ref20;
  console.log(en);
}

// An ordinary sibling read stays between the preceding default and the following key.
try {
  risky();
} catch (_ref21) {
  var _ref23;
  let _ref22 = _ref21,
    ks = null == _ref22 ? _ref22[""] : (e11(), (_ref23 = _keys(_ref22)) === void 0 ? dflt7() : _ref23),
    {
      message
    } = _ref22,
    _ref24 = _ref22,
    fi = null == _ref24 ? _ref24[""] : (e12(), _fillMaybeArray(_ref24));
  console.log(ks, message, fi);
}

// A nested pattern under Symbol.iterator reads the selected iterator method once, then
// resolves the function-name binding from that value.
try {
  risky();
} catch (_ref25) {
  let name = _nameMaybeFunction(_getIteratorMethod(_ref25));
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