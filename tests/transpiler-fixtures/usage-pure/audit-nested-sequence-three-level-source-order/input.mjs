// 3-level nested SE wrapping AE destructure. asserts each level's prefix
// evaluates in source order (log = ['A', 'B', 'C']), then polyfill assignment
const log = [];
function tagA() { log.push('A'); return 0; }
function tagB() { log.push('B'); return 0; }
function tagC() { log.push('C'); return 0; }
let from;
(tagA(), (tagB(), (tagC(), ({ Array: { from } } = globalThis))));
[log, from];
