// The number element fails the constraint on the inferred string, selecting the array member.
type Outcome<T> = T extends Array<infer V extends string> ? { data: string } : { data: number[] };
function read(value: Outcome<number[]>) { return value.data.at(0); }
export const result = read({ data: [42] });
