// a constructor read off the proxy-global surface escapes exactly as the bare spelling does: the
// value lands where no read resolves, so the reference has to carry the constructor's statics.
// the reads that stay home keep the bare constructor entry - the `new` callee and the static read
hand(globalThis.Map);
use(new globalThis.Set());
use(globalThis.WeakMap.name);
