# Training Compliance Dashboard

Static GitHub Pages front-end for the Induction Training Compliance project.

## Included
- Seven induction assessments
- KPI summary
- Course-by-course compliance table
- Action Required panel
- Officer search by Staff ID
- Sample officer record
- Responsive layout
- `data.json` contract ready for Power Automate-generated data

## Files
- `index.html`
- `styles.css`
- `app.js`
- `data.json`

## GitHub Pages
Upload these files to the root of a GitHub repository and enable GitHub Pages for the repository branch.

## Proposed production data flow
Microsoft Forms Excel tables -> Power Automate -> normalised compliance dataset -> website

## Ethics course rules
- Pass mark: 6
- Ignore rows with blank Staff ID
- Ignore Form-entered manager/site/name for compliance
- Staff ID is the join key
- Current Full Name comes from the live SharePoint staffing list
- Reassessment Due: >= 11 months since most recent valid pass and < 12 months
- Expired: >= 12 months since most recent valid pass
- Failed: latest assessment is below pass mark and no later pass supersedes it
- Not Taken: active Staff ID has no valid assessment record

The sample data is illustrative only.


## Certificate generation
Officer Search now includes a Generate Certificate button.

Rules:
- Button is enabled only when all seven induction modules are `Current`.
- Certificate shows officer name and Staff ID from the live staffing dataset.
- Each module shows its latest pass date.
- Valid-until date is the earliest 12-month expiry across the seven current passes.
- Certificate reference format: `IND-<StaffID>-YYYYMMDD`.
- Print view is A4 landscape and can be printed directly or saved as PDF from the browser.
