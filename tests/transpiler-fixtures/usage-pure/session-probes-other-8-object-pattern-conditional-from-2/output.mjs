import _Array$from from "@core-js/pure/actual/array/from";
// Nested literal containers preserve sibling effects and receiver uncertainty.
// Object rest keeps instance slots native; proven static leaves receive their pure entries.
let pick = 1;
const userObj = {};
{
  const {
    w: {
      from: f
    }
  } = {
    w: pick ? {
      from: _Array$from
    } : userObj
  };
}