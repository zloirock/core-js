// `infer U extends string` is violated by the concrete element `number`, so the conditional takes
// the FALSE branch (`number[]`), not the true branch (`string`): `.at` narrows to the array variant.
// binding the disqualified element would fire the true branch and emit the string variant instead
type Pick<T> = T extends Array<infer U extends string> ? string : number[];
declare const r: Pick<Array<number>>;
r.at(0);
