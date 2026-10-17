// Each block locks an independent form: a destructuring assignment, declaration or catch parameter,
// or a computed member write.
// Computed keys, stored receiver values and sibling bindings keep their source order.
let pick = 1;
const userObj = {};
{
let f; ({ w: { from: f } } = { w: pick ? Array : userObj });
}
