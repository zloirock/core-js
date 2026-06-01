// a destructure init that is a split-emitted instance call (`xs.flat(...)`) carrying a nested
// arrow body-wrap (`() => [1].at(0)`): extracting the split for the destructure expansion must
// resolve the split by its logical range and leave the body-wrap to compose, preserving `var _ref`
const { includes } = xs.flat(h(() => [1].at(0)));
includes("x");
