// The closed false selector makes the user object the only reachable assignment value, so its own
// `from` stays native and no Array static is substituted. An unknown assignment selector with an
// effectful key remains covered by `audit-cascade-cond-se-key-mirrors`.
let from;
let pick = false;
const userObj = { Array: { from: function () { return 'USER'; } } };
({ Array: { from } } = pick ? globalThis : userObj);
