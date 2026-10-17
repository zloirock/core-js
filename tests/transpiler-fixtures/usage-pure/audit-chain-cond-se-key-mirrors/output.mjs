import _self from "@core-js/pure/actual/self";
// The closed false selector makes the user object the only reachable source. The computed key effect
// stays on the native read and runs once. Unknown proxy-vs-user JSON selection remains covered by
// `audit-nested-cond-multi-outer-key-mirrors`.
const userObj = {};
const cond = false;
const {
  [(eff(), "stringify")]: stringify
} = cond ? _self.JSON : userObj;
typeof stringify;