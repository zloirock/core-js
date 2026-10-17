// A getter hop read by a static and an instance member is memoized once, ahead of the static,
// in an exported declarator.
class KE {
  static get P() { log(); return Promise; }
}
export const { M: { withResolvers: s5, name: nm5 } } = (n++, { M: KE.P });
