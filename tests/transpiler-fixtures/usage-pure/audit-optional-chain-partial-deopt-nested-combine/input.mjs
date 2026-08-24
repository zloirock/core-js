// deep optional chain whose nested polyfill combines leave a PARTIALLY deoptionalized
// receiver (some `?.` stripped at the folded hop, the chain-root `?.` kept). the nested
// rewrite must land in that partial-deopt form instead of throwing
const r = arr?.at(0)?.flat().includes(1).at(2);
