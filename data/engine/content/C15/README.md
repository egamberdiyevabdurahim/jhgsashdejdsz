# C15: diagnostic chunk metadata (P5e, made by code)

Written by `npx tsx tools/p5e-c15.ts` from `src/engine/phase-d.ts`; do not edit by hand (`tests/unit/engine/phase-d-c15.test.ts` fails when it is stale).
P5 spec §4.2 items 3 and 5, §5.3 C15. The chunks are cut per student on the day they are given, from the Deep questions still to ask
(a branch answered today can add a question tomorrow), so this file states the rule and what it gives the spec's personas P1-P6 with
only their first-run answers (the state a Phase D starts from).

## The rule

- A chunk takes the next questions in order while it stays within 6 questions and 8 minutes (always at least one); a remainder under 3 questions joins the chunk before it when both fit.
- Seconds per question type [assumption, the controller's; the spec's "~25-35 s per closed question"]: select 20, scale_1_5 15, scale_1_10 15, slider 15, number 20, date 20, date_or_unknown 25, autocomplete 25, contact 30, multi 30, rank 40, checklist 35, confirm_numbers 30, select_plus_number 35, select_plus_text 40, select_plus_date 35, select_per_item 45, number_currency 30, multi_plus_hours 60, repeatable 60, form 60, upload 60, table 90, text 75, text_or_voice 75; any other type 30.
- First, for every stage, the §3.3 model inputs when visible: m2_uz_programmes, m3_dtm_blocks, m3_milliy_percent, m3_history_grade, m3_native_grade, m2_planned_round.
- Then the modules by value of information (spec §4.2 item 5); M8's questions go to the parent app (item 4), M0's Deep questions come last (item 3).
- Never asked: m11_last_cycle, m9_why (retired), a parent-source question, a system question, one already answered or skipped.

| Stage | Module order | First inside a module |
|---|---|---|
| S1 | M9 Mindset & Capacity → M6 Activities & Impact → M4 Language → M3 Academics → M1 Stage & School → M2 Goal & Destination → M10 Legal & Logistics → M7 Money → M0 Gate | — |
| S2 | M6 Activities & Impact → M3 Academics → M5 Admission Tests → M2 Goal & Destination → M4 Language → M9 Mindset & Capacity → M1 Stage & School → M10 Legal & Logistics → M7 Money → M0 Gate | — |
| S3 | M11 Stage Add-ons → M5 Admission Tests → M10 Legal & Logistics → M6 Activities & Impact → M2 Goal & Destination → M3 Academics → M4 Language → M1 Stage & School → M9 Mindset & Capacity → M7 Money → M0 Gate | — |
| S4 | M3 Academics → M11 Stage Add-ons → M5 Admission Tests → M6 Activities & Impact → M2 Goal & Destination → M4 Language → M1 Stage & School → M9 Mindset & Capacity → M10 Legal & Logistics → M7 Money → M0 Gate | m3_dtm_blocks, m3_grades_table, m11_gap_activities, m11_what_changed, m11_current_uni |

## The personas (spec 06), first-run answers only

| Persona | Stage | Deep questions | Chunks: questions / minutes [modules] |
|---|---|---:|---|
| P1 | S2 | 74 | 6 / 5 [M6]; 6 / 5 [M6, M3]; 6 / 4 [M3]; 6 / 3 [M3, M5]; 6 / 3 [M2]; 6 / 5 [M2]; 6 / 4 [M4, M9]; 6 / 4 [M9]; 6 / 3 [M9]; 6 / 4 [M9, M1]; 6 / 3 [M1, M10]; 6 / 3 [M10, M7]; 2 / 2 [M0] |
| P2 | S2 | 75 | 6 / 5 [M6]; 6 / 5 [M6, M3]; 6 / 4 [M3]; 6 / 3 [M3, M5]; 6 / 3 [M2]; 6 / 5 [M2]; 6 / 5 [M2, M4]; 6 / 4 [M4, M9]; 6 / 2 [M9]; 6 / 4 [M9, M1]; 6 / 3 [M1, M10]; 6 / 3 [M10, M7]; 3 / 2 [M7, M0] |
| P3 | S1 | 32 | 6 / 2 [M9]; 6 / 3 [M9]; 6 / 6 [M6, M4]; 6 / 4 [M4, M3]; 6 / 3 [M3, M1]; 2 / 2 [M0] |
| P4 | S3 | 82 | 6 / 3 [M11]; 6 / 3 [M5, M10]; 6 / 5 [M10, M6]; 6 / 4 [M6, M2]; 6 / 3 [M2]; 6 / 5 [M2]; 6 / 4 [M3]; 6 / 3 [M3]; 6 / 5 [M3, M4]; 6 / 3 [M1, M9]; 6 / 4 [M9]; 6 / 3 [M9]; 6 / 4 [M9, M7]; 4 / 2 [M7, M0] |
| P5 | S4 | 82 | 6 / 4 [M3]; 6 / 3 [M3]; 6 / 5 [M3, M11]; 6 / 3 [M11, M5, M6]; 6 / 6 [M6]; 6 / 3 [M6, M2]; 6 / 5 [M2]; 6 / 4 [M2, M4]; 6 / 3 [M1, M9]; 6 / 4 [M9]; 6 / 3 [M9]; 6 / 4 [M9, M10]; 6 / 3 [M10, M7]; 4 / 2 [M7, M0] |
| P6 | S2 | 74 | 6 / 5 [M6]; 6 / 5 [M6, M3]; 6 / 4 [M3]; 6 / 3 [M3, M5]; 6 / 3 [M2]; 6 / 5 [M2]; 6 / 5 [M4]; 6 / 4 [M9]; 6 / 3 [M9]; 6 / 4 [M9, M1]; 6 / 3 [M1, M10]; 6 / 3 [M10, M7]; 2 / 2 [M0] |

At one chunk a day (never a second, spec §4.2 item 6), an S2-S4 student is through the Deep questions in 6-8 days.
