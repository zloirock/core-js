// Shared capture and receiver-default routes preserve independently supported claims.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
let pick = 1;
const userObj = {};
const log = [];
{
const { w: [{ from: f }] } = { w: [pick ? Array : userObj] }; log.push(f === Array.from);
}
