namespace N {
  export const Array: any = null;
}
class C extends Array<number> {}
declare const c: C;
c.at(0);
