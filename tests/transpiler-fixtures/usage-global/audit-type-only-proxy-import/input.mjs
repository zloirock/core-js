// a type-only import ERASES its binding - resolving it to a runtime global would inject for a
// name that does not exist after stripping. both spellings gate: the declaration-level kind
// (`import type g`) and the interop namespace form
import type g from "@core-js/pure/actual/global-this";
// @ts-expect-error a type-only import read as a value is the shape under test
export const viaErasedDefault = () => g.Map.groupBy([], (x: number) => x);

import type * as ns from "@core-js/pure/actual/global-this";
// @ts-expect-error a type-only import read as a value is the shape under test
export const viaErasedNamespace = () => ns.default.Promise.try(() => 1);
