// namespace nesting: NS.Inner.Data — walkStatementsForDecl descends through
// nested TSModuleDeclaration nodes. Access the nested type, call method.
namespace NS {
  export namespace Inner {
    export type Data = string[];
  }
}
declare const d: NS.Inner.Data;
d.at(0);
d.flat();
