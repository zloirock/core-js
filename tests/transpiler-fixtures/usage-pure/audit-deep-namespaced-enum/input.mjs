// Multi-level namespace: `namespace N { namespace M { enum E { A, B } } }`. Receiver
// chain `N.M.E` walks 3 segments via `collectMemberSegments` then `findEnumDeclaration`
// passes through nested TSModuleDeclaration anchors. Both shapes covered:
//   - non-computed `N.M.E.A` -> number primitive (enum value-kind)
//   - computed `N.M.E[N.M.E.A]` -> string (numeric reverse mapping)
namespace N {
  export namespace M {
    export enum E { A, B }
  }
}
const head = N.M.E[N.M.E.A];
const value = N.M.E.A;
head.includes('A');
value.toFixed(0);
