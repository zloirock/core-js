import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.fill";
import "core-js/modules/es.array.find-index";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.with";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// usage-global twin: no text rewriting happens here, so the lock is the import set alone -
// every disabled method maps to a module no enabled row injects, and each trailing statement
// after a disabled region injects its own unique module

// a disable-next-line before a brace host whose FIRST statement sits inline on the opening
// line spans the whole block - an under-covering end-line would leak the trailing lines' modules
// core-js-disable-next-line
if (cond) {
  use(a.at(0));
  use(b.flat());
  use(c.toReversed());
}
export const after = d.toSorted(cmp);

// a do-while statement extends PAST its closing brace - the trailing condition line must stay
// covered by the directive too, not just the brace-hosted body
// core-js-disable-next-line
do {
  use(e.findLast(f));
} while (use(g.toSpliced(0, 1)));
export const afterLoop = h.with(0, 1);

// a labeled brace host spans the same way as a bare block
// core-js-disable-next-line
tail: {
  use(i.flatMap(f));
  use(j.values());
}
export const afterLabel = k.includes(v);

// a BARE block is itself a statement-list host - descending to its inline first statement would
// return the shorter first-line end and leak the trailing line's module past the directive
// core-js-disable-next-line
{
  use(l.copyWithin(0, 1));
  use(m.findLastIndex(f));
}
export const afterBare = n.fill(0);

// two siblings on the directive line where the SECOND spans further - the farthest end must win
// or the second statement's continuation line leaks its module
// core-js-disable-next-line
use(o.entries());
use(p.keys());
export const afterSiblings = q.findIndex(f);