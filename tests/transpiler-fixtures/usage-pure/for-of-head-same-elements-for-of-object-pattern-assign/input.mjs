for (const { w: { assign: viaGetter } } of [{ w: Object }, { get w() { return Object; } }]) viaGetter;
