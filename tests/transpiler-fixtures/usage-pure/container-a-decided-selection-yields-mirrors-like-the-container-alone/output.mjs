import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// a container a decided selection always yields mirrors under a pattern like that container spelled
// alone: next to a key whose value runs an effect, and as the target of an assignment statement
export const {
  C: {
    groupBy
  }
} = {
  D: console.log(),
  C: {
    groupBy: _Map$groupBy
  }
};
let withResolvers;
({
  C: {
    withResolvers
  }
} = {
  C: {
    withResolvers: _Promise$withResolvers
  }
});
export { withResolvers };