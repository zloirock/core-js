// The retained slot follows a constructor alias without losing its statics.
const Held = Map;
const { C: { groupBy } } = { C: Held };
use(groupBy);
