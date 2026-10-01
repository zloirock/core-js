// cyclic const chain through destructuring inits - must not crash during resolution
const { x: a } = b;
const { y: b } = a;
a.from;
