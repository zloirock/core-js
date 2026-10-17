// deeper qualification resolves through the same channel
declare namespace Outer { namespace Sub {
  function d(x: number): number[];
  function d(x: string): string;
} }
