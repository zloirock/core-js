import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
// An excluded constructor keeps one stored receiver read before the surviving name claim.
let saved, name;
name = _nameMaybeFunction((saved = _globalThis.window?.self).Map);
export {};