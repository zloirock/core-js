namespace NS {
  export interface Box { items: number[] }
  export interface Box { meta: string[] }
}
declare const b: NS.Box;
b.meta.at(-1);
