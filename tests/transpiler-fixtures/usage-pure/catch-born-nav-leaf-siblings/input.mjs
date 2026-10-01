// A catch parameter relocates its pattern into the body, and the relocated `let` is a
// multi-declarator host once a hop memo joins it. A defaulted nav leaf beside a HOP-level sibling
// rewrites its own declarator in place (replacing it detached the pattern paths the traversal still
// held), and the fold's test ref stands as a leading declarator ahead of the binding on every
// channel - beside a LEAF-level sibling the guard once read a ref no statement declared. An
// anonymous default keeps the binding's inferred name on both legs.
const source = { codes: {}, other: { x: 1 } };
let a, b, c, d, e, f, g, h;
try { throw source; } catch ({ codes: { findIndex: m = () => -1 }, other }) { a = [m, other]; }
try { throw source; } catch ({ codes: { findIndex: m = 1 }, other }) { b = [m, other]; }
try { throw source; } catch ({ other, codes: { findIndex: m = () => -1 } }) { c = [m, other]; }
try { throw source; } catch ({ codes: { findIndex: m = () => -1 }, other: { x } }) { d = [m, x]; }
try { throw source; } catch ({ codes: { findIndex: m = () => -1 }, other: { toFixed: t = () => 0 } }) { e = [m, t]; }
try { throw source; } catch ({ codes: { findIndex: m = () => -1 } = {}, other }) { f = [m, other]; }
try { throw source; } catch ({ codes: { findIndex: m = () => -1, keys: k } }) { g = [m, k]; }
try { throw source; } catch ({ codes: { findIndex: m = class {}, keys: k } }) { h = [m, k]; }
export { a, b, c, d, e, f, g, h };
