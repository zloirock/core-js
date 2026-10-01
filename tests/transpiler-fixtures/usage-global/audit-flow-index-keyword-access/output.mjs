import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
// @flow
// Keyword-indexed access: `T[number]` reads the element type, `T[string]` reads the value of a
// string indexer. Both keywords are spelled differently in Flow, and the indexer itself lives in
// its own slot rather than among the properties - so neither shape reached the resolver that
// answers them precisely for TS. Distinct methods per arm: Array -> es.array.at,
// string -> es.string.includes.
type Rows = Array<Array<number>>;
type Labels = {
  [key: string]: string
};
declare var row: Rows[number];
declare var label: Labels[string];
row.at(0);
label.includes('x');