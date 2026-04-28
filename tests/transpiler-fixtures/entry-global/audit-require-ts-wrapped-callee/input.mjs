// `(require as any)('core-js/...')` - TS-wrapped require callee. Entry detection peels
// ParenthesizedExpression + TS expression wrappers so the Identifier check sees `require`
// and the entry expands to per-module imports
(require as any)(`core-js/actual/promise`);
