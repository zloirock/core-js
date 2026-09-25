// an instance claim that dispatches on a receiver CARRIED inside the init's literal (`{ y: nb.y }`)
// performs that read itself: a bodyless slot or a loop head rescues nothing beside the dispatch, so
// the getter runs once
const nb = { get y() { log(); return [1, 2]; } };
if (c) var { y: { at: viaSlot } } = { y: nb.y };
do var { y: { flat: viaLoop } } = { y: nb.y }; while (0);
for (var { y: { includes: viaHead } } = { y: nb.y }; !viaHead;) break;
for (let { y: { findLast: viaLet } } = { y: nb.y }, i = 0; i < 1; i++) use(viaLet);
use(viaSlot, viaLoop, viaHead);
