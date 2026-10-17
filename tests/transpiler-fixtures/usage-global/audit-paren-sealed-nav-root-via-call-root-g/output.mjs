import "core-js/modules/es.global-this";
import "core-js/modules/es.json.parse";
import "core-js/modules/web.self";
const dhG = () => globalThis;
export const {
  JSON: {
    parse: viaCallRootG
  }
} = dhG().window?.self;