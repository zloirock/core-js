// the same scope-less param position with the other pattern kinds: a nested rest, an array pattern
// and a defaulted property. One host per line - ambient function, method signature, ambient class
// method - and one multi-family method per line, so a host that stopped narrowing shows up as the
// string or iterator family joining the import set instead of being masked by a sibling.
declare function pick({ head, ...tail }: { head: number; tail: string[]; }): number[];
pick({ head: 1 }).at(0);

interface Swapper { swap([left, right]: [number[], string]): string[]; }
declare const swapper: Swapper;
swapper.swap([[1], 'a']).includes('a');

declare class Bag { take({ size = 1 }: { size?: number; }): number[]; }
declare const bag: Bag;
bag.take({}).map(n => n);
