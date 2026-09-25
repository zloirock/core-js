import _Array$from from "@core-js/pure/actual/array/from";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _at from "@core-js/pure/actual/instance/at";
import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Iterator$zip from "@core-js/pure/actual/iterator/zip";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// a getter hop read by a static and an instance member (`{ M: KE.I }`) is memoized once, ahead of the
// static, on every host - a sibling declarator, a bodyless slot, a sequence init, beside a second hop,
// an export, with the instance member written first - and a prefixed sole instance leaf or a
// multi-leaf assignment carries its prefix into the one read it performs
class KE {
  static get I() {
    log();
    return _Iterator;
  }
  static get P() {
    log();
    return _Promise;
  }
}
function g() {
  log();
  return [1, [2]];
}
const z1 = log();
const _ref = KE.I;
const s1 = _Iterator$from,
  {
    M: {
      name: _unused
    }
  } = {
    M: _ref
  },
  nm1 = _nameMaybeFunction(_ref);
if (c) var _ref2 = KE.P,
  s2 = _Promise$try,
  nm2 = _nameMaybeFunction(_ref2),
  {
    M: {
      name: _unused2
    }
  } = {
    M: _ref2
  };
n++;
const _ref3 = KE.I;
const s3 = _Iterator$concat;
const nm3 = _nameMaybeFunction(_ref3);
const {
  M: {
    name: _unused3
  }
} = {
  M: _ref3
};
const _ref4 = {
  A: {
    from: _Array$from
  },
  M: KE.I
};
const {
  A: {
    from: a4
  }
} = _ref4;
const s4 = _Iterator$zip;
const _ref5 = _ref4.M;
const nm4 = _nameMaybeFunction(_ref5);
n++;
const _ref6 = KE.P;
export const s5 = _Promise$withResolvers;
export const nm5 = _nameMaybeFunction(_ref6);
export const {
  M: {
    name: _unused4
  }
} = {
  M: _ref6
};
const _ref7 = KE.P;
const nm8 = _nameMaybeFunction(_ref7);
const s8 = _Promise$allSettled;
const {
  M: {
    name: _unused5
  }
} = {
  M: _ref7
};
const _ref8 = KE.P;
let nm9 = _nameMaybeFunction(_ref8);
let s9 = _Promise$any;
let {
  M: {
    name: _unused6
  }
} = {
  M: _ref8
};
const s6 = _at((n++, h.m));
let s7, f7;
const _ref9 = (n++, g());
s7 = _findLastMaybeArray(_ref9);
f7 = _flatMaybeArray(_ref9);
use(z1, s1, nm1, s2, nm2, s3, nm3, a4, s4, nm4, s6, s7, f7, nm8, s8, nm9, s9);