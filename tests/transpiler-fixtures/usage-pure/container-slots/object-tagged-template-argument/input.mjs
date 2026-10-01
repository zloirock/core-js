// A template interpolation hands the container to a tag that writes its constructor slot.
const escapedByTemplateTag = (function () {
  function tagShape(strings, value) { if (value) value.k = Map; return ''; }
  const tagBox = { k: Object };
  void tagShape`x${ tagBox }`;
  const { k: { values } } = tagBox;
  return values;
})();
export { escapedByTemplateTag };
