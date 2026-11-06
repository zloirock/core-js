// Another local alias does not change the loop element literal wrapper policy.
{
for (const _r of [{ w: Object }]) { let x = _r; let { w: { keys } } = _r; keys; }
}
