// An IIFE parameter consumes the array returned by its source getter.
// The nested hasOwn read and native iteration remain intact.
{
const r = (({ w: [{ hasOwn }] }) => hasOwn)({ get w() { return [Object]; } });
}
