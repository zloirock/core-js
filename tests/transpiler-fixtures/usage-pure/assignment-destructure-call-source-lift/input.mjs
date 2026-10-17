// a flat destructure ASSIGNMENT over a call the rhs spells behind a sequence prefix, a comma-zero or a
// tag: pure consumes the claim - the rhs runs as a statement of its own, less a dead comma element,
// and the binding takes the static; global injects each static the call's constructor carries
function map() { return Map; }
function promise() { return Promise; }
function tag() { return Iterator; }
let n = 0;
let a, b, c;
({ groupBy: a } = (n++, map()));
({ try: b } = (0, promise()));
({ from: c } = tag`x`);
export { a, b, c, n };
