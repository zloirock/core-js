// Private array captures keep their position between public sibling initializers.
declare const eff: () => any;
declare const pick: () => any;
export namespace N {
  export const q = eff(), [{ at, keys }] = [pick()];
}
