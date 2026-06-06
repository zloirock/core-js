// a side-effecting receiver combined with a side-effecting computed instance-method key. the
// receiver memo is hoisted ahead of the key SE (`(_ref = recv, key, _method(_ref).call(_ref))`)
// so the receiver evaluates first (native order) while the polyfill still applies. covers a single
// key SE, a multi-element key sequence, and a member-chain receiver with a trailing argument
export const a = getObj()[(p(), 'at')](-1);
export const b = getObj()[(c1(), c2(), 'flat')]();
export const c = getList().rows[(p(), 'findLast')](side());
