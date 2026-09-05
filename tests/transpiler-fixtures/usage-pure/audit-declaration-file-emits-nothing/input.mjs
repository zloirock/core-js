// the usage-pure twin of the file-level claim. pure rewrites READS, and a valid `.d.ts` holds
// none: the four annotations below are not reads (pure leaves them alone in a `.ts` file too),
// and the computed key on the last line is a read the NODE-level emit question already erases.
// so the file-level rule has nothing left to observe in this flavor - this fixture guards the
// pair, and goes red only when both rules are gone. the key row is what makes it go red at all:
// before the emit question existed it printed `[_nameMaybeFunction(_ArrayBuffer)]` in an
// ambient class, which is a rewrite of a member that never reaches the emit
export declare const value: Set<number>;
export declare function make(): Map<string, number>;
export declare class Holder { readonly items: WeakSet<object>; }
export declare let pending: Promise<void>;
export declare class Keyed { [ArrayBuffer.name]: number }
