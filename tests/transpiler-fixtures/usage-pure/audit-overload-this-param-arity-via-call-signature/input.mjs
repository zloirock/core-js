// and call signatures on a callable object type
declare const f: {
  (this: Window, x: string): number[];
  (x: number): string;
};
// @ts-expect-error a call no overload admits is the shape under test
export const viaCallSignature = f('a').at(2);
