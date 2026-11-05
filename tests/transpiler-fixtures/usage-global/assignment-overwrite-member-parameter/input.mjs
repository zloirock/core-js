// A member target keeps its setter after the instance read and a live default.
// The opaque receiver permits a claim; an own literal method is the refusal control.
export function read(receiver, target, fallback) {
  ({ slot: { at: target.method = fallback() } } = { slot: receiver });
}
