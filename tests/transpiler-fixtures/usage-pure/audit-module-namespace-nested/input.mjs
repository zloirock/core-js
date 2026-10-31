// namespace nesting: NS.Inner.Data - type-binding lookup descends through nested
// TS module/namespace declarations. Access the nested type, call method.
namespace NS {
  export namespace Inner {
    export type Data = string[];
  }
}
declare const d: NS.Inner.Data;
d.at(0);
d.flat();
