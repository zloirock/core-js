// 3-level nested SE wrapping the destructure AE. each SE level contributes one prefix
// expression to the cascade emit. source order must be preserved: tagA -> tagB -> tagC
// then the polyfill assignment. inner-to-outer walker now unshifts each level's prefix
const log = [];
function tagA() { log.push('A'); return 0; }
function tagB() { log.push('B'); return 0; }
function tagC() { log.push('C'); return 0; }
let from;
(tagA(), (tagB(), (tagC(), ({ Array: { from } } = globalThis))));
[log, from];
