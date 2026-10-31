import "core-js/modules/es.object.values";
import "core-js/modules/es.global-this";
const {
  window: extractedWindow
} = globalThis;
export const destructuredUnponyfilled = extractedWindow?.Object.values({
  c: 3
});