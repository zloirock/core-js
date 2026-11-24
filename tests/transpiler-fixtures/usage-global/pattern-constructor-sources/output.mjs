import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.values";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.dom-collections.values";
function registry() {
  const Collection = Map;
  return {
    Collection
  };
}
const {
  Collection: {
    groupBy
  }
} = registry();
function valuesOf(input) {
  const {
    methods: {
      values
    }
  } = input;
  return values({
    answer: 7
  });
}
export const result = [groupBy([3], String).get('3'), valuesOf({
  methods: Object
})];