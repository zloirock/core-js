// the literal a prototype gets installed on may sit under transparent wrappers - a `satisfies`
// operator or plain parens - so the declarator is reached through them; a wrapper must not hide the
// binding from the install scan. an explicit type ANNOTATION is different: it is the author's own
// declaration of what the value is, and the type-driven dispatch keeps honouring it. distinct
// method per line
const wrappedSatisfies = {} satisfies object;
Object.setPrototypeOf(wrappedSatisfies, Array.prototype);
export const a = (wrappedSatisfies as any).at(0);
const wrappedParens = ({});
Object.setPrototypeOf(wrappedParens, Array.prototype);
export const b = (wrappedParens as any).flatMap(f);
const annotated: Record<string, unknown> = {};
Object.setPrototypeOf(annotated, Array.prototype);
export const c = (annotated as any).findLast(f);
