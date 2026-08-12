// a rest param in a signature that owns no scope - the four type-level function shapes - is reached
// by the scope walk as a raw pattern, where the ESTree pipeline used to abort the whole file. Each
// line carries a method that exists on more than one receiver family, so an array-only import set
// is what proves the signature still RESOLVED rather than merely parsed, and the four methods are
// distinct so one host that stopped resolving cannot hide behind a sibling.
type ArrayFactory = (...seeds: number[]) => number[];
declare const arrayFactory: ArrayFactory;
arrayFactory().at(0);

type StringBoxCtor = new (...seeds: string[]) => string[];
declare const StringBox: StringBoxCtor;
new StringBox().includes('a');

interface Callable { (...seeds: boolean[]): number[]; }
declare const callable: Callable;
callable().map(n => n);

interface Constructable { new (...seeds: symbol[]): number[]; }
declare const Constructable: Constructable;
new Constructable().find(n => n > 0);
