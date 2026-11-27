// A never receiver cannot contribute a member. A never property contributes no value either.
type Pick<K> = K extends string ? { v: number[] } : never;
export function read<K>(p: Pick<K>) {
  return p.v.at(0);
}
type Member<K> = K extends string ? { v: number[] } : { v: never };
export function field<K>(p: Member<K>) {
  return p.v.includes(1);
}
declare const fixed: Pick<'x'>;
fixed.v.flat();
