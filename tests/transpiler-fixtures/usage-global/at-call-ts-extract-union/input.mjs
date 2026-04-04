type Mixed = string | number | string[] | boolean;
const x: Extract<Mixed, string> = "" as any;
x.at(-1);
