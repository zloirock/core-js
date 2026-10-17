import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// arrow param
const arrowRoot = Map;
const arrowLink = arrowRoot;
export const viaArrowParamShadow = arrowRoot2 => {
  const {
    groupBy
  } = arrowLink;
  return groupBy([], v => v);
};