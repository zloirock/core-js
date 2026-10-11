// an `in` test of an instance method folds to `true` only over a receiver of a type the build knows (an array
// literal) - as a statement that answer performs nothing and leaves, while a value keeps it; over an unknown
// receiver the test stays as written
'at' in obj;
'includes' in [];
export const hasIncludes = 'includes' in [];
