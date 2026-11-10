// Keyed captures stay private while the source key and both public bindings survive.
declare const cnd: boolean;
declare const effect: () => void;
export namespace N {
  export const { Array: { [(effect(), 'of')]: a, from: b } } = cnd && { Array };
}
