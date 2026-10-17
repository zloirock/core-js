// ... and every consumer of such a run rides the same span: a `delete` reaches its slot off it, and
// a dispatch above it reads its receiver through it - a plan that stood down here left the whole
// navigation raw, the one spelling the pure method exists to prevent
const box = { self: {} };
