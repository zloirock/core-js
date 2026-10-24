// a constructor handed OUT through a container read escapes just as the container itself does:
// reads through wherever the value lands are unresolvable, so the reference has to carry the
// constructor's statics. the reads that stay home keep the bare constructor entry - the slot read
// that is only a receiver, and the static read that resolves where it stands
const box = { Base: Map, Kept: Set, Home: WeakMap };
hand(box.Base);
use(new box.Kept());
use(box.Home.name);
