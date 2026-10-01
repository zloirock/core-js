// regression: JSON.parse with 1 arg uses native (only the 2-arg `reviver` overload is
// polyfilled), so the min-args:2 filter rejects bare `JSON.parse(s)`. TS expression wrappers
// (`as` / `!` / `satisfies`) must be peeled so the callee identity-match still finds the
// inner JSON.parse; without the peel the wrapped shapes over-emit. expected: NO import.
JSON.parse(jsonString);
(JSON.parse as any)(jsonString);
JSON.parse!(jsonString);
(JSON.parse satisfies any)(jsonString);