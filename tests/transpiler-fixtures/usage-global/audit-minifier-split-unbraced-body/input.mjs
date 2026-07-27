// global twin of the un-braced split: the pre-pass runs before the method dispatch, so both flavors
// see the same braced statements. the global side asserts the module set rather than a rewrite -
// a receiver that reaches the destructure at all is what pulls the module in. distinct method per row
const src = [1];
for (;;) (se(), ({ at } = src));
if (c) (se(), ({ flat } = src));
