# Acceptance Preview Observation — 2026-08-18

The temporary PR-branch preview on port 3001 was restarted successfully after an earlier unavailable page caused by a stopped local preview process. The application then rendered the English MIAYAAR property-file interface.

The observed UI disclosed methodology `v1.2`, the DLD registry total of `30,325 records`, the API-to-report flow, required property fields, optional financial inputs, and the explicit statement that missing approach inputs are disclosed rather than inferred. The run button was present and available for the valuation journey.

This observation establishes that the unavailable page was infrastructure-related, not an application render failure.

The rendered document contained one form and an enabled submit button labelled `Run valuation`. The displayed selects and inputs passed native browser validity checks with the default acceptance data, including the 100 sqm area, one bedroom, and AED 120,000 annual rent. A direct API acceptance call had already returned successfully on this branch; the browser observation therefore confirms form availability and valid client-side inputs rather than substituting a second value calculation in the browser.
