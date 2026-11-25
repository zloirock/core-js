// Both getters run in source order before the expanded load. After these reads,
// the binding has already been observed, so a subsequent property read stays in place.
const log = [];
const box = { get first() { log.push('first'); return 0; }, get second() { log.push('second'); return 0; }, quiet: 0 };
(box.first, (box.second, require))('core-js/actual/array/from');
(box.quiet, require)('core-js/actual/array/from');
log;
