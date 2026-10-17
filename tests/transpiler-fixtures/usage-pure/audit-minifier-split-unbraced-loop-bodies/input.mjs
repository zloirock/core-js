// a minifier collapses a destructure assignment into a statement-position sequence, and the
// destructure rewrite only sees it once that sequence is split into separate statements. an
// un-braced loop body holds its statement in a single slot instead of a list, so the split has
// nowhere to put the products until the slot is braced - miss that and the rewrite silently bails
// and the native member read survives into the output. one row per loop host, distinct method per
// row so a regression names the host that broke. the added block declares nothing, so bracing is
// unobservable
const src = [1];
for (let i = 0; i < 1; i++) (se(), ({ at } = src));
for (const k in o) (se(), ({ includes } = src));
for (const v of o) (se(), ({ flatMap } = src));
while (c) (se(), ({ flat } = src));
do (se(), ({ entries } = src)); while (c);
