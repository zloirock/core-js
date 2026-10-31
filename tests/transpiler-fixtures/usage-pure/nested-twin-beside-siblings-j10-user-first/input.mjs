// Nested leaves retain unrelated siblings at every enclosing level.
// User-object getters and defaults keep their source order; pristine built-in reads
// follow the built-in-read contract across declarations and control-flow hosts.
const box = { y: [1] };
const { y: { at: userFirst, other: o1 }, junk: j10 } = box;
export { userFirst };
export { o1 };
export { j10 };
