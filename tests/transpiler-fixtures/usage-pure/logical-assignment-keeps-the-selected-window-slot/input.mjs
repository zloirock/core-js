// The old left value can win. Its window is an actual property, also for update and delete.
export const read = (options.root ??= globalThis.self).window.document;
(options.root ||= globalThis.self).window.count++;
delete (options.root ??= globalThis.self).window.document;
