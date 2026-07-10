// a merged-interface OPTIONAL property may be undefined at runtime, so `??` may yield
// its string fallback - the member resolution must carry the optionality marker exactly
// like a class-body optional field (which already does), keeping generic dispatch
// instead of an array Maybe that throws on the string (ie:11)
class Box {
  test() {
    return (this.items ?? 'fallback').at(0);
  }
}
interface Box {
  items?: number[];
}
export const viaMergedOptional = new Box().test();

// a REQUIRED merged-interface property still folds to its precise family
class Crate {
  test() {
    return (this.items ?? 'fallback').includes(1);
  }
}
interface Crate {
  items: number[];
}
export const viaMergedRequired = new Crate().test();
