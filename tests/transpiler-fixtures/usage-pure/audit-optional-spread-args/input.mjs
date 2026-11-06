// optional call with spread args `fn?.(...iter)`: the spread iteration protocol must
// still be polyfilled even through the optional call form.
arr?.includes(...args);
