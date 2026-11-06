// Required<T> wraps T  -  Required<{data: number[]}>.data should resolve through to number[].
type Inner = { data?: number[] };
declare const r: Required<Inner>;
r.data.at(0);
