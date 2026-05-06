// TS interface declaration merging: same name `Reg` declared twice. Each contributes
// methods that resolveTypedMember must enumerate via getTypeMembers. Merged signature
// list flows through resolveMemberCallReturnFromAnnotation which iterates over members.
// distinct methods so each line traces to its declaration's return shape
interface Reg {
  one(): string[];
}
interface Reg {
  two(): string;
}
declare const reg: Reg;
reg.one().findLast(x => x);
reg.one().at(0);
reg.two().includes('z');
