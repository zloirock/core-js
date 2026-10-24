// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
/* eslint-enable no-redeclare, vars-on-top, block-scoped-var -- end of redeclaration shapes */

const [[{ URL: XU }], { Number: NP }] = [[globalThis], globalThis];
export const viaScanPastNestedSibling = NP.parseFloat(text);
