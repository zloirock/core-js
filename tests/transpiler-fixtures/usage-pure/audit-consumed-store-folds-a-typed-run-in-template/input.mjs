// ... and the same rule where the render is the STORE's own: the wrapper over the span it replaces
// goes with it, in whatever host the run stands (the declarator answered it first, and the other
// hosts reach this render through their own routes)
let stored: any;
export const inTemplate = `${ ((stored = globalThis).self.window as any).customProp }`;
export { stored };
