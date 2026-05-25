// `(Map) ||= 1` - oxc preserves the paren as ParenthesizedExpression around the LHS,
// babel strips at parse. transparent-ancestor peel walks both wrappers so the
// warning fires symmetrically across parsers
Map ||= 1;