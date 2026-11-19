declare class C {
  m(this: C, x: string): number[];
  m(x: number): string;
}
declare const c: C;
export const viaDeclareClass = c.m('a').at(1);
