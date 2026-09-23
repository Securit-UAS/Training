# Securit Guarding Training Compliance — V7 test build

## Included
- Email + PIN login screen
- PBKDF2-SHA256 verifier generation in the browser (210,000 iterations)
- First-login forced PIN change
- 12-hour session token persistence and validation
- Sign-out control
- Hidden officer mobile number support from `staff[].phone`
- WhatsApp training links for Reassessment Due / Failed / Expired / Not Taken modules
- Desktop/mobile WhatsApp deep-link handling via `wa.me`
- Certificate print layout changed to a single A4 landscape page
- Existing provider, RAG and search filters with dynamic stats retained

## Required API data
`Normalise Staff` must include `phone` mapped from the Rolling Staff DB `LastName` field.

## IMPORTANT SECURITY NOTE
This V7 build authenticates and gates the web interface, but the existing training-data Power Automate endpoint is still a signed public test endpoint and does not yet validate the session token. Anyone who obtains that endpoint URL could call it directly. Before production, add server-side session validation to the training-data flow (or proxy it through an authenticated flow), and rotate all temporary signed URLs.

No PIN is embedded in this package. The browser stores only the email address and temporary session token in localStorage.


## V7.1
Auth fetches no longer set an explicit application/json Content-Type header, avoiding CORS preflight against Power Automate HTTP triggers during testing.
