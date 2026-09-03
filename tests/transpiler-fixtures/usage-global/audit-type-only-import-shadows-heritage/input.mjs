// a heritage clause is TYPE space, and there a type-only import IS the shadow: the interface below
// names immutable's Set, not the global, so no es.set.* belongs in the import set. a heritage name
// reaches the IDENTIFIER lane on both parsers rather than the annotation walk, which is why the
// question sits on the shared emitter - asked by one binding alone, the other leg injected here.
// one global per line: the shadowed row and its live twin observe separately
import type { Set } from 'immutable';
interface ShadowedExtends extends Set<number> {}

interface LiveExtends extends WeakSet<object> {}

declare const shadowed: ShadowedExtends;
declare const live: LiveExtends;
export const r = [shadowed, live];
