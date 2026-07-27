// spreads compose, and only the container each spread lands in decides. an ARRAY spread iterates and
// copies no property, so the object stays local however many array spreads wrap it; an OBJECT spread
// copies its own properties out, and that verdict wins wherever it appears in the chain. the four
// rows are the composition matrix. `at` and `includes` are the two methods carrying both an array and
// a string variant, so the type-agnostic entry is visible as a different helper
export function arrayInArray() {
  const held = { items: [1], read() { return this.items.at(0); } };
  return [held.read(), [...[...held]]];
}
export function objectInObject() {
  const held = { items: [1], read() { return this.items.includes(1); } };
  return [held.read(), { ...{ ...held } }];
}
export function objectInsideArray() {
  const held = { items: [1], read() { return this.items.at(0); } };
  return [held.read(), [...{ ...held }]];
}
export function arrayInsideObject() {
  const held = { items: [1], read() { return this.items.includes(1); } };
  return [held.read(), { ...[...held] }];
}
