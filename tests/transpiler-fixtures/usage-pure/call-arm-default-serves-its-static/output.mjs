import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
import _Set from "@core-js/pure/actual/set/constructor";
// a DEFAULT selecting between a CALL and a constructor (`= f() || Set`) serves the static read through
// it off the call's value when that value can never be falsy, and runs the call only where the default
// fires - a nested level, a nullish selection, a top-level host, behind a sequence, and a parameter
function f() {
  log();
  return _Map;
}
function g() {
  log();
  return _Promise;
}
function k() {
  log();
  return _Iterator;
}
function m() {
  log();
  return Object;
}
function h1(o) {
  const {
    M: {
      groupBy: s
    } = (f(), {
      groupBy: _Map$groupBy
    }) || _Set
  } = o;
  return s;
}
function h2(o) {
  const {
    P: {
      try: t
    } = (g(), {
      try: _Promise$try
    }) ?? _Set
  } = o;
  return t;
}
const {
  I: {
    from: i3
  } = (k(), {
    from: _Iterator$from
  }) || _Set
} = {};
function h4(o) {
  const {
    O: {
      fromEntries: e
    } = (n++, m(), {
      fromEntries: _Object$fromEntries
    }) || _Set
  } = o;
  return e;
}
function h5({
  P: {
    withResolvers: w
  } = (g(), {
    withResolvers: _Promise$withResolvers
  }) || _Set
} = {}) {
  return w;
}
function h6({
  concat: c
} = (k(), {
  concat: _Iterator$concat
})) {
  return c;
}
use(h1, h2, i3, h4, h5, h6);