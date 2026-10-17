// An array alias can gain indexed getters or its own iterator before the pattern reads it.
// Keep its native iteration so a later read observes the preceding instance binding.
const events = [];
const row = [[], 0];
Object.defineProperty(row, 1, { get() { events.push(typeof method); return 9; } });
const { w: [{ at: method }, tail] } = { w: row };
use(method, tail, events);
