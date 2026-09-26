import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a static read through a pattern level whose DEFAULT is a call (`{ M: { groupBy } = f() }`): the call
// runs exactly when the default fires, so the level mirrors it on every host instead of reading the
// receiver the value may hold or flattening the read away
function f() {
  log();
  return _Map;
}
function mkPromise() {
  log();
  return _Promise;
}
function mkIterator() {
  log();
  return _Iterator;
}
function h(o) {
  const {
    M: {
      groupBy: s
    } = (f(), {
      groupBy: _Map$groupBy
    })
  } = o;
  return s;
}
const {
  P: {
    try: t
  } = (mkPromise(), {
    try: _Promise$try
  })
} = {};
let a;
({
  I: {
    from: a
  } = (mkIterator(), {
    from: _Iterator$from
  })
} = source);
use(h, t, a);