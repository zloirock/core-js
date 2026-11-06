// The closed false selector makes the user object the only reachable source. Its missing `from` stays
// missing and the computed key effect runs once. The unknown-selector assignment twin remains covered
// by `audit-cascade-cond-se-key-mirrors`.
const userObj = { Array: {} };
const useGlobal = false;
const { Array: { [(eff(), "from")]: from } } = useGlobal ? globalThis : userObj;
typeof from;
