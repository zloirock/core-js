// A parameter's conditional array default and inner fallback keep native from reads.
// Supplied arguments are not replaced by the default's inferred value.
let pick = 1;
const userObj = {};
{
function g([{ from: f } = {}] = [pick ? Array : userObj]) { return f; }
}
