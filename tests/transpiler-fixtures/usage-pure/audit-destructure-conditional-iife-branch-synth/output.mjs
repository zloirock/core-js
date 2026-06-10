import _Array$from from "@core-js/pure/actual/array/from";
// conditional destructure init with an SE-bearing inline-call branch: the call branch synths to
// the polyfill literal with the rescued setup ahead of it (runs once, on its OWN branch only -
// the untaken side stays unevaluated), the plain branch synths directly. without the call-branch
// classification the taken branch read NATIVE statics (undefined on targets without them)
let calls = 0;
const cond = true;
const {
  from
} = cond ? ((() => {
  calls++;
  return Array;
})(), {
  from: _Array$from
}) : {
  from: _Array$from
};