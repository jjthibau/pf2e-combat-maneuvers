# Validation

Version 0.1.3 adds native Escape checks: best-statistic switching among unarmed, Acrobatics and Athletics, real rolls matching previews, standard MAP, occupied hands, target Athletics DC, out-of-reach use, source override, explicit/environmental DC, no-target prompt, invalid DC rejection and cancellation. The existing source-selection, player and compact-UI checks were rerun against the release runtime, including a player's real Escape against an unowned target.

Native validation used Foundry 14.369 / PF2e 8.6.0 with synthetic characters and the module alone. The automatic-source engine passed 43 checks: occupied hands/shields, reach, typed bonus stacking, source selection per attack, actual MAP rolls, target defenses, player ownership, cancellation, effect modifiers and movement refresh.

The subsequent compact UI revision passed 11 focused checks, including native computed styles, keyboard expansion and an actual automatic-source MAP roll. Follow-up screenshots passed 4 standard weapon and 5 agile weapon/free-hand checks. The source engine remained unchanged across the UI revision; these are separate test runs, not one exhaustive current-version suite.

CI runs JavaScript syntax and exact release packaging/metadata checks. It does not run licensed Foundry. No exhaustive feat, homebrew, ABP, battle-form or campaign module compatibility matrix is claimed. See README for supported scope.
