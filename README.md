# Secur-IT Training Compliance Dashboard V3

Files:
- index.html — complete GitHub Pages dashboard
- data.json — current API payload, included only for local/GitHub testing

## Testing
Upload both files to the GitHub Pages folder/repository and leave:

    const API_URL = "";

The page will load `./data.json`.

## Live API
When the production Power Automate endpoint/authentication is ready, set `API_URL`
in index.html to the live endpoint or replace the fetch logic with the final MSAL/Entra call.

Do not commit a SAS-signed Power Automate test URL to a public GitHub repository.

## Logic
- Active staff comes from `staff`
- Duplicate staff IDs are deduplicated client-side
- Course history is not deduplicated
- Latest attempt wins
- Failed latest attempt = Failed
- Passed latest attempt:
  - under 11 calendar months = Current
  - 11 to under 12 calendar months = Reassessment Due
  - 12+ calendar months = Expired
- No attempt = Not Taken
- Green = 6/6 Current
- Amber = no Failed/Expired/Not Taken, with one or more Reassessment Due
- Red = any Failed/Expired/Not Taken
- Certificate available only for Green / 6 of 6 Current
