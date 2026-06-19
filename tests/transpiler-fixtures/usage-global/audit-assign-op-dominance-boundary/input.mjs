// the dominance boundary the logical-assign fix introduces: a LOGICAL assignment (`||=`) writes only on
// the short-circuit path, so the alias still holds the global - usage-global injects its static. a COMPOUND
// assignment (`+=`) writes UNCONDITIONALLY and produces a derived value, so it dominates and the init is
// dead - no injection. distinct statics per line so the present/absent imports are attributable.
var A = Array;
A ||= 0;
A.from([1]);
var B = Array;
B += 1;
B.of(1);
