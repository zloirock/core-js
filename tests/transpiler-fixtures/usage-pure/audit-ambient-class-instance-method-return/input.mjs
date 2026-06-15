// Anchoring an ambient `declare class` instance (Babel has no value binding for it; estree-toolkit
// does) lets its array-returning method flow to a precise instance helper. Without the anchor the
// receiver is unresolved and the two pipelines diverge: estree-toolkit rewrites while Babel bails.
declare class K { rows(): string[]; }
new K().rows().at(0);
