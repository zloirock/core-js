import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
const {
  self: {
    window: extractedNested
  }
} = globalThis;
export const destructuredNested = extractedNested?.Object.fromEntries([['d', 4]]);