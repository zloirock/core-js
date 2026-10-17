// A prefixed assignment captures the nested receiver after the prefix has run.
// The instance dispatch reads that capture once and leaves the assigned value intact.
let prefixes = 0;
const host = { m: [1, [2]] };
let at;
({ m: { at } } = (prefixes++, host));
console.log(at, prefixes);
