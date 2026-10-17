// a disable-next-line before a brace host whose FIRST statement sits inline on the opening
// line spans the whole block - an inner first-match end-line would under-cover the trailing
// lines and leak their polyfills past the directive
// core-js-disable-next-line
if (cond) { use(a.at(0));
  use(b.flat());
  use(c.toReversed());
}
export const after = d.toSorted();
