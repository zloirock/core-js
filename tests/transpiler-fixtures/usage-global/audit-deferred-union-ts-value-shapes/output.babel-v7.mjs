import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-start";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat-map";
// TS-only value shapes on the write side of a deferred read's union. they matter because the type
// wrappers are exactly where the two parsers differ: one keeps the wrapper node the other strips,
// and the resolver reaches the value through a path that carries no scope of its own. a row that
// narrows here is also the two emitters agreeing on the wrapped shape. distinct method per line
declare const source: number[];
let castWrite = null;
const readCast = () => castWrite.at(0);
castWrite = [1] as number[];
export const a = readCast();
let satisfiesWrite = null;
const readSatisfies = () => satisfiesWrite.includes(1);
satisfiesWrite = [1] satisfies number[];
export const b = readSatisfies();
let assertedWrite = null;
const readAsserted = () => assertedWrite.flatMap(f);
assertedWrite = source!;
export const c = readAsserted();
enum Names {
  First = "ab",
}
let enumWrite = null;
const readEnum = () => enumWrite.padStart(2);
enumWrite = Names.First;
export const d = readEnum();