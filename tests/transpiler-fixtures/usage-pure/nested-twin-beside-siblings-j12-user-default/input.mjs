// Nested leaves retain unrelated siblings at every enclosing level.
// User-object getters and defaults keep their source order; pristine built-in reads
// follow the built-in-read contract across declarations and control-flow hosts.
const box = { y: [1] };
const { junk: j12, y: { at: userDefault, other: o3 } = [] } = box;
export { j12 };
export { userDefault };
export { o3 };
