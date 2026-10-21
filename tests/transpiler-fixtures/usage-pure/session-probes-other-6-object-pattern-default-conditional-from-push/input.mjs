// Shared capture and receiver-default routes preserve independently supported claims.
// Supplied values and defaults keep their source branches and independent claims. Instance claims retain their own receivers.
let pick = 1;
const userObj = {};
const log = [];
function eff() { return Object; }
{
const { a: eff1 = eff(), w: { from: f } } = { a: undefined, w: pick ? Array : userObj }; log.push(f === Array.from, eff1);
}
