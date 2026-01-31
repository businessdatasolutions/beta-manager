# Baserow API Documentation

This documentation covers the Baserow REST API for the **beta-tester** database.

**Database ID:** `362789`

## Authentication

Baserow uses token-based authentication. Include your token in the Authorization header:

```bash
curl -H "Authorization: Token YOUR_DATABASE_TOKEN" "https://api.baserow.io/api/..."
```

All API requests must be authenticated and made over HTTPS.

---

## Tables Overview

| Table | ID | Description |
|-------|-----|-------------|
| Table | 821688 | Generic table |
| Testers | 821702 | Beta tester records |
| Feedback | 821703 | User feedback submissions |
| Incidents | 821704 | Issue/incident tracking |
| Communications | 821705 | Email/message logs |
| Templates | 821706 | Email templates |

---

## Common API Endpoints

All tables share these endpoint patterns. Replace `{table_id}` with the appropriate ID from the table above.

### List Rows

```
GET https://api.baserow.io/api/database/rows/table/{table_id}/
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `size` | integer | 100 | Rows per page |
| `user_field_names` | any | - | When set to `true`, `1`, `yes`, etc., returns human-readable field names instead of `field_{id}` |
| `search` | string | - | Full-text search query |
| `order_by` | string | `id` | Field(s) to order by. Prefix with `-` for descending (e.g., `-created_on`) |
| `filter_type` | string | `AND` | `AND` or `OR` for multiple filters |

**Filtering:**

Simple filter format:
```
filter__{field}__{filter_type}=value
```

Example: `filter__status__equal=active`

JSON filter format:
```json
{
  "filter_type": "AND",
  "filters": [
    {"field": "status", "type": "equal", "value": "active"}
  ]
}
```

**Available Filter Types:**
- `equal`, `not_equal`
- `contains`, `contains_not`, `contains_word`, `doesnt_contain_word`
- `empty`, `not_empty`
- `length_is_lower_than`
- Date filters: `date_is`, `date_is_not`, `date_is_before`, `date_is_after`, `date_equals_today`, etc.

**Response:**
```json
{
  "count": 1024,
  "next": "https://api.baserow.io/api/database/rows/table/{table_id}/?page=2",
  "previous": null,
  "results": [...]
}
```

### Get Single Row

```
GET https://api.baserow.io/api/database/rows/table/{table_id}/{row_id}/?user_field_names=true
```

### Create Row

```
POST https://api.baserow.io/api/database/rows/table/{table_id}/?user_field_names=true
Content-Type: application/json

{
  "field_name": "value",
  ...
}
```

**Query Parameters:**
- `before` (optional): Position new row before this row ID
- `send_webhook_events` (optional): Trigger webhooks (default: true)

### Update Row

```
PATCH https://api.baserow.io/api/database/rows/table/{table_id}/{row_id}/?user_field_names=true
Content-Type: application/json

{
  "field_name": "new_value"
}
```

### Delete Row

```
DELETE https://api.baserow.io/api/database/rows/table/{table_id}/{row_id}/
```

### Move Row

```
PATCH https://api.baserow.io/api/database/rows/table/{table_id}/{row_id}/move/
```

**Query Parameters:**
- `before_id` (optional): Move before this row ID. If omitted, moves to end.

### Batch Operations

**Create multiple rows:**
```
POST https://api.baserow.io/api/database/rows/table/{table_id}/batch/?user_field_names=true

{
  "items": [
    {"field": "value"},
    {"field": "value2"}
  ]
}
```

**Update multiple rows:**
```
PATCH https://api.baserow.io/api/database/rows/table/{table_id}/batch/?user_field_names=true

{
  "items": [
    {"id": 1, "field": "new_value"},
    {"id": 2, "field": "new_value2"}
  ]
}
```

**Delete multiple rows:**
```
POST https://api.baserow.io/api/database/rows/table/{table_id}/batch-delete/

{
  "items": [1, 2, 3]
}
```

### List Fields

```
GET https://api.baserow.io/api/database/fields/table/{table_id}/
```

**Response:**
```json
[
  {
    "id": 7058594,
    "table_id": 821702,
    "name": "name",
    "order": 0,
    "type": "text",
    "primary": true,
    "read_only": false,
    "description": "..."
  }
]
```

---

## Table Schemas

### Testers (ID: 821702)

| Field ID | Name | Type | Description |
|----------|------|------|-------------|
| field_7058594 | `name` | text | Tester's full name (primary) |
| field_7058595 | `email` | text | Email address |
| field_7058596 | `phone` | text | Phone number |
| field_7058597 | `source` | text | How they were acquired |
| field_7058598 | `stage` | text | Current stage in test lifecycle |
| field_7058599 | `invited_at` | text | Date invited |
| field_7058600 | `started_at` | text | Date started testing |
| field_7058601 | `last_active` | text | Last activity date |
| field_7058602 | `completed_at` | text | Date completed testing |
| field_7058603 | `notes` | text | Admin notes |
| field_7060583 | `created_on` | date | Auto-generated (read-only) |

**Example Request:**
```bash
curl -X GET \
  -H "Authorization: Token YOUR_TOKEN" \
  "https://api.baserow.io/api/database/rows/table/821702/?user_field_names=true"
