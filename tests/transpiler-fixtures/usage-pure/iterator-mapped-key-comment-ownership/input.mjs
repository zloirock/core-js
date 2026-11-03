// A first-yield instance claim must preserve the order of the next iterator read.
// The retained key owns its comment; the mapped value uses a fresh key without that comment.
const events = [];
const row = [[], 0];
Object.defineProperty(row, 1, { get() { events.push(typeof method); return 9; } });
const { w: [{ at /* instance key */: method }, tail] } = { w: row };
use(method, tail, events);
