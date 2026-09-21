// A tagged template is a call of its tag, so a destructure whose RECEIVER is one names what the tag
// hands back the way a call's receiver does - the tag still runs ahead of the extraction. Each host
// reads a different static, because a shared one would let a single injection mask the others.
function tagArray() { return Array; }
function tagMap() { return Map; }
function wrap(strings, value) { return value; }
const { from } = tagArray`x`;
const { w: { groupBy } } = { w: tagMap`y` };
const [{ withResolvers }] = [wrap`z${ Promise }`];
export const flat = from([1]);
export const nested = groupBy([2], x => x);
export const wrapped = withResolvers();
