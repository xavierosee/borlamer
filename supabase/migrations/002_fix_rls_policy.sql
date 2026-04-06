-- Fix: restrict condition_reports INSERT to validated partner tokens only.
--
-- The original policy "reports_partner_insert" used `with check (true)`,
-- allowing ANY unauthenticated user to insert arbitrary condition reports.
-- This replacement policy ensures the partner_id references a real,
-- verified partner in the partners table.

-- Drop the permissive policy
drop policy "reports_partner_insert" on condition_reports;

-- Create a stricter policy that validates the partner token exists
create policy "reports_partner_insert" on condition_reports
  for insert
  with check (
    partner_id is not null
    and exists (
      select 1 from partners
      where partners.id = condition_reports.partner_id
        and partners.verified = true
    )
  );
