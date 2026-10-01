// decorator argument with two independent receivers nested inside the call:
// outer `arr.includes(...)` and inner `other.at(0)`. each receiver gets its own
// polyfill rewrite; the decorator visitor must descend into the argument and
// rewrite both call sites without dropping either.
@dec(arr.includes(other.at(0)))
class C {}
