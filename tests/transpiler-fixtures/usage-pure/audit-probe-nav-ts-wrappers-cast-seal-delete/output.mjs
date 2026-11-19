import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// @ts-expect-error a delete tsc refuses is the shape under test
export const castSealDelete = null == _globalThis.window ? true : delete (_self.customProp as any);