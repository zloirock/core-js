// InstanceType<typeof Cls> - the type-query binding resolves to class C, then the
// InstanceType utility-type member lookup routes to the class instance members.
// Here `C` has a .list property (array), so `.at(-1)` resolves array-typed.
class C {
  list: string[] = [];
}
declare const x: InstanceType<typeof C>;
x.list.at(-1);
