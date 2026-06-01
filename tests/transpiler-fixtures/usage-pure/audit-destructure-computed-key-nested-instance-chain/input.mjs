// a destructure COMPUTED KEY holding a nested instance chain (`[[9].flat().at(0)]`) routes through
// the range compose via the key path (not the default path), folding the inner `.flat` into the
// outer `.at` so the two overwrites don't flat-splice into an overlap
const { [[9].flat().at(0)]: x } = obj;
x;
