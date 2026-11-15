// Member lookup retains the distributive condition after substituting its type argument.
type Result<T> = T extends true ? { rows: number[] } : { rows: string };
declare const value: Result<boolean>;
value.rows.at(-1);
