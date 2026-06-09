---
name: TM Hub camelCase field convention
description: API returns camelCase (Drizzle default); pages and components must use camelCase too — never snake_case
---

All DB fields returned by the Express/Drizzle API are camelCase. Pages and React hooks must use camelCase consistently.

Key field mappings:
- shot_number → shotNumber, shot_type → shotType, location_notes → locationNotes, sort_order → sortOrder
- shoot_date → shootDate, call_time → callTime, weather_notes → weatherNotes, general_notes → generalNotes
- person_name → personName, call_sheet_id → callSheetId
- element_type → elementType, scene_reference → sceneReference
- file_type → fileType, file_url → fileUrl
- assigned_to → assignedTo, last_deploy → lastDeploy, reserved_for → reservedFor
- project_id → projectId, user_id → userId, start_date → startDate, end_date → endDate, created_at → createdAt

**Why:** Drizzle ORM returns camelCase by default. The original Lovable/Supabase app used snake_case everywhere.

**How to apply:** When adding new pages or hooks, always use camelCase in both TypeScript interfaces and form state. The `ProjectResource.cost` field is typed as `string` in the API (numeric in DB) — convert `Number→String` before mutating.
