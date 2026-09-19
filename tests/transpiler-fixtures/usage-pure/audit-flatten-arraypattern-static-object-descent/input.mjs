// ArrayPattern peel + static-object descent. wrapper holds an ObjectExpression with `.ns`
// pointing at the Object constructor; destructure indexes ArrayPattern[0] (which classifier
// peels via arrayIndex tracking) and walks ns -> entries to resolve Object.entries
const wrapper = { ns: Object };
const [{ ns: { entries } }] = [wrapper];
const arr = entries({ k: 1 });
arr.at(0);
