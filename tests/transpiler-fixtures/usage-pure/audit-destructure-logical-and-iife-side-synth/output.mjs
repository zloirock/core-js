import _Array$from from "@core-js/pure/actual/array/from";
// logical AND destructure init with an SE-bearing inline-call side: the call side synths to the
// polyfill literal with the rescued setup ahead of it, inside the logical - the gate value
// short-circuits exactly as written (a falsy gate never runs the call)
let calls = 0;
const cond = true;
const {
  from
} = cond && ((() => {
  calls++;
  return Array;
})(), {
  from: _Array$from
});