declare class C {
  m(this: C, x: string): number[];
  m(x: number): string;
}
declare const c: C;
c.m('ab').at(0);
