// A missing own slot can read an inherited value before its default is considered.
// Preserve both possible receiver families.
Object.prototype.typedDefaultValue = 'xy';
const { typedDefaultValue: value = [1] } = {};
export const result = value.includes('xy');
