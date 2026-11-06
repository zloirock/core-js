// bodyless declare-class methods pair the same way
declare class C {
  m(this: C, x: string): number[];
  m(x: number): string;
}