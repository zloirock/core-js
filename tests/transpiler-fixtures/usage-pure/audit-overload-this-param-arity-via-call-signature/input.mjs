// and call signatures on a callable object type
declare const f: {
  (this: Window, x: string): number[];
  (x: number): string;
};
export const viaCallSignature = f('a').at(2);
