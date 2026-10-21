// A static leaf under a literal wrapper keeps the alias read that may throw.
// The initializer's independent instance claim remains live before that read.
const held = globalThis.window;
const [{ of }] = [(log.push([7].at(0)), held.Array)];
export const result = of(7);
