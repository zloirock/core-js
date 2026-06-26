// usage-global parity for a buried-fold COMPUTED key: a side effect buried in a `+`-concat or template fold
// of a computed key must resolve the static/method THROUGH the fold (inject the import) and keep the member
// verbatim so the buried `e++` is never folded away (usage-global only adds imports, never collapses). mirrors
// the pure counterpart's shape set: static-concat, instance-concat, template fold, and a proxy-hop receiver.
let e = 0;
const staticConcat = Array[(e++, 'fr') + 'om']([1, 2]);
const instanceConcat = [3, 4][(e++, 'fl') + 'at']();
const staticTemplate = Object[`entr${ (e++, 'i') }es`]({ x: 1 });
const hopConcat = globalThis[(e++, 'se') + 'lf'].Array.of(5);
export { staticConcat, instanceConcat, staticTemplate, hopConcat, e };
