// A kept assignment of a realm-returning call carries its argument claims through guard rebuilding.
// The stored root keeps its value while the plain middle navigation lands on the backed leaf.
const realm = () => globalThis;
const values = [1, 2, 3];
let stored;
export const result = (stored = realm(values.at(0))).window.window.self?.Array.of(9).includes(9);
export { stored };
