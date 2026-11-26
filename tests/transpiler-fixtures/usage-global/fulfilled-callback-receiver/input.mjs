// Awaited takes the text field's string type from the fulfillment callback's rest tuple.
type Done<T> = (...args: [value: T]) => void;
interface Task { then(cb: Done<{ text: string }> | null): void }
export function read(value: Awaited<Task>) {
  return value.text.at(0);
}
