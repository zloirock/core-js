import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// `Tree` extends a SELF-cyclic interface (`A extends A`) then a CLASS whose own superclass
// is cyclic (`Sub extends Base`, `Base extends Sub`). The interface cycle sets the flag
// first; without per-sub-walk isolation it bleeds into the class super-walk and masks the
// class's OWN cycle, so the class wrongly resolves to Object and Tree masquerades as a
// concrete type. Isolated, the class super-walk detects its own cycle, Tree stays unknowable,
// and `.at` falls through to the instance polyfill (safe over-emit), never suppressed.
interface A extends A {}
class Base extends Sub {}
class Sub extends Base {}
interface Tree extends A, Sub {}
declare const t: Tree;
t.at(0);