// nested discriminant path `w.meta.kind === 'a'` must narrow through the nested
// object, so `w.meta.data.at(0)` dispatches against the matching union arm
type Wrap = { meta: { kind: 'a'; data: string[] } | { kind: 'b'; data: number } };

function process(w: Wrap) {
  if (w.meta.kind === 'a') {
    return w.meta.data.at(0);
  }
  return w.meta.data;
}
