import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// An exported declarator evaluates its prefix and Promise-valued getter before either binding.
// withResolvers and name share that one captured constructor.
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