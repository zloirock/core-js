// 3-deep typeof через nested object init: walk должен пройти через два intermediate
// ObjectExpression до final ArrayExpression. precision-критично для глубоких namespace
// shapes
const NS = { mod: { sub: { items: [1, 2, 3] } } };
declare const x: typeof NS.mod.sub.items;
x.at(0);
