// Shared capture and receiver-default routes preserve independently supported claims.
// Supplied values and defaults keep their source branches and independent claims.
let pick = 1;
const userObj = {};
{
function g([{ from: f } = {}] = [pick ? Array : userObj]) { return f; }
}
