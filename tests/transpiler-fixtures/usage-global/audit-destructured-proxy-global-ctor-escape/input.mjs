// the escape a destructured constructor carries decides a PURE entry only: usage-global installs
// the polyfill on the shared global, so the module set is the same whether the binding is handed
// out or read where it stands. one constructor per line - the import set is the only observable
const { Map } = globalThis;
export const handed = Map;
const { Set: S } = globalThis;
use(new S());
