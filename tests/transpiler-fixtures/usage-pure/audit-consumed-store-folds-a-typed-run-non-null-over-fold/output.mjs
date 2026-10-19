import _self from "@core-js/pure/actual/self";
// @ts-expect-error a realm member the lib does not declare stands for any global the user adds
export const nonNullOverFold = _self.customProp;