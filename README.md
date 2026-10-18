# PF2e Combat Maneuvers

Focused original module adding Trip, Grapple, Shove, Disarm and Reposition to the native character **Actions → Encounter** tab, immediately below Strikes. No toolbox dependency.

Target one creature and choose the first, second or third attack button. Each button automatically chooses the available hand or qualifying ready weapon with the highest expected total modifier, including MAP and native bonus stacking. Native-style blue attack buttons show the total and MAP. Hover for the chosen source and reach, or click the maneuver name to expand its details. A free hand wins ties. The first and third attacks can choose different sources. Unavailable maneuvers show a reason instead of inactive button groups.

The planner checks occupied hands (including shields), relevant maneuver traits and source-specific reach using native token distances. A free hand normally uses the native fist's Agile trait; weapon attacks use that weapon's traits. Native MAP rule elements are consulted, with explicit support for Agile Maneuvers and its remastered Panache improvement. Weapon potency and existing Athletics item bonuses use native stacking; choosing a free hand does not inherit an equipped weapon's potency. Ranged Trip is limited to its first increment and includes its native −2 circumstance penalty. Out-of-reach sources are excluded. Reposition currently uses the free-hand route only.

The selected source is carried into a fresh, scoped native action variant so the actual roll uses the same source-specific modifiers. Shared native actions and actor/inventory documents are not patched or temporarily altered. Native dialogs, defense DCs, results and visibility are retained. The panel never displays enemy numeric DCs. It refreshes on equipment/effect/target changes and after movement animations. A collapsed Source overrides section allows choosing another available source.

Choose the attack number yourself; attacks are not counted automatically. Conditions and movement are not applied. Terrain/walls, target size limits, special anatomy, hands occupied by untracked activities and source-specific feat exceptions are not a complete legality engine. Unique grabs that permit Reposition with no free hand are not inferred. Buckler-specific hand exceptions, every battle form/feat, ABP variants and multiple linked tokens of the same actor have not all been validated. The planner is most reliable with one character token on the active scene. Use normal native actions for unsupported situations.

## Installation

In Foundry Setup, choose **Add-on Modules ? Install Module**, paste this manifest URL, then enable **PF2e Combat Maneuvers** in your world's Manage Modules screen:

```text
https://github.com/jjthibau/pf2e-combat-maneuvers/releases/latest/download/module.json
```

Tested on Foundry **14.369** / PF2e **8.6.0**, native character sheets. Use a character token, target one creature, then open **Actions ? Encounter**. Select the appropriate attack number yourself.

## Development

See [validation](docs/testing.md), [architecture](docs/architecture.md) and [contributing](CONTRIBUTING.md). `npm test` checks syntax; `npm run build` and `npm run check:release` build and verify the allowlisted release. No licensed core, packs or campaign data included. Original code is [MIT licensed](LICENSE).
