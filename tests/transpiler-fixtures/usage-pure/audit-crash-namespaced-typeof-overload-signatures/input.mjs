// Qualified typeof resolves the last ambient overload to its actual declaration.
declare namespace NS {
  function fn(x: number): string;
  function fn(x: string): number[];
}
type T = ReturnType<typeof NS.fn>;
declare const v: T;
v.at(0);
v.includes(2);
