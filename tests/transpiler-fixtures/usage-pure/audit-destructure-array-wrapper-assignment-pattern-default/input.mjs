// ArrayPattern wrapper around ObjectPattern with AssignmentPattern default at the
// inner level: `[{Array: {from}} = {}] = [globalThis]`. AssignmentPattern is a
// transparent destructure wrapper - default never fires because globalThis.Array.from
// is always defined under polyfill-always-wins, so flatten still resolves to Array.from
const [{ Array: { from } } = {}] = [globalThis];
from([]);
