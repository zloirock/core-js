// Chain of TSAsExpression / TSSatisfiesExpression around a typed binding.
// the expression-annotation lookup should peel both wrappers in sequence.
declare const x: unknown;
((x as { items: string[] }) as { items: string[] }).items.at(0);
