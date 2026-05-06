// resolveTypedMember overload precedence: three signatures of d.get returning string,
// string, string[]. resolveMemberCallReturnFromAnnotation collects all three resolved
// returns then runs foldUnionTypes. fold succeeds when constructors agree (Array vs
// Array vs string is divergent, but two strings + Array[] should still pick FIRST since
// fold can't unify primitive string with $Object Array). Lock the first-overload behaviour
interface Reg {
  get(k: 'a'): string;
  get(k: 'b'): string;
  get(k: 'c'): string[];
}
declare const reg: Reg;
reg.get('a').at(0);
reg.get('b').includes('z');
reg.get('c').findLast(x => x);
