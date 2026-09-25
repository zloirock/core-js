// an extraction beside a SURVIVING residual keeps the source's key order: a member target's setter,
// a user getter the residual reads and a binding written before them all observe it - the ordered
// capture holds every key in its slot where a crossed operation runs code
class C {
  static get name() { log(); return 'C'; }
  static groupBy = 1;
}
function user() { log(); return C; }
function effIterator() { log(); return Iterator; }
function effArray() { log(); return Array; }
const ob = { set a(v) { log(v); }, set b(v) { log(v); }, set f(v) { log(v); } };
({ from: ob.a, name: ob.b } = effIterator());
let s0, nm;
({ groupBy: s0, name: nm } = user());
let x;
({ fromAsync: x, isArray: ob.f } = effArray());
use(s0, nm, x);
