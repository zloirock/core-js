// the guard render inside JSX: a child container, an attribute value and a spread are ordinary
// expression slots, so the fold rides them unchanged - and the reprint has to spell the slot
// back inside a brace, where its tokens sit next to JSX syntax rather than JS
const jsxHost = globalThis.jsxHost;
export const child = <div>{globalThis.window?.self.jsxHost.count}</div>;
export const attr = <div x={globalThis.window?.self.jsxHost.count} />;
export const spread = <div {...globalThis.window?.self.jsxHost.inner} />;
export const claimChild = <div>{globalThis.window?.self.Array.of(1).at(0)}</div>;
export { jsxHost };

// an OPERAND slot inside a brace parenthesizes the fold exactly as it would outside one
const jr = () => globalThis;
export const attrOperand = <div x={-jr().window?.self.jsxHost.inner.count} />;
export const childTernary = <div>{globalThis.window?.self.jsxHost.count > 1
  ? globalThis.window?.self.Math.sign(-2) : 0}</div>;
export const attrTemplate = <div x={`v${ globalThis.window?.self.Number.parseFloat('1.5') }`} />;
