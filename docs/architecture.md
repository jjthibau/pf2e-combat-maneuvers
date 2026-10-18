# Architecture

`scripts/main.js` adds compact native-style rows to character Actions sheets, refreshes source previews, validates ownership/target selection and delegates rolls.

`scripts/sources.js` discovers available hand and ready maneuver-weapon sources, checks native reach/distance and ranks native statistic previews separately for each attack. Equal totals prefer the hand. A scoped native action variant carries the chosen source into the actual check without mutating shared native actions or actor equipment.

Escape follows a separate native Escape action context: it ranks unarmed, Acrobatics and Athletics, ignores hand occupancy/reach, and passes the chosen statistic and standard MAP into a fresh native Escape variant. A creature's Athletics DC is the default; an explicit effect DC overrides it. An untargeted Escape prompts for that effect DC. Overrides and entered DCs are client-local, with no actor/world data writes.

Native action variant and statistic interfaces are version-sensitive. Revalidate against new PF2e versions. The planner is an aid, not a complete legality engine; consult the README limitations.
