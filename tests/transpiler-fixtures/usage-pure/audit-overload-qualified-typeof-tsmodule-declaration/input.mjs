declare namespace NS {
  function q(x: number): number[];
  function q(x: string): string;
}
declare const call: typeof NS.q;
call(1).at(0);
