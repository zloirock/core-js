// the receiver/descriptor compatibility check gates pure generic resolution: when the receiver type is
// statically known (here `boolean` via the function annotation), the metadata-enhancement step either
// rejects the hint or folds to a TYPE_HINT slot for which `desc.common` doesn't
// apply. Resolution short-circuits rather than over-inject `_at` on a known boolean.
// `at` has no boolean variant - confirm no polyfill emission for the typed call.
declare function getBool(): boolean;
const x = getBool();
// boolean has no `.at`; pure generic resolution shouldn't add one. polyfill emission
// here would be over-injection (and would crash at runtime trying to call
// _at(true).call(true, 0)).
(x as any).at?.(0);
