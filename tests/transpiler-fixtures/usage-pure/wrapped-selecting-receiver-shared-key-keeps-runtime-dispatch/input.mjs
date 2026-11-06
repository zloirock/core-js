// Shared-name instance keys keep runtime dispatch through selecting receivers.
// Static branches are served without replacing a user object's own entries, keys or values.
function viaParamDefault([{ entries: e }] = [c ? Object : userObj]) { return e; }
const { w: { keys: viaKeyed } } = { w: c ? Object : userObj };
const { w: [{ values: viaKeyedArray }] } = { w: [c ? Object : userObj] };
export { viaParamDefault, viaKeyed, viaKeyedArray };
