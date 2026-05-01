// tagged template at instance method position is NOT polyfilled per isTaggedTemplateTag:
// `arr.at`x`` would treat the strings array as receiver, breaking the polyfill.
// static method on a global is fine: Array.from`` runs as plain function call.
arr.at`a`;
Array.from`b`;
