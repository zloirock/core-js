// A retained default serves the selected Array arm without exporting captures.
// Supplied objects and computed-key effects remain in their original slots.
declare const select: () => any;
declare const effect: () => void;
namespace N {
  export var { k: { of, [(effect(), 'missing')]: value } = Array } = select();
}
export { N };
