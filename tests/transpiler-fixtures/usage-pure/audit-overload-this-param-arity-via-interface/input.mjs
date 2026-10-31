// interface method signatures too
interface I {
  pick(this: I, x: string): number[];
  pick(x: number): string;
}
declare const i: I;
export const viaInterface = i.pick('a').includes(1);
