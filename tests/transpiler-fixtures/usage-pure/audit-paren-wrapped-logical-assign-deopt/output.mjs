// `(Map) ||= 1` - oxc preserves the paren as ParenthesizedExpression around the LHS,
// babel strips at parse. the slot recording peels both wrapper shapes, so the write records
// and DEOPTS the name symmetrically across parsers - the statement stays verbatim
Map ||= 1;