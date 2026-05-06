// AssignmentPattern wrapper combined with static-object descent (not proxy-global). const
// wrapper holds an ObjectExpression whose `.ns` resolves to Object via `walkStaticReceiverChain`.
// `peelInnerDefault` peels AssignmentPattern in `planOuterPropStatic` so the inner pattern
// reaches its leaf identifier resolution. Classifier `peelDestructureWrappers` also peels
// AssignmentPattern in static-object descent paths
const wrapper = { ns: Object };
const { ns: { entries } = {} } = wrapper;
const arr = entries({ k: 1 });
arr.includes(['k', 1]);
