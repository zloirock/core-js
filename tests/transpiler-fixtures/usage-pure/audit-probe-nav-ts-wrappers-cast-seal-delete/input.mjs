// @ts-expect-error a delete tsc refuses is the shape under test
export const castSealDelete = delete (globalThis.window?.self.customProp as any);
