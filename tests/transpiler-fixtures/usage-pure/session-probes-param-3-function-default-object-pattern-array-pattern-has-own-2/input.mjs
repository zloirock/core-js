// Shared capture and receiver-default routes preserve independently supported claims.
// Supplied values and defaults keep their source branches and independent claims.
{
function g({ w: [{ hasOwn } = {}] = [] } = { w: [Object] }) { return hasOwn; }
}
