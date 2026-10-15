// A guarded realm element supplies sibling constructor branches and an opaque key.
// Pure support on this rare loop host stops at existing routes: Babel keeps of native,
// while unplugin extracts it (the sidecar). The opaque read and false-arm throw remain.
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";

let enabled = true;
const key = String(Math.random() > 2);

for (const _ref of [enabled && _globalThis]) {
	const of = _Array$of;
	const { Array: { [key]: extra }, Object: { keys } } = _ref;

	use(of, keys, extra);
}