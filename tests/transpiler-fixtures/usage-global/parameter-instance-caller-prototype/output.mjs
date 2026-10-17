import "core-js/modules/es.string.at";
// A sole known caller supplies the prototype receiver at parameter consumption.
// The method keeps its string receiver family.
export const result = (({
  prototype: {
    at
  }
}) => at.call('az', -1))(String);