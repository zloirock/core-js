// Each computed key precedes its own assignment and follows the previous one.
// A claimed static binds the pure method even with a native present; its user default
// is dead. The next key observes the assigned method rather than its old value.
const events = [];
let method;
let isArray;
({ [(events.push(typeof method), 'from')]: method = null,
  [(events.push(typeof method), 'isArray')]: isArray } = Array);
export const result = [method('ab'), isArray([]), events];
