import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// `Tree` extends a SELF-cyclic interface (`A extends A`) then a CLASS whose own superclass
// is cyclic (`Sub extends Base`, `Base extends Sub`). the interface cycle must not bleed
// into the class super-walk and mask the class's OWN cycle (else Tree wrongly resolves to
// Object). with each parent walked in isolation, Tree stays unknowable and `.at` falls
// through to the instance polyfill (safe over-emit), never suppressed.
// @ts-expect-error a cyclic type tsc refuses is the shape under test
interface A extends A {}
// @ts-expect-error a cyclic type tsc refuses is the shape under test
class Base extends Sub {}
// @ts-expect-error a cyclic type tsc refuses is the shape under test
class Sub extends Base {}
interface Tree extends A, Sub {}
declare const t: Tree;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
t.at(0);