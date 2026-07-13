import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
import _includes from "@core-js/pure/actual/instance/includes";
import _keys from "@core-js/pure/actual/instance/keys";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a side-effecting computed key in a catch param extracts the dispatcher binding while the
// key survives in the residual (effect once, in order); a user default on an instance leaf
// stays LIVE and guarded AFTER the residual (the dispatcher may return undefined on a foreign
// receiver, and native fires the default after the key's effect)
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
  let {
    [(e3(), 'includes')]: _unused3
  } = _ref3;
  let _ref4,
    i = (_ref4 = _includes(_ref3)) === void 0 ? dflt() : _ref4;
  console.log(typeof i);
}
try {
  risky();
} catch (_ref5) {
  let m = _flatMapMaybeArray(_ref5);
  let {
    [(e4(), 'flatMap')]: _unused4,
    ...rest
  } = _ref5;
  console.log(typeof m, rest);
}
// plus-fold computed key routes through the same SE gate as a sequence key
try {
  risky();
} catch (_ref6) {
  let r = _toReversedMaybeArray(_ref6);
  let {
    [(e5(), 'toRevers') + 'ed']: _unused5
  } = _ref6;
  console.log(typeof r);
}
// multi-prop catch: the guarded default's segment flushes BEFORE its extraction line, so
// the second key's effect stays after the first default (native per-prop order)
try {
  risky();
} catch (_ref7) {
  let {
    [(e6(), 'toSorted')]: _unused6
  } = _ref7;
  let _ref8,
    ts = (_ref8 = _toSortedMaybeArray(_ref7)) === void 0 ? dflt2() : _ref8;
  let tsp = _toSplicedMaybeArray(_ref7);
  let {
    [(e7(), 'toSpliced')]: _unused7
  } = _ref7;
  console.log(typeof ts, typeof tsp);
}
// under REST the pattern stays whole, and the deferred guarded default lands AFTER the
// rebuilt pattern - the kept key's effect still precedes the default
try {
  risky();
} catch (_ref9) {
  let {
    [(e8(), 'findLast')]: _unused8,
    ...restA
  } = _ref9;
  let _ref10,
    fnl = (_ref10 = _findLastMaybeArray(_ref9)) === void 0 ? dflt3() : _ref10;
  console.log(typeof fnl, restA);
}

// both props defaulted, no rest: per-prop segments (key, guard, key, guard)
try {
  risky();
} catch (_ref11) {
  let {
    [(e9(), 'findLastIndex')]: _unused9
  } = _ref11;
  let _ref12,
    fli = (_ref12 = _findLastIndexMaybeArray(_ref11)) === void 0 ? dflt4() : _ref12;
  let {
    [(e10(), 'with')]: _unused10
  } = _ref11;
  let _ref13,
    w10 = (_ref13 = _withMaybeArray(_ref11)) === void 0 ? dflt5() : _ref13;
  console.log(fli, w10);
}

// a plain (non-computed) key with a default guards through the relocated per-prop channel
try {
  risky();
} catch (_ref14) {
  let _ref15,
    en = (_ref15 = _entries(_ref14)) === void 0 ? dflt6() : _ref15;
  console.log(en);
}

// a non-entry prop between two entries joins the segment before the guard
try {
  risky();
} catch (_ref16) {
  let {
    [(e11(), 'keys')]: _unused11
  } = _ref16;
  let _ref17,
    ks = (_ref17 = _keys(_ref16)) === void 0 ? dflt7() : _ref17;
  let fi = _fillMaybeArray(_ref16);
  let {
    message,
    [(e12(), 'fill')]: _unused12
  } = _ref16;
  console.log(ks, message, fi);
}

// a pattern-valued symbol prop in a catch param destructures the helper result off the
// relocated ref, dropping the dead residual (the catch-born declaration is synthesized, so
// the dead-residual gate must not depend on source positions)
try {
  risky();
} catch (_ref18) {
  let {
    name
  } = _getIteratorMethod(_ref18);
  console.log(name);
}
// with a rest sibling the consumed symbol key keeps a sentinel so rest still excludes it
try {
  risky();
} catch (_ref19) {
  let {
    name
  } = _getIteratorMethod(_ref19);
  let {
    [_Symbol$iterator]: _unused13,
    ...rest
  } = _ref19;
  console.log(name, rest);
}