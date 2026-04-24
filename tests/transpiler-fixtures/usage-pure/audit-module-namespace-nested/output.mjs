import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// namespace nesting: NS.Inner.Data - walkStatementsForDecl descends through
// nested TSModuleDeclaration nodes. Access the nested type, call method.
namespace NS {
  export namespace Inner {
    export type Data = string[];
  }
}
declare const d: NS.Inner.Data;
_atMaybeArray(d).call(d, 0);
_flatMaybeArray(d).call(d);