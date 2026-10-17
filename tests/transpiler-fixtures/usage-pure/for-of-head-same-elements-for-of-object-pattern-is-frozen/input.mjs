// ... read through the transparent wrappers a source may spell (a paren node one parser keeps)
for (const { w: { isFrozen: viaParens } } of [{ w: (Object) }, { w: Object }]) viaParens;
