// The closed false selector makes the user object the only reachable source, so its own Array.from
// remains native. Unknown proxy-vs-user nested selection remains covered by
// `audit-nested-cond-multi-key-mirrors`.
const userObj = { Array: { from: function () { return 'USER'; } } };
let useGlobal = false;
const { Array: { from } } = useGlobal ? globalThis : userObj;
from([7, 8]);
