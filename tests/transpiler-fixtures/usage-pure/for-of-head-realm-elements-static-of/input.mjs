// The of static has no import supplied by loop syntax; this isolates the pattern claim.
for (const { Array: { of }, JSON: J } of [globalThis, self]) of([J]);
