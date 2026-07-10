// a SET-ONLY accessor still reads as its param type in TS, so `S[keyof S]` includes it -
// the value union bails to generic instead of narrowing to the surviving members
// (wrong-family Maybe on the setter-typed runtime value, ie:11)
interface SetOnly {
  set foo(v: string);
  xs: number[];
}
declare const setOnlyValue: SetOnly[keyof SetOnly];
export const viaSetOnly = setOnlyValue.at(0);

// a PAIRED getter supplies the slot's read type - the setter arm skips and the union
// keeps its precise narrow
interface Paired {
  get foo(): number[];
  set foo(v: number[]);
  xs: number[];
}
declare const pairedValue: Paired[keyof Paired];
export const viaPaired = pairedValue.includes(1);
