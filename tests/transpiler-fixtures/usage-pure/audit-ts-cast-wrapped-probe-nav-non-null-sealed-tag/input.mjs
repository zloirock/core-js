// a TAG whose seal is spelled through a non-null wrapper: the lift must land its parens on the
// wrapper (a bare optional-chain tag does not parse), and a tag the plugin never touches still
// owes the reprint the parens the source wrote
export const nonNullSealedTag = (globalThis.window?.self.someTag!)`x`;
