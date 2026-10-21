// Shared capture and receiver-default routes preserve independently supported claims.
// Getter reads and binding initialization keep their source order. Instance claims retain their own receivers.
class KE {
  static get P() { log(); return Promise; }
}
export const { M: { withResolvers: s5, name: nm5 } } = (n++, { M: KE.P });
