// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
function tagArray() { return Array; }
function tagMap() { return Map; }
function wrap(strings, value) { return value; }
const { from } = tagArray`x`;
const { w: { groupBy } } = { w: tagMap`y` };
const [{ withResolvers }] = [wrap`z${ Promise }`];
export const flat = from([1]);
export const nested = groupBy([2], x => x);
export const wrapped = withResolvers();
