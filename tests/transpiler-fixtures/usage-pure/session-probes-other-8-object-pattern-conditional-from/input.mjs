// Nested literal containers preserve sibling effects and receiver uncertainty.
// Object rest keeps instance slots native; proven static leaves receive their pure entries.
let pick = 1;
const userObj = {};
{
const { w: { from: f } } = { get w() { return pick ? Array : userObj; } };
}
