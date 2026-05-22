// ReadonlyArray<T> is a concrete annotation, not a Record-style open utility.
// classify should return 'closed' so the typeof guard does NOT narrow it;
// readonly-ness affects only mutability, not the receiver shape. Method `at`
// is shared by string and array so the polyfill import alone confirms the
// receiver kept its ReadonlyArray<number> classification.
function probe(input: ReadonlyArray<number>) {
  if (typeof input === "string") return null;
  return input.at(0);
}

probe();
