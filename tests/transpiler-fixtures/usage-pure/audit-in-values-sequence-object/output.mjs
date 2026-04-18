// unwrapParens must peel `(0, Object)` so handleBinaryIn resolves the right-hand
// receiver and emits `true` for the static `'values' in Object` probe
if (true) {}