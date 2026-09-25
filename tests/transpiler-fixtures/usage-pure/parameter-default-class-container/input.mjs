// a nested parameter pattern whose default is a class reads the class's static slot the way it
// reads a literal's
class K { static M = Map; }
const o = { P: Promise };
export function viaClass({ M: { groupBy } } = K) { return groupBy; }
export function viaLiteral({ P: { try: attempt } } = o) { return attempt; }
