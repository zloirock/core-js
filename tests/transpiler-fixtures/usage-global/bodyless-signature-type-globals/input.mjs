// bodyless function-signature types name globals in their params without any function body to
// drive the param-type walk, so usage-global must sweep them directly. distinct globals per
// signature shape make it clear which line drives which polyfill
interface Reader { read(a: Map<number>): void }
declare function make(b: Set<number>): void;
type Handler = (c: WeakMap<object, number>) => void;
abstract class Base { abstract run(d: WeakSet<object>): void; }
export { make, Base };
export type { Reader, Handler };
