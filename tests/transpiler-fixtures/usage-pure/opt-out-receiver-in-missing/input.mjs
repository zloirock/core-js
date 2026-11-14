// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
Function("delete globalThis.Promise")();
try { r = "resolve"
in Promise; // core-js-disable-line
} catch (e) { r = e.name; }
