-- =========================================================
-- Project types: distinguish Solar Farm vs EV Charger projects
-- =========================================================

create type project_type as enum ('solar', 'ev_charger');

alter table public.sites
  add column project_type project_type not null default 'solar';

alter table public.qaqc_checklist_items
  add column project_type project_type not null default 'solar';

create index idx_sites_project_type on public.sites(project_type);
create index idx_qaqc_items_project_type on public.qaqc_checklist_items(project_type);

-- ---------- Seed EV Charger checklist template ----------
insert into public.qaqc_checklist_items (flow, stage, item_text, sort_order, project_type) values
  ('Civil / Sitework', 'Erosion Control', 'Install silt fence per detail (approx. 175 LF) prior to any ground disturbance', 0, 'ev_charger'),
  ('Civil / Sitework', 'Erosion Control', 'Verify silt fence embedment depth (24" minimum bury per detail)', 1, 'ev_charger'),
  ('Civil / Sitework', 'Erosion Control', 'Confirm limits of disturbance staked and match Demo & Erosion Control Plan (C-2.0)', 2, 'ev_charger'),
  ('Civil / Sitework', 'Demolition', 'Confirm 811 utility locate completed before any ground disturbance', 3, 'ev_charger'),
  ('Civil / Sitework', 'Demolition', 'Remove existing trees within limits of disturbance per plan', 4, 'ev_charger'),
  ('Civil / Sitework', 'Grading & Paving', 'Verify subgrade compaction prior to aggregate base placement', 5, 'ev_charger'),
  ('Civil / Sitework', 'Grading & Paving', 'Confirm 12" compacted sand subbase installed (if required)', 6, 'ev_charger'),
  ('Civil / Sitework', 'Grading & Paving', 'Verify 6" aggregate base placed and compacted', 7, 'ev_charger'),
  ('Civil / Sitework', 'Grading & Paving', 'Confirm 1-1/2" bituminous leveling course installed', 8, 'ev_charger'),
  ('Civil / Sitework', 'Grading & Paving', 'Confirm 1-1/2" bituminous top course installed per standard duty asphalt section (C-3.1)', 9, 'ev_charger'),
  ('Civil / Sitework', 'Grading & Paving', 'Verify standard straight curb installed per proposed site plan', 10, 'ev_charger'),
  ('Civil / Sitework', 'Site Improvements', 'Confirm landscape areas installed per proposed site plan (C-3.0)', 11, 'ev_charger'),
  ('Civil / Sitework', 'Site Improvements', 'Verify new parking stall dimensions (9'' x 18'') per Standard Parking Stall detail', 12, 'ev_charger'),
  ('Civil / Sitework', 'Site Improvements', 'Confirm 4" stripes, one coat white paint applied per parking stall detail', 13, 'ev_charger'),
  ('Electrical - Utility Service', 'Utility Coordination', 'Verify utility fault current information obtained and submitted to engineer prior to equipment order', 14, 'ev_charger'),
  ('Electrical - Utility Service', 'Utility Coordination', 'Confirm 300kVA utility transformer location and cable/conduit installed per utility company standards', 15, 'ev_charger'),
  ('Electrical - Utility Service', 'Service Equipment', 'Verify utility-rated 200A fused disconnect installed per single line diagram (E1.0)', 16, 'ev_charger'),
  ('Electrical - Utility Service', 'Service Equipment', 'Verify second 200A fused disconnect installed per single line diagram', 17, 'ev_charger'),
  ('Electrical - Utility Service', 'Service Equipment', 'Confirm ''A'' Panel 200A, 277/480V 3-phase installed per panel schedule (E0.0)', 18, 'ev_charger'),
  ('Electrical - Utility Service', 'Service Equipment', 'Verify conductor sizing matches plan (4#3/0 CU with 1#6G ground in 2" PVC)', 19, 'ev_charger'),
  ('Electrical - Utility Service', 'Service Equipment', 'Confirm AIC rating of installed equipment matches engineer-approved fault current calculation', 20, 'ev_charger'),
  ('Electrical - Utility Service', 'Grounding', 'Verify grounding electrode conductor (4G CU GEC) installed', 21, 'ev_charger'),
  ('Electrical - Utility Service', 'Grounding', 'Confirm concrete-encased electrode and ground rod installed per Typical Grounding Connection Detail (E0.0)', 22, 'ev_charger'),
  ('Electrical - Utility Service', 'Grounding', 'Verify grounding connections made within 5 ft. of point of entrance of pipe per detail', 23, 'ev_charger'),
  ('Electrical - Utility Service', 'Grounding', 'Confirm all ground connections mechanically secure and electrically continuous', 24, 'ev_charger'),
  ('Electrical - Battery System', 'Battery Installation', 'Verify RENON 233kWh battery system installed at plan location', 25, 'ev_charger'),
  ('Electrical - Battery System', 'Battery Installation', 'Confirm battery system conductor sizing (4#3/0 CU, 1#6G ground, 2" PVC) matches single line diagram', 26, 'ev_charger'),
  ('Electrical - Battery System', 'Battery Charging & Control Module', 'Verify battery charging & control module installed and wired per single line diagram', 27, 'ev_charger'),
  ('Electrical - Battery System', 'Battery Charging & Control Module', 'Confirm module connections to utility disconnect and battery system match plan', 28, 'ev_charger'),
  ('Electrical - EV Charger', 'Charger Installation', 'Verify EV charger installed at location shown on electrical layout (E1.0)', 29, 'ev_charger'),
  ('Electrical - EV Charger', 'Charger Installation', 'Confirm conductor sizing to EV charger (4#3G CU, 1#8G ground, 1.25" schedule PVC)', 30, 'ev_charger'),
  ('Electrical - EV Charger', 'Charger Installation', 'Verify charging dispenser installed per Charging Dispenser Detail (C-3.1)', 31, 'ev_charger'),
  ('Electrical - EV Charger', 'Charger Commissioning', 'Perform voltage drop calculation verification against as-built conditions', 32, 'ev_charger'),
  ('Electrical - EV Charger', 'Charger Commissioning', 'Confirm branch circuit wire sizing matches Wire Schedule (E0.0) for as-built circuit length', 33, 'ev_charger'),
  ('Electrical - EV Charger', 'Charger Commissioning', 'Functional test of EV charger completed prior to energization', 34, 'ev_charger'),
  ('Electrical - EV Charger', 'Charger Commissioning', 'Field verify equipment requirements against manufacturer specifications', 35, 'ev_charger'),
  ('Site Safety & Signage', 'Bollards & Protection', 'Verify 6" dia. steel pipe bollards installed per Bollard Detail (C-3.1)', 36, 'ev_charger'),
  ('Site Safety & Signage', 'Bollards & Protection', 'Confirm bollard cover (safety yellow) installed, filled solid with concrete', 37, 'ev_charger'),
  ('Site Safety & Signage', 'Bollards & Protection', 'Verify architectural decorative bollard cover installed at front door (black)', 38, 'ev_charger'),
  ('Site Safety & Signage', 'Site Access', 'Confirm emergency fuel shutoff remains accessible and unobstructed during construction', 39, 'ev_charger'),
  ('Site Safety & Signage', 'Site Access', 'Verify existing sliding gate remains operable throughout construction', 40, 'ev_charger');
