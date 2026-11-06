import "core-js/modules/es.global-this";
import "core-js/modules/es.json.stringify";
import "core-js/modules/web.self";
export const {
  JSON: {
    stringify: viaAnchoredSealedFull
  }
} = globalThis.window?.self;