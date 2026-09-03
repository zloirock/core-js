// a .d.ts emits no runtime code at all: every declaration in it is ambient whether or not it
// spells `declare`, so nothing here is ever evaluated and no polyfill belongs in the output.
// the node-level emit question does not cover the four annotations below - each is a type
// REFERENCE, and the annotation lane injects on those by design, so the file name is the whole
// claim. one global per line, and renaming the file to `.ts` brings all four back
export declare const value: Set<number>;
export declare function make(): Map<string, number>;
export declare class Holder { readonly items: WeakSet<object>; }
export declare let pending: Promise<void>;

// the last line is the node-level rule's own, and stays dead in a `.ts` file too: it is here so
// the two rules are read together rather than one being mistaken for the other
export declare class Keyed { [ArrayBuffer.name]: number }
