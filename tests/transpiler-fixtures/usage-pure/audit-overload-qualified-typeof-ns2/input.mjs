declare namespace NS2 {
  function w(x: unknown): number[];
  function w(x: string): string;
}
declare const call: typeof NS2.w;
call('ab').at(0);
