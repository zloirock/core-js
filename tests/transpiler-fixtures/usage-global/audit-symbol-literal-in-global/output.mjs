// usage-global counterpart of the pure fixture: `'Symbol.iterator' in Array` checks a plain
// string prop no symbol module defines - injecting the iterator suite here would be pure
// over-injection, so nothing is imported and the expression stays verbatim
'Symbol.iterator' in Array;