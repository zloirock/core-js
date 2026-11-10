import _Array$of from "@core-js/pure/actual/array/of";
// A retained default serves the selected Array arm without exporting captures.
// Supplied objects and computed-key effects remain in their original slots.
declare const select: () => any;
declare const effect: () => void;
namespace N {
  export var {
    k: {
      of,
      [(effect(), 'missing')]: value
    } = (Array, {
      of: _Array$of,
      get "missing"() {
        return Array["missing"];
      }
    })
  } = select();
}
export { N };