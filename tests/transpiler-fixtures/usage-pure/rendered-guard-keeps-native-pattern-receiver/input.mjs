import root from "@core-js/pure/actual/global-this";
import self from "@core-js/pure/actual/self";
export const { customY } = (null == root.window ? void 0 : self).Map;
root.Map = function PatchedMap() {};
