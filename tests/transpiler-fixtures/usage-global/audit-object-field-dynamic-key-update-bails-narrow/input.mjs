// o[k]++ is a dynamic computed-key write (update target) that can hit the tracked field, so the
// o.x narrow bails and .at stays generic (Array|String), not Array-only
const o = { x: [1, 2, 3] };
o[k]++;
o.x.at(-1);
