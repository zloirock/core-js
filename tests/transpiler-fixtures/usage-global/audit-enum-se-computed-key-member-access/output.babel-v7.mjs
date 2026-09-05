import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// usage-global parity: an enum member accessed through a SIDE-EFFECTING computed key (`Mode[(c++, 'A')]`)
// resolves to the member's literal value the same as `Mode.A` - the SE prefix folds to the static tail key,
// so the looked-up STRING enum value injects ONLY the string module (not array). a bare key would
// under-resolve and over-inject both. the dotted control line (`Mode.B`) folds to the SAME resolution.
enum Mode {
  A = 'alpha',
  B = 'beta',
}
let c = 0;
const seKeyFold = Mode[c++, 'A'].includes('lph');
const dottedControl = Mode.B.at(0);
export { seKeyFold, dottedControl, c };