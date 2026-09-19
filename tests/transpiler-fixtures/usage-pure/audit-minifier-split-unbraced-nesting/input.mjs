// nesting around the un-braced slot: a slot whose statement is itself a slot host, a statement list
// reached only THROUGH a slot, and a sequence nested inside the slot's sequence. the first two check
// that the walk recurses past a slot instead of stopping at it, the third that the split still
// reaches a fixpoint once the outer statement has been braced. the last row is the directive
// boundary: a leading string operand promoted to its own statement would read as a prologue entry
// in a statement list, so the split leaves no statement for a quiet literal - the brace path builds
// its products through the same builder and must leave none too. distinct method per row
const src = [1];
if (c) for (;;) (se(), ({ at } = src));
if (d) switch (k) { case 1: (se(), ({ includes } = src)); }
while (e) (a(), (b(), ({ flat } = src)), (g(), ({ flatMap } = src)));
lbl: ("use strict", ({ entries } = src));
