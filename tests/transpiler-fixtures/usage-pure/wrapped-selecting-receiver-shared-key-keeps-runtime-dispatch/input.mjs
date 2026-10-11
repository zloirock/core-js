// a key both the constructor and an instance carry, read through a wrapper level off a selecting receiver,
// keeps runtime dispatch: an identity guard on the constructor serves its static and the generic instance
// helper any other value - under a key or an array element under it - and a parameter's default hands
// the generic helper the arm it mirrors
function viaParamDefault([{ entries: e }] = [c ? Object : userObj]) { return e; }
const { w: { keys: viaKeyed } } = { w: c ? Object : userObj };
const { w: [{ values: viaKeyedArray }] } = { w: [c ? Object : userObj] };
export { viaParamDefault, viaKeyed, viaKeyedArray };
