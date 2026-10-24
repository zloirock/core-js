// arrow param
const arrowRoot = Map;
const arrowLink = arrowRoot;
export const viaArrowParamShadow = arrowRoot2 => {
  const { groupBy } = arrowLink;
  return groupBy([], v => v);
};
