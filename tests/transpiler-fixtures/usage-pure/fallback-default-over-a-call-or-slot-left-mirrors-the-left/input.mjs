// a `||` / `??` parameter default whose left always yields a constructor through a call, an IIFE, a static container's
// slot or a class static becomes the literal that left mirrors, its other keys read off the left re-spelled -
// in an exported function, whose callers nothing sees, as in a local one; a dead prefix of the left drops
const mkM = () => Map;
const box = { U: Map };
class K { static U = Map; }
export function viaCall({ groupBy, prototype } = mkM() || Object) { return [groupBy, prototype]; }
export function viaIife({ groupBy, prototype } = (() => Map)() ?? Object) { return [groupBy, prototype]; }
export function viaSlot({ groupBy, prototype } = box.U || Object) { return [groupBy, prototype]; }
export function viaStatic({ groupBy, prototype } = K.U ?? Object) { return [groupBy, prototype]; }
export function viaSequence({ groupBy, prototype } = (0, mkM()) || Object) { return [groupBy, prototype]; }
function local({ groupBy, prototype } = mkM() || Object) { return [groupBy, prototype]; }
export const viaLocal = local();
