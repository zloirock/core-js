// A plain read above a nullable realm selection keeps its throw.
// The defined arm still supplies the static method.
export const result = (globalThis.window == null ? void 0 : globalThis).self.Promise.resolve;
