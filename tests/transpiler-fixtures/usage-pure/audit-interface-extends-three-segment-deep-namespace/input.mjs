// interface extending a 3-segment qualified name; the namespace walker must resolve via
// full segment path, not just the last segment, so a sibling-scope decl with the same
// short name doesn't shadow
namespace NS {
  export namespace Inner {
    export interface Base {
      data: number[];
    }
  }
}
interface Sub extends NS.Inner.Base {}
declare const s: Sub;
s.data.includes(1);
s.data.flat();
