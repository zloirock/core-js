// a declare-signature pattern parameter may carry `?` on the PATTERN itself - the printed
// signature must keep it, annotated or not
declare function withArray([a]?: number[]): void;
declare function withObject({ a }?: { a: 1; }): void;
declare function bareOptional([a]?): void;
export const last = [1, 2, 3].at(-1);
