// Shared capture and receiver-default routes preserve independently supported claims.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
let pick = 1;
const userObj = {};
const arr = [1, 2];
const log = [];
{
const [{ from: f }, { at: a }] = [pick ? Array : userObj, arr]; log.push(f === Array.from, typeof a);
}
