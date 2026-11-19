import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// a method writing a static of the global past a class static block's declaration of the same name patches the
// global, so usage-pure leaves every read of that static to the patch; a write the block makes to its own
// declaration's member patches nothing global, so the read past it is substituted as usual. one family per line
// so a lost decision shows up in the import set.
class C {
  static {
    let Array = 1;
  }
  static patch() {
    Array.from = function () {
      return [];
    };
  }
}
export const a = Array.from([1]);
class D {
  static {
    let Object = {
      groupBy: 1
    };
    Object.groupBy = 2;
  }
}
export const b = _Object$groupBy([], x => x);