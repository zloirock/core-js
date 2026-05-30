// deep optional chain whose nested polyfill combines leave a PARTIALLY deoptionalized
// receiver (some `?.` stripped at the folded hop, the chain-root `?.` kept). compose must
// locate the inner needle in that partial-deopt form instead of throwing
const r = arr?.at(0)?.flat().includes(1).at(2);
