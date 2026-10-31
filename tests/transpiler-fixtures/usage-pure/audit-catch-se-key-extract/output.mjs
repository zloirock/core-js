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
  let v = null == _ref ? _ref[""] : (e1(), _at(_ref));
  console.log(typeof v);
}
try {
  risky();
} catch (_ref2) {
  let f = null == _ref2 ? _ref2[""] : (e2(), _flatMaybeArray(_ref2)),
    {
      message
    } = _ref2;
  console.log(typeof f, message);
}
try {
  risky();
} catch (_ref3) {
  var _ref4;
  let i = null == _ref3 ? _ref3[""] : (e3(), (_ref4 = _includes(_ref3)) === void 0 ? dflt() : _ref4);
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
} catch (_ref5) {
  let r = null == _ref5 ? _ref5[""] : ((e5(), 'toRevers') + 'ed', _toReversedMaybeArray(_ref5));
  console.log(typeof r);
}
// In a multi-property catch pattern, the first default runs before the second key.
try {
  risky();
} catch (_ref6) {
  var _ref7;
  let ts = null == _ref6 ? _ref6[""] : (e6(), (_ref7 = _toSortedMaybeArray(_ref6)) === void 0 ? dflt2() : _ref7),
    tsp = null == _ref6 ? _ref6[""] : (e7(), _toSplicedMaybeArray(_ref6));
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
} catch (_ref8) {
  var _ref9, _ref10;
  let fli = null == _ref8 ? _ref8[""] : (e9(), (_ref9 = _findLastIndexMaybeArray(_ref8)) === void 0 ? dflt4() : _ref9),
    w10 = null == _ref8 ? _ref8[""] : (e10(), (_ref10 = _withMaybeArray(_ref8)) === void 0 ? dflt5() : _ref10);
  console.log(fli, w10);
}

// A plain key also keeps its default lazy when the selected instance value is undefined.
try {
  risky();
} catch (_ref11) {
  let _ref12,
    en = (_ref12 = _entries(_ref11)) === void 0 ? dflt6() : _ref12;
  console.log(en);
}

// An ordinary sibling read stays between the preceding default and the following key.
try {
  risky();
} catch (_ref13) {
  var _ref14;
  let ks = null == _ref13 ? _ref13[""] : (e11(), (_ref14 = _keys(_ref13)) === void 0 ? dflt7() : _ref14),
    {
      message
    } = _ref13,
    fi = null == _ref13 ? _ref13[""] : (e12(), _fillMaybeArray(_ref13));
  console.log(ks, message, fi);
}

// A nested pattern under Symbol.iterator reads the selected iterator method once, then
// resolves the function-name binding from that value.
try {
  risky();
} catch (_ref15) {
  let name = _nameMaybeFunction(_getIteratorMethod(_ref15));
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