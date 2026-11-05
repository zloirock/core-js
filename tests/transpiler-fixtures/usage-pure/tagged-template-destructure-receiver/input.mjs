// A direct tag-returned constructor supports static extraction.
// Constructor values inside literal wrappers keep full entries and native property reads.
function tagArray() { return Array; }
function tagMap() { return Map; }
function wrap(strings, value) { return value; }
const { from } = tagArray`x`;
const { w: { groupBy } } = { w: tagMap`y` };
const [{ withResolvers }] = [wrap`z${ Promise }`];
export const flat = from([1]);
export const nested = groupBy([2], x => x);
export const wrapped = withResolvers();
