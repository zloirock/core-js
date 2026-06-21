// `Tree` extends a SELF-cyclic interface (`A extends A`) then a CLASS whose own superclass
// is cyclic (`Sub extends Base`, `Base extends Sub`). the interface cycle must not bleed
// into the class super-walk and mask the class's OWN cycle (else Tree wrongly resolves to
// Object). with each parent walked in isolation, Tree stays unknowable and `.at` falls
// through to the instance polyfill (safe over-emit), never suppressed.
interface A extends A {}
class Base extends Sub {}
class Sub extends Base {}
interface Tree extends A, Sub {}
declare const t: Tree;
t.at(0);
