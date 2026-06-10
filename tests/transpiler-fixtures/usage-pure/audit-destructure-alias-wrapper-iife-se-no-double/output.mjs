import _Array$from from "@core-js/pure/actual/array/from";
// const-alias wrapper whose init carries an SE-bearing IIFE: the setup runs at the ALIAS
// declaration, so the flatten of the alias READ must extract WITHOUT re-emitting the call -
// a deref-escaped harvest once double-ran it
let calls = 0;
const wrapper = [(() => {
  calls++;
  return Array;
})()];
const from = _Array$from;