interface Box { items: number[] }
interface Box { meta: string[] }
declare const b: Box;
b.meta.at(-1);
