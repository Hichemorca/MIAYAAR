# GitHub-Native CI/CD Failure Notifications

## Purpose

MIAYAAR records a failed **MIAYAAR CI** run or a failed Netlify deployment status as a labelled GitHub issue. This keeps the signal in the repository, with a link to the relevant run or deployment when GitHub supplies one.

## Delivery Scope

The workflow creates issues labelled `ci-cd-alert`. Repository watchers who have enabled issue notifications in their own GitHub notification preferences receive GitHub Inbox and/or email notifications according to those personal settings. A repository administrator cannot force an individual watcher’s email or mobile delivery preference.

The repository owner and other stakeholders who need alerts should watch the repository and choose an appropriate notification level in GitHub. GitHub treats this subscription as a personal account preference, so the repository automation credential cannot change it on another user’s behalf.

## Covered Events

| Source | Failure signal | Alert action |
| --- | --- | --- |
| MIAYAAR CI | `workflow_run` concludes with `failure` | Create one deduplicated issue per failed run/checkpoint. |
| Netlify check | Netlify `check_run` concludes with `failure` | Create one deduplicated issue. |
| Netlify deployment status | `deploy/netlify…` commit status is `failure` or `error` | Create one deduplicated issue. |

## Operating Procedure

Investigate the linked run or deploy, remediate the root cause, and re-run or redeploy. Close the issue only after the corresponding required check is successful. The issue body contains a hidden deduplication key so repeated delivery of the same event does not open duplicate alerts.

> This workflow does not replace Netlify’s own GitHub deployment comment and status integration. It adds an auditable issue signal for failures.

## Reference

Netlify documents that GitHub-connected sites can publish commit statuses and rich commit checks for deploy outcomes, including a link to failed deploy details. See [Netlify deploy notifications](https://docs.netlify.com/deploy/deploy-notifications/#github-commit-statuses) and [Netlify Deploy Preview status](https://docs.netlify.com/deploy/deploy-types/deploy-previews/#status-and-notifications).
