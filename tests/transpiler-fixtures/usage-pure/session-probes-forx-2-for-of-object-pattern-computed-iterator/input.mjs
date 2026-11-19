{
for (const { w: { [Symbol.iterator]: it } } of [{ w: [1] }]) it;
}
