// a top-typed first arm (`unknown`) accepts every argument, so an undiscriminating arg still
// resolves the call to it - TS first-match
declare namespace NS2 {
  function w(x: unknown): number[];
  function w(x: string): string;
}
