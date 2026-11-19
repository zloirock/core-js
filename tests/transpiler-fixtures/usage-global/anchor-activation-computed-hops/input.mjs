// Computed realm and constructor keys retain the selected prototype.
const proxyKey = 'self', ctorKey = 'Promise';
const { [proxyKey]: { [ctorKey]: { prototype } } } = globalThis;
use(prototype);
