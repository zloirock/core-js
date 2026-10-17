// a static accessor and a static field initializer are static contexts too; an assignment
// pattern routes through the same funnel; a nested class resolves against the NEAREST
// extends host, not the outer one
class Accessor extends Array {
  static get x() { const { from } = this; return from; }
}
export const viaGetter = Accessor.x;
