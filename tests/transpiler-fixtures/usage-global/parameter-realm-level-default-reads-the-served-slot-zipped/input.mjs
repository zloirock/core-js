// A realm key's level nested in a parameter's pattern reads its slot through the parameter's default, as a
// declaration's reads it through the init, whatever hosts the parameter and beside a rest alike. The level's own
// default stays live, since a caller's object may lack the slot, and loads what it reads (`grouped({})` reads
// `Object.groupBy`), save where the one caller hands the realm itself (`viaArgument`): that default is dead.
export function zipped({ Iterator: { zip } = Set } = globalThis) {
  return zip;
}
