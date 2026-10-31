import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// several computed keys over a selection the build decides read the operand that runs as a plain
// receiver: its effect leads the first key, and no coercion keeps the constructor - nor the namespace
// entry an escape of a decided selection imports
export const log = [];
const any = (_pushMaybeArray(log).call(log, 'init'), _pushMaybeArray(log).call(log, 'k1'), _Promise$any),
  withResolvers = (_pushMaybeArray(log).call(log, 'k2'), _Promise$withResolvers);
export { any, withResolvers };