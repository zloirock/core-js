// `pureImportName` for instance kind: suffix = `Maybe${kebabToPascal(type)}` where `type` is
// the first segment of the import entry. For `array/instance/to-reversed` the type segment is
// `array` → binding hints `toReversedMaybeArray` (kept consistent with type-guard resolution)
[].toReversed();
