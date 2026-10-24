import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a TAG whose seal is spelled through a non-null wrapper: the lift must land its parens on the
// wrapper (a bare optional-chain tag does not parse), and a tag the plugin never touches still
// owes the reprint the parens the source wrote
// @ts-expect-error a realm member the lib does not declare stands for any global the user adds
export const nonNullSealedTag = ((null == _globalThis.window ? void 0 : _self)?.someTag!)`x`;