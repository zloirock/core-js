// Reading the same hop as a whole value retains that value beside its static.
const { C: { withResolvers }, C: held } = flag ? { C: Promise } : { C: Object };
export const readTwice = () => [withResolvers(), held];
