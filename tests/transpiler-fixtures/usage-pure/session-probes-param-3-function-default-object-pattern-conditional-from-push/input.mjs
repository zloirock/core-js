// Shared capture and receiver-default routes preserve independently supported claims.
// Supplied values and defaults keep their source branches and independent claims. Instance claims retain their own receivers.
let pick = 1;
const userObj = {};
const log = [];
{
function g({ w: { from: f } } = { w: pick ? Array : userObj }) { return f; } log.push(g() === Array.from, g({ w: userObj })());
}
