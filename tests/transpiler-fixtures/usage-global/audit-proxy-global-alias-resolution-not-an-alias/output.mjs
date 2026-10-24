import "core-js/modules/es.global-this";
// NEGATIVE: an ObjectPattern destructuring an ARRAY literal reads named keys - always undefined,
// so no ctor alias registers and no reflect static injects
const {
  Reflect: R
} = [globalThis];
export const notAnAlias = R;