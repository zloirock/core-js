// Shared capture and receiver-default routes preserve independently supported claims.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
let pick = 1;
const userObj = {};
const log = [];
{
class C5 { static { const [{ from: f }] = [pick ? Array : userObj]; C5.f = f; } } log.push(C5.f === Array.from);
}
