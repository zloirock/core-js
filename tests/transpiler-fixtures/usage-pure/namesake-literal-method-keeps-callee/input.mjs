// the method of a local LITERAL resolves the way a local function does: a namesake of the literal's
// name bound and read in another scope - a parameter, a local of another body - opens nothing, so the
// static its method returns is still the realm's. one static per row
export const escaping = { lend: () => other };
function relabelLiteral(crate1) { return crate1; }
const crate1 = { lend() { return Math; } };
export const viaLiteralMethodParam = crate1.lend().cbrt(8);
function elsewhereLiteral() { const crate2 = 1; return crate2; }
const crate2 = { lend() { return Object; } };
export const viaLiteralMethodLocal = crate2.lend().fromEntries([]);
