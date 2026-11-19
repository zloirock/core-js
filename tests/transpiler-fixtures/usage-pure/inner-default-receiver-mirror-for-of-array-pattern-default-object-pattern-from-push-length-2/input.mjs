// A loop-head element default and its trailing sibling retain their own array positions.
// The served from leaf handles supplied Array and fallback Array without moving the sibling read.
const out = [];
for (const [{ from } = Array, tail] of [[undefined, 1], [Array, 2]]) out.push(from([1]).length + tail);
export { out };
