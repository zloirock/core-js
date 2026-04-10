type Deep<T> = { get(): T extends object ? T extends Array<infer U> ? U[] : never : T };
declare const d: Deep<string>;
d.get().at(-1);
