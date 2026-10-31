// a kept root re-emits itself, so it must not ALSO be harvested as an effect (the assignment would run
// twice) - but only it is exempt. an effect the sequence around it carries is not the assignment and must
// still ride ahead, in source order
let sc = 0;
let sq;
export const seAroundKeptRoot = (sc++, sq = globalThis.window)?.self.Array.prototype.findIndex.call([1], x => x);
export { sc };
