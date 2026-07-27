// branch and label counterparts of the un-braced loop bodies: both arms of an `if` and a labeled
// statement each hold a single statement rather than a list, so the same bracing has to happen
// before the minifier-sequence split can reach them. distinct method per row so a regression names
// the slot that broke. `with` shares the slot shape but only parses in sloppy scripts, so it is
// covered by the plugin unit probes rather than here
const src = [1];
if (c) (se(), ({ at } = src));
if (c) x(); else (se(), ({ keys } = src));
lbl: (se(), ({ flat } = src));
