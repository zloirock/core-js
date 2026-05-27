// `targets: null` passes validation - the targets-rejection branch
// (`!isEmpty(targets) && ...`) skips on isEmpty so null clears the option
// rather than crashing. matches conditional-spread (`{ targets: ci ? cfg :
// null }`); resolveTargets then falls back to browserslist project config
Array.from(x);