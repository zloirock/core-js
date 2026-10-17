import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Nested literal containers preserve sibling effects and receiver uncertainty.
// Object rest keeps instance slots native; proven static leaves receive their pure entries.
let pick = 1;
const userObj = {};
const log = [];
{
  const {
    w: {
      from: f
    } = {}
  } = {
    w: pick ? undefined : userObj
  };
  _pushMaybeArray(log).call(log, typeof f);
}