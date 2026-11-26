interface ReturnType<T> { produced: number[]; }
declare const q: ReturnType<string>;
export const last = q.produced.findLast(x => x);
q.produced.at(-1);
