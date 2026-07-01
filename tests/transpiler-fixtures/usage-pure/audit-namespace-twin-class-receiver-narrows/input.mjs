class C extends Array<number> {}
namespace N {
  class C {}
}
declare const c: C;
export const r = c.at(0);
