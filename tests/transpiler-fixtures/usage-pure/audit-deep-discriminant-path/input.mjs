type Wrap = { meta: { kind: 'a'; data: string[] } | { kind: 'b'; data: number } };

function process(w: Wrap) {
  if (w.meta.kind === 'a') {
    return w.meta.data.at(0);
  }
  return w.meta.data;
}
