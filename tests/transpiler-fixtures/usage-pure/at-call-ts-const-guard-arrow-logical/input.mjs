declare const x: string | number[];
typeof x === "string" && (() => x.at(-1))();
