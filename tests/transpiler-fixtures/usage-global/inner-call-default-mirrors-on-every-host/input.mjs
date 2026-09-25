// a static read through a pattern level whose DEFAULT is a call (`{ M: { groupBy } = f() }`): the call
// runs exactly when the default fires, so the level mirrors it on every host instead of reading the
// receiver the value may hold or flattening the read away
function f() { log(); return Map; }
function mkPromise() { log(); return Promise; }
function mkIterator() { log(); return Iterator; }
function h(o) {
  const { M: { groupBy: s } = f() } = o;
  return s;
}
const { P: { try: t } = mkPromise() } = {};
let a;
({ I: { from: a } = mkIterator() } = source);
use(h, t, a);
