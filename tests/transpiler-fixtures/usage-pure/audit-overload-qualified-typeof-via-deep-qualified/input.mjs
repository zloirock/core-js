// deeper qualification resolves through the same channel
declare namespace Outer { namespace Sub {
  function d(x: number): number[];
  function d(x: string): string;
} }
declare const f2: typeof Outer.Sub.d;
export const viaDeepQualified = f2(5).includes(1);
