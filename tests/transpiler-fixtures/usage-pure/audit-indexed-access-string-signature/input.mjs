// T[string] indexed access — picks up TSIndexSignature with string parameter.
// only TSStringKeyword check is structural-exact; Flow/oxc param shape may differ.
interface Dict {
  [k: string]: number[];
}
declare const d: Dict[string];
d.at(-1);
