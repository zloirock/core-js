// the prototype-routed read rule has to hold wherever the `super` sits, not just in a plain method:
// an arrow keeps the enclosing super binding, a static block reads the parent CONSTRUCTOR (so a
// static field is visible there), an instance field initializer reads the parent prototype like any
// method, and the walk has to cross an intermediate class to reach the declaring one. the rows use
// only `at` and `includes` because they are the two methods carrying both an array and a string
// variant - the emitted helper is the whole signal here. nothing is exported: an escaping class
// switches the field narrow off entirely, which would make the static rows vacuous
class Base { get a() { return "s"; } }
class InArrow extends Base { a = [1]; m() { return (() => super.a.includes("s"))(); } }
class StaticBase { static b = [1]; }
class InStaticBlock extends StaticBase { static { super.b.at(0); } }
class InFieldInit extends Base { c = super.a.at(0); }
class Middle extends StaticBase {}
class TwoLevels extends Middle { static m() { return super.b.includes(1); } }
