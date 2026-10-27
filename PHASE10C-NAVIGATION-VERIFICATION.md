# Phase 10C — Production Navigation Verification & Cleanup

## Purpose
Phase 10C completes the transition from the Phase 10 navigation prototype to the shared production navigation layer.

## Verified repository state
- Phase 10B PR #77 is merged into `main`.
- The current shared `assets/site.js` on `main` still contains the earlier Community of Consensus navigation enhancement and does not yet contain the generated Phase 10B unified-navigation block.
- The Charter source still contains its legacy page-specific navigation markup, so the shared JavaScript replacement is required to eliminate page-to-page differences without rewriting substantive Charter content.

## Production navigation target
Visible primary destinations:
1. Home
2. Charter
3. 12 Principles
4. Supreme Citizen
5. Citizens Branch
6. Community of Consensus
7. Participate

### Elections & Government
- Election Day
- Voting
- Election Participation Pathway
- Congressional Certification
- January 6
- Connect With Congress

### Resources
- Citizenship & Due Process
- Continuous Civic Participation
- Founding Documents
- About
- Info & Contact

## Verification checklist
Before merge, inspect the Netlify Deploy Preview on:
- Home
- Charter
- Citizens Branch
- Community of Consensus
- Election Day
- Voting
- January 6
- Congressional Certification

For each page confirm:
- identical primary navigation destinations;
- Election Day is discoverable under Elections & Government;
- both dropdown groups open and close correctly;
- no legacy three-row menu remains visible after JavaScript loads;
- page-specific content is unchanged.

### Mobile
At mobile width confirm:
- hamburger opens/closes the primary menu;
- dropdown buttons expand their grouped links;
- links remain centered/readable;
- no horizontal overflow;
- tapping a dropdown does not close the whole hamburger menu unexpectedly.

## Scope guardrail
This phase changes navigation/discovery only. It does not change Charter language, Community of Consensus methodology, election information, public voting functionality, or participant-data collection.
