// a destructure init that is a split-emitted instance call (`xs.flat(...)`) carrying a nested
// arrow body-wrap (`() => [1].at(0)`): extracting the split for the destructure expansion must
// keep the receiver capture local to that arrow while preserving the outer call order.
const { includes } = xs.flat(h(() => [1].at(0)));
includes("x");
