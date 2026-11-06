// An opted-out pattern keeps its static read, including under a multiline parent property.
// A constructor substituted outside that property must carry the retained static.
const box = { C: Iterator };
const {
  // core-js-disable-next-line
  C: {
    from,
  },
} = box;
export { from };
