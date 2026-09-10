// a decorated class extending `Array` with a static `super.from(...)` call: the decorator makes the
// heritage a proxy-global read, so the whole `Array` family lands whatever the static method spells.
// dropping the `super` call leaves the same set; dropping the decorator instead leaves none at all
@decorator class A extends Array { static f(x) { return super.from(x); } }
