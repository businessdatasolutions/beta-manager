# Baserow Table Templates

CSV templates for setting up the Beta Manager database in Baserow.

## Tables Overview

| Table | Description |
|-------|-------------|
| `testers.csv` | Beta testers with their contact info and test status |
| `feedback.csv` | Feedback submitted by testers |
| `incidents.csv` | Crashes, bugs, and other incidents |
| `communications.csv` | Email/message history with testers |
| `email_templates.csv` | Email templates for automated messages |

## Import Instructions

1. Log in to Baserow
2. Create a new database called "Beta Manager"
3. For each table:
   - Click "+" to add a new table
   - Name it according to the CSV filename (without extension)
   - Click the dropdown menu → "Import"
   - Select the corresponding CSV file
   - Map columns appropriately

## Field Type Configuration

After importing, configure these field types in Baserow:

### testers
| Field | Baserow Type |
|-------|--------------|
| name | Text |
| email | Email |
| phone | Phone |
| source | Single Select: `email`, `linkedin`, `whatsapp`, `referral`, `other` |
| stage | Single Select: `prospect`, `invited`, `accepted`, `installed`, `onboarded`, `active`, `completed`, `transitioned`, `declined`, `dropped_out`, `unresponsive` |
| invited_at | Date |
| started_at | Date |
| last_active | Date |
| completed_at | Date |
| notes | Long Text |

### feedback
| Field | Baserow Type |
|-------|--------------|
| tester | Link to `testers` table |
| type | Single Select: `bug`, `feature_request`, `ux_issue`, `general` |
| severity | Single Select: `critical`, `major`, `minor` |
| title | Text |
| content | Long Text |
| status | Single Select: `new`, `in_review`, `addressed`, `closed` |
| device_info | Text |
| app_version | Text |
| screenshot_url | URL |
| admin_notes | Long Text |

### incidents
| Field | Baserow Type |
|-------|--------------|
| tester | Link to `testers` table (optional) |
| type | Single Select: `crash`, `bug`, `ux_complaint`, `dropout`, `uninstall` |
| severity | Single Select: `critical`, `major`, `minor` |
| title | Text |
| description | Long Text |
| status | Single Select: `open`, `investigating`, `resolved` |
| source | Single Select: `manual`, `crashlytics`, `automated` |
| crash_id | Text |
| resolved_at | Date |
| resolution_notes | Long Text |

### communications
| Field | Baserow Type |
|-------|--------------|
| tester | Link to `testers` table |
| channel | Single Select: `email`, `whatsapp`, `linkedin`, `phone`, `other` |
| direction | Single Select: `outbound`, `inbound` |
| subject | Text |
| content | Long Text |
| template_name | Text |
| status | Single Select: `sent`, `delivered`, `opened`, `clicked`, `bounced`, `failed` |
| sent_at | Date Time |
| opened_at | Date Time |
| clicked_at | Date Time |

### email_templates
| Field | Baserow Type |
|-------|--------------|
| name | Text (unique) |
| subject | Text |
| body | Long Text |
| variables | Text (JSON array) |
| is_active | Boolean |

## API Token

After setup, generate an API token:
1. Click your profile icon → Settings
2. Go to "API tokens"
3. Create a new token with read/write access to the Beta Manager database
4. Note the table IDs from each table's URL (the number after `/table/`)

## Environment Variables

Add these to your backend `.env`:

```bash
BASEROW_API_TOKEN=your_api_token_here
BASEROW_TESTERS_TABLE_ID=xxxxx
BASEROW_FEEDBACK_TABLE_ID=xxxxx
BASEROW_INCIDENTS_TABLE_ID=xxxxx
BASEROW_COMMUNICATIONS_TABLE_ID=xxxxx
BASEROW_TEMPLATES_TABLE_ID=xxxxx
```
