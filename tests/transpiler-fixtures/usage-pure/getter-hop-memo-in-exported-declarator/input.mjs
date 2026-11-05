// An exported declarator evaluates its prefix and Promise-valued getter before either binding.
// withResolvers and name share that one captured constructor.
class KE {
  static get P() { log(); return Promise; }
}
export const { M: { withResolvers: s5, name: nm5 } } = (n++, { M: KE.P });
