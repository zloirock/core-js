// the concrete element `number` SATISFIES `infer U extends number`, so the conditional fires its
// TRUE branch (`string[]`) - the constraint-assignability gate must not over-bail a satisfying
// candidate. `r` is `string[]`, so `.at` narrows to the array variant (the violating case is its own fixture)
type Pick<T> = T extends Array<infer U extends number> ? string[] : Date;
declare const r: Pick<Array<number>>;
r.at(0);
