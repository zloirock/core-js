// undecidable conditional fold strips never-branch; only viable branch survives the synth
// union, keeping the surviving member dispatch sound
type Pick<K> = K extends string ? { v: number[] } : never;
declare const p: Pick<'x'>;
p.v.at(0);
p.v.flat();
