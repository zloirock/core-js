declare namespace Outer { namespace Sub {
  function d(x: number): number[];
  function d(x: string): string;
} }
declare const call: typeof Outer.Sub.d;
call('ab').at(0);
