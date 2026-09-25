// a computed hop key spelled by a CALL runs exactly once where the source runs it when the hop
// collapses onto its polyfill - on a read, a destructure, an optional member, and a WRITE through the
// hop (plain, logical, delete, update), which lands on the constructor the read would see
function k(v) { log(); return v; }
use(globalThis[k('Map')].groupBy);
const { try: t } = globalThis[k('Promise')];
use(t, globalThis[k('Iterator')]?.from);
globalThis[k('Set')].extra = 1;
globalThis[k('WeakMap')].extra ??= 1;
delete globalThis[k('WeakSet')].extra;
globalThis[k('DisposableStack')].count++;
