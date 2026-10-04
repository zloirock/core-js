// Removing an indirect entry load preserves getter reads reached through a local binding.
// Outer and nested callee prefixes keep their source order; quiet data reads disappear.
const log = [];
const box = { get first() { log.push('first'); return 0; }, get second() { log.push('second'); return 0; }, quiet: 0 };
(box.first, (box.second, require))('core-js/actual/array/from');
(box.quiet, require)('core-js/actual/array/from');
log;
