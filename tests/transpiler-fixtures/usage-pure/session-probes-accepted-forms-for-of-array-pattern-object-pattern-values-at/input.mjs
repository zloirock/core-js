// A for-of array head keeps its native Object.values read beside a captured array at leaf.
// Both bindings retain their original element positions.
{
for (const [{ values }, { at }] of [[Object, [1]]]) [values, at];
}
