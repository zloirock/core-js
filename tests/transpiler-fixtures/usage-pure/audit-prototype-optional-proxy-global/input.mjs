// `globalThis?.Array.prototype.at(0)` — optional proxy-global + prototype-access.
// after babel mutation `globalThis → _globalThis`, buildMemberMeta's prototype-detection
// still recognizes Array through polyfillHint on the `_globalThis` import binding
globalThis?.Array.prototype.at(0);
