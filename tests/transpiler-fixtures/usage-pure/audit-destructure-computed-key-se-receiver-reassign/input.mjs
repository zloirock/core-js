// the computed key's side effect REASSIGNS the receiver binding. the instance extraction is emitted BEFORE
// the residual (which runs the key effect), so the polyfill read sees the receiver as it was before the key
// - matching native, which reads the property off the RHS value evaluated ahead of the key. emitting the
// extraction after the residual would read the reassigned binding (wrong receiver)
let arr = [[1], [2]];
const { [(arr = [[9]], 'flat')]: m } = arr;
const probe = [3].includes(3);
