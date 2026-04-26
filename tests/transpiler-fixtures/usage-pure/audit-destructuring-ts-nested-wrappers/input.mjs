// destructure where the init is wrapped in nested TS expression wrappers: all
// wrappers are peeled to recognise the underlying receiver.
const { from } = ((Array as any) satisfies any);
