// a destructured parameter whose receiver default is a MEMBER of the file's own container - a class
// static field, a pure static getter, a literal's data slot - takes the static: pure mirrors the
// default on both legs, since the read of a pure member is no work the source did, and the mirror
// keeps a caller-supplied object; global injects the static
class Fields {
  static M = Map;
}
class Getters {
  static get P() { return Promise; }
}
const data = { I: Iterator };
export function viaField({ groupBy } = Fields.M) { return groupBy; }
export function viaGetter({ try: attempt } = Getters.P) { return attempt; }
export function viaData({ from } = data.I) { return from; }
// ... and a caller that supplies its own object still reads its own slot
export const supplied = viaData({ from: 1 });
