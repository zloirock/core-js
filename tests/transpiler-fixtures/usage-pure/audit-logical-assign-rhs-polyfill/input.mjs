// logical-assignment with polyfilled RHS: `Array.from` on the right of `||=` is a
// regular static read, no warning. plugin substitutes the pure binding directly;
// no special bail because the LHS is a writable user identifier
let x;
x ||= Array.from;