```

**Example Response:**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "order": "1.00000000000000000000",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+31612345678",
      "source": "referral",
      "stage": "active",
      "invited_at": "2024-01-10",
      "started_at": "2024-01-12",
      "last_active": "2024-01-20",
      "completed_at": "",
      "notes": "Great feedback so far",
      "created_on": "2024-01-10"
    }
  ]
}
```

---

### Feedback (ID: 821703)

| Field ID | Name | Type | Description |
|----------|------|------|-------------|
| field_7058612 | `tester` | text/link | Reference to tester (primary) |
| field_7058613 | `type` | text | Feedback type (bug, feature, etc.) |
| field_7058614 | `severity` | text | Severity level |
| field_7058615 | `title` | text | Feedback title |
| field_7058616 | `content` | text | Detailed feedback content |
| field_7058617 | `status` | text | Processing status |
| field_7058618 | `device_info` | text | Device/OS information |
| field_7058619 | `app_version` | text | App version |
| field_7058620 | `screenshot_url` | text | URL to screenshot |
| field_7058621 | `admin_notes` | text | Admin notes |
| field_7060519 | `created_on` | datetime | Auto-generated (read-only) |

**Example Response:**
```json
{
  "id": 1,
  "tester": "John Doe",
  "type": "bug",
  "severity": "high",
  "title": "App crashes on login",
  "content": "When I try to log in with Google...",
  "status": "new",
  "device_info": "iPhone 14, iOS 17.2",
  "app_version": "1.2.3",
  "screenshot_url": "https://...",
  "admin_notes": "",
  "created_on": "2024-01-20T12:00:00Z"
}
```

---

### Incidents (ID: 821704)

| Field ID | Name | Type | Description |
|----------|------|------|-------------|
| field_7058628 | `tester` | text/link | Reference to tester (primary) |
| field_7058629 | `type` | text | Incident type |
| field_7058630 | `severity` | text | Severity level |
| field_7058631 | `title` | text | Incident title |
| field_7058632 | `description` | text | Detailed description |
| field_7058633 | `status` | text | Current status |
| field_7058634 | `source` | text | How it was reported |
| field_7058635 | `crash_id` | text | External crash tracking ID |
| field_7058636 | `resolved_at` | text | Resolution date |
| field_7058637 | `resolution_notes` | text | Resolution details |
| field_7060538 | `created_on` | datetime | Auto-generated (read-only) |

---

### Communications (ID: 821705)

| Field ID | Name | Type | Description |
|----------|------|------|-------------|
| field_7058638 | `tester` | text/link | Reference to tester (primary) |
| field_7058639 | `channel` | text | Communication channel (email, etc.) |
| field_7058640 | `direction` | text | Inbound/outbound |
| field_7058641 | `subject` | text | Message subject |
| field_7058642 | `content` | text | Message content |
| field_7058643 | `template_name` | text | Template used (if any) |
| field_7058644 | `status` | text | Send status |
| field_7058645 | `sent_at` | text | Send timestamp |
| field_7058646 | `opened_at` | text | Open timestamp |
| field_7058647 | `clicked_at` | text | Click timestamp |

---

### Templates (ID: 821706)

| Field ID | Name | Type | Description |
|----------|------|------|-------------|
| field_7058650 | `name` | text | Template name (primary) |
| field_7058651 | `subject` | text | Email subject line |
| field_7058652 | `body` | text | Email body (supports variables) |
| field_7058653 | `variables` | text | Available template variables |
| field_7058654 | `is_active` | text | Whether template is active |

---

## Important Notes

### Single Select Fields

**Known Limitation:** Single select fields (like `status`, `type`, `severity`, `stage`, `source`, `channel`, `direction`) do NOT support standard Baserow filters via the API.

Attempting to use filters like `filter__status__equal=active` on single select fields will return an error: `ERROR_VIEW_FILTER_TYPE_UNSUPPORTED_FIELD`.

**Workaround:** Fetch all records and filter in-memory in your application code.

### Field Name Modes

With `user_field_names=true`:
- Request/response uses human-readable field names: `{"name": "John"}`
- `order_by`, `include`, `exclude` use field names: `order_by=-created_on`

Without `user_field_names`:
- Request/response uses field IDs: `{"field_7058594": "John"}`
- `order_by`, `include`, `exclude` use field IDs: `order_by=-field_7060583`

### Link Row Fields

When a field links to another table (like `tester` linking to Testers table), the response format is:
```json
{
  "tester": [
    {"id": 1, "value": "John Doe"}
  ]
}
```

To create/update a link row field, pass an array of row IDs:
```json
{
  "tester": [1]
}
```

### Pagination

Default page size is 100, maximum is 200. Use `page` and `size` parameters:
```
?page=2&size=50
```

### Rate Limiting

Baserow has rate limits. For batch operations, use the batch endpoints instead of multiple single requests.
