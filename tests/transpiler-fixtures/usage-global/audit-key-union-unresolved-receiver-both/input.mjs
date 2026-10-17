// A conditionally reassigned computed-key alias on an UNRESOLVED receiver (a local instance) unions its reachable keys through the
// typeless dispatch the primary key already gets: every reachable branch may run at runtime, so each earns its side-effect import
// (over-inject-safe).
let k = 'at';
if (c) k = 'flat';
const arr = [1, 2];
export const both = arr[k];
