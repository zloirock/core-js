// Erased overloads do not hide the runtime implementation with the same name.
declare function structuredClone(value: string): string;
function structuredClone(value) {
  return "user";
}
export const result = structuredClone({
  value: 1
});