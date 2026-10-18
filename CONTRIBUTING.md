# Contributing

Report bugs through GitHub issues with module, Foundry and PF2e versions, reproduction steps and expected behavior. Use synthetic characters and remove private campaign information.

Requires Node.js 24 and Python 3. Run `npm test`, `npm run build` and `npm run check:release`. Behavior changes also require native Foundry gameplay validation in a separately licensed environment. CI validates syntax and packaging only.

For releases, update package/manifest versions and versioned download URL, commit, and push a matching `vVERSION` tag. Automation publishes the manifest, ZIP and checksums.

Keep contributions focused on combat maneuvers. Never commit licensed core files, packs, credentials, campaign exports or private test artifacts. Original contributions use the MIT license.
