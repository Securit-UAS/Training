# Securit Training Compliance — Live

This is the live-data GitHub Pages build.

## Files
- `index.html` — dashboard and certificate
- `config.js` — live Power Automate API endpoint
- `securit-logo.png` — supplied Securit logo

## Before upload
Put the NEW/production Power Automate endpoint in `config.js`:

```js
window.SECURIT_TRAINING_API_URL = "YOUR_NEW_FLOW_URL";
```

Do not reuse or publish the previously exposed signed test URL.

## API shape expected
```json
{
  "staff": [
    {
      "staffId": "54311",
      "fullName": "Aaron Singh",
      "Contractor": "Adelar",
      "siteName": "Glencar JLR Wolverhampton",
      "created": "2026-09-22T05:04:03Z"
    }
  ],
  "sites": [
    {
      "siteName": "Glencar JLR Wolverhampton",
      "managerEmail": "example@securit.email",
      "siteId": "123",
      "active": "Yes"
    }
  ],
  "ethics": [],
  "unexpected-filming": [],
  "id-ooh-social": [],
  "incident-reporting": [],
  "health-safety": [],
  "checkpoint-welfare": []
}
```

## Logic
- Staff duplicates are resolved by `staffId`.
- Newest `created` record wins.
- Exact-normalised `siteName` is matched against the CMS site array.
- `managerEmail` supplies the responsible Operations Manager.
- Latest training attempt wins for each module.
- Current: under 11 calendar months after latest passed attempt.
- Reassessment Due: 11 to under 12 calendar months.
- Expired: 12+ calendar months.
- Latest failed attempt: Failed.
- No attempt: Not Taken.
- Green: all 6 Current.
- Amber: Current/Due only, with at least one Due.
- Red: any Failed, Expired or Not Taken.
- Certificate enabled only for Green / 6 of 6 Current.


## V5 interface changes
- Page title: `Guarding Training Compliance`
- Main heading: `Securit Guarding Induction & Core Training`
- Ops Manager email hidden from table and officer detail view
- Company / labour provider dropdown generated dynamically from live `Contractor` values
- Search still supports officer name, Staff ID, site and manager name


## V6
Dashboard summary cards are now dynamic. Active Staff, Green, Amber, Red and Compliance
recalculate against the currently visible result set after RAG filters, provider dropdown
selection and text search are applied.
