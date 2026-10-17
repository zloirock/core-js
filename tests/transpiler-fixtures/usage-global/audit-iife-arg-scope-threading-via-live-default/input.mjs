// no call-arg: the default IS live - its own target resolves
export const viaLiveDefault = (({ from } = Iterator) => from)();
