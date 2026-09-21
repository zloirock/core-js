// A tagged template is a CALL of its tag: the strings array fills the first slot, the interpolations
// follow, and the value the tag hands back is read the way a call's value is - so a read off it
// takes its polyfill and the tag still evaluates ahead of that read. The receiver the swap erases
// re-emits as a sequence prefix, which is what keeps the tag's own evaluation where the source
// wrote it, and both legs spell it the same way.
const tag = () => Map;
const a = tag`x`.has(1);
const tag2 = (() => Set);
const b = tag2`y`.intersection(new Set([1]));
function pick(strings, value) { return value; }
export const viaStatic = pick`${ Map }`.groupBy([1], x => x);
export { a, b };
