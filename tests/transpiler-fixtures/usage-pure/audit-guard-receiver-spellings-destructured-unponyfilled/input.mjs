const { window: extractedWindow } = globalThis;
export const destructuredUnponyfilled = extractedWindow?.Object.values({ c: 3 });
