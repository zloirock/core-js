// resolving an identifier down to the global-proxy ROOT is ONE surface with several arm shapes -
// each cell pins one arm. positives inject the arm-only marker; the negative arm must NOT register
// a ctor alias (named keys off an array literal are always undefined)
import g from "@core-js/pure/actual/global-this";
export const viaImportMember = g.Map.groupBy([], x => x);
