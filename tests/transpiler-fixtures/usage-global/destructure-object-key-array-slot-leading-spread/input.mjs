// an object-pattern key naming an array index reads the slot under the positional contract: past
// a leading spread every static element is a possible value, the same maybe-union the positional
// spelling enumerates, so both spellings of one read inject the static the runtime may reach
// one static per row, so every row is observable by its own module
const { 1: viaKeyed } = [...rest, Map];
export const a = viaKeyed.groupBy(src, x => x);
const [, viaPositional] = [...rest, Object];
export const b = viaPositional.fromEntries(src);
