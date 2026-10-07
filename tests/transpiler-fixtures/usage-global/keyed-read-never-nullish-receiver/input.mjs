// In usage-global every computed-key read stays native whatever its receiver, and each method injects its
// own module: the null rejection ahead of the key is a pure render only.
let k = 0;
const list = [1, 2];
const maybe = pick();
export const { [(k++, 'at')]: viaLiteral } = [1, 2];
export const { [(k++, 'flat')]: viaBinding } = list;
export const { [(k++, 'includes')]: viaFallback } = maybe ?? [3];
export const { [(k++, 'findLast')]: viaPrototype } = Array.prototype;
export function written() { let x = [1]; x = maybe; const { [(k++, 'with')]: w } = x; return w; }
export function beforeInit() { const { [(k++, 'toSorted')]: s } = late; return s; }
var late = [2, 1];
export function shadowed(Array) { const { [(k++, 'toReversed')]: r } = Array.prototype; return r; }
export function eitherArm(c) { const { [(k++, 'entries')]: e } = c ? list : Array.prototype; return e; }
export function selected(c) { const { [(k++, 'toSpliced')]: t } = c ? [1] : null; return t; }
export function opaqueArm(c) { const { [(k++, 'keys')]: o } = c ? [1] : maybe; return o; }
export function gated() { const { [(k++, 'fill')]: f } = maybe && [1]; return f; }
export function element() { const [{ [(k++, 'copyWithin')]: c }, z] = [maybe, 1]; return [c, z]; }
export function namespace() { const { [(k++, 'findLastIndex')]: n } = Math.prototype; return n; }
