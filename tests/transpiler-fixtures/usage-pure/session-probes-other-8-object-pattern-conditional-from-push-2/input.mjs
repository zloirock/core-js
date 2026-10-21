// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
let pick = 1;
const userObj = {};
const log = [];
{
const { w: { from: f } } = { w: pick ? Array : userObj }; log.push(f === Array.from);
}
