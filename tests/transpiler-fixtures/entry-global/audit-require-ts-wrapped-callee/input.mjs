// `(require as any)('core-js/...')` - TS-wrapped require callee. Entry detection peels
// the parenthesized wrapper plus TS expression wrappers so the identifier check sees `require`
// and the entry expands to per-module imports
(require as any)(`core-js/actual/promise`);
