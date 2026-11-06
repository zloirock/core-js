// global call wrapped in two layers of TS expression wrappers: both layers are peeled
// to recognise the polyfillable call.
((Map as any) satisfies any)();
