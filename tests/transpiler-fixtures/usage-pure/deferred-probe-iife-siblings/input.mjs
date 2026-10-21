// Both keys are served through the sealed receiver. The argument still throws
// before entering the body when the host is absent.
(({ of, from }) => [of(3), from([4])])((globalThis.window?.self).Array);
