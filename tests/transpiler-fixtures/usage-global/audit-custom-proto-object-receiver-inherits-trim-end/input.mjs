let notTheValue = {};
Object.setPrototypeOf((notTheValue, unrelated), Array.prototype);
export const i = notTheValue.trimEnd();
