// InstanceType<typeof Cls> - resolveTypeQueryBinding + getTypeMembers InstanceType branch.
// Here `C` has a .list property (array). Instance type should route to class members.
class C {
  list: string[] = [];
}
declare const x: InstanceType<typeof C>;
x.list.at(-1);
