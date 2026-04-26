// standalone global wrapped in TS `satisfies`: the cast is peeled so the global
// reference is recognised and polyfilled.
(Promise satisfies any);
