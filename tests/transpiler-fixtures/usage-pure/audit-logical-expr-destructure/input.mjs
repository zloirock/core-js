// destructure init is LogicalExpression - buildDestructuringInitMeta special-cases `?? || &&`.
// `?? || `: primary is left, fallback is right. `&&`: primary is right (always conditional)
const { from } = Array ?? Stub;
const { keys } = Stub ?? Object;
const { entries } = Array && Map;
