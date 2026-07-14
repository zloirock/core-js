// a disable-next-line before a brace host whose FIRST statement sits inline on the opening
// line spans the whole block - an inner first-match end-line would under-cover the trailing
// lines and leak their polyfills past the directive
// core-js-disable-next-line
if (cond) { use(a.at(0));
  use(b.flat());
  use(c.toReversed());
}
export const after = d.toSorted();

// a do-while statement extends PAST its closing brace - the trailing condition line must stay
// covered by the directive too, not just the brace-hosted body
// core-js-disable-next-line
do { use(e.findLast(f));
} while (use(g.toSpliced(0, 1)));
export const afterLoop = h.with(0, 1);

// a labeled brace host spans the same way as a bare block
// core-js-disable-next-line
tail: { use(i.flatMap(f));
  use(j.values());
}
export const afterLabel = k.includes(v);

// a BARE block is itself a statement-list host - descending to its inline first statement would
// return the shorter first-line end and leak the trailing lines past the directive
// core-js-disable-next-line
{ use(l.at(2));
  use(m.findLastIndex(g));
}
export const afterBare = n.flatMap(h);

// two siblings on the directive line where the SECOND spans further - the farthest end must win
// or the second statement's continuation line leaks
// core-js-disable-next-line
use(o.flat(2)); use(
  p.with(1, z));
export const afterSiblings = q.at(-1);
