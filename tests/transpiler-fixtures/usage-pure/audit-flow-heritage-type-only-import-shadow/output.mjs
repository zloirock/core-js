// Flow spells the two heritage clauses with two node types, and both are type space: a name in
// either is a type reference, so a type-only import shadows it exactly as it shadows a plain
// annotation. `implements` used to answer differently from its `extends` twin, which is why both
// stand here beside an unshadowed control - one global per line, so each observes on its own
import type { Set } from 'immutable';
import type { Map } from 'immutable';
export class ShadowedImplements implements Set {}
interface ShadowedExtends extends Map {}
declare var shadowed: ShadowedExtends;
interface LiveExtends extends WeakSet {}
declare var live: LiveExtends;
export const r = [shadowed, live];