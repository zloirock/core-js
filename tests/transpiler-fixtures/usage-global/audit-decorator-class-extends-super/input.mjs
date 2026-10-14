// a decorated class extending `Array` with a static `super.from(...)` call: the decorator hands the
// class, its heritage with it, to code this file does not see, which loads none of `Array`'s modules -
// core-js polyfills no Array constructor - so the static the method spells loads alone, as it does
// without the decorator
@decorator class A extends Array { static f(x) { return super.from(x); } }
