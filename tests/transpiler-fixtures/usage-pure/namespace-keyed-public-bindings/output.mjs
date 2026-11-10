import _Array$from from "@core-js/pure/actual/array/from";
// Keyed captures stay private while the source key and both public bindings survive.
declare const cnd: boolean;
declare const effect: () => void;
export namespace N {
  const {
    Array: _ref
  } = cnd && {
    Array
  };
  export const {
    [(effect(), 'of')]: a
  } = _ref;
  export const b = _ref === Array ? _Array$from : _ref.from;
}