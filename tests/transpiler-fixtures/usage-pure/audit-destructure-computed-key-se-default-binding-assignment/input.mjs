// a defaulted binding (`m = []`, an AssignmentPattern) in an assignment-context SE-key: the binding
// Identifier is unwrapped so the post-statement overwrite targets `m`, not the AssignmentPattern
let m;
({ [(eff(), 'flat')]: m = [] } = arr);
