// a divergent set whose first arm the arg-match cannot weigh (`object`) WIDENS to the generic
// helper instead of handing back one arm's type-specific dispatcher
declare namespace NS3 {
  function w(x: object): number[];
  function w(x: string): string;
}