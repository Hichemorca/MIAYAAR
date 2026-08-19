# MIAYAAR Verification Record

## 2026-08-18 — Full valuation path

The English web interface was exercised against the running `valuation.run` server procedure using an apartment in Jumeirah Village Circle with a 100 sqm area, one bedroom, a documented annual rent of AED 120,000, and the remaining property facts shown in the UI.

The request completed as `partial`, as intended: the server returned twelve eligible local DLD comparable transactions using a 90-day search window, produced a baseline value of AED 1,565,274 and a lower-to-upper range of AED 1,455,642 to AED 1,681,091, and displayed three applicable approaches. The cost approach was explicitly marked unavailable because its prepared inputs were absent; no client-side substitute or synthetic value was created.

The rendered report displayed the immutable request identifier, methodology document/version (`MIAYAAR-METH-001 v1.1`), confidence level, scenario values, normalized method weights, transaction-level evidence, the limitation warning, and decision-record statement.
