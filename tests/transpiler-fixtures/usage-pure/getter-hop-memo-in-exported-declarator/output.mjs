import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// Shared capture and receiver-default routes preserve independently supported claims.
// Getter reads and binding initialization keep their source order. Instance claims retain their own receivers.
class KE {
  static get P() {
    log();
    return _Promise;
  }
}
const {
    M: _ref
  } = (n++, {
    M: KE.P
  }),
  s5 = _Promise$withResolvers,
  nm5 = _nameMaybeFunction(_ref);
export { s5, nm5 };