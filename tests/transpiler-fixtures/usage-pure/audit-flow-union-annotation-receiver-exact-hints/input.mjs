// a Flow cross-family union receiver dispatches through the generic runtime helper in
// pure (single import), same as the TS twin
declare var r: Array<number> | string;
(r ?? 'f').includes('x');
