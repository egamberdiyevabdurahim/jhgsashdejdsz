
  // PRODUCT CUTS (26 Sep 2026): true = switched off (entry points hidden, code kept). Set a flag to false to bring the feature back.
  window.JG_CUTS = { todayDaily: true, todayMock: true, lessonsMock: !!window.JG_ENGINE, todaySquad: true, classOf: true, schoolCup: true, jgLive: true, passport: true, projectLab: true, almostThere: true, helpDesk: true, creatorStudio: true, satSeason: true, rival: true, todayRecap: true, playerCard: true, englishCoach: true, cmStories: !!window.JG_ENGINE, ghostMode: !!window.JG_ENGINE, studyNow: !!window.JG_ENGINE, cmPeople: !!window.JG_ENGINE };   /* JG-PROD: owner 4 Oct R13, a real student (window.JG_ENGINE) gets five more cuts, the design's own way of switching a feature off: the Community stories row of invented people, the roadmap's "Race a ghost" sample students, the Study Room's invented "N studying now", Community's "New group" and "Send to people" (no one real to add yet), and (P4e H1) the Lessons tab's Mock Saturday banner, an invented "2,379 registered" for a mock nobody runs yet (the parent apps leave Mock Saturday out for a real family since P1; its Today card is the design's own cut for everyone); the demo family keeps all five */
  document.documentElement.classList.add(...Object.keys(window.JG_CUTS).filter(k => window.JG_CUTS[k]).map(k => `cut-${k}`));

(() => {
  "use strict";
  /* ==========================================================
     JAMALS GLOBAL ENGINE, FRONT END: diagnostic -> first picture -> honest check.
     The screens read the canonical question bank (03) and the rules seed (05)
     as the backend will serve them. JG_API is a MOCK of the backend with the
     shapes of 04_ENGINE_SPEC §2 (Scorecard, Feasibility, DailyTask): replace
     its methods with real calls and the screens stay the same.
     ========================================================== */
  /* ---------- the canonical data, exactly as the backend will serve it ---------- */
  const QB = {"version":"0.1.0","source":"Diagnostic-to-Roadmap engine question bank","conventions":{"id":"stable, never renamed; translations are labels keyed by id","core":"true = asked in the 12-minute Core flow; false = Deep, delivered as week-1 daily tasks","stages":{"S1":"age 10-13 or > 4 years from graduation","S2":"14-16 / 2-4 years from application","S3":"application year (<= 14 months to first deadline)","S4":"finished school: gap year, reapplicant, transfer (18-20)"},"stage_rule":"stage is derived from grade + confirmed graduation date + destination deadlines; age is a fallback only","audience":"student | parent | system (computed, not asked)","types":["date","select","multi","autocomplete","repeatable","repeatable_autocomplete","checklist","number","number_currency","scale_1_5","scale_1_10","slider","rank","text","text_or_voice","upload","table","test","confirm_date","confirm_numbers","contact","form","select_plus_text","select_plus_number","select_plus_date","select_per_item","multi_plus_hours","date_or_unknown","system"],"options_dynamic":"strings starting with 'dynamic:' are generated from country_profile / destination_rules / taxonomies; 'fallback:' lists apply when no profile exists","kid_text_en":"wording for S1 (reading level ~10 years); same id, same feeds","free_text":"accepted in ANY language; voice-to-text allowed; the LLM interprets, code stores raw + extracted","sensitive":"optional, consent-gated, never used in rankings, deletable on request"},"modules":[{"id":"M0","name":"Gate","purpose":"Identity, jurisdiction, consent. Drives which country profile, stage and language everything else uses.","questions":[{"id":"m0_roadmap_language","core":true,"type":"select","text_en":"Which language should your roadmap be in?","options":["en","uz","ru"],"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["profile.roadmap_language"],"notes":"P4b (owner 3 Oct 2026, R12): the roadmap, the reading check and (once uz/ru are enabled) the AI text use it; m0_app_language stays the app's own language; P4g (owner 4 Oct 2026, L): a live student picks it on the diagnostic's first screen, and every question, option, hint and button of the diagnostic follows it"},{"id":"m0_dob","core":true,"type":"date","text_en":"Date of birth","kid_text_en":"When is your birthday?","audience":"student","stages":["S1","S2","S3","S4"],"feeds":["profile.dob","derived.age","derived.stage"],"verify":"none","notes":"age<14 -> parent account required before continuing"},{"id":"m0_gender","core":true,"type":"select","text_en":"Gender (optional)","options":["male","female","prefer_not_to_say"],"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["profile.gender"],"sensitive":true,"notes":"only used for conscription branch (m10_military) and family-constraint wording; never for ranking"},{"id":"m0_residence_country","core":true,"type":"select","text_en":"Which country do you live in?","options":"dynamic:countries","audience":"student","stages":["S1","S2","S3","S4"],"feeds":["profile.residence_country","derived.country_profile"]},{"id":"m0_residence_city","core":false,"type":"autocomplete","text_en":"Which city or town?","audience":"student","stages":["S1","S2","S3","S4"],"feeds":["profile.residence_city"]},{"id":"m0_city_type","core":false,"type":"select","text_en":"What kind of place is it?","options":["capital","major_city","small_town","rural"],"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["profile.city_type"],"notes":"resource access proxy: test centers, tutors, clubs"},{"id":"m0_citizenship","core":true,"type":"multi","text_en":"Citizenship (select all that apply)","options":"dynamic:countries","audience":"student","stages":["S1","S2","S3","S4"],"feeds":["profile.citizenships","derived.visa_pool","derived.aid_pool"]},{"id":"m0_app_language","core":false,"type":"select","text_en":"App language","options":"dynamic:supported_languages","audience":"system","stages":["S1","S2","S3","S4"],"feeds":["profile.app_language"],"notes":"default from device locale; free-text answers accepted in any language"},{"id":"m0_timezone","core":false,"type":"system","text_en":"Timezone","audience":"system","stages":["S1","S2","S3","S4"],"feeds":["profile.timezone"]},{"id":"m0_parent_contact","core":false,"type":"contact","text_en":"Parent or guardian contact (phone or email)","audience":"parent","stages":["S1","S2","S3","S4"],"branch":"derived.age < 14 OR m8_parent_attitude in [hesitant,against]","feeds":["family.parent_contact"],"sensitive":true},{"id":"m0_consent","core":false,"type":"system","text_en":"Consent record (student + parent for minors, per jurisdiction)","audience":"system","stages":["S1","S2","S3","S4"],"feeds":["profile.consent"],"notes":"store consent version + timestamp; block Deep modules M7/M8 sensitive fields until consent"}]},{"id":"M1","name":"Stage & School","purpose":"Where the student is in their country's system. Country profile supplies grade names, school types, grading scale and the fork points (e.g. Uzbekistan after grade 9).","questions":[{"id":"m1_status","core":true,"type":"select","text_en":"What best describes you right now?","options":["in_school","finished_school_gap_year","in_university","not_in_school_other"],"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["profile.status","derived.stage"]},{"id":"m1_grade","core":true,"type":"select","text_en":"Which grade / year are you in?","kid_text_en":"Which class are you in at school?","options":"dynamic:country_profile.grades","audience":"student","stages":["S1","S2","S3","S4"],"branch":"m1_status == in_school","feeds":["profile.grade","derived.years_left","derived.graduation_date"]},{"id":"m1_graduation_confirm","core":true,"type":"confirm_date","text_en":"We think you finish school in {derived.graduation_date}. Correct?","audience":"student","stages":["S1","S2","S3","S4"],"branch":"m1_status == in_school","feeds":["profile.graduation_date"],"notes":"the application cycle is computed from this; must be confirmed, not assumed"},{"id":"m1_school_type","core":false,"type":"select","text_en":"What type of school?","options":"dynamic:country_profile.school_types|fallback:[public_state,private_national,international_ib,international_cambridge,international_ap,specialized_olympiad,lyceum_gymnasium,religious,homeschool_online,vocational,other]","audience":"student","stages":["S1","S2","S3","S4"],"feeds":["school.type"]},{"id":"m1_curriculum","core":false,"type":"select","text_en":"Which curriculum?","options":["national","ib_myp_dp","cambridge_igcse_alevel","ap","french_bac","german_abitur","other"],"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["school.curriculum","derived.rigor_ceiling"]},{"id":"m1_instruction_language","core":false,"type":"multi","text_en":"Language(s) your school teaches in","options":"dynamic:languages","audience":"student","stages":["S1","S2","S3","S4"],"feeds":["school.instruction_languages","derived.english_medium"]},{"id":"m1_school_support","core":false,"type":"multi","text_en":"Does your school have any of these?","options":["college_counselor","has_sent_students_abroad","issues_english_transcripts","teachers_can_write_recs_in_english","none_of_these","dont_know"],"audience":"student","stages":["S2","S3","S4"],"feeds":["school.support"],"notes":"drives 'get school report / find recommender' tasks; missing support = counselor-substitute tasks in roadmap"},{"id":"m1_grading_scale","core":false,"type":"select","text_en":"Grading scale your school uses","options":"dynamic:country_profile.grading_scales|fallback:[five_point,ten_point,twelve_point,twenty_point,percent_100,letters_a_f,gpa_4,ib_1_7,uk_a_star_u]","audience":"student","stages":["S1","S2","S3","S4"],"feeds":["school.grading_scale"],"notes":"needed to normalize m3_average; P4b (R1): asked on the m3_average screen, so asked alone only when the average was skipped","branch":"m3_average == skipped"},{"id":"m1_class_rank","core":false,"type":"select","text_en":"Roughly where are you in your class?","options":["top_5pct","top_10pct","top_25pct","top_50pct","below_50pct","dont_know"],"audience":"student","stages":["S2","S3","S4"],"feeds":["academics.rank_band"]},{"id":"m1_post_grade_plan","core":false,"type":"select","text_en":"After this grade, what is the plan?","options":"dynamic:country_profile.fork_options","audience":"student","stages":["S1","S2","S3","S4"],"branch":"country_profile.has_fork_after(m1_grade)","feeds":["school.next_path","derived.rigor_ceiling"],"notes":"e.g. UZ after grade 9: stay 10-11 / academic lyceum / vocational college / international school / move abroad"}]},{"id":"M2","name":"Goal & Destination","purpose":"What they want and why. Destination choice decides the rules engine (exam-driven / holistic / hybrid) and which language and tests matter.","questions":[{"id":"m2_destinations","core":true,"type":"multi","text_en":"Which countries are you considering for university?","kid_text_en":"Would you like to study in your own country, another country, or you don't know yet?","options":"dynamic:countries+[own_country,dont_know_yet]","audience":"student","stages":["S2","S3","S4"],"feeds":["goal.destinations","derived.rules_set"]},{"id":"m2_destination_rank","core":false,"type":"rank","text_en":"Rank your top 3","audience":"student","stages":["S2","S3","S4"],"branch":"len(m2_destinations) > 1","feeds":["goal.destination_rank"]},{"id":"m2_dream_unis","core":true,"type":"repeatable_autocomplete","text_en":"Which universities do you want to apply to? (up to 5)","audience":"student","stages":["S1","S2","S3","S4"],"feeds":["goal.dream_unis"],"notes":"P4g (owner 4 Oct 2026, U): asked at every stage, gap year included; an S1 student may continue with none","kid_text_en":"Is there a university you dream about? (up to 5)","why_en":"Why we ask: your roadmap, its tests and its dates are built for these universities. You can change them anytime."},{"id":"m2_dream_why","core":false,"type":"select_per_item","text_en":"Why this one?","options":["ranking_prestige","specific_program","cost_or_scholarship","family_or_friends_there","culture_lifestyle","immigration_prospects","someone_recommended","other"],"audience":"student","stages":["S2","S3","S4"],"branch":"len(m2_dream_unis) > 0","feeds":["goal.dream_why"],"notes":"'ranking_prestige' only -> brand-fixation flag"},{"id":"m2_open_unknown_scholarship","core":false,"type":"scale_1_5","text_en":"Would you go to a less-known university if it gave you a full scholarship?","audience":"student","stages":["S2","S3","S4"],"feeds":["goal.openness_unknown_uni"]},{"id":"m2_open_other_country","core":false,"type":"scale_1_5","text_en":"Would you switch country if it is cheaper or more realistic?","audience":"student","stages":["S2","S3","S4"],"feeds":["goal.openness_other_country"]},{"id":"m2_post_grad_intent","core":false,"type":"select","text_en":"After graduating, what do you want?","options":["return_home","work_in_destination","grad_school","undecided"],"audience":"student","stages":["S2","S3","S4"],"feeds":["goal.post_grad_intent","derived.visa_intent_risk"]},{"id":"m2_degree_route","core":false,"type":"select","text_en":"Which route?","options":["bachelors_direct","foundation_year","community_college_transfer","vocational","undecided"],"audience":"student","stages":["S2","S3","S4"],"feeds":["goal.degree_route"]},{"id":"m2_field","core":true,"type":"select","text_en":"What do you want to study?","kid_text_en":"What do you like learning about most?","options":"dynamic:field_taxonomy","audience":"student","stages":["S1","S2","S3","S4"],"feeds":["goal.field"]},{"id":"m2_uz_programmes","core":false,"live":true,"type":"repeatable","text_en":"Which programme and language will you apply to at each Uzbek state university?","options":{"fields":["university_id","code:number","lang:[uz,ru]"]},"audience":"student","stages":["S2","S3","S4"],"branch":"m2_destinations includes own_country AND m0_residence_country == UZ","feeds":["goal.uz_programmes"],"why_en":"Why we ask: the state test ranks students by programme and language, so your chance is read for the one you choose.","notes":"P5d review R1 (spec §3.3), 7 Oct 2026: a live student only (live: true); rows { university_id, code, lang } of src/engine/data/admission/uz_programmes_2026.json, picked from the Agency's list (public/runtime/jg-unis.js) here or on the university's page (commit uz_programme)"},{"id":"m2_planned_round","core":false,"live":true,"type":"select","text_en":"Which round will you apply in to your first-choice US university?","options":["early_action","restrictive_early_action","early_decision","regular_decision","not_sure"],"audience":"student","stages":["S3"],"branch":"m2_destinations includes US","feeds":["goal.planned_round"],"why_en":"Why we ask: your chance is read for the round you apply in.","notes":"P5d review R1 (spec §3.3), 7 Oct 2026: a live student only (live: true); the round term of spec §3.4 (inputs.ts)"},{"id":"m2_majors","core":false,"type":"multi","text_en":"Specific majors (if you know)","options":"dynamic:majors_by_field","audience":"student","stages":["S2","S3","S4"],"feeds":["goal.majors"]},{"id":"m2_field_certainty","core":false,"type":"scale_1_10","text_en":"How sure are you about this field?","audience":"student","stages":["S2","S3","S4"],"feeds":["goal.field_certainty"]},{"id":"m2_field_why","core":false,"type":"text_or_voice","text_en":"Why this field? (you can type or record voice, any language)","options":{"max_words":100},"audience":"student","stages":["S2","S3","S4"],"feeds":["goal.field_why_raw","llm.motivation_quality"]},{"id":"m2_life_at_30","core":false,"type":"text_or_voice","text_en":"What does your life look like at 30? Job, country, anything.","options":{"max_words":80},"audience":"student","stages":["S2","S3","S4"],"feeds":["goal.life_at_30_raw"]},{"id":"m2_gap_year_ok","core":false,"type":"select","text_en":"Is a gap year acceptable? (you / your parents)","options":["yes","no","maybe","parents_would_refuse"],"audience":"student","stages":["S2","S3","S4"],"feeds":["goal.gap_year_ok"]},{"id":"m2_instruction_language_ok","core":false,"type":"multi","text_en":"Which languages could you study in?","options":"dynamic:languages","audience":"student","stages":["S2","S3","S4"],"feeds":["goal.instruction_languages_ok","derived.language_gap"]},{"id":"m2_location_constraints","core":false,"type":"multi","text_en":"Anything that limits where you can go?","options":["near_family","religious_needs","climate","safety","big_city_only","campus_town_ok","disability_access","none"],"audience":"student","stages":["S2","S3","S4"],"feeds":["goal.location_constraints"]}]},{"id":"M3","name":"Academics","purpose":"Grades, rigor, math level, olympiads, national exam path. Verified with uploads and the math mini-test.","questions":[{"id":"m3_report_cards_upload","core":false,"type":"upload","text_en":"Upload your report cards for the last 2 years (photo is fine)","audience":"student","stages":["S2","S3","S4"],"feeds":["academics.transcripts_raw","academics.grades_by_subject"],"verify":"ocr_extract -> grades_by_subject; mismatch with m3_average -> flag","branch":"derived.ocr_ready == yes","notes":"P4b (owner 3 Oct 2026, R1): out of the first run, and hidden until a route reads the files (the design only names them)"},{"id":"m3_grades_table","core":false,"type":"table","text_en":"Your grades by subject (optional)","options":{"columns":["subject","grade","year"]},"audience":"student","stages":["S2","S3","S4"],"feeds":["academics.grades_by_subject"]},{"id":"m3_average","core":true,"type":"number","text_en":"Your overall average","audience":"student","stages":["S2","S3","S4"],"feeds":["academics.average_raw","derived.gpa_normalized"],"notes":"P4b (owner 3 Oct 2026, R1): asked with its scale (m1_grading_scale: five_point, ten_point, percent_100, gpa_4) and picked on a slider; a bare value is five_point"},{"id":"m3_trend","core":false,"type":"select","text_en":"Are your grades going up, staying flat, or going down?","options":["improving","stable","declining"],"audience":"student","stages":["S2","S3","S4"],"feeds":["academics.trend"]},{"id":"m3_strong_subjects","core":false,"type":"multi","text_en":"Strongest 3 subjects","options":"dynamic:subjects","audience":"student","stages":["S1","S2","S3","S4"],"feeds":["academics.strong"]},{"id":"m3_weak_subjects","core":false,"type":"multi","text_en":"Weakest 3 subjects","options":"dynamic:subjects","audience":"student","stages":["S1","S2","S3","S4"],"feeds":["academics.weak"]},{"id":"m3_enjoy_subjects","core":false,"type":"multi","text_en":"Subjects you enjoy most, regardless of grades","kid_text_en":"Which lessons do you actually like?","options":"dynamic:subjects","audience":"student","stages":["S1","S2","S3","S4"],"feeds":["academics.enjoy","llm.major_fit"]},{"id":"m3_math_level_self","core":false,"type":"select","text_en":"Where are you in math?","kid_text_en":"What math are you doing now? (adding, fractions, equations...)","options":["arithmetic","pre_algebra","algebra_1","geometry","algebra_2","precalculus_trig","calculus","beyond_calculus"],"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["academics.math_level_self"],"branch":"m3_math_test == skipped","notes":"P4b (owner 3 Oct 2026, R2): the math check measures it; old answer sets keep it"},{"id":"m3_math_test","core":true,"type":"test","text_en":"2-minute adaptive math check","options":{"engine":"math_ladder","minutes":2,"language":"native"},"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["academics.math_level_tested","verify.math_gap"],"verify":"adaptive ladder; result overrides self-report"},{"id":"m3_sciences","core":false,"type":"multi","text_en":"Sciences you take, and do you have lab access?","options":["biology","chemistry","physics","computer_science","none","lab_access_yes","lab_access_no"],"audience":"student","stages":["S2","S3","S4"],"feeds":["academics.sciences"]},{"id":"m3_rigor_available","core":false,"type":"multi","text_en":"Hardest courses available at your school","options":["ap","ib_hl","a_level","honors_advanced","olympiad_track","none"],"audience":"student","stages":["S2","S3","S4"],"feeds":["academics.rigor_available","derived.rigor_ceiling"]},{"id":"m3_external_courses","core":false,"type":"repeatable","text_en":"Courses you did outside school (online or offline)","options":{"fields":["name","provider","completed","certificate_url"]},"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["academics.external_courses"]},{"id":"m3_olympiads","core":true,"type":"repeatable","text_en":"Olympiads or academic competitions","kid_text_en":"Have you been in any competitions? Which ones?","options":{"fields":["subject","highest_level:[school,district,regional,national,international]","medal:[gold,silver,bronze,honorable_mention,participant]","year","evidence_url"]},"audience":"student","stages":["S2","S3","S4"],"feeds":["academics.olympiads","derived.hook_strength"],"notes":"P4g (owner 4 Oct 2026, M): the medal is picked (it was the free-text best_result), for readiness v3"},{"id":"m3_honors","core":true,"type":"repeatable","text_en":"Honors or awards you have won","options":{"fields":["name","level:[school,district,regional,national,international]","year"]},"audience":"student","stages":["S2","S3","S4"],"feeds":["academics.honors"],"why_en":"Why we ask: awards show universities what you have achieved. None yet? Continue with an empty list.","notes":"P4g (owner 4 Oct 2026, M): in the first run, after the olympiads, for readiness v3; the level is picked"},{"id":"m3_national_exam_path","core":true,"type":"select","text_en":"National exams that apply to you","options":"dynamic:country_profile.national_exams","audience":"student","stages":["S2","S3","S4"],"feeds":["academics.national_exam"],"notes":"auto-suggested from country + grade; e.g. Gaokao, JEE, EGE, DTM, CSAT, Abitur, A-levels"},{"id":"m3_dtm_result","core":true,"type":"select_plus_number","text_en":"Have you taken the DTM test? If yes, your score in points","options":["taken","not_taken"],"audience":"student","stages":["S2","S3","S4"],"branch":"m3_national_exam_path == DTM","feeds":["academics.national_exam_result","tests.taken"],"notes":"P4b (owner 3 Oct 2026, R6); points are bounded 0-300 until DTM's real maximum is verified"},{"id":"m3_milliy_sertifikat","core":true,"type":"repeatable","text_en":"Your Milliy sertifikat results: subject and grade","options":{"fields":["subject","grade:[a_plus,a,b_plus,b,c_plus,c]"]},"audience":"student","stages":["S2","S3","S4"],"branch":"m3_national_exam_path == MILLIY_SERTIFIKAT","feeds":["academics.national_certificates"],"notes":"P4b (owner 3 Oct 2026, R6): grades A+ to C; the subject is typed until the official subject list is confirmed"},{"id":"m3_milliy_percent","core":false,"live":true,"type":"repeatable","text_en":"The percentage on each Milliy sertifikat (grades B+ to C count by it)","options":{"fields":["subject","percent:number"]},"audience":"student","stages":["S2","S3","S4"],"branch":"m3_national_exam_path == MILLIY_SERTIFIKAT","feeds":["academics.national_certificates"],"notes":"P5d review R1 (spec §3.3), 7 Oct 2026: a live student only (live: true); CM 578 cl. 45: A+ and A count as the block's maximum, B+ to C by the percentage; matched to m3_milliy_sertifikat by subject"},{"id":"m3_dtm_blocks","core":false,"live":true,"type":"repeatable","text_en":"Your points in each block of your last state test (DTM), from the official result","options":{"fields":["block:[native_language,mathematics,uzbekistan_history,first_subject,second_subject]","points:number"]},"audience":"student","stages":["S2","S3","S4"],"branch":"m3_national_exam_path == DTM OR m2_destinations includes own_country AND m0_residence_country == UZ","feeds":["academics.national_exam_result"],"why_en":"Why we ask: official block points fix your state-test score, so we can show a chance instead of an estimate. Native language, maths and history count up to 11 each, the first subject up to 93, the second up to 63.","notes":"P5d review R1 (spec §3.3), 7 Oct 2026: a live student only (live: true); spec §3.7 source 2 (Order No. 105: 1.1 × 10, 3.1 × 30, 2.1 × 30)"},{"id":"m3_history_grade","core":false,"live":true,"type":"select","text_en":"Your latest school grade in History of Uzbekistan","options":["5","4","3","2"],"audience":"student","stages":["S2","S3","S4"],"branch":"m2_destinations includes own_country AND m0_residence_country == UZ","feeds":["academics.grades"],"notes":"P5d review R1 (spec §3.3), 7 Oct 2026: a live student only (live: true); 11 points of every state test (Order No. 105); no in-app check measures it, so it is an estimate (spec §3.7 source 3)"},{"id":"m3_native_grade","core":false,"live":true,"type":"select","text_en":"Your latest school grade in your native language","options":["5","4","3","2"],"audience":"student","stages":["S2","S3","S4"],"branch":"m2_destinations includes own_country AND m0_residence_country == UZ","feeds":["academics.grades"],"notes":"P5d review R1 (spec §3.3), 7 Oct 2026: a live student only (live: true); 11 points of every state test (Order No. 105); an estimate, as above"},{"id":"m3_national_exam_status","core":false,"type":"select_plus_number","text_en":"Status and target for that exam","options":["not_started","preparing","registered","done"],"audience":"student","stages":["S2","S3","S4"],"branch":"m3_national_exam_path != none","feeds":["academics.national_exam_status","academics.national_exam_target"]},{"id":"m3_reading_habit","core":false,"type":"select","text_en":"How many books do you read per month (any language)?","kid_text_en":"How many books do you read in a month?","options":["0","1","2_3","4_plus"],"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["academics.reading_habit"]},{"id":"m3_study_hours","core":false,"type":"number","text_en":"Hours per week you study outside school","audience":"student","stages":["S1","S2","S3","S4"],"feeds":["capacity.study_hours"]},{"id":"m3_self_study","core":false,"type":"scale_1_5","text_en":"Can you learn from a book or video on your own without a teacher?","audience":"student","stages":["S1","S2","S3","S4"],"feeds":["mindset.self_study"]},{"id":"m3_learning_health","core":false,"type":"text","text_en":"Any learning difference or health condition that affects school? Documented?","audience":"student","stages":["S1","S2","S3","S4"],"feeds":["academics.accommodation_needs"],"sensitive":true,"notes":"optional; only used to plan accommodations and pacing; never shown in rankings"}]},{"id":"M4","name":"Language","purpose":"Native languages, English and any destination language. Self-report is replaced by the adaptive screener. English is only gated if a chosen destination needs it.","questions":[{"id":"m4_native_languages","core":false,"type":"multi","text_en":"Languages you speak at home","options":"dynamic:languages","audience":"student","stages":["S1","S2","S3","S4"],"feeds":["language.native"]},{"id":"m4_english_self","core":true,"type":"select","text_en":"Your English level (your own guess)","kid_text_en":"How much English do you know? (none / a little / I can chat / I can read books)","options":["A0_none","A1","A2","B1","B2","C1","C2"],"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["language.english_self"]},{"id":"m4_english_official","core":false,"type":"repeatable","text_en":"Official English test scores, if any","options":{"fields":["test:[ielts,toefl,duolingo,pte,cambridge,other]","score","date"]},"audience":"student","stages":["S2","S3","S4"],"feeds":["language.english_official"]},{"id":"m4_english_screener","core":true,"type":"test","text_en":"3-minute adaptive English check","options":{"engine":"english_screener","minutes":3,"starts_at":"A0","stop_rule":"a level passes with at most one miss; two misses at a level, or passing C2, end it; every question is timed and a timeout counts as \"I don't know\"; one attempt"},"audience":"student","stages":["S1","S2","S3","S4"],"branch":"m2_destinations != own_country","feeds":["language.english_tested","verify.english_gap"],"verify":"result overrides m4_english_self; if gap >= 2 CEFR levels -> honesty/overconfidence flag (soft)"},{"id":"m4_writing_sample_en","core":false,"type":"text","text_en":"Write 150 words in English: why do you want this?","options":{"max_words":150},"audience":"student","stages":["S2","S3","S4"],"branch":"language.english_tested >= A2","feeds":["language.writing_en_raw","llm.writing_level","llm.voice_baseline"]},{"id":"m4_writing_sample_native","core":false,"type":"text_or_voice","text_en":"Write or record 150 words in your own language: why do you want this?","kid_text_en":"Tell me, in your own words, why you want to study hard. You can record it.","options":{"max_words":150},"audience":"student","stages":["S1","S2","S3","S4"],"branch":"language.english_tested < A2 OR derived.stage == S1","feeds":["language.writing_native_raw","llm.thinking_quality","llm.voice_baseline"]},{"id":"m4_other_languages","core":false,"type":"repeatable","text_en":"Other languages you know","options":{"fields":["language","level:[A1,A2,B1,B2,C1,C2,native]","certificate:[none,testdaf,dsh,goethe,delf,dalf,tcf,topik,jlpt,hsk,torfl,dele,cils,other]"]},"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["language.other"]},{"id":"m4_exposure","core":false,"type":"select","text_en":"How much English (or your target language) do you use daily?","options":["none","under_1h","1_2h","over_2h"],"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["language.daily_exposure"]},{"id":"m4_language_test_plan","core":false,"type":"date_or_unknown","text_en":"When do you plan to take an official language test?","audience":"student","stages":["S2","S3","S4"],"feeds":["language.test_plan"]}]},{"id":"M5","name":"Admission Tests","purpose":"Tests already taken plus the checklist the destination rules require. The list is generated by code from destination x field, never typed by the student.","questions":[{"id":"m5_tests_taken","core":true,"type":"repeatable","text_en":"Have you taken any of these tests? Add your scores","options":{"fields":["test:[sat,act,psat,mock_sat,ap,ib_exam,dtm,milliy_sertifikat,ielts,toefl,duolingo,cefr_multilevel,other]","score","date","official:bool"]},"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["tests.taken"],"verify":"link to in-app Mock SAT result when available","kid_text_en":"Have you taken any of these tests?","why_en":"Why we ask: real scores show which universities are within reach. Not taken one yet? Tap “Not yet”.","notes":"P4g (owner 4 Oct 2026, T): a live student answers SAT, IELTS, TOEFL, Duolingo, ACT and AP one by one (taken + score, or not yet; AP per subject, row.subject), then any other test; only taken tests are stored, as before"},{"id":"m5_required_tests","core":true,"type":"checklist","text_en":"Tests your destinations require, and where you are with each","options":{"source":"dynamic:destination_rules.required_tests(m2_destinations, m2_field)","status":["not_started","preparing","registered","done","not_needed"]},"audience":"student","stages":["S2","S3","S4"],"feeds":["tests.required_status"],"notes":"examples by destination: SAT/ACT; UCAT, LNAT, MAT, TMUA, ESAT, STEP (UK); EJU (JP); HSK (CN); TOPIK (KR); YOS (TR); TestAS / Studienkolleg FSP (DE); IMAT (IT medicine)"},{"id":"m5_test_center_access","core":false,"type":"select","text_en":"Is there a test center you can reach, with bookable dates?","options":["yes_nearby","yes_but_far_or_full","no_center_in_country","dont_know"],"audience":"student","stages":["S2","S3","S4"],"feeds":["tests.center_access"],"notes":"'no center' -> travel + registration lead-time tasks"},{"id":"m5_prep_budget","core":false,"type":"select","text_en":"Budget for test prep","options":["zero_self_study","small_online","can_pay_course"],"audience":"student","stages":["S2","S3","S4"],"feeds":["tests.prep_budget"]},{"id":"m5_prep_hours","core":false,"type":"number","text_en":"Hours per week you can give to test prep","audience":"student","stages":["S2","S3","S4"],"feeds":["capacity.test_prep_hours"]},{"id":"m5_target_scores","core":false,"type":"confirm_numbers","text_en":"Target scores (we suggest from your dream list; adjust)","options":"dynamic:destination_rules.typical_scores(m2_dream_unis)","audience":"student","stages":["S2","S3","S4"],"feeds":["tests.targets"]}]},{"id":"M6","name":"Activities & Impact","purpose":"What they do outside class, depth vs breadth, initiative, responsibilities. Weakest area for students whose schools offer nothing; the roadmap has to create lanes.","questions":[{"id":"m6_activities","core":true,"type":"repeatable","text_en":"Everything you do outside class","kid_text_en":"What do you do after school and on weekends? Clubs, sports, games you make, helping at home...","options":{"fields":["name","category:[academic_club,research,building_tech,sports,arts,community_service,work,family_responsibility,entrepreneurship,religious_cultural,leadership_student_gov,other]","role","founded_or_joined","hours_per_week","weeks_per_year","years","evidence_url"]},"audience":"student","stages":["S2","S3","S4"],"feeds":["activities.list","derived.depth_score","derived.initiative_score"],"why_en":"Why we ask: universities look at what you do outside class: volunteering, a startup, clubs, sports, a job. Add each one."},{"id":"m6_honors","core":false,"type":"repeatable","text_en":"Awards or recognition outside academics","options":{"fields":["name","level","year"]},"audience":"student","stages":["S2","S3","S4"],"feeds":["activities.honors"]},{"id":"m6_created","core":false,"type":"text","text_en":"Things you have built, published, sold, organized or taught","kid_text_en":"Have you ever made something yourself? A game, a video, a project, a small business?","options":{"max_words":150,"links":true},"audience":"student","stages":["S2","S3","S4"],"feeds":["activities.created","derived.initiative_score"]},{"id":"m6_responsibilities","core":false,"type":"multi_plus_hours","text_en":"Responsibilities at home or work","options":["job","family_business","caring_for_siblings","caring_for_relative","household","none"],"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["activities.responsibilities","context.hardship_signals"],"notes":"counts as context in holistic systems; also caps available hours"},{"id":"m6_leadership","core":false,"type":"number","text_en":"Have you led people? How many?","audience":"student","stages":["S2","S3","S4"],"feeds":["activities.leadership_scale"]},{"id":"m6_summer","core":false,"type":"select_plus_number","text_en":"Summers: are you free, and is there a budget for a program?","options":["fully_free","partly_free","working","family_duties"],"audience":"student","stages":["S2","S3","S4"],"feeds":["capacity.summer","money.summer_budget"]},{"id":"m6_portfolio","core":false,"type":"select","text_en":"Do you have a portfolio or audition material?","options":["yes_complete","partial","no"],"audience":"student","stages":["S2","S3","S4"],"branch":"m2_field in [arts,design,architecture,music,film]","feeds":["activities.portfolio_status"]},{"id":"m6_sports","core":false,"type":"repeatable","text_en":"Competitive sport details","options":{"fields":["sport","level:[school,regional,national,international]","results","open_to_recruitment:bool"]},"audience":"student","stages":["S2","S3","S4"],"branch":"m6_activities has category sports AND level >= regional","feeds":["activities.sports_recruitable"]},{"id":"m6_research","core":false,"type":"select_plus_text","text_en":"Any research experience or a mentor?","options":["none","school_project","with_mentor","published"],"audience":"student","stages":["S2","S3","S4"],"feeds":["activities.research"]},{"id":"m6_community_problem","core":false,"type":"text_or_voice","text_en":"A problem in your school or community you would like to solve","kid_text_en":"What is something around you that you wish worked better?","options":{"max_words":100},"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["activities.problem_seed","llm.project_seed"]},{"id":"m6_mentors","core":false,"type":"multi","text_en":"Who could help you? (select all)","options":["teacher","relative_in_profession","professional_contact","alumni_abroad","online_community","nobody_yet"],"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["context.mentors"]}]},{"id":"M7","name":"Money","purpose":"The single biggest filter for cross-border applicants. Parent-facing where possible, currency-normalized, and it gates the destination list.","questions":[{"id":"m7_respondent","core":false,"type":"select","text_en":"Who is answering this section?","options":["student","parent","together"],"audience":"student","stages":["S2","S3","S4"],"feeds":["money.respondent"]},{"id":"m7_annual_budget","core":true,"type":"number_currency","text_en":"How much can the family pay per year for university? (your currency; we convert)","audience":"parent","stages":["S2","S3","S4"],"feeds":["money.annual_budget_usd"],"sensitive":true,"notes":"if student answers alone, mark confidence=low and request parent confirmation task"},{"id":"m7_assets","core":false,"type":"select","text_en":"Savings or assets set aside for education (optional)","options":["none","under_10k","10k_50k","50k_150k","over_150k","prefer_not_to_say"],"audience":"parent","stages":["S2","S3","S4"],"feeds":["money.assets_band"],"sensitive":true},{"id":"m7_sponsors","core":false,"type":"multi","text_en":"Any sponsor?","options":["relatives","employer","government_program","foundation","none"],"audience":"student","stages":["S2","S3","S4"],"feeds":["money.sponsors"]},{"id":"m7_aid_need","core":true,"type":"select","text_en":"How much financial aid would you need?","options":["none","partial","full"],"audience":"student","stages":["S2","S3","S4"],"feeds":["money.aid_need","derived.aid_gate"]},{"id":"m7_income_documentable","core":false,"type":"select","text_en":"Can the family document income? (tax records, bank statements, employer letter)","options":["yes","partially","no","dont_know"],"audience":"parent","stages":["S2","S3","S4"],"feeds":["money.income_documentable","derived.visa_funds_risk","derived.aid_forms_risk"],"sensitive":true},{"id":"m7_loans","core":false,"type":"select","text_en":"Would the family take an education loan? (many countries need a local cosigner)","options":["yes","maybe","no"],"audience":"parent","stages":["S2","S3","S4"],"feeds":["money.loans_ok"]},{"id":"m7_scholarship_interest","core":false,"type":"multi","text_en":"Scholarship programs you may qualify for (select the ones to pursue)","options":"dynamic:scholarships_by(citizenship, destinations, age)","audience":"student","stages":["S2","S3","S4"],"feeds":["money.scholarship_targets"],"notes":"e.g. GKS, MEXT, CSC, Turkiye Burslari, Stipendium Hungaricum, need-blind US schools, NYUAD; each with age caps from rules base"},{"id":"m7_process_budget","core":false,"type":"number_currency","text_en":"Budget for the process itself (tests, application fees, translations, visa)","audience":"student","stages":["S2","S3","S4"],"feeds":["money.process_budget_usd"]},{"id":"m7_prestige_vs_cost","core":false,"type":"slider","text_en":"What matters more: prestige or cost?","options":{"left":"prestige","right":"low_cost"},"audience":"student","stages":["S2","S3","S4"],"feeds":["money.prestige_vs_cost"]}]},{"id":"M8","name":"Family","purpose":"Alignment and constraints. The gap between the student's answers and the parents' answers is itself a diagnostic signal.","questions":[{"id":"m8_parent_education","core":false,"type":"select","text_en":"Parents' or guardians' highest education","options":["no_secondary","secondary","vocational","bachelors","masters_plus","dont_know"],"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["family.parent_education","context.first_gen"]},{"id":"m8_parent_attitude","core":true,"type":"select","text_en":"How do your parents feel about your plan?","kid_text_en":"Do your parents know you want this? What do they say?","options":["fully_supportive","conditional","hesitant","against","dont_know"],"audience":"student","stages":["S2","S3","S4"],"feeds":["family.attitude","derived.family_risk"]},{"id":"m8_decision_maker","core":false,"type":"select","text_en":"Who makes the final decision about where you study?","options":["me","parents","together"],"audience":"student","stages":["S2","S3","S4"],"feeds":["family.decision_maker"]},{"id":"m8_family_major_pref","core":false,"type":"select_plus_text","text_en":"Do your parents want you to study something specific? Same as you?","options":["same_as_mine","different","no_preference"],"audience":"student","stages":["S2","S3","S4"],"feeds":["family.major_pref","derived.major_conflict"]},{"id":"m8_constraints","core":false,"type":"multi","text_en":"Family or community expectations that could affect the plan (optional)","options":["distance_limits","gender_expectations","religious_expectations","marriage_expectations","eldest_child_duties","none","prefer_not_to_say"],"audience":"student","stages":["S2","S3","S4"],"feeds":["family.constraints"],"sensitive":true},{"id":"m8_family_abroad","core":false,"type":"select_plus_text","text_en":"Anyone in the family who studied or lives abroad? Where?","options":["yes","no"],"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["family.abroad_network"]},{"id":"m8_parent_flow","core":false,"type":"system","text_en":"Send the parent questionnaire (budget confirm, attitude, constraints, consent)","audience":"system","stages":["S1","S2","S3","S4"],"feeds":["family.parent_flow_status"],"notes":"5 questions; link or QR; unlocks full roadmap when completed for minors"}]},{"id":"M9","name":"Mindset & Capacity","purpose":"Predicts execution. This block sets task load, cadence, format and tone of the daily tasks.","questions":[{"id":"m9_why","core":false,"type":"text_or_voice","text_en":"The real reason you want this (type or record, any language)","kid_text_en":"Why do you want to do well in school? Say it in your own words.","options":{"max_words":100},"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["mindset.why_raw","llm.intrinsic_vs_extrinsic"],"why_en":"Why we ask: we show your reason back to you on hard days. It stays private: your parents and other students never see it.","retired":true,"notes":"P4g (owner 4 Oct 2026, S1): removed from the diagnostic, first run and Deep alike (retired: never asked); stored answers stay valid"},{"id":"m9_motivation_source","core":false,"type":"select","text_en":"Who or what pushed you toward this?","options":["myself","parents","friends","teacher","social_media","other"],"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["mindset.motivation_source"],"why_en":"Why we ask: to understand who is behind your goal. Private, and never used to rank you."},{"id":"m9_streak","core":false,"type":"select","text_en":"Longest time you did something every day","options":["never","1_week","1_month","3_months","6_months_plus"],"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["mindset.consistency_band"],"why_en":"Why we ask: to understand how long you keep a habit going. Private, and never used to rank you."},{"id":"m9_voluntary_6mo","core":false,"type":"text","text_en":"Something you kept doing 6+ months with nobody forcing you","options":{"max_words":60},"audience":"student","stages":["S2","S3","S4"],"feeds":["mindset.voluntary_persistence"],"why_en":"Why we ask: to understand what keeps you going on your own. Private, and never used to rank you."},{"id":"m9_failure","core":false,"type":"text_or_voice","text_en":"A time you failed. What did you do next?","options":{"max_words":80},"audience":"student","stages":["S2","S3","S4"],"feeds":["mindset.failure_response_raw","llm.resilience"],"why_en":"Why we ask: to understand how you handle a setback. Private, and never used to rank you."},{"id":"m9_structure_pref","core":false,"type":"select","text_en":"How do you work best?","options":["strict_daily_plan","flexible_weekly_goals"],"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["capacity.structure_pref","tasks.cadence"],"why_en":"Why we ask: to understand how you like to organise your work. Private, and never used to rank you."},{"id":"m9_discipline","core":false,"type":"scale_1_5","text_en":"How disciplined are you, honestly?","audience":"student","stages":["S1","S2","S3","S4"],"feeds":["mindset.discipline_self"],"why_en":"Why we ask: to understand how you see yourself today. Private, and never used to rank you."},{"id":"m9_sleep","core":false,"type":"number","text_en":"Hours of sleep on a normal night (optional)","audience":"student","stages":["S1","S2","S3","S4"],"feeds":["wellbeing.sleep"],"sensitive":true,"why_en":"Why we ask: to understand your rest. Optional, private, and never used to rank you."},{"id":"m9_screen","core":false,"type":"number","text_en":"Hours on your phone on a normal day (optional)","audience":"student","stages":["S1","S2","S3","S4"],"feeds":["wellbeing.screen"],"sensitive":true,"why_en":"Why we ask: to understand your day. Optional, private, and never used to rank you."},{"id":"m9_stress","core":false,"type":"scale_1_5","text_en":"Stress level right now","audience":"student","stages":["S1","S2","S3","S4"],"feeds":["wellbeing.stress","tasks.load_modifier"],"notes":"4-5 -> reduce load, add rest tasks, surface support; never diagnose","why_en":"Why we ask: when stress is high, we plan lighter weeks with more rest. It stays private."},{"id":"m9_support","core":false,"type":"select","text_en":"Who supports you when it gets hard?","options":["family","friends","teacher_mentor","nobody","prefer_not_to_say"],"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["wellbeing.support"],"why_en":"Why we ask: to understand who you can lean on. Private, and never used to rank you."},{"id":"m9_hours_per_week","core":true,"type":"number","text_en":"Hours per week you can give to this roadmap","kid_text_en":"How many hours a week can you spend on extra learning?","audience":"student","stages":["S1","S2","S3","S4"],"feeds":["capacity.hours_per_week","tasks.budget"],"why_en":"Why we ask: we size your weekly plan to these hours."},{"id":"m9_time_of_day","core":false,"type":"select","text_en":"When do you work best?","options":["early_morning","after_school","evening","night","varies"],"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["tasks.preferred_time"],"why_en":"Why we ask: to understand when you work best. Private, and never used to rank you."},{"id":"m9_days_off","core":false,"type":"multi","text_en":"Days you cannot work on this","options":["mon","tue","wed","thu","fri","sat","sun","none"],"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["tasks.days_off"],"why_en":"Why we ask: these become rest days, with no tasks."},{"id":"m9_learning_style","core":false,"type":"select","text_en":"How do you like to learn?","options":["video","reading","practice_tests","live_classes","one_on_one","mixed"],"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["tasks.format_pref"],"why_en":"Why we ask: to understand how you like to learn. Private, and never used to rank you."},{"id":"m9_devices","core":true,"type":"multi","text_en":"What do you have?","options":["laptop","tablet","phone_only","stable_internet","unstable_internet","shared_device"],"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["capacity.devices","tasks.format_constraints"],"why_en":"Why we ask: we match tasks to what you have, such as lessons that work on a phone."},{"id":"m9_commitments","core":false,"type":"multi_plus_hours","text_en":"Other fixed commitments and hours per week","options":["national_exam_prep","sport","music_arts","job","religious","family_duties","none"],"audience":"student","stages":["S1","S2","S3","S4"],"feeds":["capacity.commitments","tasks.budget"],"why_en":"Why we ask: to understand what else fills your week. Private, and never used to rank you."},{"id":"m9_personality","core":false,"type":"slider","text_en":"Introvert <-> extrovert","options":{"left":"introvert","right":"extrovert"},"audience":"student","stages":["S2","S3","S4"],"feeds":["mindset.personality_axis","tasks.interview_prep_weight"],"why_en":"Why we ask: to understand you a little better. Private, and never used to rank you."},{"id":"m9_story","core":false,"type":"text_or_voice","text_en":"Tell your story in about 200 words (text or voice)","options":{"max_words":200},"audience":"student","stages":["S2","S3","S4"],"feeds":["narrative.baseline_raw","llm.narrative_quality"],"why_en":"Why we ask: to hear where you come from, in your own words. Private, and never used to rank you."}]},{"id":"M10","name":"Legal & Logistics","purpose":"Passport, visas, conscription, restrictions, documents, recommenders. Cheap to ask, expensive to discover in the application year.","questions":[{"id":"m10_passport","core":false,"type":"select_plus_date","text_en":"Do you have a passport? Expiry date?","options":["yes","no","expired"],"audience":"student","stages":["S2","S3","S4"],"feeds":["logistics.passport"]},{"id":"m10_visa_history","core":false,"type":"select","text_en":"Any visa refusals for you or your family?","options":["none","yes_me","yes_family","dont_know"],"audience":"student","stages":["S2","S3","S4"],"feeds":["logistics.visa_history","derived.visa_risk"],"sensitive":true},{"id":"m10_military","core":false,"type":"select","text_en":"Military service obligation and your plan for deferment","options":["not_applicable","applies_have_deferment_plan","applies_no_plan","dont_know"],"audience":"student","stages":["S2","S3","S4"],"branch":"country_profile.conscription applies to profile.gender AND derived.age >= 15","feeds":["logistics.military"],"notes":"countries in rules base: e.g. KR, IL, SG, TR, UZ, RU, IR, EG, TH; deferment paperwork becomes a milestone"},{"id":"m10_travel_restrictions","core":false,"type":"system","text_en":"Entry or sanction restrictions between your citizenship and destinations","audience":"system","stages":["S1","S2","S3","S4"],"feeds":["derived.travel_restriction_flags"],"notes":"computed from rules base; shown as a blocker in feasibility matrix with source_url"},{"id":"m10_social_media","core":false,"type":"select","text_en":"Are your social accounts public, and would you clean them up if asked?","options":["private","public_fine","public_needs_cleanup","no_accounts"],"audience":"student","stages":["S2","S3","S4"],"feeds":["logistics.social_media"]},{"id":"m10_docs_ready","core":false,"type":"checklist","text_en":"Documents ready?","options":["birth_certificate","transcripts_official","transcripts_translated","apostille_or_notarized","passport_copy","photos"],"audience":"student","stages":["S3","S4"],"feeds":["logistics.docs"]},{"id":"m10_recommenders","core":false,"type":"select","text_en":"Teachers who could write you a recommendation","options":["none_yet","one","two_plus"],"audience":"student","stages":["S2","S3","S4"],"feeds":["logistics.recommenders"]},{"id":"m10_accounts","core":false,"type":"checklist","text_en":"Application accounts created?","options":"dynamic:destination_rules.portals(m2_destinations)","audience":"student","stages":["S3","S4"],"feeds":["logistics.accounts"],"notes":"Common App, UCAS, Studielink, uni-assist, Campus France, OUAC, universitaly, etc."}]},{"id":"M11","name":"Stage Add-ons","purpose":"Extra questions only for application-year (S3) and gap-year / reapplicant / transfer (S4) users.","questions":[{"id":"m11_college_list","core":false,"type":"repeatable","text_en":"Your current application list","options":{"fields":["university","country","round:[early,regular,rolling]","status"]},"audience":"student","stages":["S3","S4"],"feeds":["apply.list"]},{"id":"m11_deadlines_known","core":false,"type":"select","text_en":"Do you know each deadline?","options":["yes_all","some","no"],"audience":"student","stages":["S3","S4"],"feeds":["apply.deadline_awareness"]},{"id":"m11_essay_status","core":false,"type":"select","text_en":"Essays / personal statement status","options":["not_started","brainstorming","drafting","revising","done"],"audience":"student","stages":["S3","S4"],"feeds":["apply.essay_status"]},{"id":"m11_recs_status","core":false,"type":"select","text_en":"Recommendation letters status","options":["not_asked","asked","confirmed","submitted"],"audience":"student","stages":["S3","S4"],"feeds":["apply.recs_status"]},{"id":"m11_tests_booked","core":false,"type":"checklist","text_en":"Remaining test dates booked?","options":"dynamic:tests.required_status where status != done","audience":"student","stages":["S3","S4"],"feeds":["apply.tests_booked"]},{"id":"m11_aid_forms_status","core":false,"type":"select","text_en":"Financial aid forms status","options":["not_applicable","not_started","in_progress","submitted"],"audience":"student","stages":["S3","S4"],"feeds":["apply.aid_forms_status"]},{"id":"m11_interview_ready","core":false,"type":"scale_1_5","text_en":"How ready are you for an interview in the destination language?","audience":"student","stages":["S3","S4"],"feeds":["apply.interview_readiness"]},{"id":"m11_last_cycle","core":false,"type":"repeatable","text_en":"Where did you apply last cycle, and what happened?","options":{"fields":["university","result:[admitted,waitlisted,rejected,withdrew]","aid_offered","reason_if_known"]},"audience":"student","stages":["S4"],"branch":"m1_status in [finished_school_gap_year,in_university]","feeds":["reapply.last_cycle"],"retired":true,"notes":"P4g (owner 4 Oct 2026, S2): removed from the diagnostic, first run and Deep alike (retired: never asked); stored answers stay valid"},{"id":"m11_what_changed","core":false,"type":"text_or_voice","text_en":"What has changed since then?","options":{"max_words":120},"audience":"student","stages":["S4"],"branch":"m11_last_cycle not empty","feeds":["reapply.delta_raw"]},{"id":"m11_current_uni","core":false,"type":"form","text_en":"Current university, GPA, credits, and why you want to transfer","options":{"fields":["university","gpa","credits_completed","reason"]},"audience":"student","stages":["S4"],"branch":"m1_status == in_university","feeds":["transfer.current"]},{"id":"m11_gap_activities","core":false,"type":"repeatable","text_en":"What have you done during the gap?","options":{"fields":["activity","months","evidence_url"]},"audience":"student","stages":["S4"],"branch":"m1_status == finished_school_gap_year","feeds":["reapply.gap_activities"]},{"id":"m11_age_caps","core":false,"type":"system","text_en":"Age caps on your scholarship targets","audience":"system","stages":["S4"],"feeds":["derived.age_cap_flags"],"notes":"computed from rules base (e.g. undergrad scholarship age limits); shown as blocker"}]}],"consistency_checks":[{"id":"c_english_gap","rule":"m4_english_self - language.english_tested >= 2 CEFR levels","action":"use tested level; soft message about overconfidence; no penalty"},{"id":"c_math_gap","rule":"m3_math_level_self - academics.math_level_tested >= 2 rungs","action":"use tested level; adjust math track"},{"id":"c_grades_vs_average","rule":"OCR grades_by_subject mean != m3_average by > 10% of scale","action":"ask to confirm; flag transcript_confidence=low"},{"id":"c_olympiad_vs_grades","rule":"national+ olympiad claimed but subject grade below top band","action":"request evidence_url; keep claim as unverified"},{"id":"c_budget_vs_list","rule":"money.aid_need == full AND every dream uni is need-aware or no-aid for this citizenship","action":"reality gap = high; require parallel destinations before roadmap unlock"},{"id":"c_hours_vs_goals","rule":"tasks.budget < minimum hours implied by milestones for stage","action":"reduce parallel tracks; show trade-off screen"},{"id":"c_student_vs_parent","rule":"parent m7/m8 answers differ from student answers","action":"surface the gap as a family-alignment task, not as an error"},{"id":"c_visa_intent","rule":"m2_post_grad_intent == work_in_destination AND destination rules flag strict nonimmigrant intent","action":"education screen on post-study routes; not a blocker"},{"id":"c_stage_mismatch","rule":"derived.stage from grade/graduation differs from age-based stage","action":"grade/graduation wins; stage = closest to next application deadline"}]};                     // 03_question_bank.json (ids never change) /* JG-PROD: owner 3 Oct R1 R2 R3 R4 R5 R6 R7 R9 R10 R11 R12 R13, the question bank v2 = src/engine/data/question_bank.json (P4b); owner 4 Oct R3, the check labels state their typical length (math 2 minutes, English about 3); owner 4 Oct P4g S1 (S1 S2 U T M), the real reason and the last cycle retired, universities and tests asked of every student, olympiad medals and honors in the first run; owner 7 Oct P5d review R1, the §3.3 fields as live-only Deep questions (programme × language, the US round, Milliy percentages, DTM block points, the history and native-language grades) */ /* JG-PROD: owner 10 Oct (delegated call, teen walk), the English check is given to every student but one whose only route is her own country: a Korea or Türkiye student was given none and her level was only her own word (the bank's m4_english_screener branch = src/engine/data/question_bank.json) */
  const SEED = {"version":"0.1.0","note":"SEED ONLY. Every record carries verified_at/source_url/needs_verification. Records marked needs_verification=true contain typical values from general knowledge and MUST be checked on the official site before use in production. The engine must treat them as unverified and emit verify tasks.","country_profiles":[{"country":"UZ","label":"Uzbekistan","verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm grade structure, fork options after grade 9, DTM calendar and conscription/deferment rules on official sources","grades":[{"code":"1","label_i18n":"grade_1","typical_age":7},{"code":"2","label_i18n":"grade_2","typical_age":8},{"code":"3","label_i18n":"grade_3","typical_age":9},{"code":"4","label_i18n":"grade_4","typical_age":10},{"code":"5","label_i18n":"grade_5","typical_age":11},{"code":"6","label_i18n":"grade_6","typical_age":12},{"code":"7","label_i18n":"grade_7","typical_age":13},{"code":"8","label_i18n":"grade_8","typical_age":14},{"code":"9","label_i18n":"grade_9","typical_age":15},{"code":"10","label_i18n":"grade_10","typical_age":16},{"code":"11","label_i18n":"grade_11","typical_age":17}],"final_grade":"11","school_year_start_month":9,"school_types":["public_state","presidential_school","specialized_school","academic_lyceum","vocational_college","private_national","international_ib","international_cambridge","other"],"grading_scales":["five_point"],"fork_points":[{"after_grade":"9","options":["stay_grades_10_11","academic_lyceum","vocational_college","international_school","move_abroad"]}],"national_exams":[{"id":"DTM","name":"DTM state test for university admission","taken_in_grade":"11","typical_dates":"June-July (registration in spring)","admission_logic":"exam_driven"},{"id":"MILLIY_SERTIFIKAT","name":"Milliy sertifikat (national certificate exams by subject)","needs_verification":true,"notes":"P4b (owner 3 Oct 2026, R6): the student gives subject + grade (A+, A, B+, B, C+, C); how a certificate counts for admission is not in the rules yet"}],"instruction_languages":["uz","ru","en"],"conscription":{"applies_to":"male","age_range":"18-27","deferment_for_study_abroad":"unknown"},"test_centers":[{"test":"SAT","cities":["Tashkent"],"note":"dates fill early; some students travel to Almaty/Bishkek"},{"test":"IELTS","cities":["Tashkent","Samarkand","Fergana","Namangan","Bukhara"]},{"test":"AP","cities":["Tashkent"],"note":"limited authorized centers"}],"typical_family_budget_band_usd":"most families need full or near-full aid for US/UK; German/Turkish/Korean routes more often affordable","scholarship_programs_home":["El-Yurt Umidi (mostly graduate level; check undergrad availability)"]},{"country":"TEMPLATE","label":"Copy this for each launch corridor country","verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Fill from official ministry sources","grades":[],"final_grade":null,"school_year_start_month":null,"school_types":[],"grading_scales":[],"fork_points":[],"national_exams":[],"instruction_languages":[],"conscription":{"applies_to":"none","age_range":null,"deferment_for_study_abroad":"unknown"},"test_centers":[],"scholarship_programs_home":[]}],"destination_rules":[{"destination":"US","admission_logic":"holistic","cycles":[{"entry_term":"Fall 2029 (for a student graduating June 2029)","deadlines":[{"name":"Early Decision / Early Action","date":"2028-11-01","applies_to":"most selective universities; varies","hard":true,"verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm per university; ED/EA dates vary (Oct 15 - Nov 15)"},{"name":"Regular Decision","date":"2029-01-01","applies_to":"most universities; many are Jan 1-5","hard":true,"verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm per university"}],"decision_window":"Dec (ED) / Mar-Apr (RD)"}],"requirements":{"school_leaving":{"accepted_certificates":["national secondary certificate + transcript in English","IB","A-levels","AP-based"],"needs_foundation_or_studienkolleg_for":[]},"tests":[{"test_id":"SAT_or_ACT","required_for":{"universities":["Harvard","Yale","Dartmouth","Brown","Penn","Cornell","Stanford","MIT","Caltech","Johns Hopkins","UT Austin","Ohio State","Purdue","Georgetown","Florida and Georgia public systems","Princeton","Carnegie Mellon"]},"sources_by_university":{"Princeton":{"url":"https://admission.princeton.edu/apply/standardized-testing","checked":"2026-10-04","says":"SAT or ACT required for fall 2028 entry onward; test optional for fall 2027 entry"},"Carnegie Mellon":{"url":"https://admission-pantheon.cmu.edu/admission/standardized-testing","checked":"2026-10-04","says":"School of Computer Science requires SAT or ACT; Engineering, Dietrich, MCS, Tepper and Heinz IS are test flexible (scores required: SAT, ACT, IB, AP, A-level or French Bac); Fine Arts is test optional"}},"typical_score_band":"1500+ SAT for most selective as an international; 1300-1450 for strong publics","optional_where":"many other universities remain test-optional; Princeton requires from Fall 2028 entry; Columbia reverted for fall 2027 applicants","verified_at":"2026-09-24","source_url":"https://www.carnegieprep.com/college-admissions/college-admissions-testing-policy-updates/","needs_verification":false},{"test_id":"AP","required_for":{},"typical_score_band":"4-5 as rigor evidence","optional_where":"everywhere","verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Optional; confirm availability at home test centers"}],"language":[{"language":"en","min_level":"B2","accepted_certificates":["TOEFL iBT 100+ (selective) / 80+","IELTS 7.0+ (selective) / 6.5+","Duolingo 120-130+"],"waivers":"often waived with high SAT EBRW or English-medium schooling; varies","verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm per university"}]},"costs":{"tuition_band_usd":"private 60k-70k; public out-of-state 35k-55k","living_band_usd":"15k-25k","application_fee_band_usd":"75-90 per application (waivers exist)","visa_and_process_usd":"SEVIS + visa fee ~535; plus tests, translations","verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm current fees"},"aid":{"need_blind_for_internationals":["Harvard","Yale","Princeton","MIT","Amherst","Dartmouth","Bowdoin"],"note":"Brown reported need-blind for internationals from the class of 2029 - verify","meets_full_need":["same list; plus some need-aware schools meet full need for admitted internationals"],"merit_full_ride_examples":["check current lists; examples change yearly"],"government_scholarships":[],"verified_at":"2026-09-24","source_url":"https://www.thedp.com/article/2023/04/international-students-need-blind-financial-aid","needs_verification":false},"visa":{"type":"F-1","docs":["I-20 from university","SEVIS fee receipt","DS-160","passport","proof of funds for year 1","admission letter","academic documents"],"proof_of_funds_rule":"documented funds covering I-20 estimated cost for the first year","intent_rule":"nonimmigrant intent required (INA 214(b)); post-graduation 'stay' plans hurt interviews","post_study_work_note":"OPT exists; from 2026-09-15 F-1 admission is a fixed period tied to the I-20 end date, max 4 years + 30-day grace; undergraduates may change major only after one academic year; H-1B path became costlier in 2025 (verify current fee)","restrictions_by_citizenship":[{"country":"full_ban_list_2026","type":"F/M/J entry suspended (e.g., Afghanistan, Iran, Myanmar, Haiti, Syria, Yemen and others)","source_url":"https://isss.uoregon.edu/federal-updates"},{"country":"partial_ban_list_2026","type":"F/M/J entry suspended (e.g., Nigeria, Venezuela, Cuba, Tanzania and others)","source_url":"https://isss.uoregon.edu/federal-updates"},{"country":"UZ","type":"not on F-1 ban lists; appears on 2026 list of countries with increased immigrant-visa (public charge) scrutiny; student visas still issued","source_url":"https://manifestlaw.com/blog/212f-visa-rejections"}],"verified_at":"2026-09-24","source_url":"https://miracosta.edu/student-services/international-students/immigration-updates.html","needs_verification":false},"portals":["Common App","Coalition (Scoir)","university-specific"],"recommendation_letters":{"count":"2 teachers + counselor/school report","who":"grade 10-11 teachers"},"interview":"some","universities":[{"id":"mit","name":"MIT","selectivity_band":"ultra","need_aware_for_internationals":false,"typical_scores":"SAT 1520-1580","notes":"need-blind, meets full need"},{"id":"penn","name":"University of Pennsylvania","selectivity_band":"ultra","need_aware_for_internationals":true,"typical_scores":"SAT 1500-1570","notes":"need-aware for internationals"}],"verified_at":"2026-09-24","source_url":"https://thecollegeinvestor.com/77443/colleges-are-requiring-sat-and-act-scores-again-heres-the-full-list-for-2027/","needs_verification":false},{"destination":"UK","admission_logic":"hybrid","cycles":[{"entry_term":"Sept 2029","deadlines":[{"name":"UCAS early deadline (Oxford, Cambridge, medicine, dentistry, veterinary)","date":"2028-10-15","applies_to":"those courses","hard":true,"verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm UCAS date for that cycle"},{"name":"UCAS main deadline","date":"2029-01-14","applies_to":"most courses (mid-January; exact date varies by year)","hard":true,"verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm UCAS date for that cycle"}],"decision_window":"Nov-May"}],"requirements":{"school_leaving":{"accepted_certificates":["A-levels","IB","national certificates with strong grades (varies; many non-EU certificates need a foundation year)"],"needs_foundation_or_studienkolleg_for":["many national 11-year certificates -> International Foundation Year"]},"tests":[{"test_id":"UCAT","required_for":{"fields":["medicine","dentistry"]},"typical_score_band":"course-specific","verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm test dates/registration"},{"test_id":"LNAT","required_for":{"fields":["law"],"universities":["Oxford","LSE","UCL","KCL","Bristol","Durham","Glasgow","Nottingham","SOAS"]},"verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm list"},{"test_id":"MAT","required_for":{"fields":["mathematics","computer science"],"universities":["Oxford","Imperial"]},"verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm"},{"test_id":"TMUA","required_for":{"fields":["economics","computer science","mathematics"],"universities":["Cambridge","Imperial","Durham","LSE","Warwick"]},"verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm per course"},{"test_id":"ESAT","required_for":{"fields":["engineering","natural sciences"],"universities":["Cambridge","Imperial"]},"verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm"},{"test_id":"STEP","required_for":{"fields":["mathematics"],"universities":["Cambridge (offer condition)","Warwick"]},"verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm"}],"language":[{"language":"en","min_level":"B2","accepted_certificates":["IELTS for UKVI 6.0-7.0 by course","TOEFL iBT (accepted by most universities; check visa rules)","PTE Academic"],"waivers":"English-medium qualifications accepted by some","verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm per university and UKVI"}],"personal_statement":"from 2026 entry UCAS uses three structured questions instead of one free statement (verify)"},"costs":{"tuition_band_usd":"28k-50k","living_band_usd":"15k-22k (London higher)","application_fee_band_usd":"UCAS fee ~35","visa_and_process_usd":"visa fee + immigration health surcharge per year (verify)","verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm current fees"},"aid":{"need_blind_for_internationals":[],"meets_full_need":[],"merit_full_ride_examples":["very rare at undergraduate level; partial scholarships common"],"government_scholarships":[],"verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm scholarship landscape per university"},"visa":{"type":"Student visa","docs":["CAS from university","proof of funds (28-day rule)","passport","English evidence","TB test for some countries"],"proof_of_funds_rule":"tuition for year 1 + living costs held for 28 days","intent_rule":"genuine student; credibility interviews possible","post_study_work_note":"Graduate Route exists; length under review (verify)","restrictions_by_citizenship":[],"verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm on gov.uk"},"portals":["UCAS"],"recommendation_letters":{"count":"1 reference","who":"school"},"interview":"some (Oxbridge, medicine)","universities":[],"verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Whole record: typical values, verify on ucas.com and university sites"},{"destination":"DE","admission_logic":"exam_driven","cycles":[{"entry_term":"Winter semester 2029/30","deadlines":[{"name":"uni-assist / university deadline (winter)","date":"2029-07-15","applies_to":"many programs; some earlier (Jan-Apr for restricted programs)","hard":true,"verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm per program"},{"name":"summer semester deadline","date":"2029-01-15","applies_to":"some programs","hard":true,"verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm"}],"decision_window":"Aug-Sept"}],"requirements":{"school_leaving":{"accepted_certificates":["Abitur","IB","A-levels","recognized national certificates via anabin/uni-assist"],"needs_foundation_or_studienkolleg_for":["many non-EU 11-year certificates (e.g., Uzbekistan attestat) -> Studienkolleg + Feststellungspruefung, or 1-2 years of home university study; verify per country in anabin"]},"tests":[{"test_id":"TestAS","required_for":{},"typical_score_band":"optional/recommended by some universities","verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm"},{"test_id":"Studienkolleg_FSP","required_for":{"fields":["all, when certificate not directly recognized"]},"verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm per state"}],"language":[{"language":"de","min_level":"C1","accepted_certificates":["TestDaF 4x4","DSH-2","Goethe C1/C2","telc C1 Hochschule"],"waivers":"none for German-taught programs","verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm per university"},{"language":"en","min_level":"B2","accepted_certificates":["IELTS 6.5","TOEFL iBT 88-90"],"waivers":"for English-taught programs only","verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm per program"}]},"costs":{"tuition_band_usd":"mostly 0 (semester fee 150-400 EUR); Baden-Wuerttemberg ~1500 EUR/semester for non-EU; private universities charge","living_band_usd":"12k-15k","application_fee_band_usd":"uni-assist ~75 first application","visa_and_process_usd":"visa + blocked account (~12k EUR/year) + health insurance","verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm blocked account amount for the year"},"aid":{"need_blind_for_internationals":["n/a (tuition-free public system)"],"meets_full_need":[],"merit_full_ride_examples":["DAAD mostly graduate; Deutschlandstipendium 300 EUR/month"],"government_scholarships":[],"verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm"},"visa":{"type":"National visa (D) for studies","docs":["admission or Studienkolleg letter","blocked account or sponsor","health insurance","passport","certificates"],"proof_of_funds_rule":"blocked account covering 12 months","intent_rule":"study purpose; 18-month job-seeker residence after graduation (verify)","post_study_work_note":"18-month job search residence permit","restrictions_by_citizenship":[],"verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm on make-it-in-germany / consulate site"},"portals":["uni-assist","university portals","hochschulstart (restricted programs)"],"recommendation_letters":{"count":"usually none","who":"n/a"},"interview":false,"universities":[],"verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Whole record: typical values; verify with DAAD, anabin, uni-assist"},{"destination":"UZ_HOME","admission_logic":"exam_driven","cycles":[{"entry_term":"Sept 2029","deadlines":[{"name":"DTM registration","date":"2029-04-15","applies_to":"all state universities","hard":true,"verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm DTM registration window"},{"name":"DTM test window","date":"2029-06-20","applies_to":"all","hard":true,"verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm"}],"decision_window":"Aug"}],"requirements":{"school_leaving":{"accepted_certificates":["attestat (grade 11) / lyceum diploma"],"needs_foundation_or_studienkolleg_for":[]},"tests":[{"test_id":"DTM","required_for":{"fields":["all"]},"typical_score_band":"3 subjects; grant thresholds vary by program","verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm subject sets per program"}],"language":[{"language":"uz_or_ru","min_level":"native","accepted_certificates":[],"waivers":"language certificates (IELTS, etc.) may add points - verify"}]},"costs":{"tuition_band_usd":"grant (free) or contract (varies)","living_band_usd":"low","application_fee_band_usd":"small","visa_and_process_usd":"0","verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm"},"aid":{"need_blind_for_internationals":[],"meets_full_need":[],"merit_full_ride_examples":["state grant places by DTM score"],"government_scholarships":[],"verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm"},"visa":{"type":"none","docs":[],"proof_of_funds_rule":"n/a","intent_rule":"n/a","post_study_work_note":"n/a","restrictions_by_citizenship":[],"verified_at":"2026-09-24","source_url":"n/a","needs_verification":false},"portals":["my.gov.uz / DTM portal"],"recommendation_letters":{"count":"0","who":"n/a"},"interview":false,"universities":[],"verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Verify all on dtm.uz"}],"scholarship_programs":[{"id":"GKS","name":"Global Korea Scholarship (undergraduate)","destination":"KR","age_cap":"under 25 (verify)","citizenship_rules":"non-Korean; country quotas","covers":"tuition, stipend, language year","verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm on studyinkorea.go.kr"},{"id":"MEXT_UG","name":"MEXT undergraduate","destination":"JP","age_cap":"17-24 (verify)","citizenship_rules":"embassy recommendation by country","covers":"tuition, stipend, airfare","verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm on MEXT/embassy site"},{"id":"CSC","name":"Chinese Government Scholarship","destination":"CN","age_cap":"under 25 for bachelor (verify)","citizenship_rules":"non-Chinese","covers":"tuition, dorm, stipend","verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm on campuschina.org"},{"id":"TURKIYE_BURSLARI","name":"Turkiye Scholarships (undergraduate)","destination":"TR","age_cap":"under 21 (verify)","citizenship_rules":"non-Turkish","covers":"tuition, stipend, housing, Turkish year","verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm on turkiyeburslari.gov.tr"},{"id":"STIPENDIUM_HUNGARICUM","name":"Stipendium Hungaricum","destination":"HU","age_cap":"unknown (verify)","citizenship_rules":"partner countries via national nominating authority","covers":"tuition, stipend, dorm","verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm"},{"id":"NYUAD","name":"NYU Abu Dhabi need-based aid","destination":"AE","age_cap":"none","citizenship_rules":"all","covers":"full demonstrated need for admitted students (verify)","verified_at":null,"source_url":null,"needs_verification":true,"verify_task":"Confirm on nyuad.nyu.edu"}],"language_gap_months_heuristic":{"A0->A1":3,"A1->A2":4,"A2->B1":6,"B1->B2":8,"B2->C1":10,"note":"at 5-7 h/week; multiply by 1.3 for distant language families (e.g., English speaker -> Korean); heuristic only"}};                 // 05_SEED_DATA.json (every record carries needs_verification) /* JG-PROD: owner 3 Oct R6, CP_UZ v2: Milliy sertifikat; owner 4 Oct R10, US v2: Princeton and Carnegie Mellon in the SAT or ACT list = src/engine/data/seed_rules.json (P4d) */
  const TODAY = new Date();
  const CEFR = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];
  const RUNGS = ["arithmetic", "pre_algebra", "algebra_1", "geometry", "algebra_2", "precalculus_trig", "calculus", "beyond_calculus"];
  const SCALES = { five_point: ["5-point", 2, 5, .1, 5], ten_point: ["10-point", 1, 10, .1, 10], percent_100: ["100-point", 0, 100, 1, 100], gpa_4: ["GPA 4.0", 0, 4, .01, 4] }, scaleOf = A => { if (Object.prototype.hasOwnProperty.call(SCALES, A.m1_grading_scale)) return A.m1_grading_scale; const v = parseFloat(A.m3_average); return !isFinite(v) || v <= 5 ? "five_point" : v <= 10 ? "ten_point" : v <= 100 ? "percent_100" : "five_point"; }, avgOf = A => { const v = parseFloat(A.m3_average), s = scaleOf(A); return !isFinite(v) || v < 0 || v > SCALES[s][4] ? null : { value: v, scale: s, of: SCALES[s][4], five: Math.round(v * 5 / SCALES[s][4] * 100) / 100 }; };   /* JG-PROD: owner 3 Oct R1, the average's scale [label, min, max, step, out of] and its 5-point view (src/engine/answers.ts SCALES, scaleOf, averageOf); P4b final review I3: an average typed before its scale was asked reads on the only scale its value can be on, never "85 of 5", and a value its scale cannot have is unknown */
  /* ---------- words people read instead of ids ---------- */
  const L = {
    in_school: "I'm in school", finished_school_gap_year: "I finished school (gap year)", in_university: "I'm at university", not_in_school_other: "Something else",
    public_state: "Public school", presidential_school: "Presidential school", specialized_school: "Specialized school", academic_lyceum: "Academic lyceum",
    vocational_college: "Vocational college", private_national: "Private school", international_ib: "International school (IB)", international_cambridge: "International school (Cambridge)",
    national: "National curriculum", ib_myp_dp: "IB (MYP / DP)", cambridge_igcse_alevel: "Cambridge IGCSE / A-level", ap: "AP", french_bac: "French Bac", german_abitur: "German Abitur", other: "Other",
    ranking_prestige: "It's famous, top ranked", specific_program: "A specific program", cost_or_scholarship: "Cost or a scholarship", family_or_friends_there: "Family or friends there",
    culture_lifestyle: "Culture and lifestyle", immigration_prospects: "Staying to work after",
    return_home: "Come back home", work_in_destination: "Work in that country", grad_school: "Go on to grad school", undecided: "Not sure yet",
    arithmetic: "Arithmetic", pre_algebra: "Pre-algebra", algebra_1: "Algebra 1", geometry: "Geometry", algebra_2: "Algebra 2", precalculus_trig: "Pre-calculus and trigonometry",
    calculus: "Calculus", beyond_calculus: "Beyond calculus",
    "0": "None", "1": "One", "2_3": "Two or three", "4_plus": "Four or more",
    A0_none: "None yet", A1: "A1 · a few words", A2: "A2 · simple sentences", B1: "B1 · I can chat", B2: "B2 · I can study in it", C1: "C1 · fluent", C2: "C2 · like a native",
    partial: "Some aid", full: "Full aid",
    fully_supportive: "Fully supportive", conditional: "Supportive, with conditions", hesitant: "Hesitant", against: "Against it", dont_know: "I don't know",
    strict_daily_plan: "A strict daily plan", flexible_weekly_goals: "Flexible weekly goals",
    laptop: "Laptop", tablet: "Tablet", phone_only: "Phone only", stable_internet: "Stable internet", unstable_internet: "Unstable internet", shared_device: "A shared device",
    national_exam_prep: "National exam prep", sport: "Sport", music_arts: "Music or arts", job: "A job", religious: "Religious study", family_duties: "Family duties", none: "None",
    own_country: "My own country", dont_know_yet: "I don't know yet", registered: "Registered", fully_free: "Fully free", partly_free: "Partly free", working: "Working",
    school_project: "A school project", with_mentor: "With a mentor", published: "Published", same_as_mine: "The same as me", different: "Something different", no_preference: "No preference",
    yes: "Yes", no: "No", expired: "Expired", not_started: "Not started", preparing: "Preparing", booked: "Booked", done: "Done", DTM: "DTM (state test)", MILLIY_SERTIFIKAT: "Milliy sertifikat",   /* JG-PROD: owner 3 Oct R6, the national certificate (src/engine/labels.ts) */
  };
  const LQ = { m7_aid_need: { none: "No aid needed" }, m3_national_exam_path: { none: "None of these" }, m0_roadmap_language: { en: "English", uz: "Oʻzbekcha", ru: "Русский" }, m3_dtm_result: { taken: "Yes, I took it", not_taken: "Not yet" }, m3_milliy_sertifikat: { a_plus: "A+", a: "A", b_plus: "B+", b: "B", c_plus: "C+", c: "C" }, m5_tests_taken: { sat: "SAT", act: "ACT", psat: "PSAT", mock_sat: "Mock SAT", ib_exam: "IB exam", dtm: "DTM", milliy_sertifikat: "Milliy sertifikat", ielts: "IELTS", toefl: "TOEFL", duolingo: "Duolingo English Test", cefr_multilevel: "CEFR (Multilevel)" }, m3_olympiads: { school: "School", district: "District", regional: "Regional", national: "National", international: "International", gold: "Gold · 1st place", silver: "Silver · 2nd place", bronze: "Bronze · 3rd place", honorable_mention: "Honorable mention", participant: "Took part" }, m3_honors: { school: "School", district: "District", regional: "Regional", national: "National", international: "International" }, m6_activities: { academic_club: "Academic club", building_tech: "Building / tech", community_service: "Volunteering / community service", work: "A job", family_responsibility: "Family responsibilities", entrepreneurship: "Startup / own business", religious_cultural: "Religious / cultural", leadership_student_gov: "Leadership / student government" } };   /* JG-PROD: owner 3 Oct R6 R7 R12, the new options as words (src/engine/labels.ts); owner 4 Oct P4g S1 (M): olympiad levels and medals (a bare "national" read "National curriculum"), and volunteering and a startup named as the owner names them */
  const human = id => String(id).replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase()); const FL = { subject: "Subject", highest_level: "Highest level", medal: "Medal", year: "Year", evidence_url: "Link (optional)", name: "Name", level: "Level", category: "Category", role: "Your role", founded_or_joined: "Founded or joined", hours_per_week: "Hours per week", weeks_per_year: "Weeks per year", years: "Years", test: "Test", score: "Score", date: "Date", official: "Official result", grade: "Grade" }, fieldLabel = k => T((window.JG_ENGINE && FL[k]) || human(k));   /* JG-PROD: owner 4 Oct P4g S1 (L): a live student reads the fields as words, in the language picked first */
  const label = (q, v) => T((LQ[q] && LQ[q][v]) || L[v] || (COUNTRY[v] && COUNTRY[v].name) || (LANG[v]) || (FIELD[v]) || human(v));   /* JG-PROD: owner 4 Oct P4g S1 (L): every option in the language picked first */

  /* ---------- the lists behind "dynamic:" options (the backend serves these from taxonomies) ---------- */
  const COUNTRY = {}; [["UZ", "Uzbekistan"], ["KZ", "Kazakhstan"], ["KG", "Kyrgyzstan"], ["TJ", "Tajikistan"], ["TM", "Turkmenistan"], ["AZ", "Azerbaijan"], ["RU", "Russia"],
    ["US", "United States"], ["GB", "United Kingdom"], ["DE", "Germany"], ["KR", "South Korea"], ["JP", "Japan"], ["TR", "Türkiye"], ["CN", "China"], ["AE", "UAE"],
    ["SA", "Saudi Arabia"], ["QA", "Qatar"], ["NL", "Netherlands"], ["FR", "France"], ["IT", "Italy"], ["HU", "Hungary"], ["PL", "Poland"], ["CZ", "Czechia"], ["ES", "Spain"],
    ["CH", "Switzerland"], ["CA", "Canada"], ["AU", "Australia"], ["SG", "Singapore"], ["HK", "Hong Kong"], ["MY", "Malaysia"], ["IN", "India"], ["PK", "Pakistan"],
    ["BR", "Brazil"], ["NG", "Nigeria"], ["EG", "Egypt"]].forEach(([c, n]) => { COUNTRY[c] = { code: c, name: n }; });
  const flag = c => String.fromCodePoint(...[...c].map(ch => 127397 + ch.charCodeAt(0)));
  const LANG = { uz: "Uzbek", ru: "Russian", en: "English", kk: "Kazakh", ky: "Kyrgyz", tg: "Tajik", tr: "Turkish", ko: "Korean", ja: "Japanese", zh: "Chinese", de: "German",
    fr: "French", ar: "Arabic", hi: "Hindi", es: "Spanish", pt: "Portuguese" };
  const FIELD = { computer_science: "Computer science", engineering: "Engineering", medicine: "Medicine", business: "Business", economics: "Economics", law: "Law",
    mathematics: "Mathematics", natural_sciences: "Natural sciences", social_sciences: "Social sciences", humanities: "Humanities", arts: "Arts", design: "Design",
    architecture: "Architecture", music: "Music", film: "Film", education: "Education", undecided: "Not sure yet" };
  const UNIS = (window.JG_BOOT && window.JG_BOOT.unis) || [["mit", "MIT", "US"], ["harvard", "Harvard University", "US"], ["stanford", "Stanford University", "US"], ["penn", "University of Pennsylvania", "US"],   /* JG-PROD: owner 4 Oct R10, a real student's catalog and its search words come from the engine (src/engine/catalog.ts); the design's 20 stay the demo's */
    ["nyu", "New York University", "US"], ["oxford", "University of Oxford", "GB"], ["cambridge", "University of Cambridge", "GB"], ["imperial", "Imperial College London", "GB"],
    ["tum", "TU Munich", "DE"], ["kaist", "KAIST", "KR"], ["snu", "Seoul National University", "KR"], ["utokyo", "University of Tokyo", "JP"], ["boun", "Boğaziçi University", "TR"],
    ["nyuad", "NYU Abu Dhabi", "AE"], ["tsinghua", "Tsinghua University", "CN"], ["nus", "National University of Singapore", "SG"], ["tudelft", "TU Delft", "NL"],
    ["wiut", "Westminster International University in Tashkent", "UZ"], ["inha", "Inha University in Tashkent", "UZ"], ["nuu", "National University of Uzbekistan", "UZ"]];
  const RULES_OF = { US: "US", GB: "UK", DE: "DE" };                          // destination country -> rules record
  const cp = code => SEED.country_profiles.find(p => p.country === code) || SEED.country_profiles.find(p => p.country === "TEMPLATE");
  const rule = id => SEED.destination_rules.find(r => r.destination === id);

  function options(q, A, D) {                                               // [{value, label}]
    const o = q.options;
    if (Array.isArray(o)) return o.map(v => ({ value: String(v), label: label(q.id, v) }));
    if (typeof o !== "string") return [];
    const [src, fb] = o.split("|fallback:"), prof = cp(A.m0_residence_country || "UZ");
    const list = (() => {
      if (src.startsWith("dynamic:countries+")) return ["own_country", "dont_know_yet", ...["US", "GB", "DE", "KR", "JP", "TR", "CN", "AE", "NL", "FR", "IT", "HU", "CA", "AU", "SG"].filter(c => c !== A.m0_residence_country)];
      if (src === "dynamic:countries") return Object.keys(COUNTRY);
      if (src === "dynamic:languages") return Object.keys(LANG);
      if (src === "dynamic:field_taxonomy") return Object.keys(FIELD);
      const fall = fb ? fb.replace(/[[\]]/g, "").split(",") : [];              // an empty profile list means "no data": use the fallback
      if (src === "dynamic:country_profile.grades") return (prof.grades || []).length ? prof.grades.map(g => g.code) : Array.from({ length: 12 }, (_, i) => String(i + 1));
      if (src === "dynamic:country_profile.school_types") return (prof.school_types || []).length ? prof.school_types : fall;
      if (src === "dynamic:country_profile.national_exams") return [...(prof.national_exams || []).map(e => e.id), "none"];
      return fb ? fb.replace(/[[\]]/g, "").split(",") : [];
    })();
    return list.map(v => ({ value: v, label: src === "dynamic:country_profile.grades" ? T("Grade {g}", { g: v }) : label(q.id, v), flag: COUNTRY[v] ? flag(v) : "" }));   /* JG-PROD: owner 4 Oct P4g S1 (L) */
  }

  /* ---------- the branch language of the question bank ---------- */
  function val(path, A, D) {
    if (path.startsWith("derived.")) return D[path.slice(8)];
    if (path === "language.english_tested") return D.english_tested;
    return A[path];
  }
  function cmp(a, op, b) {
    const ia = CEFR.indexOf(a), ib = CEFR.indexOf(b); if (ia >= 0 && ib >= 0) { a = ia; b = ib; }
    if (a === undefined || a === null) return op === "!=";
    return { "==": a == b, "!=": a != b, "<": a < b, ">": a > b, "<=": a <= b, ">=": a >= b }[op];
  }
  function branch(expr, A, D) {
    if (/ OR /.test(expr)) return expr.split(/ OR /).some(e => branch(e.trim(), A, D));
    if (/ AND /.test(expr)) return expr.split(/ AND /).every(e => branch(e.trim(), A, D));
    let m;
    if ((m = expr.match(/^len\((\w+)\)\s*(>=|>|==)\s*(\d+)$/))) { const v = A[m[1]]; return cmp(Array.isArray(v) ? v.length : 0, m[2], +m[3]); }
    if ((m = expr.match(/^([\w.]+) in \[(.*)\]$/))) { const v = val(m[1], A, D), list = m[2].split(",").map(x => x.trim()); return Array.isArray(v) ? v.some(x => list.includes(x)) : list.includes(v); }
    if ((m = expr.match(/^([\w.]+) includes (\w+)$/))) { const v = val(m[1], A, D); return Array.isArray(v) && v.includes(m[2]); }
    if ((m = expr.match(/^([\w.]+) not empty$/))) { const v = val(m[1], A, D); return Array.isArray(v) ? v.length > 0 : !!v && v !== "skipped"; }
    if (expr === "derived.rules_set requires_english") return !!D.requires_english;
    if ((m = expr.match(/^country_profile\.has_fork_after\((\w+)\)$/))) return (cp(A.m0_residence_country || "UZ").fork_points || []).some(f => f.after_grade === A[m[1]]);
    if ((m = expr.match(/^m6_activities has category (\w+)$/))) return (A.m6_activities || []).some(x => x.category === m[1]);
    if (expr === "country_profile.conscription applies to profile.gender") { const c = (cp(A.m0_residence_country || "UZ").conscription || {}).applies_to; return c === "all" || (c === "male" && A.m0_gender === "male"); }
    if ((m = expr.match(/^level\s*>=\s*\w+$/))) return true;                 // paired with the category test above
    if ((m = expr.match(/^([\w.]+)\s*(==|!=|<=|>=|<|>)\s*(.+)$/))) { const r = m[3].trim(); return cmp(val(m[1], A, D), m[2], /^-?\d+(\.\d+)?$/.test(r) ? +r : r); }
    console.warn("JG: branch not understood", expr); return true;
  }

  /* ---------- derived fields (02_DIAGNOSTIC_SPEC §3; code, never the LLM) ---------- */
  const monthsBetween = (a, b) => (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  function firstDeadline(id, gradYear) {                                   // the rules base decides; missing -> needs_verification
    const r = rule(id);
    if (r) for (const c of r.cycles || []) {
      const d = (c.deadlines || [])[0];
      if (d && d.date && (+d.date.slice(0, 4) === gradYear || +d.date.slice(0, 4) === gradYear - 1)) return { name: d.name, date: d.date, needs_verification: !!d.needs_verification || !!r.needs_verification, rule_id: id };
    }
    return { name: "first application deadline", date: null, needs_verification: true, rule_id: id };
  }
  function derive(A) {
    const D = {}, prof = cp(A.m0_residence_country || "UZ");
    if (A.m0_dob) D.age = Math.floor((TODAY - new Date(A.m0_dob)) / 31557600000);
    const g = parseInt(A.m1_grade, 10), fin = parseInt(prof.final_grade, 10) || (["UZ", "KZ", "KG", "TJ", "TM", "AZ", "RU"].includes(A.m0_residence_country) ? 11 : 12);
    if (A.m1_status === "in_school" && g) {
      D.years_left = fin - g;
      const startNext = TODAY.getMonth() + 1 >= (prof.school_year_start_month || 9) ? 1 : 0;
      D.graduation_date = A.m1_graduation_override || `${TODAY.getFullYear() + startNext + D.years_left}-06-30`;
    }
    const dest = A.m2_destinations || [];
    D.rules_set = [...new Set(dest.map(d => d === "own_country" ? `${A.m0_residence_country || "UZ"}_HOME` : RULES_OF[d] || d).filter(d => d !== "dont_know_yet"))];
    D.requires_english = D.rules_set.some(id => ((rule(id) || {}).requirements || {}).language && rule(id).requirements.language.some(l => l.language === "en"));
    D.english_tested = A.m4_english_screener && A.m4_english_screener.level;
    D.math_tested = A.m3_math_test && A.m3_math_test.rung;
    if (D.graduation_date) {
      const gy = +D.graduation_date.slice(0, 4), dls = D.rules_set.map(id => firstDeadline(id, gy)).filter(d => d.date);
      if (dls.length) { const first = dls.sort((a, b) => a.date.localeCompare(b.date))[0]; D.first_deadline = first; D.months_to_first_deadline = monthsBetween(TODAY, new Date(first.date)); }
    }
    if (["finished_school_gap_year", "in_university"].includes(A.m1_status)) D.stage = "S4";
    else if (D.months_to_first_deadline != null && D.months_to_first_deadline <= 14) D.stage = "S3";
    else if ((D.age != null && D.age <= 13) || (D.years_left != null && D.years_left >= 5)) D.stage = "S1";
    else D.stage = "S2";
    return D;
  }
  const visible = (q, A, D) => !q.retired && q.audience !== "system" && !(q.live && !window.JG_ENGINE) && q.stages.includes(D.stage || "S2") && (!q.branch || branch(q.branch, A, D));   /* JG-PROD: owner 4 Oct P4g S1 (S1 S2), a retired question is never asked (src/engine/branch.ts) */ /* JG-PROD: owner 7 Oct P5d review R1, a live-only question (the spec §3.3 fields) is asked of a live student only: the demo and /preview ask what they asked */

  /* ---------- MOCK BACKEND: same shapes as 04_ENGINE_SPEC §2, replace with real calls ---------- */
  const GAP = SEED.language_gap_months_heuristic || {};
  function gapMonths(from, to) {
    let m = 0; for (let i = Math.max(0, CEFR.indexOf(from)); i < CEFR.indexOf(to); i++) m += +GAP[`${CEFR[i]}->${CEFR[i + 1]}`] || 0; return m;
  }
  const JG_API = {
    scorecard(A, D) {
      const ax = {}, set = (k, rag, s, ev) => { ax[k] = { rag, score: { green: 3, yellow: 2, red: 1 }[rag], gap_sentence_i18n: s, evidence: ev || [] }; };
      const AV = avgOf(A), avg = AV ? AV.five : NaN, rung = RUNGS.indexOf(D.math_tested || A.m3_math_level_self), eng = D.english_tested || (A.m4_english_self || "A0").replace("_none", "");   /* JG-PROD: owner 3 Oct R1, the thresholds read the 5-point view */
      const need = D.requires_english ? "B2" : null, gm = need ? gapMonths(eng, need) : 0, grade = parseInt(A.m1_grade, 10) || 9;
      set("academics", avg >= 4.5 ? "green" : avg >= 3.8 ? "yellow" : "red", isNaN(avg) ? "Add your average so we can compare it with your targets." : `Average ${AV.value} of ${AV.of}: ${avg >= 4.5 ? "strong for your targets" : "raise it this year; universities look at the trend"}.`, ["m3_average"]);   /* JG-PROD: owner 3 Oct R1, the student's own scale */
      const expect = Math.max(0, Math.min(7, grade - 6));
      set("math", rung >= expect ? "green" : rung >= expect - 1 ? "yellow" : "red", `Math check: ${label("", RUNGS[Math.max(0, rung)])}${D.math_tested ? " (tested)" : " (self-rated)"}.`, ["m3_math_test"]);
      set("language", !need || CEFR.indexOf(eng) >= CEFR.indexOf(need) ? "green" : gm <= 6 ? "yellow" : "red",
        need ? (CEFR.indexOf(eng) >= CEFR.indexOf(need) ? `English ${eng}: meets the ${need} your destinations need.` : `English ${eng} now, ${need} needed: about ${gm} months at 5–7 hours a week (an estimate, not a promise).`) : "No English requirement for your destinations; English is a bonus track.", ["m4_english_screener"]);
      const req = A.m5_required_tests || {}, st = Object.values(req);
      set("tests", st.length && st.every(s => s === "done") ? "green" : st.some(s => s === "preparing" || s === "booked") ? "yellow" : "red", st.length ? `${st.filter(s => s === "not_started").length} of ${st.length} required tests not started yet.` : "We'll list the tests your destinations require.", ["m5_required_tests"]);
      const acts = (A.m6_activities || []).length;
      set("activities", acts >= 3 ? "green" : acts >= 1 ? "yellow" : "red", acts ? `${acts} ${acts === 1 ? "activity" : "activities"} so far; depth and your own initiative matter most.` : "No activities yet: this is where your story starts.", ["m6_activities"]);
      set("narrative", "yellow", "We'll read your writing sample in week 1.", []);
      const aid = A.m7_aid_need, bud = +(A.m7_annual_budget && A.m7_annual_budget.usd) || 0;
      set("money", aid === "none" ? "green" : aid === "partial" ? "yellow" : "red", aid === "full" ? `Full aid needed with a budget of $${bud.toLocaleString("en-US")}: only a few universities meet full need for international students.` : aid === "partial" ? "Partial aid: we'll look for merit money and lower-cost options." : "Budget covers the costs; the work is rigor and fit.", ["m7_aid_need", "m7_annual_budget"]);
      const at = A.m8_parent_attitude;
      set("family", at === "fully_supportive" ? "green" : ["hesitant", "against"].includes(at) ? "red" : "yellow", at === "conditional" ? "Parents are supportive with conditions: a parent check will align you." : at === "fully_supportive" ? "Family is behind you." : "Your family isn't on board yet: we'll start with a parent conversation.", ["m8_parent_attitude"]);
      set("logistics", "yellow", "Passport, visas and documents come in your week-1 tasks.", []);
      const h = +A.m9_hours_per_week || 0;
      set("capacity", h >= 12 ? "green" : h >= 8 ? "yellow" : "red", `${h} hours a week${h < 12 ? ": we'll plan tightly and protect your rest days" : ": enough for a full plan"}.`, ["m9_hours_per_week"]);
      return { axes: ax, computed_at: new Date().toISOString() };
    },
    flags(A, D) {                                                            // consistency_checks that matter on the first screen
      const out = [], self = (A.m4_english_self || "").replace("_none", ""), t = D.english_tested;
      if (self && t && Math.abs(CEFR.indexOf(self) - CEFR.indexOf(t)) >= 2) out.push({ id: "c_english_gap", text: `You rated your English ${self}; the check shows ${t}. We'll plan with ${t}. Guessing wrong is completely normal.` });
      const ms = A.m3_math_level_self, mt = D.math_tested;
      if (ms && mt && Math.abs(RUNGS.indexOf(ms) - RUNGS.indexOf(mt)) >= 2) out.push({ id: "c_math_gap", text: `You said ${label("", ms)}; the check placed you at ${label("", mt)}. We'll use the check.` });
      return out;
    },
    feasibility(A, D) {
      const eng = D.english_tested || "A0", rows = [], aid = A.m7_aid_need, bud = +(A.m7_annual_budget && A.m7_annual_budget.usd) || 0;
      const row = (dest, name, logic, blockers, lg, cost, dl, extra) => rows.push(Object.assign({ destination: dest, name, admission_logic: logic, blockers, language_gap_months: lg, cost_band: cost,
        feasibility: blockers.includes("deadline_passed") ? "blocked" : blockers.length >= 2 ? "low" : blockers.length === 1 ? "medium" : "high", next_hard_deadline: dl, source_rule_ids: dl && dl.rule_id ? [dl.rule_id] : [] }, extra || {}));
      const gy = D.graduation_date ? +D.graduation_date.slice(0, 4) : TODAY.getFullYear() + 2;
      for (const id of D.rules_set) {
        const r = rule(id); if (!r) continue;
        const langReq = ((r.requirements || {}).language || []).find(l => l.language === "en" || l.language === "de" || l.language === "uz_or_ru");
        const b = [];
        if (aid === "full" && bud < 5000 && id !== "UZ_HOME" && id !== "DE") b.push("money");
        if (langReq && langReq.language === "en" && CEFR.indexOf(eng) < CEFR.indexOf(langReq.min_level)) b.push("language");
        if (id === "US" && !Object.values(A.m5_required_tests || {}).some(s => s !== "not_started")) b.push("tests");
        row(id, { US: "United States", UK: "United Kingdom", DE: "Germany", UZ_HOME: "Uzbekistan (home)" }[id] || id, r.admission_logic, b,
          langReq && langReq.language === "en" ? gapMonths(eng, langReq.min_level) : 0, (r.costs || {}).tuition_band_usd || "", firstDeadline(id, gy), { chosen: true });
      }
      const suggest = [];                                                   // up to 5 parallel destinations by language and budget fit
      if (!D.rules_set.includes("UZ_HOME") && (A.m0_residence_country || "UZ") === "UZ") suggest.push({ destination: "UZ_HOME", name: "Uzbekistan (home)", admission_logic: "exam_driven", blockers: [], language_gap_months: 0, cost_band: "grant (free) or contract", feasibility: "high", next_hard_deadline: firstDeadline("UZ_HOME", gy), source_rule_ids: ["UZ_HOME"], note: "DTM is your spine; native language" });
      const sch = id => SEED.scholarship_programs.find(s => s.id === id) || {};
      suggest.push({ destination: "KR", name: "South Korea", admission_logic: "hybrid", blockers: [], language_gap_months: gapMonths(eng, "B2"), cost_band: "full scholarship (GKS)", feasibility: "medium", next_hard_deadline: { name: "GKS application window", date: null, needs_verification: true }, source_rule_ids: [], note: `GKS scholarship · age cap ${sch("GKS").age_cap || "verify"}`, needs_verification: true });
      suggest.push({ destination: "TR", name: "Türkiye", admission_logic: "hybrid", blockers: [], language_gap_months: 0, cost_band: "full scholarship (Türkiye Bursları)", feasibility: "medium", next_hard_deadline: { name: "Türkiye Bursları window", date: null, needs_verification: true }, source_rule_ids: [], note: `Türkiye Bursları · age cap ${sch("TURKIYE_BURSLARI").age_cap || "verify"} · Turkish taught in a prep year`, needs_verification: true });
      if (!D.rules_set.includes("DE")) suggest.push({ destination: "DE", name: "Germany", admission_logic: "exam_driven", blockers: [], language_gap_months: gapMonths(eng, "B2"), cost_band: "tuition mostly free", feasibility: "medium", next_hard_deadline: firstDeadline("DE", gy), source_rule_ids: ["DE"], note: "May need Studienkolleg first (verify)", needs_verification: true });
      const chosen = rows.filter(r => r.chosen), worst = chosen.length && chosen.every(r => r.feasibility === "low" || r.feasibility === "blocked");
      const reality_gap = !chosen.length ? 1 : worst ? (chosen.some(r => r.blockers.includes("money")) ? 3 : 2) : chosen.some(r => r.feasibility === "low") ? 1 : 0;
      return { rows, suggestions: suggest.slice(0, 5), reality_gap };
    },
    archetype(sc, A) {
      const g = k => sc.axes[k].rag;
      if ((A.m2_destinations || []).length === 1 && A.m2_destinations[0] === "own_country") return "E";
      if (A.m7_aid_need === "none") return "D";
      if (g("academics") === "green" && g("math") === "green" && g("money") === "red") return g("language") === "red" ? "A/C" : "A";
      if (g("language") === "green" && g("money") !== "red") return "B";
      return "C";
    },
    firstTasks(A, D) {                                                      // code-generated week-1 openers; the LLM writes the rest inside these limits
      const day = i => { const d = new Date(TODAY); d.setDate(d.getDate() + i); return d.toISOString().slice(0, 10); };
      const phone = (A.m9_devices || []).includes("phone_only"), out = [];
      if (D.requires_english && CEFR.indexOf(D.english_tested || "A0") < CEFR.indexOf("B1"))
        out.push({ id: "t1", date: day(0), type: "practice", title_i18n: "English: 15 minutes of everyday words", instructions_i18n: `Open Video Lessons → English ${D.english_tested || "A1"}, lesson 1${phone ? " (works on your phone)" : ""}. Then take the 5-word quiz.`, est_minutes: 15, verification: "quiz", coins: 10, generated_by: "code" });
      if ((A.m3_olympiads || []).length || (D.math_tested && RUNGS.indexOf(D.math_tested) >= 4))
        out.push({ id: "t2", date: day(1), type: "verify", title_i18n: "Find the regional math olympiad date", instructions_i18n: "Open Explore → Olympiads, find your region's round, and paste the official link. We mark the date as confirmed once it's checked.", est_minutes: 10, verification: "link", coins: 15, generated_by: "code" });
      if (!(S.parent && S.parent.done)) out.push({ id: "t3", date: day(1), type: "contact", title_i18n: "Send the parent check", instructions_i18n: "Share the link with a parent. It takes them 3 minutes and unlocks your full roadmap.", est_minutes: 5, verification: "auto_event", coins: 20, generated_by: "code" });
      if (out.length < 3) out.push({ id: "t4", date: day(2), type: "reflect", title_i18n: "Write 5 sentences: why this goal?", instructions_i18n: "Any language. We use it to shape your tasks, not to grade you.", est_minutes: 10, verification: "self_report", coins: 10, generated_by: "code" });
      return out.slice(0, 3);
    },
  };
  /* ================= the screens ================= */
  const $ = id => document.getElementById(id);
  const esc = t => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const KEY = "jg.diag.v1";
  let S = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } })() || { answers: {}, at: null, done: false };
  let A = S.answers, D = derive(A), draft = null, sub = null;                // sub = a mini-test or result screen
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }; const T = (s, p) => { const W = window.JG_DIAG; let t = W && W.word ? W.word(A && A.m0_roadmap_language, s) : s; if (p) t = String(t).replace(/\{(\w+)\}/g, (m, k) => (Object.prototype.hasOwnProperty.call(p, k) ? p[k] : m)); return t; }, LD = (iso, o) => { const W = window.JG_DIAG, l = A && A.m0_roadmap_language; return W && W.date && l && l !== "en" ? W.date(l, iso, o) : new Date(iso).toLocaleDateString("en-US", o); };   const rmL = () => { const c = window.JG_ENGINE && window.JG_ENGINE.cache; return (c && c.unis_uz && c.unis_uz.lang) || (A && A.m0_roadmap_language) || "en"; }, RT = (s, p) => { const W = window.JG_DIAG; let t = W && W.word ? W.word(rmL(), s) : s; if (p) t = String(t).replace(/\{(\w+)\}/g, (m, k) => (Object.prototype.hasOwnProperty.call(p, k) ? p[k] : m)); return t; }, rmDate = (s, o) => { const W = window.JG_DIAG, l = rmL(); return W && W.date && l !== "en" ? W.date(l, s, o) : new Date(s).toLocaleDateString("en-US", o); }, rmM = s => s ? rmDate(s, { month: "short", year: "numeric" }) : "", rmD = s => s ? rmDate(s, { day: "numeric", month: "short", year: "numeric" }) : RT("date being confirmed"); if (window.JG_ENGINE) window.JG_RMLANG = rmL;   /* JG-PROD: owner 4 Oct P4g S1 (L): T is the diagnostic's words in the language picked first (public/runtime/jg-diag.js, a live student's), English otherwise; LD its dates */ /* JG-PROD: owner 4 Oct P4g fix K2, RT is the roadmap's words in the roadmap's language (the engine's unis_uz.lang, else the language picked first; public/runtime/jg-diag.js), rmM and rmD its dates; English and the demo read exactly fmtM and fmtD; defined here, before Home first paints (a later line left it uninitialised then) */   /* JG-PROD: owner 4 Oct P4g fix K2 review, rmL is the one resolver of the roadmap's language: Jamol's greeting and fallback read it too (public/runtime/jg-jamol.js), so before a result (no unis_uz) he no longer greets in the AI layer's English while the roadmap reads Uzbek */
  const MOD_LINES = { M0: "First, a few basics about you.", M1: "Now, where you are in school.", M2: "The fun part: where you want to go.", M3: "Your studies. Honest answers make a better plan.",
    M4: "Languages next.", M5: window.JG_ENGINE ? "Your test scores so far." : "Tests your destinations ask for.", M6: "What you do outside class.", M7: "Money: a parent can help with this one.", M8: "Your family's view.",   /* JG-PROD: owner 4 Oct P4g fix K10, a live student's M5 asks every test with its score (owner 4 Oct P4g T), so its line says so; the demo keeps the design's */
    M9: "Last: how you work best.", M10: "Documents and logistics.", M11: "A few questions for your stage." };
  const mascot = (k, cls) => (window.JIA_MIMG ? window.JIA_MIMG("jamol", k, cls) : "");

  const view = document.createElement("div");
  view.className = "dg-view"; view.id = "dg-view"; view.hidden = true;
  view.setAttribute("role", "dialog"); view.setAttribute("aria-modal", "true"); view.setAttribute("aria-label", "Build my roadmap");
  (($("pr-view") || {}).parentElement || document.body).appendChild(view);

  function flow() {
    const out = [];
    { const c = window.JG_PHASED && (S.deep ? window.JG_PHASED.flow(S.deep, QB, q => visible(q, A, window.JG_PHASED.derived(D))) : window.JG_PHASED.first && window.JG_PHASED.first(QB, q => visible(q, A, D))); if (c) return c; } for (const m of QB.modules) for (const q of m.questions) if ((S.deep ? m.id === S.deep && !q.core : q.core) && visible(q, A, D) && !(q.id === "m0_roadmap_language" && window.JG_ENGINE)) out.push({ q, m });   /* JG-PROD: owner 4 Oct P4g S1 (L): a live student picks the language on the first screen, not as a question */   /* JG-PROD: owner 7 Oct P5e (spec §4.2 item 3), a Phase D chunk asks the question ids the server chose for it (window.JG_PHASED, public/runtime/jg-phased.js) */   /* JG-PROD: owner 7 Oct P5e review 5, a chunk's question that an earlier answer in it hid is not asked (the server stores it "skipped") */   /* JG-PROD: owner 7 Oct P5 fix (spec §4.2 item 3; the wave-2 walk), a chunk asks exactly its own questions, in the server's order, each visible by the server's stage (JG_PHASED.flow, .derived): it began at its first id wherever the design's bank kept it, and the page's own stage dropped S3/S4-only questions */   /* JG-PROD: owner 11 Oct 2026 (his ruling, the diagnostic as daily tasks), with Phase D on a student's first run asks only what Home cannot be drawn without (JG_PHASED.first: at school, class, where); the rest of the old first run comes in the daily questions and the checks as tasks */
    return out;
  }
  function open() { view.style.zIndex = String(window.JIA_z ? window.JIA_z() : 70); view.hidden = false; if (S.deep) render(); else if (S.done && S.result) results(); else if (!S.at || (window.JG_ENGINE && !S.deep && !A.m0_roadmap_language)) intro(); else render(); }   /* JG-PROD: owner 4 Oct P4g S1 (L): no language yet, the first screen asks it */
  function close() { stopTick(); view.hidden = true; save(); paintHome(); }   /* JG-PROD: owner 3 Oct R3, a closed check stops its timer */
  window.JG_openDiagnostic = open;

  /* ---------- start ---------- */
  function intro() {
    sub = "intro"; const live = !!window.JG_ENGINE, lg = A.m0_roadmap_language, ask = live && !["en", "uz", "ru"].includes(lg);   /* JG-PROD: owner 4 Oct P4g S1 (L): the first screen asks the language of the questions */
    view.innerHTML = `<div class="dg-top"><span></span><button class="dg-x" type="button" data-act="close" aria-label="${T("Close")}">×</button></div>${"" /* JG-PROD: owner 4 Oct P4g S1 (L) */}
      <div class="dg-intro">
        <div class="dg-hero">${mascot("welcome", "dg-hero-img")}</div>
        ${ask ? `<h2 id="dg-lq">Savollar qaysi tilda boʻlsin?<br>На каком языке задавать вопросы?<br>Which language should the questions be in?</h2>` : `<h2>${T("Let's build your roadmap")}</h2>`}${live ? `<div class="${ask ? "dg-opts" : "dg-chips"}" role="${ask ? "radiogroup" : "group"}" aria-label="${ask ? "Til · Язык · Language" : T("Language of the questions")}">${[["uz", "Oʻzbekcha"], ["ru", "Русский"], ["en", "English"]].map(([v, n]) => `<button type="button"${ask ? ` role="radio" class="dg-opt" aria-checked="false"` : ` class="dg-chip" aria-pressed="${lg === v}"`} data-act="lang" data-v="${v}" lang="${v}"><span>${n}</span></button>`).join("")}</div>` : ""}${"" /* JG-PROD: owner 4 Oct P4g S1 (L) */}
        ${ask ? "" : `<p>${window.JG_ENGINE && window.JG_CHECKS && window.JG_CHECKS.capMinutes ? T(window.JG_PHASED && window.JG_PHASED.readingLater() ? "About {q} minutes of questions and up to 2 short checks: English (about {e} minutes) and math (up to {m} minutes). Then you'll see where you stand, and your plan to get where you want to go." : "About {q} minutes of questions and up to 3 short checks: English (about {e} minutes), math (up to {m} minutes) and reading (1 to 2 minutes). Then you'll see where you stand, and your plan to get where you want to go.", { q: 8, e: (QB.modules.flatMap(x => x.questions).find(x => x.id === "m4_english_screener") || { options: { minutes: 3 } }).options.minutes, m: window.JG_CHECKS.capMinutes.math }) : T("About 14 minutes in all: 8 minutes of questions and up to 3 short checks of 1 to 3 minutes each. Then you'll see where you stand, and your plan to get where you want to go.")}</p>`}<!-- JG-PROD: owner 3 Oct R13, a much shorter first run (27 questions for the owner's walk, 39 before); P4b final review I4: 8 minutes at the design's own rate (12 minutes for 39), and the reading check has no clock; the whole run for a strong S3 student is 27 questions + 17 English + 10 math + 6 reading = 60 screens (design-checks.test.ts); owner 4 Oct R3: the honest totals, with each check at its typical length (math 2 minutes, English about 3, reading 1 to 2: a 103-146 word passage and 5 questions), and up to 3 checks because English is asked only when a destination needs it; owner 4 Oct P4g S1 (L), in the language picked first --><!-- JG-PROD: owner 7 Oct P5 fix copy, a live student's intro states each check as its own card does (English about 3 minutes, the design's; math up to the CAT's 8-minute cap, public/runtime/jg-checks.js capMinutes), and 2 checks while Phase D takes the reading check to its days (JG_PHASED.readingLater), 3 without: the wave-2 walk read "1 to 3 minutes each" above a math card saying "up to 8 minutes" (its items' limits add up to 6.6-7.9 minutes); the demo keeps the design's words -->
        ${ask ? "" : `<ul class="dg-points"><li>${T("Honest answers make a better plan. There are no wrong ones.")}</li><li>${T("Tap Finish later anytime. We'll keep your place.")}</li><li>${T("Private questions are optional and never shown to anyone.")}</li></ul>`}<!-- JG-PROD: owner 3 Oct R13, the way to leave and come back, named; owner 4 Oct P4g S1 (L) -->
      </div>
      <div class="dg-foot"><button class="dg-go" type="button" data-act="start"${ask ? " disabled" : ""}>${T("Start")}</button><button class="dg-link jg-demo" type="button" data-act="demo">Demo: fill in as Aziz (persona P1)</button></div>`;   /* JG-PROD: owner 4 Oct P4g S1 (L): Start waits for the language */ /* JG-PROD: S5, the demo persona link stays out of the real app (html:not(.demo-tools) .jg-demo) */
  }

  /* ---------- one question ---------- */
  function render() {
    sub = null; D = derive(A);
    const F = flow(); let i = F.findIndex(x => x.q.id === S.at);
    if (i < 0) { i = F.findIndex(x => A[x.q.id] === undefined); if (i < 0) i = F.length - 1; S.at = F[i].q.id; }   // the question left the flow: go to the first open one
    const { q, m } = F[i], kid = D.stage === "S1" && q.kid_text_en, firstOfModule = i === 0 || F[i - 1].m.id !== m.id; if (window.JG_ENGINE && window.JG_ENGINE.listen) window.JG_ENGINE.listen(F.map(x => x.m.id), i, A, !!S.deep);   /* JG-PROD: P4a E2, ask for Jamol's next line while the student answers (spec §5.5) */
    const inMod = F.filter(x => x.m.id === m.id), n = inMod.findIndex(x => x.q.id === q.id) + 1;
    draft = A[q.id] !== undefined ? JSON.parse(JSON.stringify(A[q.id])) : undefined;
    const title = T(kid || (window.JG_ENGINE && q.id === "m3_math_test" ? "Adaptive math check" : q.text_en)).replace("{derived.graduation_date}", D.graduation_date ? LD(D.graduation_date, { month: "long", year: "numeric" }) : T("June"));   /* JG-PROD: owner 4 Oct P4g S1 (L); the review of 7 Oct (owner 4 Oct R3): a live student's math check is the CAT, up to 8 minutes, so its heading drops the design's "2-minute" (the demo keeps it) */
    const mods = [...new Set(F.map(x => x.m.id))];
    view.innerHTML = `<div class="dg-top">
        <button class="dg-back" type="button" data-act="back" aria-label="${T("Back")}"${i === 0 ? " disabled" : ""}>‹</button>${"" /* JG-PROD: owner 4 Oct P4g S1 (L) */}
        <div class="dg-prog" aria-label="${T("Question {n} of {m}", { n: i + 1, m: F.length })}">${mods.map(id => { const qs = F.filter(x => x.m.id === id), done = qs.filter(x => F.indexOf(x) < i).length; return `<i style="flex:${qs.length}"><b style="width:${Math.round(done / qs.length * 100)}%"></b></i>`; }).join("")}</div>${"" /* JG-PROD: owner 4 Oct P4g S1 (L) */}
        <button class="dg-x" type="button" data-act="close" aria-label="${T("Save and close")}">×</button></div>${"" /* JG-PROD: owner 4 Oct P4g S1 (L) */}
      <div class="dg-body">
        <p class="dg-mod">${esc(T(m.name))} · ${esc(T("Question {n}", { n }))}</p>${"" /* JG-PROD: owner 4 Oct P4g S1 (L); JG-PROD: owner 10 Oct (delegated call, teen walk), the question's number in its section with no total: the total changed under the student (1 / 1, then 2 / 3) as her answers opened more questions */}
        ${firstOfModule ? `<div class="dg-say">${mascot(kid ? "delighted" : "point", "dg-say-img")}<p>${esc(T(/* JG-PROD: P4a E1, Jamol reacts in the design's own bubble; a Deep opener keeps MOD_LINES (spec §5.5) */ (window.JG_ENGINE && window.JG_ENGINE.say && window.JG_ENGINE.say(m.id, !!S.deep)) || MOD_LINES[m.id] || ""))}</p></div>` : ""}${"" /* JG-PROD: owner 4 Oct P4g S1 (L) */}
        <h2 class="dg-q" id="dg-q">${esc(title)}</h2>
        ${q.sensitive ? `<p class="dg-private">🔒 ${T("Optional and private. Never shown to anyone or used to rank you.")}</p>` : ""}${q.why_en /* JG-PROD: owner 3 Oct R9 R10, the "why we ask" line in the design's own note box */ ? `<p class="dg-private">💡 ${esc(T(q.why_en))}</p>` : ""}${"" /* JG-PROD: owner 4 Oct P4g S1 (L) */}
        ${q.audience === "parent" ? `<p class="dg-parent">👪 ${T("This one is for a parent. Answer it together, or send it to them.")}</p>${(f => f ? `<div class="jd-share"><code>${esc(f.url)}</code><button class="dg-go" type="button" data-act="ptg">${esc(f.telegram)}</button><button class="dg-link" type="button" data-act="pcopy">${esc(f.copy)}</button></div>` : "")(window.JG_ENGINE && window.JG_RUNTIME && window.JG_RUNTIME.familyShare && window.JG_RUNTIME.familyShare(A.m0_roadmap_language))}` : ""}${"" /* JG-PROD: owner 4 Oct R8, "send it to them" sends the real parent link (Telegram or copy) for a real student; the demo keeps the note as drawn; owner 4 Oct P4g S1 (L), in the language picked first */}
        <div class="dg-in" id="dg-in"></div>
      </div>
      <div class="dg-foot">
        <button class="dg-go" type="button" data-act="next" id="dg-next">${T("Continue")}</button>${"" /* JG-PROD: owner 4 Oct P4g S1 (L) */}
        ${!q.core || q.sensitive ? `<button class="dg-link" type="button" data-act="skip">${T("Skip for now")}</button>` : q.audience === "parent" ? `<button class="dg-link" type="button" data-act="parent">${T("Send it to my parent instead")}</button>` : ""}<button class="dg-link" type="button" data-act="close">${T("Finish later")}</button>${"" /* JG-PROD: owner 3 Oct R13, a visible way to leave and come back where you were (it saves and closes, as × does); owner 4 Oct P4g S1 (L), in the language picked first */}
      </div>`;
    input(q, $("dg-in")); sync(q);
  }
  const has = v => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && !v.length) && !(typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length);
  function sync(q) { const b = $("dg-next"); if (b) b.disabled = !valid(q); }
  function valid(q) {
    if (q.type === "confirm_date") return draft === "yes" || (draft && draft.month);
    if (q.type === "select_per_item") return (A.m2_dream_unis || []).every(u => draft && draft[u.university_id]); if (q.type === "repeatable_autocomplete" && D.stage === "S1") return Array.isArray(draft);   /* JG-PROD: owner 4 Oct P4g S1 (U), every stage is asked its universities; an S1 student may continue with none */
    if (q.type === "number_currency") return draft && draft.amount !== "" && draft.amount != null;
    if (q.type === "test") return !!(draft && (draft.level || draft.rung) && !draft.partial);   /* JG-PROD: owner 3 Oct R4 R5, P4b final review I1: a check left partway is finished before the next question */
    if (q.type === "checklist") return !!(valid2 && valid2());
    if (q.type === "repeatable" || q.type === "table") return Array.isArray(draft);        // an empty list is an answer: "none yet"
    return has(draft);
  }
  function answer(q, v) { A[q.id] = v; S.answers = A; save(); }
  function next(skip) {
    const F = flow(), i = F.findIndex(x => x.q.id === S.at), q = F[i].q;
    answer(q, skip ? "skipped" : draft);
    D = derive(A);
    const F2 = flow(), j = F2.findIndex(x => x.q.id === q.id);
    if (j < F2.length - 1) { S.at = F2[j + 1].q.id; save(); render(); } else { const u = S.deep && window.JG_PHASED && window.JG_PHASED.unanswered(S.deep, F2, A); if (u) { S.at = u.q.id; save(); render(); return; } save(); if (S.deep) deepDone(); else readingCheck(); }   /* JG-PROD: owner 7 Oct P5 fix (spec §4.2 items 3, 8), a chunk ends only when each of its questions is answered or skipped: one still open is asked first */
  }
  function back() { const F = flow(), i = F.findIndex(x => x.q.id === S.at); if (i > 0) { S.at = F[i - 1].q.id; save(); render(); } }

  /* ---------- inputs, one per answer type ---------- */
  function input(q, el) {
    const set = v => { draft = v; sync(q); };
    const opts = () => options(q, A, D);
    const t = q.type;
    if (t === "select" || t === "scale_1_5") {
      const list = t === "scale_1_5" ? [1, 2, 3, 4, 5].map(v => ({ value: v, label: T(["Not at all", "Probably not", "Maybe", "Probably", "Definitely"][v - 1]) })) : opts();   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      if (!list.length) { console.warn("JG: no options for", q.id); el.innerHTML = `<input class="dg-field" type="text" value="${esc(draft || "")}" placeholder="${T("Type your answer")}" aria-labelledby="dg-q">`; el.querySelector("input").addEventListener("input", e => set(e.target.value.trim())); return; }   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      const long = list.length > 9;
      el.innerHTML = `${long ? `<input class="dg-search" type="search" placeholder="${T("Search")}" aria-label="${T("Search options")}">` : ""}<div class="dg-opts${t === "scale_1_5" ? " scale" : ""}" role="radiogroup" aria-labelledby="dg-q">${list.map(o => `<button type="button" role="radio" class="dg-opt" data-v="${esc(o.value)}" aria-checked="${String(draft) === String(o.value)}">${o.flag ? `<span class="dg-flag">${o.flag}</span>` : ""}${t === "scale_1_5" ? `<b>${o.value}</b>` : ""}<span>${esc(o.label)}</span></button>`).join("")}</div>`;   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      el.addEventListener("click", e => { const b = e.target.closest(".dg-opt"); if (!b) return; el.querySelectorAll(".dg-opt").forEach(x => x.setAttribute("aria-checked", String(x === b))); set(t === "scale_1_5" ? +b.dataset.v : b.dataset.v); });
      if (long) filterable(el);
      return;
    }
    if (t === "multi" || t === "multi_plus_hours") {
      const list = opts(), cur = t === "multi" ? (draft || []) : Object.keys(draft || {});
      if (!list.length) { console.warn("JG: no options for", q.id); el.innerHTML = `<input class="dg-field" type="text" value="${esc(Array.isArray(draft) ? draft.join(", ") : "")}" placeholder="${T((window.JG_ENGINE && window.JG_DIAG && window.JG_DIAG.hint && window.JG_DIAG.hint(q.id)) || "Type your answer")}" aria-labelledby="dg-q">`; el.querySelector("input").addEventListener("input", e => set(e.target.value.split(",").map(x => x.trim()).filter(Boolean))); return; }   /* JG-PROD: owner 4 Oct P4g S1 (L) */ /* JG-PROD: owner 10 Oct (delegated call, teen walk), a question with no list to pick from (the strongest, weakest and favourite subjects) says what to write in its box (public/runtime/jg-diag.js hint) */
      el.innerHTML = `${list.length > 12 ? `<input class="dg-search" type="search" placeholder="${T("Search")}" aria-label="${T("Search options")}">` : ""}<div class="dg-chips" role="group" aria-labelledby="dg-q">${list.map(o => `<button type="button" class="dg-chip" data-v="${esc(o.value)}" aria-pressed="${cur.includes(o.value)}">${o.flag ? `${o.flag} ` : ""}${esc(o.label)}</button>`).join("")}</div>${t === "multi_plus_hours" ? `<div class="dg-hours" id="dg-hours"></div>` : ""}`;   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      const hours = () => { const h = $("dg-hours"); if (!h) return; h.innerHTML = Object.keys(draft || {}).filter(k => k !== "none").map(k => `<label class="dg-hr">${esc(label(q.id, k))}<input type="number" min="0" max="60" inputmode="numeric" data-k="${esc(k)}" value="${draft[k] || ""}" placeholder="${T("h / week")}"></label>`).join(""); };   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      el.addEventListener("click", e => {
        const b = e.target.closest(".dg-chip"); if (!b) return;
        const on = b.getAttribute("aria-pressed") !== "true", v = b.dataset.v;
        if (t === "multi") { let a = (draft || []).filter(x => x !== v); if (on) a = v === "none" ? ["none"] : [...a.filter(x => x !== "none"), v]; el.querySelectorAll(".dg-chip").forEach(x => x.setAttribute("aria-pressed", String(a.includes(x.dataset.v)))); set(a); }
        else { const o = Object.assign({}, draft || {}); if (on) { if (v === "none") Object.keys(o).forEach(k => delete o[k]); else delete o.none; o[v] = o[v] || ""; } else delete o[v]; el.querySelectorAll(".dg-chip").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.v in o))); set(o); hours(); }
      });
      el.addEventListener("input", e => { const i = e.target.closest("[data-k]"); if (i) { draft[i.dataset.k] = i.value; sync(q); } });
      if (list.length > 12) filterable(el); hours(); return;
    }
    if (t === "date") { el.innerHTML = `<input class="dg-field" type="date" value="${esc(draft || "")}" max="${new Date().toISOString().slice(0, 10)}" aria-labelledby="dg-q">`; el.querySelector("input").addEventListener("input", e => set(e.target.value)); return; }
    if (t === "number" && q.id === "m3_average") { let sc = scaleOf(A); const paint = () => { const [, lo, hi, st] = SCALES[sc], v = draft != null && draft !== "" ? String(draft) : ""; el.innerHTML = `<div class="dg-chips" role="group" aria-label="${T("Grading scale")}">${Object.keys(SCALES).map(k => `<button type="button" class="dg-chip" data-sc="${k}" aria-pressed="${k === sc}">${T(SCALES[k][0])}</button>`).join("")}</div><div class="dg-range"><b class="dg-big" id="dg-rv">${v === "" ? "–" : esc(v)}</b><input type="range" min="${lo}" max="${hi}" step="${st}" value="${v === "" ? (lo + hi) / 2 : esc(v)}" aria-labelledby="dg-q"><div class="dg-ends"><span>${lo}</span><span>${hi}</span></div></div><p class="dg-hint">${T("Pick your school's scale, then slide to your average.")}</p>`; }; paint(); el.addEventListener("click", e => { const b = e.target.closest("[data-sc]"); if (!b || b.dataset.sc === sc) return; sc = A.m1_grading_scale = b.dataset.sc; draft = undefined; delete A.m3_average; paint(); sync(q); }); el.addEventListener("input", e => { if (e.target.type !== "range") return; A.m1_grading_scale = sc; $("dg-rv").textContent = e.target.value; set(e.target.value); }); return; }   /* JG-PROD: owner 3 Oct R1, the average on a scale the student picks, set on the design's own slider (.dg-chips, .dg-range, .dg-big); m1_grading_scale is written beside it, as confirm_date writes m1_graduation_override; a new scale drops the average kept on the old one (Task 10 review I1); an average kept with no scale opens on the scale its value can only be on (scaleOf, P4b final review I3); owner 4 Oct P4g S1 (L), in the language picked first */ if (t === "number") {
      el.innerHTML = `<div class="dg-num"><button type="button" data-d="-1" aria-label="${T("Less")}">−</button><input class="dg-field" type="number" inputmode="decimal" step="any" value="${esc(draft != null ? draft : "")}" aria-labelledby="dg-q"><button type="button" data-d="1" aria-label="${T("More")}">+</button></div>${q.id === "m3_average" ? `<p class="dg-hint">${T("In your school's scale, for example 4.8 out of 5.")}</p>` : q.id === "m9_hours_per_week" ? `<p class="dg-hint">${T("Be realistic. We plan around this and protect your rest days.")}</p>` : ""}`;   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      const i = el.querySelector("input"), st = q.id === "m3_average" ? .1 : 1;
      i.addEventListener("input", () => set(i.value));
      el.addEventListener("click", e => { const b = e.target.closest("[data-d]"); if (!b) return; i.value = Math.max(0, Math.round(((parseFloat(i.value) || 0) + st * b.dataset.d) * 10) / 10); set(i.value); });
      return;
    }
    if (t === "scale_1_10" || t === "slider") {
      const lr = t === "slider" ? [label(q.id, q.options.left), label(q.id, q.options.right)] : [T("Not sure at all"), T("Completely sure")], v = draft != null ? draft : t === "slider" ? 50 : 5;   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      el.innerHTML = `<div class="dg-range">${t === "scale_1_10" ? `<b class="dg-big" id="dg-rv">${v}</b>` : ""}<input type="range" min="${t === "slider" ? 0 : 1}" max="${t === "slider" ? 100 : 10}" value="${v}" aria-labelledby="dg-q"><div class="dg-ends"><span>${esc(lr[0])}</span><span>${esc(lr[1])}</span></div></div>`;
      const r = el.querySelector("input"); r.addEventListener("input", () => { if ($("dg-rv")) $("dg-rv").textContent = r.value; set(+r.value); }); if (draft == null) set(+r.value); return;
    }
    if (t === "confirm_date") {
      const g = D.graduation_date ? new Date(D.graduation_date) : null;
      el.innerHTML = `<div class="dg-opts" role="radiogroup" aria-labelledby="dg-q"><button type="button" role="radio" class="dg-opt" data-v="yes" aria-checked="${draft === "yes"}"><span>${T("Yes, that's right")}</span></button><button type="button" role="radio" class="dg-opt" data-v="change" aria-checked="${!!(draft && draft.month)}"><span>${T("No, it's different")}</span></button></div><div class="dg-when" id="dg-when" hidden><input class="dg-field" type="month" value="${g ? g.toISOString().slice(0, 7) : ""}" aria-label="${T("When you finish school")}"></div><p class="dg-hint">${T("Your whole application calendar is counted from this date, so we ask you to confirm it.")}</p>`;   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      el.addEventListener("click", e => { const b = e.target.closest(".dg-opt"); if (!b) return; el.querySelectorAll(".dg-opt").forEach(x => x.setAttribute("aria-checked", String(x === b))); $("dg-when").hidden = b.dataset.v !== "change"; set(b.dataset.v === "yes" ? "yes" : { month: $("dg-when").querySelector("input").value }); });
      el.querySelector("input").addEventListener("input", e => { A.m1_graduation_override = `${e.target.value}-30`; set({ month: e.target.value }); });
      return;
    }
    if (t === "repeatable_autocomplete") {
      const cur = draft || [];
      el.innerHTML = `<input class="dg-search" type="search" placeholder="${T("Search universities")}" aria-label="${T("Search universities")}"><p class="dg-hint">${T(D.stage === "S1" ? "Up to 5. Not sure yet? Continue, and add them later." : "Up to 5. You can change these anytime.")}</p><div class="dg-picked" id="dg-picked"></div><div class="dg-sug" id="dg-sug"></div>`;   /* JG-PROD: owner 4 Oct P4g S1 (L U); JG-PROD: owner 10 Oct (delegated call, teen walk), the hint stands under the search box: under the list it sat behind the Continue bar on a phone */
      const paint = () => {
        $("dg-picked").innerHTML = (draft || []).map(u => { const x = UNIS.find(z => z[0] === u.university_id) || [u.university_id, u.university_id, u.country]; return `<button type="button" class="dg-chip" aria-pressed="true" data-rm="${x[0]}">${flag(x[2])} ${esc(x[1])} ×</button>`; }).join("");
        const qv = el.querySelector(".dg-search").value.trim().toLowerCase();
        $("dg-sug").innerHTML = (window.JG_RUNTIME && window.JG_RUNTIME.uniFind ? window.JG_RUNTIME.uniFind(UNIS, qv) : UNIS.filter(x => !qv || x[1].toLowerCase().includes(qv))).filter(x => !(draft || []).some(u => u.university_id === x[0])).slice(0, 7).map(x => `<button type="button" class="dg-opt" data-add="${x[0]}"><span class="dg-flag">${flag(x[2])}</span><span>${esc(x[1])}</span></button>`).join("");   /* JG-PROD: owner 4 Oct R10, the search matches aliases (Toshkent, Ташкент, WIUT, Akfa), best match first (JG_RUNTIME.uniFind) */
      };
      el.addEventListener("click", e => {
        const a = e.target.closest("[data-add]"), r = e.target.closest("[data-rm]");
        if (a && (draft || []).length < 5) { const x = UNIS.find(z => z[0] === a.dataset.add); set([...(draft || []), { university_id: x[0], country: x[2] }]); }
        if (r) set((draft || []).filter(u => u.university_id !== r.dataset.rm));
        paint();
      });
      el.querySelector(".dg-search").addEventListener("input", paint); set(cur); paint(); return;
    }
    if (t === "select_per_item") {
      const unis = A.m2_dream_unis || []; draft = draft || {};
      el.innerHTML = unis.map(u => { const x = UNIS.find(z => z[0] === u.university_id) || [u.university_id, u.university_id, u.country]; return `<div class="dg-per"><p>${flag(x[2])} ${esc(x[1])}</p><div class="dg-chips" data-u="${x[0]}">${q.options.map(o => `<button type="button" class="dg-chip" data-v="${o}" aria-pressed="${draft[x[0]] === o}">${esc(label(q.id, o))}</button>`).join("")}</div></div>`; }).join("");
      el.addEventListener("click", e => { const b = e.target.closest(".dg-chip"); if (!b) return; const g = b.parentElement; g.querySelectorAll(".dg-chip").forEach(x => x.setAttribute("aria-pressed", String(x === b))); set(Object.assign({}, draft, { [g.dataset.u]: b.dataset.v })); });
      return;
    }
    if (t === "upload") {
      el.innerHTML = `<label class="dg-drop"><input type="file" accept="image/*,application/pdf" multiple><span class="dg-drop-i">📷</span><b>${T("Take a photo or choose files")}</b><small>${T("We read the grades for you. The photo is deleted after checking.")}</small></label><p class="dg-files" id="dg-files">${draft && draft.files ? T("{n} file(s) added", { n: draft.files.length }) : ""}</p><button class="dg-link" type="button" data-none>${T("I don't have them right now")}</button>`;   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      el.querySelector("input").addEventListener("change", e => { const f = [...e.target.files].map(x => x.name); $("dg-files").textContent = T("{n} file(s) added: {list}", { n: f.length, list: f.join(", ") }); set({ files: f, status: "ocr_pending" }); });   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      el.querySelector("[data-none]").addEventListener("click", () => { draft = "skipped"; next(true); });
      return;
    }
    if (q.id === "m2_uz_programmes" && window.JG_ENGINE && window.JG_UNIS && window.JG_UNIS.programmes) return window.JG_UNIS.programmes(el, draft, set, T, esc);   /* JG-PROD: owner 7 Oct P5d review R1, the Uzbek programme x language is picked from the Agency's list (public/runtime/jg-unis.js), never typed */ if (q.id === "m5_tests_taken" && window.JG_ENGINE && window.JG_DIAG && window.JG_DIAG.tests) return window.JG_DIAG.tests(el, draft, set, T, esc);   /* JG-PROD: owner 4 Oct P4g S1 (T), a live student is asked SAT, IELTS, TOEFL, Duolingo, ACT and AP one by one (public/runtime/jg-diag.js) */ if (q.id === "m6_activities" && window.JG_ENGINE && window.JG_DIAG && window.JG_DIAG.activities) return window.JG_DIAG.activities(el, draft, set, T, esc);   /* JG-PROD: owner 10 Oct (delegated call, teen walk), a live student adds an activity in two boxes (what it is, hours a week); the other six sit under "add more details" and are saved as before (public/runtime/jg-diag.js) */ if (t === "table" || t === "repeatable") {
      const fields = t === "table" ? q.options.columns : (q.options && q.options.fields) || ["name"];
      const spec = fields.map(f => { const m = String(f).match(/^(\w+)(?::\[(.*)\]|:(\w+))?$/); return m ? { k: m[1], list: m[2] ? m[2].split(",") : null, bool: m[3] === "bool", num: m[3] === "number" } : { k: String(f) }; });
      draft = Array.isArray(draft) ? draft : [];
      const paint = () => {
        el.innerHTML = `<div class="dg-rows">${draft.map((r, ri) => `<div class="dg-row">${spec.map(s => s.list ? `<label>${esc(fieldLabel(s.k))}<select data-r="${ri}" data-k="${s.k}"><option value="">${T("Choose")}</option>${s.list.map(o => `<option value="${o}"${r[s.k] === o ? " selected" : ""}>${esc(label(q.id, o))}</option>`).join("")}</select></label>` : s.bool ? `<label class="dg-bool"><input type="checkbox" data-r="${ri}" data-k="${s.k}"${r[s.k] ? " checked" : ""}> ${esc(fieldLabel(s.k))}</label>` : `<label>${esc(fieldLabel(s.k))}<input type="${s.num ? "number" : "text"}" data-r="${ri}" data-k="${s.k}" value="${esc(r[s.k] || "")}"></label>`).join("")}<button type="button" class="dg-rm" data-del="${ri}" aria-label="${T("Remove")}">×</button></div>`).join("")}</div>${"" /* JG-PROD: owner 4 Oct P4g S1 (L) */}
          <button type="button" class="dg-add" data-addrow>${T(draft.length ? "+ Add another" : "+ Add one")}</button>${!draft.length ? `<p class="dg-hint">${T("Nothing yet? That's fine: continue with an empty list.")}</p>` : ""}`;   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      };
      el.addEventListener("click", e => { if (e.target.closest("[data-addrow]")) { draft.push({}); paint(); sync(q); } const d = e.target.closest("[data-del]"); if (d) { draft.splice(+d.dataset.del, 1); paint(); sync(q); } });
      el.addEventListener("input", e => { const f = e.target.closest("[data-r]"); if (!f) return; draft[+f.dataset.r][f.dataset.k] = f.type === "checkbox" ? f.checked : f.value; sync(q); });
      paint(); return;
    }
    if (t === "checklist") {
      const tests = requiredTests(); draft = Object.assign(window.JG_ENGINE ? Object.fromEntries(tests.filter(x => x.id.toLowerCase().split("_or_").some(t => (Array.isArray(A.m5_tests_taken) ? A.m5_tests_taken : []).some(r => r && String(r.test).toLowerCase() === t))).map(x => [x.id, "done"])) : {}, draft || {});   /* JG-PROD: owner 4 Oct P4g S1 (T), a test the student just entered as taken reads "Done" here, not asked twice; an answer given stands; P4g fix K10, a tests answer that is no list ("skipped") is no tests, not a crash */
      el.innerHTML = tests.length ? tests.map(x => `<div class="dg-per"><p>${esc(T(x.name))}${x.verify ? ` <span class="dg-verify">${T("being confirmed")}</span>` : ""}</p><div class="dg-chips" data-t="${x.id}">${["not_started", "preparing", "booked", "done"].map(s => `<button type="button" class="dg-chip" data-v="${s}" aria-pressed="${(draft[x.id] || "") === s}">${esc(label("", s))}</button>`).join("")}</div></div>`).join("") : `<p class="dg-hint">${T("Your destinations don't list extra tests. Continue.")}</p>`;   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      if (!tests.length) set({ none: "done" });
      el.addEventListener("click", e => { const b = e.target.closest(".dg-chip"); if (!b) return; const g = b.parentElement; g.querySelectorAll(".dg-chip").forEach(x => x.setAttribute("aria-pressed", String(x === b))); const o = Object.assign({}, draft, { [g.dataset.t]: b.dataset.v }); draft = o; sync(q); });
      draft = Object.fromEntries(tests.map(x => [x.id, draft[x.id] || ""])); valid2 = () => tests.every(x => draft[x.id]);
      return;
    }
    if (t === "number_currency") {
      draft = draft || { amount: "", currency: "UZS" };
      el.innerHTML = `<div class="dg-money"><input class="dg-field" type="number" inputmode="numeric" min="0" placeholder="0" value="${esc(draft.amount)}" aria-labelledby="dg-q"><select aria-label="${T("Currency")}">${["UZS", "USD", "EUR", "RUB", "KZT"].map(c => `<option${draft.currency === c ? " selected" : ""}>${c}</option>`).join("")}</select></div><p class="dg-hint" id="dg-usd"></p>`;   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      const rate = { UZS: 1 / 12600, USD: 1, EUR: 1.08, RUB: 1 / 92, KZT: 1 / 480 };           // display only; the backend converts with live rates
      const upd = () => { const a = +el.querySelector("input").value || 0, c = el.querySelector("select").value; draft = { amount: el.querySelector("input").value, currency: c, usd: Math.round(a * rate[c]), confidence: "low" }; $("dg-usd").textContent = T("≈ ${usd} a year. A parent confirms this later.", { usd: draft.usd.toLocaleString("en-US") }); sync(q); };   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      el.addEventListener("input", upd); upd(); return;
    }
    if (t === "text_or_voice" || t === "text") {
      const max = (q.options && q.options.max_words) || 150;
      el.innerHTML = `<textarea class="dg-text" rows="5" placeholder="${T("Type in any language")}" aria-labelledby="dg-q">${esc(draft || "")}</textarea><div class="dg-textbar"><span id="dg-wc">${T("{n} / {max} words", { n: 0, max })}</span>${!window.JG_ENGINE && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) && t === "text_or_voice" ? `<button type="button" class="dg-mic" data-mic>🎙 ${T("Say it")}</button>` : ""}</div>`;   /* JG-PROD: owner 4 Oct P4g S1 (L) */   /* JG-PROD: owner 20 Oct 2026 (M1 core, C-21: a minor's voice goes to no third party), no "Say it" for a live student: the browser's speech recognition sends the recording to its vendor; she types */
      const ta = el.querySelector("textarea"), wc = () => { const n = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0; $("dg-wc").textContent = T("{n} / {max} words", { n, max }); set(ta.value.trim()); };   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      ta.addEventListener("input", wc); wc();
      const mic = el.querySelector("[data-mic]");
      if (mic) mic.addEventListener("click", () => { const R = window.SpeechRecognition || window.webkitSpeechRecognition, r = new R(); r.interimResults = false; r.onresult = ev => { ta.value = (ta.value + " " + ev.results[0][0].transcript).trim(); wc(); }; r.onend = () => mic.textContent = `🎙 ${T("Say it")}`; mic.textContent = T("Listening…"); r.start(); });   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      return;
    }
    if (t === "test") {
      const eng = q.options.engine, r = draft;
      el.innerHTML = `<div class="dg-testcard"><span class="dg-test-i">${eng === "math_ladder" ? "∑" : "Aa"}</span><div><b>${T(eng === "math_ladder" ? "Math check" : "English check")} · ${window.JG_ENGINE && eng === "math_ladder" && window.JG_CHECKS && window.JG_CHECKS.capMinutes ? T("up to {n} minutes", { n: window.JG_CHECKS.capMinutes.math }) : T("about {n} minutes", { n: q.options.minutes })}</b><p>${T(eng === "math_ladder" ? (window.JG_ENGINE ? "Type the number or pick the answer. Each question has its own time limit, shown at the top. It adapts to you; when you don't know one, tap “I don't know”." : "Mostly numbers and symbols, 10 to 15 seconds each. It gets harder until it's too hard, which is normal. When you don't know one, tap “I don't know”.") : (window.JG_ENGINE ? "It adapts to you: each answer sets the next question, and each question has its own time limit." : "It starts very easy and adapts to you, with a timer on each question. When a level is too hard, it stops."))} ${T("One attempt: start when you have a quiet moment, and finish in one go.")}</p></div></div>${"" /* JG-PROD: owner 3 Oct R3 R4 R5, timed, one attempt; P4b final review I2: "I don't know", never the stop control, for a question you don't know; owner 4 Oct P4g S1 (L): the instructions in the language picked first, the English check's items stay English; owner 7 Oct P5c, a live student's checks are adaptive (the CAT) with a time limit on each question shown at the top (decision 5), so the card says so; the demo keeps the design's words; the review of 7 Oct (owner 4 Oct R3): the math card states the CAT's time cap ("up to 8 minutes", public/runtime/jg-checks.js capMinutes), not "about 2", and the English card no longer says it stops once precise enough (it asks its 10 questions) */}
        ${r && r.partial ? `<p class="dg-result">${T("Paused partway. The question on screen when you left counts as “I don't know”.")}</p>` : "" /* JG-PROD: owner 3 Oct R4 R5, P4b final review I1: a check left partway resumes */}${r && (r.level || r.rung) && !r.partial ? (r.probs && window.JG_CHECKS && window.JG_CHECKS.line ? window.JG_CHECKS.line(r) : `<p class="dg-result">${T("Result:")} <b>${esc(r.level || label("", r.rung))}</b> · ${T("confidence {p}%", { p: Math.round((r.confidence || 0) * 100) })}</p>`) : ""}${"" /* JG-PROD: owner 4 Oct P4g S1 (L); owner 7 Oct P5c, a check the CAT placed reads "B1 · possibly B2 · provisional" with its IELTS estimate or SAT content line in the student's language (public/runtime/jg-checks.js line(), spec §2.6) instead of "confidence N%" */}
        ${r && (r.level || r.rung) && !r.partial ? "" : `<button class="dg-go ghost" type="button" data-test="${eng}">${T(r && r.partial ? "Continue the check" : "Start the check")}</button>`}${"" /* JG-PROD: owner 3 Oct R4 R5, one attempt: no retake button once a result exists; P4b final review I1: "Continue the check" for one left partway; owner 4 Oct P4g S1 (L) */}`;
      const tb = el.querySelector("[data-test]"); if (tb) tb.addEventListener("click", () => miniTest(eng, q));   /* JG-PROD: owner 3 Oct R4 R5, no button once a result exists */
      return;
    }
    if (t === "select_plus_date" || t === "select_plus_number" || t === "select_plus_text") {
      const kind = t.split("_").pop(), cur = draft && typeof draft === "object" ? draft : {}, NOEXTRA = ["no", "none", "no_preference", "same_as_mine", "not_started", "fully_free", "not_taken"];   /* JG-PROD: owner 3 Oct R6, "Not yet" asks no DTM score */
      const ph = { m3_national_exam_status: "Target score", m6_summer: "Program budget in USD (0 if none)", m6_research: "What was it about?", m8_family_major_pref: "What do they want you to study?", m8_family_abroad: "Who, and where?", m3_dtm_result: "Your DTM score (points)" }[q.id] || "";   /* JG-PROD: owner 3 Oct R6 */
      el.innerHTML = `<div class="dg-opts" role="radiogroup" aria-labelledby="dg-q">${q.options.map(o => `<button type="button" role="radio" class="dg-opt" data-v="${o}" aria-checked="${cur.choice === o}"><span>${esc(label(q.id, o))}</span></button>`).join("")}</div>
        <div class="dg-extra" id="dg-extra"${cur.choice && !NOEXTRA.includes(cur.choice) ? "" : " hidden"}><input class="dg-field" type="${kind === "date" ? "date" : kind === "number" ? "number" : "text"}" value="${esc(cur.extra || "")}" placeholder="${esc(T(ph))}" aria-label="${esc(T(ph || (kind === "date" ? "Expiry date" : "Details")))}"></div>`;   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      const x = el.querySelector("#dg-extra input");
      el.addEventListener("click", e => { const b = e.target.closest(".dg-opt"); if (!b) return; el.querySelectorAll(".dg-opt").forEach(z => z.setAttribute("aria-checked", String(z === b))); $("dg-extra").hidden = NOEXTRA.includes(b.dataset.v); set({ choice: b.dataset.v, extra: x.value }); });
      x.addEventListener("input", () => { if (draft && draft.choice) set({ choice: draft.choice, extra: x.value }); });
      return;
    }
    if (t === "date_or_unknown") {
      el.innerHTML = `<input class="dg-field" type="month" value="${esc(draft && draft !== "unknown" ? draft : "")}" aria-labelledby="dg-q"><button type="button" class="dg-chip dg-unk" data-unknown aria-pressed="${draft === "unknown"}">${T("I don't know yet")}</button>`;   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      const i = el.querySelector("input"), u = el.querySelector("[data-unknown]");
      i.addEventListener("input", () => { u.setAttribute("aria-pressed", "false"); set(i.value); });
      u.addEventListener("click", () => { i.value = ""; u.setAttribute("aria-pressed", "true"); set("unknown"); });
      return;
    }
    if (t === "autocomplete") { el.innerHTML = `<input class="dg-field" type="text" autocomplete="address-level2" value="${esc(draft || "")}" placeholder="${T("City or town")}" aria-labelledby="dg-q">`; el.querySelector("input").addEventListener("input", e => set(e.target.value.trim())); return; }   /* JG-PROD: owner 4 Oct P4g S1 (L) */
    if (t === "contact") {
      const c = draft && typeof draft === "object" ? draft : {};
      el.innerHTML = `<div class="dg-rows"><label class="dg-lab">${T("Their name (optional)")}<input class="dg-field" type="text" data-k="name" value="${esc(c.name || "")}"></label><label class="dg-lab">${T("Phone or email")}<input class="dg-field" type="text" data-k="contact" inputmode="email" value="${esc(c.contact || "")}"></label></div><p class="dg-hint">${T("Only used to ask for their consent and to share your progress with them.")}</p>`;   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      el.addEventListener("input", () => { const o = {}; el.querySelectorAll("[data-k]").forEach(i => { o[i.dataset.k] = i.value.trim(); }); set(o.contact ? o : undefined); });
      return;
    }
    if (t === "rank") {
      const items = [...new Set([...(A.m2_destinations || []), ...(S.parallel || [])])].filter(x => x !== "dont_know_yet"), order = Array.isArray(draft) ? draft.slice() : [];
      if (items.length < 2) { el.innerHTML = `<p class="dg-hint">${T("Only one destination so far. You can rank them once you add more.")}</p>`; set(items.length ? items : ["none"]); return; }   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      const paint = () => { el.innerHTML = `<p class="dg-hint">${T("Tap them in order of preference.")}</p><div class="dg-opts">${items.map(v => { const k = order.indexOf(v); return `<button type="button" class="dg-opt" data-v="${v}" aria-pressed="${k >= 0}"><b class="dg-rank">${k >= 0 ? k + 1 : ""}</b><span>${COUNTRY[v] ? flag(v) + " " : ""}${esc(label(q.id, v))}</span></button>`; }).join("")}</div>`; };   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      el.addEventListener("click", e => { const b = e.target.closest(".dg-opt"); if (!b) return; const v = b.dataset.v, k = order.indexOf(v); if (k >= 0) order.splice(k, 1); else if (order.length < 3) order.push(v); paint(); set(order.length ? order.slice() : undefined); });
      paint(); return;
    }
    if (t === "confirm_numbers") {
      const sug = draft && typeof draft === "object" && !draft.none ? draft : Object.assign({}, (D.rules_set || []).includes("US") ? { SAT: 1500 } : {}, D.requires_english ? { IELTS: 7 } : {}, (S.parallel || []).includes("KR") ? { TOPIK: 3 } : {});
      el.innerHTML = `<p class="dg-hint">${T("Suggested from your destinations. These are targets, not requirements; adjust them if you like.")}</p><div class="dg-rows">${Object.keys(sug).map(k => `<label class="dg-lab">${esc(k)}<input class="dg-field" type="number" step="any" data-k="${k}" value="${esc(sug[k])}"></label>`).join("") || `<p class="dg-hint">${T("No test targets for your destinations.")}</p>`}</div>`;   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      const read = () => { const o = {}; el.querySelectorAll("[data-k]").forEach(i => { o[i.dataset.k] = i.value; }); set(Object.keys(o).length ? o : { none: true }); };
      el.addEventListener("input", read); read(); return;
    }
    if (t === "form") {
      const f = draft && typeof draft === "object" ? draft : {};
      el.innerHTML = `<div class="dg-rows">${((q.options || {}).fields || []).map(k => `<label class="dg-lab">${esc(fieldLabel(k))}<input class="dg-field" type="text" data-k="${k}" value="${esc(f[k] || "")}"></label>`).join("")}</div>`;   /* JG-PROD: owner 4 Oct P4g S1 (L) */
      el.addEventListener("input", () => { const o = {}; el.querySelectorAll("[data-k]").forEach(i => { o[i.dataset.k] = i.value.trim(); }); set(Object.values(o).some(Boolean) ? o : undefined); });
      return;
    }
    el.innerHTML = `<input class="dg-field" type="text" value="${esc(draft || "")}" aria-labelledby="dg-q">`; el.querySelector("input").addEventListener("input", e => set(e.target.value));
  }
  let valid2 = null;
  function filterable(el) { const s = el.querySelector(".dg-search"); s.addEventListener("input", () => { const v = s.value.trim().toLowerCase(); el.querySelectorAll(".dg-opt, .dg-chip").forEach(b => { b.hidden = v && !b.textContent.toLowerCase().includes(v); }); }); }
  function requiredTests() {                                               // the tests the student's destinations, field and dream universities need (src/engine/required-tests.ts, line for line)   /* JG-PROD: owner 3 Oct R8, only what the chosen destinations need */
    const out = [], add = (id, name, verify) => { if (!out.some(x => x.id === id)) out.push({ id, name, verify }); }, RU = { mit: "MIT", harvard: "Harvard", stanford: "Stanford", penn: "Penn", oxford: "Oxford", cambridge: "Cambridge", imperial: "Imperial", yale: "Yale", princeton: "Princeton", dartmouth: "Dartmouth", brown: "Brown", cornell: "Cornell", caltech: "Caltech", jhu: "Johns Hopkins", utaustin: "UT Austin", osu: "Ohio State", purdue: "Purdue", georgetown: "Georgetown", cmu: "Carnegie Mellon", lse: "LSE", ucl: "UCL", kcl: "KCL", bristol: "Bristol", durham: "Durham", glasgow: "Glasgow", nottingham: "Nottingham", soas: "SOAS", warwick: "Warwick" };   /* JG-PROD: owner 4 Oct R10, RU = RULE_UNI (src/engine/required-tests.ts): a new catalog row a rule names keeps its test */
    const field = String(A.m2_field || "").replace(/_/g, " "), ids = (A.m2_dream_unis || []).map(u => u.university_id || ""), dreams = ids.map(x => RU[x]).filter(Boolean), unplaced = !ids.length || ids.some(x => !UNIS.some(u => u[0] === x)), eleven = ["UZ", "KZ", "KG", "TJ", "TM", "AZ", "RU"].includes(A.m0_residence_country || "UZ"), uzIds = ids.filter(x => UNIS.some(u => u[0] === x && u[2] === "UZ")), ownOnly = uzIds.length > 0 && uzIds.every(x => (UNIS.find(u => u[0] === x) || [])[4] === "own");   /* JG-PROD: owner 4 Oct R4 R5, DTM stays unless every Uzbek choice admits by its own exams (JG_BOOT.unis row[4], src/engine/uz-records.ts) */
    for (const id of D.rules_set || []) { const r = rule(id); if (!r) continue;
      for (const tt of (r.requirements || {}).tests || []) { if (id === "UK" && tt.test_id === "STEP") continue; if (id === "UZ_HOME" && tt.test_id === "DTM" && ownOnly) continue; const f = (tt.required_for || {}).fields || [], u = (tt.required_for || {}).universities || []; if (!f.length && !u.length) continue; const byField = !f.length || f.includes("all") || (f.some(x => x.startsWith("all, when")) ? eleven && (((r.requirements || {}).school_leaving || {}).needs_foundation_or_studienkolleg_for || []).length > 0 : !!field && f.includes(field)), byUni = !u.length || unplaced || u.some(nm => dreams.some(d => nm === d || nm.startsWith(`${d} `))); if (byField && byUni) add(tt.test_id, tt.test_id.replace(/_/g, " "), !!r.needs_verification); }   /* JG-PROD: owner 4 Oct R4 R5, no DTM line for own-exam-only Uzbek choices (= src/engine/required-tests.ts) */
      if (((r.requirements || {}).language || []).some(l => l.language === "en")) add("IELTS_or_TOEFL", "IELTS or TOEFL", !!r.needs_verification);
    }
    for (const x of ids) { const u = UNIS.find(r => r[0] === x) || []; if ((D.rules_set || []).includes(u[2])) for (const t of u[5] || []) add(t[0], t[1], !!t[2]); } return out;   /* JG-PROD: owner 10 Oct (delegated call, teen walk), what a named university of a chosen route asks for (TOPIK, TR-YÖS or SAT, English proof), from the route's sourced record: JG_BOOT.unis row[5] (= src/engine/required-tests.ts uniRouteTests) */
  }

  /* ---------- the three checks: the verified banks (src/engine/data/check_items.json), a timer on every question, stacked fractions, one attempt ---------- */ /* JG-PROD: owner 3 Oct R2 R3 R4 R5 R12, the checks v2 (P4b) */
  const EN = (window.JG_DESIGN_BANKS || {}).en || {};   // English A0-C2, check_items.json "en": on the page only for /preview /* JG-PROD: owner 7 Oct A4, the keys leave the page: the server grades the checks (src/server/checks.ts) and only /preview (development) hands the page its banks; was owner 3 Oct R4, the English bank to C2 */
  const MATH = (window.JG_DESIGN_BANKS || {}).math || {};   // math by rung, check_items.json "math": on the page only for /preview /* JG-PROD: owner 7 Oct A4, the keys leave the page; was owner 3 Oct R3 R5, the math bank through calculus */
  const READ = (window.JG_DESIGN_BANKS || {}).read || {};   // the reading passage in each roadmap language, check_items.json "read": on the page only for /preview /* JG-PROD: owner 7 Oct A4, the keys leave the page; was owner 3 Oct R12, the reading passage per roadmap language */
  const EN_SEC = { A0: 15, A1: 15, A2: 20, B1: 20, B2: 25, C1: 30, C2: 30 }, READ_EXTRA = 10, MATH_SEC = [10, 11, 11, 12, 13, 14, 14, 15];   /* JG-PROD: owner 3 Oct R3 R4 R5, seconds per question: math 10 s at the easiest rung to 15 s at the hardest; English by level, +10 s on a reading item */
  const form = (items, f) => { const a = (items || []).filter(it => (it[3] || {}).form === f); return a.length ? a : (items || []).filter(it => (it[3] || {}).form === "A"); };   // the diagnostic takes form A; form B waits for the scheduled re-check
  const frac = h => h.replace(/\{([^{}\/]+)\/([^{}]+)\}/g, (m, a, b) => `<span class="dg-frac" role="math" aria-label="${a}/${b}"><span>${a}</span><span>${b}</span></span>`);   /* JG-PROD: owner 3 Oct R3, {a/b} after esc() is a stacked fraction, never a slash */
  let dgTick = null, dgAuto = 0; const stopTick = () => { clearInterval(dgTick); dgTick = null; view._hold = view._shift = 0; const t = $("dg-timer"); if (t) t.textContent = ""; }, mmss = s => `0:${String(s).padStart(2, "0")}`, shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);   /* JG-PROD: owner 3 Oct R4 R5, P4b final review I1 I2: dgAuto 1 answers "I don't know" to every question left (a confirmed stop), 2 times out the question on screen when a check was left partway */
  function mcq(prompt, choices, correct, meta, onPick, sec, math) {   // sec > 0: a countdown in the header, and 0 is "I don't know"; math: {a/b} drawn stacked
    if (dgAuto) { const late = dgAuto === 2; if (late) dgAuto = 0; return onPick(false, late); } stopTick(); const order = shuffle(choices.map((c, i) => i)), f = s => (math ? frac(esc(s)) : esc(s)); let done = false; const pick = (ok, late) => { if (done) return; done = true; stopTick(); onPick(ok, !!late); }; view._pick = pick;   /* JG-PROD: owner 3 Oct R3 R4 R5; P4b final review I1 I2: no screen for a question answered by a stop or a resume */
    view.querySelector(".dg-body").innerHTML = `<p class="dg-mod">${meta}</p><h2 class="dg-q dg-mathq" id="dg-q">${f(prompt)}</h2><div class="dg-opts" role="radiogroup" aria-labelledby="dg-q">${order.map(i => `<button type="button" role="radio" class="dg-opt" data-i="${i}"><span>${f(choices[i])}</span></button>`).join("")}</div><button class="dg-link" type="button" data-dunno>${T("I don't know")}</button>`;   /* JG-PROD: owner 4 Oct P4g S1 (L) */
    view.querySelector(".dg-body").onclick = e => { const b = e.target.closest("[data-i]"), dn = e.target.closest("[data-dunno]"); if (b) pick(typeof correct === "function" ? correct(+b.dataset.i) : +b.dataset.i === correct); else if (dn) pick(false); };   /* JG-PROD: owner 7 Oct A4, for an item the server serves, "correct" gives the token of the option tapped (the page never knows which is right) */
    if (sec > 0) { let end = Date.now() + sec * 1000; const paint = () => { if (view._hold) return; if (view._shift) { end += view._shift; view._shift = 0; } const l = Math.ceil((end - Date.now()) / 1000), t = $("dg-timer"); if (l <= 0) return pick(false, true); if (t) t.textContent = mmss(l); }; paint(); dgTick = setInterval(paint, 250); }   /* JG-PROD: owner 3 Oct R3 R4 R5, P4b final review I2: the clock holds while "Stop the check here?" is open */
  }
  function testFrame(title, qid) { view._check = qid || null; view._pick = null; view.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-act="quittest" aria-label="${T("Stop the check")}">×</button><p class="dg-tt">${esc(title)}</p><span class="dg-timer" id="dg-timer"></span></div><div class="dg-body"></div><div class="dg-foot"></div>`; }   /* JG-PROD: owner 3 Oct R3, the header's own timer slot now counts down; P4b final review I2: the stop control is the design's × (close), not Back's ‹, and asks first; owner 4 Oct P4g S1 (L) */
  function miniTest(engine, q) {
    sub = "test"; const was = A[q.id], R = was && was.partial ? was.resume || null : null; if (was && (was.level || was.rung) && !was.partial) return render(); if (!window.JG_DESIGN_BANKS) return window.JG_CHECKS ? window.JG_CHECKS.mini(engine, q, { A, view, frame: testFrame, mcq, T, finish, mark: () => { A[q.id] = { partial: true, form: "A" }; S.answers = A; save(); } }) : render();   /* JG-PROD: owner 3 Oct R4 R5, one attempt: a result, even one stopped early, stands; P4b final review I1: one left partway resumes where it stood (R); owner 7 Oct A4, the server serves the items without their keys, grades them, climbs and resumes (public/runtime/jg-checks.js); the draft keeps only "partial" */
    const keep = (res, at) => { A[q.id] = Object.assign({}, res, { partial: true, resume: at }); S.answers = A; save(); };   /* JG-PROD: owner 3 Oct R4 R5, P4b final review I1: with where the check stood, so a check left partway (a phone that dies, a closed tab) resumes there; the engine never reads a partial result as a level */   // every answer saves the result so far: leaving the check keeps what was reached
    if (engine === "english_screener") {
      testFrame(T("English check"), q.id); const levels = Object.keys(EN), subs = Object.assign({}, R && R.subs); let { li = 0, k = 0, right = 0, passed = -1, n = 0, timeouts = 0 } = R || {};   /* JG-PROD: owner 3 Oct R4, P4b final review I1 I2; owner 4 Oct P4g S1 (L) */
      const result = () => ({ level: passed >= 0 ? levels[passed] : "A0", confidence: Math.min(.95, .55 + n * .03), subskills: Object.fromEntries(Object.entries(subs).map(([s, x]) => [s, Math.round(x.r / x.n * 100)])), form: "A", timeouts });   /* JG-PROD: owner 3 Oct R4, through C2 */
      const step = () => {
        const its = li < levels.length ? form(EN[levels[li]], "A") : []; if (k >= its.length) return finish(result());   /* JG-PROD: owner 3 Oct R4 */
        const it = its[k], m = it[3] || {}, sec = EN_SEC[levels[li]] + (m.sub === "reading" ? READ_EXTRA : 0);
        mcq(it[0], it[1], it[2], T("Question {n} · level {l}", { n: ++n, l: levels[li] }), (ok, late) => {   /* JG-PROD: owner 4 Oct P4g S1 (L) */
          const s = subs[m.sub || "other"] = subs[m.sub || "other"] || { r: 0, n: 0 }; s.n++; if (ok) { s.r++; right++; } if (late) timeouts++; k++;
          const need = its.length - 1;                                       // a level passes with at most one miss: 2 of 3, 3 of 4
          if (right >= need) { passed = li; li++; k = 0; right = 0; } else if (k - right > its.length - need) li = levels.length;   /* JG-PROD: owner 3 Oct R4, a level's second miss ends the check */
          keep(result(), { li, k, right, passed, n, timeouts, subs }); step();   /* JG-PROD: owner 3 Oct R4, P4b final review I1 */
        }, sec);
      }; dgAuto = R ? 2 : 0; step();   /* JG-PROD: owner 3 Oct R4, P4b final review I1: the question on screen when the check was left timed out */
    } else {
      testFrame(T("Math check"), q.id); const grade = parseInt(A.m1_grade, 10) || 9, start = Math.max(0, Math.min(7, grade - 6) - 2);   /* JG-PROD: owner 3 Oct R2 R5, the stop control asks first (P4b final review I2); no self-rating: two rungs below the grade's expectation (src/engine/score.ts); owner 4 Oct P4g S1 (L) */
      let { r = start, floor = start, ceil = RUNGS.length, k = 0, right = 0, passed = start - 1, n = 0, timeouts = 0 } = R || {};   /* JG-PROD: owner 3 Oct R5; P4b final review I1: a check left partway resumes where it stood */
      const result = () => ({ rung: RUNGS[Math.max(0, passed)], confidence: Math.min(.95, .7 + n * .02), form: "A", timeouts });
      const step = () => {
        if (r >= ceil) return finish(result());
        const its = form(MATH[RUNGS[r]], "A"), it = its[k];
        mcq(T(it[0]), it[1].map(o => T(o)), it[2], T("Question {n} · step {s} of {m}", { n: ++n, s: r + 1, m: RUNGS.length }), (ok, late) => {   /* JG-PROD: owner 4 Oct P4g S1 (L); P4g fix K1, a worded item ("Right triangle, legs 6 and 8: hypotenuse?") and "or" in an option read in the language picked first, symbols as they are */
          if (ok) right++; if (late) timeouts++; k++;
          const need = its.length - 1;                                       // a rung passes with at most one miss: 2 of 3
          if (right >= need) { passed = r; r++; k = 0; right = 0; }
          else if (k - right > its.length - need) {   /* JG-PROD: owner 3 Oct R5, a rung's second miss */
            if (r === floor && r > 0) { ceil = r; r--; floor = r; passed = r - 1; k = 0; right = 0; }   // the first rung tried is too hard: one rung down, then stop below it
            else { keep(result()); return finish(result()); }
          }
          keep(result(), { r, floor, ceil, k, right, passed, n, timeouts }); step();   /* JG-PROD: owner 3 Oct R5, P4b final review I1 */
        }, MATH_SEC[r], true);
      }; dgAuto = R ? 2 : 0; step();   /* JG-PROD: owner 3 Oct R5, P4b final review I1: the question on screen when the check was left timed out */
    }
    function finish(res) { stopTick(); dgAuto = 0; view._check = view._pick = null; draft = res; A[q.id] = res; S.answers = A; save(); if (S.recheck) { const rc = S.recheck; S.recheck = null; save(); view.hidden = true; recheckDone(res, rc); return; } render(); }   /* JG-PROD: owner 3 Oct R4 R5; P4b final review I1 I2: a finished result has no partial flag */
  }
  const readLang = () => (["uz", "en", "ru"].includes(A.m0_roadmap_language) ? A.m0_roadmap_language : "uz");   /* JG-PROD: owner 3 Oct R12, the reading passage follows the roadmap language; the design's Uzbek one when none was chosen; owner 7 Oct A4, the passages' languages named here (the page no longer holds the passages) */
  function readingCheck() {
    if (A.reading_check || (window.JG_PHASED && window.JG_PHASED.readingLater())) return results(); if (window.JG_ENGINE && window.JG_ENGINE.prepare) window.JG_ENGINE.prepare(A);   /* JG-PROD: P4a E3, the result is drafted during the reading check (spec §5.2) */   /* JG-PROD: owner 7 Oct P5e (spec §2.5, DC3), with Phase D on the reading check is the first daily task, not part of the first run */   /* JG-PROD: owner 7 Oct P5e review 6, only while this student's Phase D is not complete (a restart after it asks the reading check here) */
    sub = "test"; if (!window.JG_DESIGN_BANKS) return window.JG_CHECKS ? window.JG_CHECKS.reading(readLang(), { view, frame: testFrame, mcq, T, esc, done: res => { A.reading_check = res; save(); results(); } }) : results(); const RL = READ[readLang()]; testFrame(T("Reading check · {name}", { name: RL.name })); const t0 = Date.now(), words = RL.text.split(/\s+/).length;   /* JG-PROD: owner 3 Oct R12, the passage in the roadmap's language; owner 4 Oct P4g S1 (L); owner 7 Oct A4, the server serves the passage and its questions without their keys, times the reading and grades it (public/runtime/jg-checks.js) */
    view.querySelector(".dg-body").innerHTML = `<p class="dg-mod">${T("Read at your normal speed. Then 5 short questions.")}</p><div class="dg-passage" lang="${readLang()}">${esc(RL.text)}</div>`;   /* JG-PROD: owner 3 Oct R12; owner 4 Oct P4g S1 (L) */
    view.querySelector(".dg-foot").innerHTML = `<button class="dg-go" type="button" data-read>${T("I've finished reading")}</button>`;   /* JG-PROD: owner 4 Oct P4g S1 (L) */
    view.querySelector("[data-read]").onclick = () => {
      const wpm = Math.round(words / Math.max(.25, (Date.now() - t0) / 60000)); let i = 0, ok = 0;
      view.querySelector(".dg-foot").innerHTML = "";
      const step = () => { if (i >= RL.qs.length) { A.reading_check = { wpm, comprehension_pct: Math.round(ok / RL.qs.length * 100) }; save(); return results(); } const it = RL.qs[i]; mcq(it[0], it[1], it[2], T("Question {n} of {m}", { n: i + 1, m: RL.qs.length }), good => { if (good) ok++; i++; step(); }); };   /* JG-PROD: owner 3 Oct R12; owner 4 Oct P4g S1 (L) */
      step();
    };
  }

  /* ---------- the first picture ---------- */
  const AXES = [["academics", "Academics"], ["math", "Math"], ["language", "Language"], ["tests", "Tests"], ["activities", "Activities"], ["narrative", "Your story"], ["money", "Money"], ["family", "Family"], ["logistics", "Documents"], ["capacity", "Time"]];
  const TASK_I = { study: "📘", practice: "✏️", create: "🛠", submit: "📤", upload: "📎", book: "📅", contact: "💬", reflect: "💭", verify: "🔎", rest: "🌙" };
  function results(ok) { if (window.JG_ENGINE && !S.done && !ok) { if (view._busy) return; view._busy = true; const was = !!window.JG_ENGINE.cache.result; window.JG_ENGINE.commit("diagnostic_done", { answers: A }).then(r => { view._busy = false; if (r && r.snapshot) { if (was) S.done = true; results(true); } }); return; }   /* JG-PROD: S6, the server scores the diagnostic and pays +50 once ever; the page shows "+50" only for the first result (spec §4.1) */
    sub = "results"; D = (window.JG_ENGINE && window.JG_ENGINE.cache.derived) || derive(A); RM = null;   /* JG-PROD: S6, the server's derived facts */
    const JR = window.JG_ENGINE && window.JG_ENGINE.result(), sc = JR ? JR.scorecard : JG_API.scorecard(A, D), fl = JR ? JR.flags : JG_API.flags(A, D), fe = JR ? JR.feasibility : JG_API.feasibility(A, D), arch = JR ? JR.archetype : JG_API.archetype(sc, A), tasks = JR ? JR.first_tasks : JG_API.firstTasks(A, D);   /* JG-PROD: S6, the first picture is the server's (spec §4.1) */
    const first = !S.done; S.done = true; S.result = { stage: D.stage, archetype: arch, reality_gap: fe.reality_gap }; save();
    if (first && window.JIA_coins && window.JIA_coins.add) { try { window.JIA_coins.add(50); } catch (e) {} }
    const sc1 = D.stage === "S1";
    view.innerHTML = `<div class="dg-top"><span></span><p class="dg-tt">${T("Your first picture")}</p><button class="dg-x" type="button" data-act="close" aria-label="${T("Close")}">×</button></div>${"" /* JG-PROD: owner 4 Oct P4g S1 (L) */}
      <div class="dg-body">
        <div class="dg-res-head">${mascot(sc1 ? "cele" : "delighted", "dg-res-img")}<div><b>${T(sc1 ? "You did it!" : "Here's where you stand today")}</b><p><span class="dg-stage">${D.stage}</span> ${T({ S1: "Foundation years", S2: "Build years", S3: "Application year", S4: "Gap year / reapplying" }[D.stage])}${D.graduation_date ? T(" · finishing school {date}", { date: LD(D.graduation_date, { month: "long", year: "numeric" }) }) : ""}</p></div></div>${"" /* JG-PROD: owner 4 Oct P4g S1 (L) */}
        ${first ? `<p class="dg-coins">🪙 ${T("+50 coins for finishing your diagnostic")}</p>` : ""}${"" /* JG-PROD: owner 4 Oct P4g S1 (L) */}
        ${fl.map(f => `<p class="dg-flagmsg">${esc(f.text)}</p>`).join("")}
        ${sc1 ? "" : `<h3 class="dg-h3">${T("Your scorecard")}</h3><div class="dg-axes">${AXES.map(([k, n]) => { const a = sc.axes[k]; return `<div class="dg-axis ${a.rag}"><i aria-hidden="true"></i><div><b>${T(n)}</b><p>${esc(a.gap_sentence_i18n)}</p></div><span class="sr-only">${T(a.rag)}</span></div>`; }).join("")}</div>`}${"" /* JG-PROD: owner 4 Oct P4g S1 (L); owner 6 Oct P4h fix W6: the colour read aloud in the student's language */}
        <h3 class="dg-h3">${T("Your first tasks")}</h3>${"" /* JG-PROD: owner 4 Oct P4g S1 (L) */}
        <div class="dg-tasks">${tasks.map(t => `<div class="dg-task"><span class="dg-ti" aria-hidden="true">${TASK_I[t.type] || "•"}</span><div><b>${esc(t.title_i18n)}</b><p>${esc(t.instructions_i18n)}</p><small>${T("{n} min", { n: t.est_minutes })} · ${T({ quiz: "short quiz", link: "paste a link", upload: "upload", self_report: "tick when done", auto_event: "checks itself" }[t.verification] || "")} · 🪙 ${t.coins}</small></div></div>`).join("")}</div>${"" /* JG-PROD: owner 4 Oct P4g S1 (L) */}
      </div>
      <div class="dg-foot">${fe.reality_gap >= 2 && !sc1 ? `<button class="dg-go" type="button" data-act="reality">${T("See your honest check")}</button>` : `<button class="dg-go" type="button" data-act="roadmap">${T("Open my roadmap")}</button>`}<button class="dg-link" type="button" data-act="redo">${T("Start the diagnostic again")}</button></div>`;   /* JG-PROD: owner 4 Oct P4g S1 (L) */
    view._fe = fe;
  }

  /* ---------- the honest check (02 §9, §11): parallel destinations before the roadmap unlocks ---------- */
  const BL = { money: "Money", language: "Language", tests: "Tests", visa: "Visa", age: "Age limit", deadline_passed: "Deadline passed", conscription: "Military service", restriction: "Entry restriction" };
  const FE = { high: "Within reach", medium: "Possible", low: "Long shot", blocked: "Blocked this cycle" };
  const when = dl => !dl ? "" : dl.date ? `${dl.name}: ${LD(dl.date, { day: "numeric", month: "short", year: "numeric" })}${dl.needs_verification ? T(" · being confirmed") : ""}` : T("{name}: date being confirmed", { name: dl.name });   /* JG-PROD: owner 4 Oct P4g S1 (L) */
  function reality() {
    sub = "reality"; const fe = view._fe || JG_API.feasibility(A, D), pick = new Set(S.parallel || []);
    const chosen = fe.rows.filter(r => r.chosen);
    view.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-act="toresults" aria-label="${T("Back")}">‹</button><p class="dg-tt">${T("An honest check")}</p><button class="dg-x" type="button" data-act="close" aria-label="${T("Close")}">×</button></div>${"" /* JG-PROD: owner 4 Oct P4g S1 (L) */}
      <div class="dg-body">
        <p class="dg-lead">${/* JG-PROD: P4a E4, the AI lead, its labels and blockers filled in by code (spec §5.2, §6) */ fe.reality_lead ? esc(fe.reality_lead) : `On today's profile, ${chosen.map(r => r.name).join(" and ")} ${chosen.length > 1 ? "are" : "is"} a long shot. That can change, and here is exactly what stands in the way.`}</p>
        ${chosen.map(r => `<div class="dg-fe ${r.feasibility}"><div class="dg-fe-h"><b>${esc(r.name)}</b><span>${T(FE[r.feasibility])}</span></div><div class="dg-bl">${r.blockers.map(b => `<span>${T("Blocked by: {b}", { b: T(BL[b] || b) })}</span>`).join("")}</div><p>${r.language_gap_months ? T("English gap: about {n} months (estimate). ", { n: r.language_gap_months }) : ""}${esc(when(r.next_hard_deadline))}</p></div>`).join("")}${"" /* JG-PROD: owner 4 Oct P4g S1 (L) */}
        <h3 class="dg-h3">${T("Add at least 2 parallel destinations")}</h3>${"" /* JG-PROD: owner 4 Oct P4g S1 (L) */}
        <p class="dg-hint">${T("They run alongside your dream, not instead of it. You can change them anytime.")}</p>${"" /* JG-PROD: owner 4 Oct P4g S1 (L) */}
        <div class="dg-sugs">${fe.suggestions.map(r => `<button type="button" class="dg-sugc" data-p="${r.destination}" aria-pressed="${pick.has(r.destination)}"><div class="dg-fe-h"><b>${COUNTRY[r.destination] ? flag(r.destination) + " " : "🏠 "}${esc(r.name)}</b><span class="dg-pill ${r.feasibility}">${T(FE[r.feasibility])}</span></div><p>${esc(r.note || "")}</p><small>${r.language_gap_months ? T("Language: ~{n} months to B2 · ", { n: r.language_gap_months }) : T("No language gap · ")}${esc(r.cost_band)}${r.needs_verification ? T(" · details being confirmed") : ""}</small></button>`).join("")}</div>${"" /* JG-PROD: owner 4 Oct P4g S1 (L) */}
      </div>
      <div class="dg-foot"><button class="dg-go" type="button" data-act="unlock" id="dg-unlock"${pick.size >= 2 ? "" : " disabled"}>${pick.size >= 2 ? T("Unlock my roadmap") : T("Choose {n} more", { n: 2 - pick.size })}</button></div>`;   /* JG-PROD: owner 4 Oct P4g S1 (L) */
    view.querySelector(".dg-sugs").onclick = e => { const b = e.target.closest("[data-p]"); if (!b || view._busy) return; const flip = () => { pick.has(b.dataset.p) ? pick.delete(b.dataset.p) : pick.add(b.dataset.p); S.parallel = [...pick]; save(); b.setAttribute("aria-pressed", String(pick.has(b.dataset.p))); const u = $("dg-unlock"); u.disabled = pick.size < 2; u.textContent = pick.size >= 2 ? T("Unlock my roadmap") : T("Choose {n} more", { n: 2 - pick.size }); }; if (!window.JG_ENGINE) return flip(); const want = new Set(pick); want.has(b.dataset.p) ? want.delete(b.dataset.p) : want.add(b.dataset.p); view._busy = true; window.JG_ENGINE.commit("parallel", { parallel: [...want] }).then(r => { view._busy = false; if (r && r.snapshot) flip(); }); };   /* JG-PROD: S7, the parallel routes are an awaited server commit (spec §4.1); owner 4 Oct P4g S1 (L) */
  }
  function unlocked(ok) { if (window.JG_ENGINE && !ok) { if (view._busy) return; view._busy = true; window.JG_ENGINE.commit("unlock", { parallel: S.parallel || [] }).then(r => { view._busy = false; if (r && r.snapshot) unlocked(true); }); return; }   /* JG-PROD: S7, unlocking is a server commit: guardrail 9, the plan, this week's tasks, +3 bricks (spec §4.1) */
    S.unlocked = true; save();
    view.innerHTML = `<div class="dg-top"><span></span><span></span><button class="dg-x" type="button" data-act="close" aria-label="${T("Close")}">×</button></div>${"" /* JG-PROD: owner 4 Oct P4g S1 (L) */}
      <div class="dg-intro"><div class="dg-hero">${mascot("cele", "dg-hero-img")}</div><h2>${T("Your roadmap is unlocked")}</h2><p>${T("Your dream stays on the map, with {n} parallel routes beside it. Every date comes from checked rules; anything not yet confirmed is marked, never guessed.", { n: S.parallel.length })}</p></div>${"" /* JG-PROD: owner 4 Oct P4g S1 (L) */}
      <div class="dg-foot"><button class="dg-go" type="button" data-act="roadmap">${T("Open my roadmap")}</button></div>`;   /* JG-PROD: owner 4 Oct P4g S1 (L) */
  }

  /* ---------- wiring ---------- */
  const DEMO = { m0_dob: "2012-05-14", m0_residence_country: "UZ", m0_citizenship: ["UZ"], m1_status: "in_school", m1_grade: "9", m1_graduation_confirm: "yes", m1_school_type: "public_state",
    m1_curriculum: "national", m1_instruction_language: ["uz"], m2_destinations: ["US"], m2_dream_unis: [{ university_id: "mit", country: "US" }], m2_dream_why: { mit: "ranking_prestige" },
    m2_open_unknown_scholarship: 4, m2_post_grad_intent: "undecided", m2_field: "computer_science", m2_field_certainty: 6, m3_report_cards_upload: "skipped",
    m3_grades_table: [{ subject: "Math", grade: "5", year: "2026" }, { subject: "Physics", grade: "5", year: "2026" }, { subject: "English", grade: "4", year: "2026" }], m3_average: "4.8",
    m3_math_level_self: "algebra_2", m3_math_test: { rung: "algebra_2", confidence: .82 }, m3_olympiads: [{ subject: "Math", highest_level: "district", best_result: "2nd place", year: "2026" }],
    m3_national_exam_path: "DTM", m3_reading_habit: "1", m4_native_languages: ["uz"], m4_english_self: "B1", m4_english_screener: { level: "A1", confidence: .78, subskills: {} },
    m5_tests_taken: [], m5_required_tests: { SAT_or_ACT: "not_started", IELTS_or_TOEFL: "not_started" }, m6_activities: [{ name: "School robotics club", category: "building_tech" }],
    m7_annual_budget: { amount: "0", currency: "USD", usd: 0, confidence: "low" }, m7_aid_need: "full", m7_prestige_vs_cost: 40, m8_parent_attitude: "conditional",
    m9_why: "I want to build things that help people in my country, and MIT is where the best builders learn.", m9_structure_pref: "strict_daily_plan", m9_hours_per_week: "10",
    m9_devices: ["phone_only", "unstable_internet"], m9_commitments: { national_exam_prep: "4" }, reading_check: { wpm: 150, comprehension_pct: 80 } };
  view.addEventListener("click", e => {
    const b = e.target.closest("[data-act]"); if (!b || b.disabled) return;
    const act = b.dataset.act, F = sub ? null : flow(), q = F && F.find(x => x.q.id === S.at);
    if (act === "close") close();
    else if (act === "start") { S.at = flow()[0].q.id; save(); render(); } else if (act === "lang" && ["en", "uz", "ru"].includes(b.dataset.v)) { A.m0_roadmap_language = b.dataset.v; S.answers = A; save(); intro(); }   /* JG-PROD: owner 4 Oct P4g S1 (L): the choice is an answer (m0_roadmap_language), saved per account with the diagnostic */
    else if (act === "demo") { A = S.answers = JSON.parse(JSON.stringify(DEMO)); S.done = false; save(); results(); }
    else if (act === "next" && q) next(false);
    else if (act === "skip" && q) next(true);
    else if (act === "parent" && q) { draft = "parent_pending"; next(false); } else if ((act === "ptg" || act === "pcopy") && window.JG_RUNTIME && window.JG_RUNTIME.sendFamilyLink) window.JG_RUNTIME.sendFamilyLink(act === "ptg" ? "telegram" : "copy", b, A.m0_roadmap_language);   /* JG-PROD: owner 4 Oct R8, the money question's share row; the parent check stays on Today, which marks it sent */
    else if (act === "back") back();
    else if (act === "quittest") { const qa = view._check && A[view._check], ft = view.querySelector(".dg-foot"), bd = view.querySelector(".dg-body"); if (qa && qa.partial && view._pick && ft && bd) { view._hold = view._hold || Date.now(); if (window.JG_CHECKS) window.JG_CHECKS.hold(true); bd.style.display = "none"; ft.innerHTML = `<p class="dg-private">${T("Stop the check here? Every question left counts as “I don't know”, and the check can't be taken again.")}</p><button class="dg-go" type="button" data-act="testgo">${T("Keep going")}</button><button class="dg-link" type="button" data-act="teststop">${T("Stop the check")}</button>`; return; } stopTick(); view._check = view._pick = null; if (S.recheck) { S.recheck = null; save(); view.hidden = true; openRoadmap(); } else render(); }   /* JG-PROD: owner 3 Oct R4 R5, P4b final review I2: once a question is answered, stopping asks first (the clock holds, the question hides); a confirmed stop answers "I don't know" to every question left, so nothing untested is credited; before any answer it leaves with nothing kept */ else if (act === "testgo" || act === "teststop") { const ft = view.querySelector(".dg-foot"), bd = view.querySelector(".dg-body"); if (window.JG_CHECKS) window.JG_CHECKS.hold(false); if (view._hold) { view._shift = Date.now() - view._hold; view._hold = 0; } if (ft) ft.innerHTML = ""; if (bd) bd.style.display = ""; if (act === "teststop" && view._pick) { dgAuto = 1; view._pick(false); } }   /* JG-PROD: owner 3 Oct R4 R5, P4b final review I2: "Keep going" resumes the clock where it held; owner 4 Oct P4g S1 (L); owner 7 Oct A4, and the server's clock for that question holds with it */
    else if (act === "reality") reality();
    else if (act === "toresults") results();
    else if (act === "unlock") unlocked();
    else if (act === "roadmap") { if (window.JG_ENGINE && !S.unlocked) { if (view._busy) return; view._busy = true; window.JG_ENGINE.commit("unlock", { parallel: S.parallel || [] }, { quiet: ["reality_gap"] }).then(r => { view._busy = false; if (r && r.snapshot) { S.unlocked = true; save(); view.hidden = true; if (!S.onboarded) obRun(openRoadmap); else openRoadmap(); } else if (r && r.error === "reality_gap") reality(); }); return; } S.unlocked = true; save(); view.hidden = true; if (!S.onboarded) obRun(openRoadmap); else openRoadmap(); }   /* JG-PROD: S7, "Open my roadmap" unlocks on the server; when guardrail 9 wants parallel routes first, the design's own honest check opens */   // day one first
    else if (act === "redo") { const keep = () => Object.fromEntries(["m4_english_screener", "m3_math_test", "reading_check", "m0_roadmap_language"].filter(k => A[k] !== undefined).map(k => [k, A[k]])); if (window.JG_ENGINE && S.done) { if (view._busy) return; view._busy = true; window.JG_ENGINE.commit("diagnostic_restart", {}).then(r => { view._busy = false; if (r && r.snapshot) { S = { answers: keep(), at: null, done: false }; A = S.answers; RM = null; save(); intro(); } }); return; } S = { answers: keep(), at: null, done: false }; A = S.answers; RM = null; save(); intro(); }   /* JG-PROD: S7, a restart is a server commit; history and the roadmap stay until the next result (spec §4.1) */ /* JG-PROD: owner 3 Oct R4 R5, a restart keeps the three check results (one attempt) */ /* JG-PROD: owner 4 Oct P4g S1 (L), and the language picked first */
  });
  view.addEventListener("keydown", e => { if (e.key === "Escape") { e.preventDefault(); close(); } });

  /* ---------- Home: the roadmap card starts here ---------- */
  function paintHome() {
    const G = window.JG_ENGINE && window.JG_ENGINE.cache && window.JG_ENGINE.cache.goal; if (G) { const t = $("rm-title"), k = $("kpi-goal"), an = $("rm-apps-names"); if (t) t.textContent = `Roadmap to ${G.short}`; if (k) k.textContent = window.JG_ENGINE.chance && window.JG_ENGINE.chance() ? window.JG_ENGINE.chance().chanceFor : `Readiness for ${G.short}`; if (an) an.textContent = `${an.textContent.startsWith(" · ") ? " · " : ""}${G.unis.length ? G.unis.map(u => u.short).join(", ") : "none yet"}`; } const gk = G ? [G.short, G.year, ...G.unis.map(u => u.key)].join() : ""; if (paintHome.gk != null && paintHome.gk !== gk) document.dispatchEvent(new Event("jg:goal")); paintHome.gk = gk;   /* JG-PROD: owner 3 Oct R14, Home follows the goal as soon as the diagnostic is done; when it changes, "jg:goal" tells the chart (M003/D001), the tracker (M012/D018) and the desktop Home (D023) */ const s = $("rm-sub"); if (!s) return;   /* JG-PROD: owner 7 Oct P5d, "Chance for {goal}" in his language (owner decision 1) */
    if (S.unlocked) { const n = window.JG_ENGINE ? new Set([...((window.JG_ENGINE.cache.derived || {}).rules_set || []), ...(S.parallel || [])]).size || 1 : (S.parallel || []).length + 1; s.textContent = `${window.JG_ENGINE ? "" : `Stage ${S.result ? S.result.stage : ""} · `}${n} ${n === 1 && window.JG_ENGINE ? "route" : "routes"} planned`; }   /* JG-PROD: P4d re-walk F5, a real student counts the routes the plan runs (his own destinations and the parallel ones, as src/engine/plan.ts), one "route"; the demo as drawn */   /* JG-PROD: owner 10 Oct (delegated call, teen walk), a real student's Home line carries no stage code ("Stage S1" told a 13-year-old nothing; Uzbek and Russian dropped it through the dictionaries, English read the design's own line): "1 route planned"; the demo as drawn */
    else if (S.done) s.textContent = (window.JG_PHASED && window.JG_PHASED.homeLine && window.JG_PHASED.homeLine("done")) || "Diagnostic done · one step to unlock";   /* JG-PROD: owner 11 Oct 2026 (his ruling, the diagnostic as daily tasks), while Phase D runs this line says how many tasks today holds (JG_PHASED.homeLine("done")), never "Diagnostic done · one step to unlock" */
    else if (S.at) { const F = flow(), i = F.findIndex(x => x.q.id === S.at); s.textContent = (window.JG_PHASED && window.JG_PHASED.homeLine && window.JG_PHASED.homeLine()) || (i >= 0 ? `Diagnostic in progress · ${i + 1} of ${F.length}` : "Diagnostic in progress · tap to continue"); }   /* JG-PROD: owner 3 Oct R13, Home says where they left off */   /* JG-PROD: owner 11 Oct 2026 (his ruling, the diagnostic as daily tasks), with Phase D on a student who has not finished the first run is told "A few quick questions, then your first tasks" here (JG_PHASED.homeLine), never "Diagnostic in progress · 1 of 22" or "Take the diagnostic to begin" */
    const h = $("dg-hook"); if (!h) return;
    h.querySelector(".dg-hl").textContent = RT(S.unlocked ? "Open my roadmap" : S.done ? "Open my diagnostic" : S.at ? "Continue my diagnostic" : "Build my real roadmap");   /* JG-PROD: owner 4 Oct P4g fix K2, Home's roadmap button in the roadmap's language (the owner: "some students don't understand English"); the rest of the app's chrome stays English (D16); the demo reads the design's English */
    let next = ""; if (S.unlocked) { try { const a = roadmap().milestones.find(m => m.status === "active"); if (a) next = RT("Next: {t} · {by}", { t: a.title_i18n, by: a.due ? RT("by {date}", { date: rmM(a.due) }) : rmD(null) }); } catch (e) {} }   /* JG-PROD: owner 4 Oct P4g fix K2, Home's "Next: … · by …" in the roadmap's language and its dates (the owner: "some students don't understand English"); the rest of the app's chrome stays English (D16); the demo reads the design's English */   /* JG-PROD: owner 4 Oct P4g fix K3 review, a step whose date is still being confirmed (an undated US cycle: the essays, now ahead of the visa) reads "date being confirmed", never a bare "by" */
    h.querySelector(".dg-hs").textContent = next;
    try { paintToday(); } catch (e) {}                                     // Today follows the roadmap (not ready during start-up)
  }
  const hook = document.createElement("button");
  hook.type = "button"; hook.className = "dg-hook"; hook.id = "dg-hook";
  hook.innerHTML = `<span class="dg-hl"></span><small class="dg-hs"></small><b aria-hidden="true">›</b>`;
  hook.addEventListener("click", () => (S.unlocked ? openRoadmap() : open()));
  const rmCard = $("rm-title") ? $("rm-title").closest(".rm, .roadmap, section, article") : null;
  if (rmCard) rmCard.appendChild(hook);
  const pv = document.querySelector('.pv [data-act="diagnostic"]'); if (pv) pv.addEventListener("click", open);
  paintHome(); if (window.JG_ENGINE) document.addEventListener("jg:snapshot", () => { try { paintHome(); } catch (e) {} });   /* JG-PROD: owner 10 Oct (delegated call, teen walk), Home's "Next: … · by …" line follows a new snapshot at once (a check's result, a daily answer): it stayed one step behind the roadmap until the roadmap had been opened and closed ("Keyingi qadam: Ingliz tili B1" beside "Erishildi: Ingliz tili B1 ✓") */

  /* ================= ROADMAP: the planner (mock, pure, spec §3) and the map ================= */
  const ymd = d => (window.JG_ENGINE ? window.JG_ENGINE.ymd(d) : d.toISOString().slice(0, 10));   /* JG-PROD: S4 (spec §4.5), the student's local day, not the UTC date */
  const addM = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x; };
  const backW = (date, w) => { const x = new Date(date); x.setDate(x.getDate() - w * 7); return ymd(x); };
  const fmtD = s => s ? new Date(s).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "date being confirmed";
  const fmtM = s => s ? new Date(s).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";
  JG_API.plan = (A, D, parallel) => {
    const P = [], M = [], need = D.requires_english ? "B2" : null, eng = D.english_tested || "A0";
    const gy = D.graduation_date ? +D.graduation_date.slice(0, 4) : TODAY.getFullYear() + 2;
    const routes = [...D.rules_set, ...(parallel || [])];
    const ms = o => M.push(Object.assign({ status: "upcoming", hard_deadline: false, needs_verification: false, human_checkpoint: false, depends_on: [], route: "all" }, o));
    if (D.stage === "S1") {                                                 // S1 never sees a university roadmap (spec rule 4, guardrail 5)
      P.push({ id: "p0", title_i18n: "Habits", start: ymd(TODAY), end: ymd(addM(TODAY, 6)), goal_i18n: "A little reading, math and English every day. We check again in 6 months." });
      const r0 = Math.max(0, RUNGS.indexOf(D.math_tested || "arithmetic"));
      [["m_read", "Read 2 books a month in your language", 2], ["m_math", `Math: reach ${label("", RUNGS[Math.min(7, r0 + 1)])}`, 5], ["m_en100", "English: your first 100 words", 3],
       ["m_make", "Make something every week", 1], ["m_recheck", "Check-in: see how much you've grown", 6]].forEach(([id, t, mo]) => ms({ id, phase_id: "p0", kind: "habit", title_i18n: t, due: ymd(addM(TODAY, mo)), why: "Small steps every day add up." }));
      M.sort((a, b) => a.due.localeCompare(b.due)); M[0].status = "active";
      return { id: "rm1", profile_version: 1, archetype: null, phases: P, milestones: M, weekly_goals: [], generated_at: new Date().toISOString(), change_log: [{ at: ymd(TODAY), what_changed_i18n: "Created from your diagnostic." }, ...(S.changelog || [])] };
    }
    // phase 0: foundation (language first when a destination needs it)
    let b1 = null, langEnd = TODAY;
    if (need && CEFR.indexOf(eng) < CEFR.indexOf(need)) {
      let m = 0, prev = null;
      for (let i = CEFR.indexOf(eng); i < CEFR.indexOf(need); i++) {
        m += +GAP[`${CEFR[i]}->${CEFR[i + 1]}`] || 0; const lvl = CEFR[i + 1], id = `m_en_${lvl}`;
        ms({ id, phase_id: "p0", kind: "language", title_i18n: lvl === need ? `English ${lvl} and a certificate (IELTS or TOEFL)` : `English ${lvl}`, due: ymd(addM(TODAY, m)), depends_on: prev ? [prev] : [],
          why: lvl === "B1" ? "B1 unlocks your SAT and essay work. Before that, SAT money is wasted." : lvl === need ? "Your destinations ask for B2. The certificate must be done at least 8 weeks before your first deadline." : "Retest every 8–12 weeks; the plan adjusts to your real level." });
        if (lvl === "B1") b1 = id; prev = id;
      }
      langEnd = addM(TODAY, m);
      P.push({ id: "p0", title_i18n: "Foundation", start: ymd(TODAY), end: ymd(langEnd), goal_i18n: `English ${eng} → ${need}, about ${m} months at 5–7 hours a week (an estimate)` });
    } else P.push({ id: "p0", title_i18n: "Foundation", start: ymd(TODAY), end: ymd(addM(TODAY, 6)), goal_i18n: "Strong habits and your next math step" });
    const rung = RUNGS.indexOf(D.math_tested || A.m3_math_level_self || "algebra_1");
    if (rung >= 0 && rung < RUNGS.length - 1) ms({ id: "m_math_next", phase_id: "p0", kind: "math", title_i18n: `Math: reach ${label("", RUNGS[rung + 1])}`, due: ymd(addM(TODAY, 8)), why: "Your tested level decides this step, not your class." });
    // phase 1: build (hooks and activities)
    P.push({ id: "p1", title_i18n: "Build", start: ymd(addM(TODAY, 1)), end: `${gy - 1}-06-30`, goal_i18n: "Things only you did: olympiads, a real project, depth over breadth" });
    if ((A.m3_olympiads || []).length || rung >= 4) {
      ms({ id: "m_oly_reg", phase_id: "p1", kind: "olympiad", title_i18n: "Regional math olympiad", due: `${gy - 2}-03-01`, needs_verification: true, why: "Your olympiad result is your strongest hook. The date isn't in our checked rules yet, so you have a task to confirm it." });
      ms({ id: "m_oly_nat", phase_id: "p1", kind: "olympiad", title_i18n: "National math olympiad", due: `${gy - 1}-03-01`, needs_verification: true, depends_on: ["m_oly_reg"], why: "A national result changes how universities read your whole application." });
    }
    ms({ id: "m_project", phase_id: "p1", kind: "activity", title_i18n: "Start one project of your own", due: `${gy - 2}-06-30`, why: "Initiative beats a long list of clubs." });
    // phase 2: prepare, backward from the first hard deadline of each abroad route
    const us = routes.includes("US") ? firstDeadline("US", gy) : null, first = D.first_deadline || us;
    P.push({ id: "p2", title_i18n: "Prepare", start: `${gy - 1}-01-01`, end: first && first.date ? backW(first.date, 1) : `${gy - 1}-10-15`, goal_i18n: "Tests, essays, recommenders and your final list", locked_until: b1 ? { condition: "english_tested >= B1" } : undefined });
    if (routes.includes("US")) {
      const dl = us.date || `${gy - 1}-11-01`;
      ms({ id: "m_sat1", phase_id: "p2", kind: "test", title_i18n: "SAT: first sitting", due: `${gy - 1}-06-06`, depends_on: b1 ? [b1] : [], locked: !!b1, route: "US", why: "Tests must be done at least 6 weeks before your deadline, so there's room for one retake." });
      ms({ id: "m_sat2", phase_id: "p2", kind: "test", title_i18n: "SAT: retake if needed", due: backW(dl, 6), depends_on: ["m_sat1"], locked: !!b1, route: "US", why: "The last sitting that still counts for your early deadline." });
      ms({ id: "m_essays", phase_id: "p2", kind: "essay", title_i18n: "Essays drafted", due: backW(dl, 12), depends_on: b1 ? [b1] : [], locked: !!b1, route: "US", why: "Drafted 12 weeks ahead leaves time for real rewrites. We coach, we never write it for you." });
      ms({ id: "m_recs", phase_id: "p2", kind: "recs", title_i18n: "Ask your recommenders", due: backW(dl, 10), route: "US", why: "Teachers need at least 10 weeks." });
      ms({ id: "m_list", phase_id: "p2", kind: "list", title_i18n: "Final university list", due: backW(dl, 8), human_checkpoint: true, route: "US", why: "A counselor checks the list with you before it's final." });
      ms({ id: "m_ed", phase_id: "p2", kind: "ed", title_i18n: "Early decision or early action: your choice", due: backW(dl, 4), human_checkpoint: true, route: "US", why: "A binding choice. A counselor confirms it with you." });
    }
    // phase 3: apply (hard deadlines straight from the rules base; no rule -> a verify milestone)
    P.push({ id: "p3", title_i18n: "Apply", start: first && first.date ? backW(first.date, 2) : `${gy - 1}-10-15`, end: `${gy}-07-31`, goal_i18n: "Every deadline on time, with a counselor at the big decisions" });
    const rulesMs = id => {
      const r = rule(id); if (!r) return;
      for (const c of r.cycles || []) for (const d of c.deadlines || []) if (d.date && (+d.date.slice(0, 4) === gy || +d.date.slice(0, 4) === gy - 1))
        ms({ id: `m_${id}_${d.name.replace(/\W+/g, "_").slice(0, 24)}`, phase_id: "p3", kind: "deadline", title_i18n: `${{ US: "US", UK: "UK", DE: "Germany", UZ_HOME: "Uzbekistan" }[id] || id}: ${d.name}`, due: d.date,
          hard_deadline: true, source_rule_id: id, needs_verification: !!d.needs_verification || !!r.needs_verification, route: id, verified_at: r.verified_at, source_url: r.source_url,
          why: d.needs_verification || r.needs_verification ? "This date comes from our rules base but hasn't been confirmed for your cycle yet. It will never move silently." : "Confirmed from the official source." });
    };
    routes.forEach(id => { if (rule(id)) rulesMs(id); });
    const VER = { KR: ["GKS scholarship: application window", "South Korea"], TR: ["Türkiye Bursları: application window", "Türkiye"], DE: ["Germany: does your certificate need Studienkolleg? (anabin)", "Germany"] };
    routes.filter(id => VER[id] && !rule(id === "DE" ? "DE" : "__")).forEach(id => ms({ id: `m_verify_${id}`, phase_id: "p3", kind: "verify", title_i18n: `Verify: ${VER[id][0]}`, due: null, needs_verification: true, route: id,
      why: "We don't have a checked date for this yet, so we won't guess one. Check the official site and paste the link." }));
    if (routes.some(id => !["UZ_HOME"].includes(id))) ms({ id: "m_visa", phase_id: "p3", kind: "visa", title_i18n: "Visa paperwork", due: `${gy}-05-01`, human_checkpoint: true, needs_verification: true, why: "Visa rules change often. A counselor reviews your documents." });
    M.sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"));
    const act = M.find(m => !m.locked && m.kind !== "verify"); if (act) act.status = "active";
    const goals = act ? [0, 1, 2].map(i => { const w = new Date(TODAY); w.setDate(w.getDate() + 7 * i - ((w.getDay() + 6) % 7)); return { id: `w${i}`, milestone_id: act.id, week_start: ymd(w), target_i18n: act.kind === "language" ? ["3 video lessons and 1 vocabulary quiz", "2 lessons, 1 listening practice, 1 quiz", "Mini retest and 2 lessons"][i] : "Work on this milestone", hours_budget: Math.min(+A.m9_hours_per_week || 6, 6) }; }) : [];
    return { id: "rm1", profile_version: 1, archetype: null, phases: P, milestones: M, weekly_goals: goals, generated_at: new Date().toISOString(), change_log: [{ at: ymd(TODAY), what_changed_i18n: "Created from your diagnostic." }, ...(S.changelog || [])] };
  };
  JG_API.narrate = (R, A, D) => {                                          // stand-in for the LLM narrator (spec §5.2): only data from the roadmap
    const lang = R.milestones.find(m => m.kind === "language"), act = R.milestones.find(m => m.status === "active");
    if (D.stage === "S1") return { intro_i18n: "Your plan is about habits: a little reading, math and English every day. Every week you also make something of your own.", next_actions: JG_API.firstTasks(A, D).map(t => t.title_i18n), active: act };
    return { intro_i18n: lang ? `Your plan starts with English: from ${D.english_tested || "A0"} to B2 is ${R.phases[0].goal_i18n.split(", ")[1] || "a long road"}. While it grows, you build your math hook. SAT and essays unlock at English B1.` : "Your plan starts with your strongest subject and one project of your own.",
      next_actions: JG_API.firstTasks(A, D).map(t => t.title_i18n), active: act };
  };

  /* ---------- the map ---------- */
  const rv = document.createElement("div");
  rv.className = "jr-view"; rv.id = "jr-view"; rv.hidden = true;
  rv.setAttribute("role", "dialog"); rv.setAttribute("aria-modal", "true"); rv.setAttribute("aria-label", RT("Your roadmap"));   /* JG-PROD: owner 4 Oct P4g fix K2, the roadmap's name (the owner: "some students don't understand English"); the rest of the app's chrome stays English (D16); the demo reads the design's English */
  view.parentElement.appendChild(rv);
  let RM = null, route = "all";
  const ROUTE_N = { US: ["US", "United States"], UK: ["GB", "United Kingdom"], DE: ["DE", "Germany"], UZ_HOME: ["", "Uzbekistan (home)"], KR: ["KR", "South Korea"], TR: ["TR", "Türkiye"], JP: ["JP", "Japan"] };
  const rName = id => { const r = ROUTE_N[id]; return r ? `${r[0] ? flag(r[0]) : "🏠"} ${RT(r[1])}` : id; };   /* JG-PROD: owner 4 Oct P4g fix K2, the route chips' country names (the owner: "some students don't understand English"); the rest of the app's chrome stays English (D16); the demo reads the design's English */
  function roadmap() {
    const JE = window.JG_ENGINE && window.JG_ENGINE.cache.roadmap; if (!RM || (JE ? RM.id !== JE.id || RM.profile_version !== JE.profile_version : RM.profile_version !== (S.version || 1))) { D = derive(A); RM = JE ? window.JG_ENGINE.roadmap() : JG_API.plan(A, D, S.parallel || []); RM.profile_version = JE ? JE.profile_version : S.version || 1;   /* JG-PROD: S8, the server's roadmap, kept while its id and version hold; the ghost append below stays the page's own */
      (window.JG_ENGINE ? [] : S.ghostAdds || []).forEach((t, i) => RM.milestones.push({ id: `m_ghost_${i}`, phase_id: RM.phases[1] ? "p1" : "p0", kind: "activity", title_i18n: t, due: ymd(addM(TODAY, 3 + i)), status: "upcoming", hard_deadline: false, needs_verification: false, human_checkpoint: false, depends_on: [], route: "all", why: "From your ghost's real path. Make it yours." }));   /* JG-PROD: owner 4 Oct R13, no step from a sample student's path ("ghost") on a real student's roadmap, even one added before the ghost race was switched off */
      RM.milestones.sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999")); }
    return RM;
  }
  function openRoadmap() {
    if (!S.unlocked) { open(); return; }
    D = derive(A); const R = roadmap(), N = (window.JG_ENGINE && window.JG_ENGINE.narration()) || JG_API.narrate(R, A, D), routes = [...new Set([...D.rules_set, ...(S.parallel || [])])];   /* JG-PROD: S9, the server's narration */
    const shown = R.milestones.filter(m => route === "all" || m.route === route || m.route === "all");
    const reports = S.reports || {}, reviews = S.reviews || {};
    let lastYear = null;
    const body = R.phases.map(ph => {
      const items = shown.filter(m => m.phase_id === ph.id); if (!items.length) return "";
      return `<section class="jr-phase" aria-label="${esc(ph.title_i18n)}"><header class="jr-ph"><span class="jr-ph-n">${RT("Phase {n}", { n: R.phases.indexOf(ph) + 1 })}</span><b>${esc(ph.title_i18n)}</b><p>${esc(ph.goal_i18n)}</p><small>${rmM(ph.start)} – ${rmM(ph.end)}${ph.locked_until ? RT(" · SAT and essays unlock at English B1") : ""}</small></header>${"" /* JG-PROD: owner 4 Oct P4g fix K2, a phase's number and dates */}
        <ol class="jr-list">${items.map(m => {
          const y = m.due ? m.due.slice(0, 4) : null, yr = y && y !== lastYear ? `<li class="jr-year" aria-hidden="true">${y}</li>${ghostYear(y)}` : ""; if (y) lastYear = y;
          const st = m.locked ? "locked" : m.kind === "verify" ? "verify" : m.status;
          return `${yr}<li><button type="button" class="jr-m ${st}${m.hard_deadline ? " hard" : ""}" data-m="${m.id}"><i class="jr-node" aria-hidden="true"></i><span class="jr-mt"><b>${esc(m.title_i18n)}</b><small>${window.JG_ENGINE && m.status === "done" ? RT("✓ Done") : m.due ? (m.hard_deadline ? rmD(m.due) : RT("by {date}", { date: rmM(m.due) })) : RT("date being confirmed")}${m.route !== "all" ? ` · ${rName(m.route)}` : ""}</small>${"" /* JG-PROD: owner 4 Oct P4g fix K2, a step's date; owner 4 Oct P4g fix K3, a step already done (an official test taken) reads "✓ Done", not a date still to meet */}
            <span class="jr-tags">${st === "active" ? `<em class="t-now">${RT("Now")}</em>` : ""}${m.hard_deadline ? `<em class="t-hard">${RT("Hard deadline")}</em>` : ""}${m.needs_verification ? `<em class="t-ver">${RT(reports[m.id] ? "Reported · checking" : "Being confirmed")}</em>` : ""}${m.human_checkpoint ? `<em class="t-hum">${RT(reviews[m.id] ? "Review booked" : "Counselor review")}</em>` : ""}${m.locked ? `<em class="t-lock">${RT("🔒 After English B1")}</em>` : ""}</span></span></button></li>${"" /* JG-PROD: owner 4 Oct P4g fix K2, a step's tags */}`;
        }).join("")}</ol></section>`;
    }).join("");
    rv.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-r="close" aria-label="${RT("Close")}">‹</button><p class="dg-tt">${RT("Your roadmap")}${window.JG_PHASED ? window.JG_PHASED.badge() : ""}</p><button class="jr-upd" type="button" data-r="update">${RT("Update")}</button></div>${"" /* JG-PROD: owner 4 Oct P4g fix K2, the view's title bar */}${"" /* JG-PROD: owner 7 Oct P5e (spec §4.2 item 9, §6.1), the "Draft" badge while Phase D runs */}
      <div class="jr-body">${window.JG_PHASED ? window.JG_PHASED.draftLine() : ""}${"" /* JG-PROD: owner 7 Oct P5e (spec §4.2 item 9), the draft roadmap says so in a line */}
        <div class="jr-hero">${mascot("point", "jr-hero-img")}<div><p>${esc(N.intro_i18n)}</p><b class="jr-next-h">${RT("Your next 3 actions")}</b><ul>${N.next_actions.map(a => `<li>${esc(a)}</li>`).join("")}</ul></div></div>${"" /* JG-PROD: owner 4 Oct P4g fix K2, the next actions' heading */}
        ${ghostCard()}<div class="jr-routes" role="group" aria-label="${RT("Show routes")}"><button type="button" data-route="all" aria-pressed="${route === "all"}">${RT("All routes")}</button>${routes.map(id => `<button type="button" data-route="${id}" aria-pressed="${route === id}">${rName(id)}${D.rules_set.includes(id) ? RT(" · dream") : ""}</button>`).join("")}</div>${"" /* JG-PROD: owner 4 Oct P4g fix K2, the route filter */}
        ${R.change_log.length ? `<details class="jr-changed"><summary>${RT("What changed")} <span>${R.change_log.length}</span></summary>${R.change_log.map(c => `<p><b>${rmD(c.at)}</b> ${esc(c.what_changed_i18n)}</p>`).join("")}</details>` : ""}${"" /* JG-PROD: owner 4 Oct P4g fix K2, "What changed" and its dates */}
        ${body}
        <div class="jr-legend"><span><em class="t-hard">${RT("Hard deadline")}</em> ${RT("never moves silently")}</span><span><em class="t-ver">${RT("Being confirmed")}</em> ${RT("not yet checked at the official source")}</span><span><em class="t-hum">${RT("Counselor review")}</em> ${RT("a person confirms it with you")}</span></div>${"" /* JG-PROD: owner 4 Oct P4g fix K2, the legend */}
      </div>`;
    rv.style.zIndex = String(window.JIA_z ? window.JIA_z() : 72); rv.hidden = false; paintHome();
  }
  function sheet(id) {
    const m = roadmap().milestones.find(x => x.id === id); if (!m) return;
    const goals = (roadmap().weekly_goals || []).filter(g => g.milestone_id === id), rep = (S.reports || {})[id], rev = (S.reviews || {})[id];
    const src = m.hard_deadline ? (m.needs_verification ? RT("From our rules base ({rule}), not yet confirmed for your cycle. If it changes, you'll see it under \"What changed\".", { rule: m.source_rule_id }) : `${RT("Confirmed · {rule}", { rule: m.source_rule_id })}${m.verified_at ? RT(" · checked {date}", { date: rmD(m.verified_at) }) : ""}`) : RT(m.needs_verification ? "Not in our checked rules yet. You have a task to confirm it on the official site." : "Planned by your roadmap from your diagnostic.");   /* JG-PROD: owner 4 Oct P4g fix K2, a step's source, in its sheet (the owner: "some students don't understand English"); the rest of the app's chrome stays English (D16); the demo reads the design's English */
    const el = document.createElement("div"); el.className = "jr-sheet"; el.id = "jr-sheet";
    el.innerHTML = `<div class="jr-sheet-bg" data-r="shut"></div><div class="jr-card" role="dialog" aria-modal="true" aria-labelledby="jr-st">
      <p class="dg-mod">${esc(roadmap().phases.find(p => p.id === m.phase_id).title_i18n)}${m.route !== "all" ? ` · ${rName(m.route)}` : ""}</p>
      <h3 id="jr-st">${esc(m.title_i18n)}</h3><p class="jr-due">${window.JG_ENGINE && m.status === "done" ? RT("✓ Done") : m.due ? RT(m.hard_deadline ? "Deadline: {date}" : "By {date}", { date: rmD(m.due) }) : RT("Date being confirmed")}</p>${"" /* JG-PROD: owner 4 Oct P4g fix K2, the sheet's date; owner 4 Oct P4g fix K3, a step already done (an official test taken) reads "✓ Done", not a date still to meet */}
      <p class="jr-why">${esc(m.why || "")}</p>
      <div class="jr-src ${m.needs_verification ? "ver" : ""}"><b>${RT(m.needs_verification ? "Being confirmed" : "Source")}</b><p>${esc(src)}</p></div>${"" /* JG-PROD: owner 4 Oct P4g fix K2, the sheet's source heading */}
      ${m.locked ? `<p class="jr-lockmsg">${RT("🔒 Unlocks when your English check reaches B1.")}</p>` : ""}${"" /* JG-PROD: owner 4 Oct P4g fix K2, the sheet's lock */}
      ${m.depends_on.length ? `<p class="jr-dep">${RT("After: {list}", { list: m.depends_on.map(d => esc((roadmap().milestones.find(x => x.id === d) || {}).title_i18n || d)).join(", ") })}</p>` : ""}${"" /* JG-PROD: owner 4 Oct P4g fix K2, the sheet's "After:" */}
      ${goals.length ? `<b class="jr-next-h">${RT("This week and next")}</b><ul class="jr-goals">${goals.map(g => `<li><span>${RT("Week of {date}", { date: rmD(g.week_start) })}</span>${esc(g.target_i18n)} · ${RT("{n} h", { n: g.hours_budget })}</li>`).join("")}</ul>` : ""}${"" /* JG-PROD: owner 4 Oct P4g fix K2, the sheet's week goals */}
      <div class="jr-acts">
        ${m.human_checkpoint && !window.JG_ENGINE ? `<button class="dg-go" type="button" data-r="review" data-id="${id}"${rev ? " disabled" : ""}>${rev ? `${RT("Review booked")}${rev.who ? RT(" with {who} · {slot}", { who: esc(rev.who), slot: esc(rev.slot) }) : ""} ✓` : RT(S.reviewsUsed ? "Book a counselor review · 🪙 150" : "Book a counselor review · first one free")}</button>` : ""}${"" /* JG-PROD: owner 4 Oct P4g fix K2, the sheet's review button */}${"" /* JG-PROD: owner 20 Oct 2026 (M1 core 7, the controller's call): no counselor review for a live student: its counselors are invented and no booking exists; the coins one took are given back (src/server/core/refund.ts) */}
        ${m.due ? `<button class="dg-link" type="button" data-r="report" data-id="${id}"${rep ? " disabled" : ""}>${rep && window.JG_ENGINE && window.JG_ENGINE.reportLine ? esc(window.JG_ENGINE.reportLine(id)) : RT(rep ? "Reported. A reviewer is checking the official source." : "Report a wrong date")}</button>` : ""}${"" /* JG-PROD: owner 4 Oct P4g fix K2, the sheet's report button */}${"" /* JG-PROD: owner 20 Oct 2026 (M1 core 6): a live student reads where her report stands (saved, being checked, or the outcome: public/runtime/jg-core.js), never a reviewer nobody is */}
        <button class="dg-link" type="button" data-r="shut">${RT("Close")}</button>${"" /* JG-PROD: owner 4 Oct P4g fix K2, the sheet's close */}
      </div></div>`;
    el.style.zIndex = String(+rv.style.zIndex + 1); rv.appendChild(el);
    setTimeout(() => (el.querySelector(".dg-go:not(:disabled)") || el.querySelector("[data-r=shut].dg-link")).focus({ preventScroll: true }), 50);
  }
  rv.addEventListener("click", e => {
    const m = e.target.closest("[data-m]"); if (m) { sheet(m.dataset.m); return; }
    const rt = e.target.closest("[data-route]"); if (rt) { route = rt.dataset.route; const top = rv.querySelector(".jr-body").scrollTop; openRoadmap(); rv.querySelector(".jr-body").scrollTop = top; return; }
    const b = e.target.closest("[data-r]"); if (!b || b.disabled) return;
    const a = b.dataset.r, sh = $("jr-sheet");
    if (a === "close") { rv.hidden = true; paintHome(); }
    else if (a === "redo") { rv.hidden = true; open(); }
    else if (a === "update") updateSheet();
    else if (a === "shut") { if (sh) sh.remove(); }
    else if (a === "report") { S.reports = Object.assign({}, S.reports, { [b.dataset.id]: ymd(new Date()) }); save(); if (window.JG_ENGINE) window.JG_ENGINE.report(b.dataset.id); if (sh) sh.remove(); openRoadmap(); sheet(b.dataset.id); }   /* JG-PROD: S10, the report also goes to the review queue */
    else if (a === "review") { if (sh) sh.remove(); book(b.dataset.id); }
  });
  rv.addEventListener("keydown", e => { if (e.key === "Escape") { e.preventDefault(); const sh = $("jr-sheet"); if (sh) sh.remove(); else { rv.hidden = true; paintHome(); } } });
  window.JG_openRoadmap = openRoadmap;

  /* ================= TODAY: the day's four tasks come from the roadmap (mock task writer, spec §5.3) ================= */
  const DEEP_ORDER = ["M10", "M6", "M8", "M4", "M5", "M7", "M3", "M9", "M2", "M1", "M11"];   // the Deep modules become week-1 tasks   /* JG-PROD: owner 3 Oct R1 R13, what left the first run stays reachable from S2 on (src/engine/tasks.ts) */
  const deepQs = id => { const c = window.JG_PHASED && window.JG_PHASED.flow(id, QB, q => visible(q, A, window.JG_PHASED.derived(D))); if (c) return c.map(x => x.q); const m = QB.modules.find(x => x.id === id); return m ? m.questions.filter(q => !q.core && visible(q, A, D)) : []; };   /* JG-PROD: owner 7 Oct P5e (spec §4.2 item 3), a chunk is the server's question ids */   /* JG-PROD: owner 7 Oct P5e review 5, only the chunk's questions still visible */   /* JG-PROD: owner 7 Oct P5 fix (spec §4.2 item 3), in the server's order and by its stage, as flow() asks them */
  const REST_DAY = 0;                                                      // Sunday: at least one rest day a week, never breaks the streak
  const dayOf = () => ymd(new Date());
  function taskState() { S.days = S.days || {}; const k = dayOf(); S.days[k] = S.days[k] || { done: [], proofs: {} }; if (window.JG_ENGINE) { const e = window.JG_ENGINE.done(k); e.ids.forEach(id => { if (!S.days[k].done.includes(id)) { S.days[k].done.push(id); S.days[k].proofs[id] = e.proofs[id]; } }); } return S.days[k]; }   /* JG-PROD: S11, today's completions on the other device or by the parent's answer count here too */
  JG_API.dailyTasks = (A, D, R, date) => {
    const kid = D.stage === "S1", phone = (A.m9_devices || []).includes("phone_only");
    const budget = Math.round((+A.m9_hours_per_week || 6) * 60 / 6), cap = phone ? 20 : 30, out = [];
    const t = (o) => out.push(Object.assign({ id: `${date}_${out.length}`, date, generated_by: "code" }, o, { est_minutes: Math.min(cap, o.est_minutes) }));
    const act = R.milestones.find(m => m.status === "active"), lang = R.milestones.find(m => m.kind === "language" && !m.locked);
    if (kid) {
      t({ type: "study", short: "Read", title_i18n: "Read for 15 minutes", instructions_i18n: "Any book you like, in your own language. Tell us the title when you finish.", est_minutes: 15, verification: "self_report", coins: 10, milestone_id: "m_read" });
      t({ type: "practice", short: "Math", title_i18n: "3 math puzzles", instructions_i18n: "Solve the puzzles. Take your time.", est_minutes: 10, verification: "quiz", quiz: "math", coins: 10, milestone_id: "m_math" });
      t({ type: "practice", short: "English", title_i18n: "5 new English words", instructions_i18n: "Learn them, then match them in the quiz.", est_minutes: 10, verification: "quiz", quiz: "english", coins: 10, milestone_id: "m_en100" });
      t({ type: "create", short: "Make", title_i18n: "Make something small", instructions_i18n: "A drawing, a model, a tiny program. Add a photo of it.", est_minutes: 20, verification: "upload", coins: 15, milestone_id: "m_make" });
      return out;
    }
    if (lang) t({ type: "practice", short: "English", title_i18n: `English: lesson ${1 + (S.lessons || 0)} and a quick quiz`, instructions_i18n: `Open Video Lessons → English ${D.english_tested || "A1"}, lesson ${1 + (S.lessons || 0)}${phone ? " (works on your phone)" : ""}. Then answer 3 quick questions.`, est_minutes: 15, verification: "quiz", quiz: "english", coins: 10, milestone_id: lang.id });
    const oly = R.milestones.find(m => m.kind === "olympiad" && m.needs_verification && !(S.proofs || {})[m.id]);
    if (oly) t({ type: "verify", short: "Verify", title_i18n: `Find the ${oly.title_i18n.toLowerCase()} date`, instructions_i18n: "Find the official page for your region's round and paste the link. We mark the date as confirmed once it's checked.", est_minutes: 10, verification: "link", coins: 15, milestone_id: oly.id });
    else t({ type: "practice", short: "Math", title_i18n: "Math: 3 practice problems", instructions_i18n: "Problems at your tested level. Show your working on paper.", est_minutes: 15, verification: "quiz", quiz: "math", coins: 10, milestone_id: (R.milestones.find(m => m.kind === "math") || {}).id });
    if (!(S.parent_sent) && A.m8_parent_attitude !== "fully_supportive") t({ type: "contact", short: "Parent", title_i18n: "Send the parent check", instructions_i18n: "Share the link with a parent. It takes them about 3 minutes and completes by itself when they answer.", est_minutes: 5, verification: "auto_event", coins: 20, milestone_id: null });
    const mod = DEEP_ORDER.find(id => !(S.deepDone || []).includes(id) && deepQs(id).length);
    if (mod && out.length < 4) { const m = QB.modules.find(x => x.id === mod); t({ type: "reflect", short: "Profile", title_i18n: `Finish your profile: ${m.name}`, instructions_i18n: `${deepQs(mod).length} short questions. They make your plan more accurate.`, est_minutes: Math.max(4, Math.ceil(deepQs(mod).length * .8)), verification: "self_report", deep: mod, coins: 15, milestone_id: null }); }
    if (out.length < 4) t({ type: "reflect", short: "Reflect", title_i18n: "Write 5 sentences: what did you learn this week?", instructions_i18n: "Any language. We use it to shape your tasks, not to grade you.", est_minutes: 10, verification: "self_report", coins: 10, milestone_id: act ? act.id : null });
    let sum = out.reduce((n, x) => n + x.est_minutes, 0);                  // the day's budget: trim the longest tasks first
    while (sum > budget && out.some(x => x.est_minutes > 5)) { const x = out.reduce((a, b) => (b.est_minutes > a.est_minutes ? b : a)); x.est_minutes -= 5; sum -= 5; }
    return out.slice(0, 4);
  };
  const QUIZ = (window.JG_DESIGN_BANKS || {}).quiz || { english: [],   /* JG-PROD: owner 7 Oct A4, the quiz's keys and whys leave the page: the server grades it and says an item's why once it is answered; only /preview hands the page its quiz; was owner 4 Oct R9, each item's one-line why (4th element; = en.json quiz.*.why) */
    math: [] }, QUIZ_W = { correct: "Correct", wrong: "Not this time", answer: "Right answer: {{answer}}.", next: "Next", result: "See my result" };   /* JG-PROD: owner 4 Oct R9, the words after an answer; a real student's task brings them in their language; owner 7 Oct A4, the quiz's items from the server */

  let TT = null;                                                           // today's tasks
  function todayTasks() { if (!S.unlocked && !(window.JG_PHASED && window.JG_PHASED.active())) return null; const k = dayOf(); if (window.JG_ENGINE) return window.JG_ENGINE.tasks(k); if (!TT || TT.date !== k) { D = derive(A); TT = { date: k, list: JG_API.dailyTasks(A, D, roadmap(), k) }; } return TT.list; }   /* JG-PROD: S12, today's tasks are the server's rows (stable ids, spec §3.2) */   /* JG-PROD: owner 7 Oct P5e (spec §4.2 item 1), Phase D's tasks start with the first run, before the roadmap is unlocked */
  function paintToday() {
    const list = todayTasks(), T = window.JIA_today; if (!list || !T) return;
    const st = taskState();
    list.forEach((task, i) => {
      T.name(i, task.short); const el = T.tile(i); if (!el) return;
      el.setAttribute("role", "button"); el.tabIndex = 0; el.dataset.jt = i; el.classList.add("jt-on");
      el.setAttribute("aria-label", `${task.title_i18n}, ${task.est_minutes} minutes, ${task.coins} coins${st.done.includes(task.id) ? ", done" : ""}`);
    });
    (list => { if (window.JG_ENGINE && T.count) T.count(list.length); if (window.JG_ENGINE && T.done) T.done(list.map(t => st.done.includes(t.id))); T.startAt(Math.min(100, window.JG_ENGINE ? list.filter(t => st.done.includes(t.id)).length * 100 / Math.max(1, list.length) : st.done.length * 25), !paintToday.synced); })((l => { const n = l.findIndex(t => t.optional); return n > 0 && l.slice(n).every(t => t.optional) ? l.slice(0, n) : l; })(list)); paintToday.synced = true;   /* JG-PROD: P4d re-walk F2, a real student's Dome has today's tasks as its tiles and fills by their share done (the demo: × 25, as drawn) */   /* JG-PROD: owner 10 Oct (delegated call), a tile ticks when its own task is done: a real student's Dome gets each task's own done flag (the same completions the share done counts); the demo none, as drawn */   /* JG-PROD: owner 10 Oct (delegated call, teen walk), my four tiles are my own work: an optional item after the day's own tasks (the parent's questionnaire, beside the day) is no tile and no part of the share done, so the Dome fills on the student's own tasks; a rest day (all optional) and the demo as drawn */
    const wk = $("jt-week"); if (wk) wk.remove();
    const tasksEl = $("wd-tasks"); if (!tasksEl) return;
    const now = new Date(), mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const days = [...Array(7)].map((_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
    tasksEl.insertAdjacentHTML("afterend", `<div class="jt-week" id="jt-week" aria-label="This week">${days.map(d => { const k = ymd(d), dn = (S.days || {})[k], rest = window.JG_ENGINE ? !!((((window.JG_ENGINE.cache || {}).week || {}).days || []).find(x => x.date === k) || {}).rest : d.getDay() === REST_DAY, today = k === dayOf(), full = dn && dn.done.length >= 4;   /* JG-PROD: I2, the server's rest days (cadence), Sunday only without the engine (final review runtime I2) */
      return `<span class="${today ? "today " : ""}${rest ? "rest " : ""}${full ? "full" : ""}" title="${rest ? "Rest day: your streak is safe" : ""}"><small>${"MTWTFSS"[(d.getDay() + 6) % 7]}</small><i aria-hidden="true">${rest ? "🌙" : full ? "✓" : ""}</i><span class="sr-only">${d.toLocaleDateString("en-US", { weekday: "long" })}${rest ? ", rest day" : full ? ", done" : today ? ", today" : ""}</span></span>`; }).join("")}
      <b class="jt-streak" id="jt-streak" hidden></b><button type="button" class="jt-freeze" id="jt-freeze" title="Streak freeze">🧊 Freeze</button></div>`);   /* JG-PROD: owner 10 Oct (delegated call, teen walk), the streak's number stands by the week strip: an empty, hidden place that public/runtime/jg-real.js fills for a real student ("no streak number anywhere on Home"); the demo family's row is as drawn */
    $("jt-freeze").onclick = () => { if (window.JIA_openShop) window.JIA_openShop(); };
  }
  function markDone(task, proof, answers) {   /* JG-PROD: S13, a quiz's chosen options travel with the completion */
    const st = taskState(); if (st.done.includes(task.id)) return;
    st.done.push(task.id); st.proofs[task.id] = proof || "done"; if (task.verification === "link" && task.milestone_id) S.proofs = Object.assign({}, S.proofs, { [task.milestone_id]: proof });
    if (task.quiz === "english") S.lessons = (S.lessons || 0) + 1;
    save(); if (window.JG_ENGINE) window.JG_ENGINE.completeTask(task, proof, answers); if (window.JIA_coins && window.JIA_coins.add) try { window.JIA_coins.add(task.coins); } catch (e) {}   /* JG-PROD: S13, the server checks the proof and pays the task's coins once; the local add stays as the animation */
    if (window.JIA_today) window.JIA_today.complete();
    setTimeout(paintToday, 1800);
  }
  const VER = { quiz: "Quick quiz", link: "Paste a link", upload: "Add a photo", self_report: "Tick when done", auto_event: "Completes by itself" };
  function taskSheet(i) {
    const list = todayTasks(); if (!list) return; const task = list[i], st = taskState(), done = st.done.includes(task.id);
    const ms = task.milestone_id && roadmap().milestones.find(m => m.id === task.milestone_id);
    const old = $("jt-sheet"); if (old) old.remove();
    const el = document.createElement("div"); el.className = "jr-sheet jt-sheet"; el.id = "jt-sheet";
    el.innerHTML = `<div class="jr-sheet-bg" data-t="shut"></div><div class="jr-card" role="dialog" aria-modal="true" aria-labelledby="jt-h">
      <p class="dg-mod">${TASK_I[task.type] || "•"} ${esc(task.type)} · ${task.est_minutes} min · 🪙 ${task.coins}</p>
      <h3 id="jt-h">${esc(task.title_i18n)}</h3><p class="jr-why">${esc(task.instructions_i18n)}</p>
      ${ms ? `<p class="jt-adv">Moves you toward: <b>${esc(ms.title_i18n)}</b>${ms.due ? ` · by ${fmtM(ms.due)}` : ""}</p>` : ""}
      <div class="jt-proof" id="jt-proof"></div>${done ? "" : `<button class="dg-link jt-study" type="button" data-t="study">🧱 Study this in the Study Room</button>`}</div>`;
    view.parentElement.appendChild(el);
    el.style.zIndex = String(window.JIA_z ? window.JIA_z() : 80);
    const box = $("jt-proof"), finish = (proof, answers) => { box.innerHTML = `<p class="jt-ok">✓ Done · 🪙 +${task.coins}</p>`; markDone(task, proof, answers); setTimeout(() => el.remove(), 900); };   /* JG-PROD: S13 */
    if (done && !(window.JG_HW && window.JG_HW.fixes && window.JG_HW.fixes(task))) box.innerHTML = `<p class="jt-ok">✓ Done today</p><button class="dg-link" type="button" data-t="shut">Close</button>`;   /* JG-PROD: owner 18 Oct 2026, [p15#7] a homework set handed in with corrections left opens its corrections from its task (public/runtime/jg-hw.js fixes, then the quiz below), not "Done today" */
    else if (task.verification === "quiz" && !window.JG_DESIGN_BANKS) { if (window.JG_CHECKS) window.JG_CHECKS.quiz(task, box, { finish, esc, label: VER.quiz, words: QUIZ_W }); } else if (task.verification === "quiz") {   /* JG-PROD: owner 7 Oct A4, the server serves the quiz without its keys, grades each answer and says its why after it (public/runtime/jg-checks.js); the design's own below, for /preview */
      const qs = QUIZ[task.quiz] || QUIZ.english, QF = window.JG_ENGINE && window.JG_ENGINE.cache && window.JG_ENGINE.cache.quiz_feedback, why = (QF && QF.why[QUIZ[task.quiz] ? task.quiz : "english"]) || qs.map(q => q[3]), W = (QF && QF.words) || QUIZ_W; let k = 0, right = 0, picks = [];   /* JG-PROD: S13, the options chosen, which the server grades (spec §6); owner 4 Oct R9, the why and the words in the student's language (the design's English without the engine) */
      const step = () => {
        if (k >= qs.length) { if (right >= 2) finish(`quiz ${right}/3`, picks); else { box.innerHTML = `<p class="jt-miss">${right} of 3. Almost! Review the lesson and try again.</p><button class="dg-go" type="button" data-t="retry">Try again</button>`; } return; }   /* JG-PROD: S13 */
        const it = qs[k], order = shuffle([0, 1, 2]);
        box.innerHTML = `<b class="jr-next-h">${VER.quiz} · ${k + 1} of 3</b><p class="jt-q">${esc(it[0])}</p><div class="dg-opts">${order.map(j => `<button type="button" class="dg-opt" data-j="${j}"><span>${esc(it[1][j])}</span></button>`).join("")}</div>`;
      };
      box.onclick = e => { const b = e.target.closest("[data-j]"); if (b && !b.disabled && picks.length === k) { picks[k] = +b.dataset.j; const it = qs[k], ok = picks[k] === it[2]; if (ok) right++; box.querySelectorAll(".dg-opt").forEach(o => { o.disabled = true; if (+o.dataset.j === it[2]) o.classList.add("ok"); else if (o === b) o.classList.add("bad"); }); box.querySelector(".dg-opts").insertAdjacentHTML("afterend", `<div class="jd-res ${ok ? "ok" : "bad"}" role="status"><b>${esc(ok ? W.correct : W.wrong)}</b><p>${ok ? "" : `${esc(W.answer.replace("{{answer}}", () => it[1][it[2]]))} `}${esc(why[k] || "")}</p></div><button class="dg-go" type="button" data-t="qnext">${esc(k + 1 >= qs.length ? W.result : W.next)}</button>`); box.querySelector("[data-t=qnext]").focus(); } if (e.target.closest("[data-t=qnext]")) { k++; step(); } if (e.target.closest("[data-t=retry]")) { k = 0; right = 0; picks = []; step(); } };   /* JG-PROD: S13; owner 4 Oct R9, each answer is marked (the design's JG Daily .dg-opt.ok/.bad and .jd-res) with the right answer and a one-line why, and Next moves on; 2 of 3 still passes (896) */
      step();
    } else if (task.verification === "link") {
      box.innerHTML = `<b class="jr-next-h">${VER.link}</b><input class="dg-field" type="url" id="jt-url" placeholder="https://" inputmode="url"><p class="dg-hint" id="jt-uh">${window.JG_ENGINE && !(window.JG_BOOT && JG_BOOT.core && JG_BOOT.core.staffed) ? "The official page with the date." : "The official page with the date. A reviewer confirms it."}</p><button class="dg-go" type="button" data-t="link" disabled>Submit link</button>`;   /* JG-PROD: owner 20 Oct 2026 (M1 core 8): no reviewer is promised while no counselor is on staff (boot.core.staffed) */
      const u = $("jt-url"), b = box.querySelector("[data-t=link]"), ok = () => /^https?:\/\/[^\s/]+\.[^\s]{2,}/.test(u.value.trim());
      u.oninput = () => { b.disabled = !ok(); }; b.onclick = () => ok() && finish(u.value.trim());
    } else if (task.verification === "upload") {
      box.innerHTML = `<b class="jr-next-h">${VER.upload}</b><label class="dg-drop"><input type="file" accept="image/*"><span class="dg-drop-i">📷</span><b>Take a photo or choose one</b><small>${window.JG_ENGINE && !(window.JG_BOOT && JG_BOOT.core && JG_BOOT.core.staffed) ? "Only you can see it." : "Only you and your counselor can see it."}</small></label>`;   /* JG-PROD: owner 20 Oct 2026 (M1 core 8): no counselor is named while none is on staff */
      box.querySelector("input").onchange = e => { if (e.target.files[0]) finish(e.target.files[0].name); };
    } else if (window.JG_PHASED && window.JG_PHASED.sheet(task, box, { start: () => { el.remove(); S.deep = task.deep; S.deepTask = i; const F0 = flow(); S.at = F0.length ? F0[0].q.id : null; save(); if (!F0.length) return deepDone(); view.style.zIndex = String(window.JIA_z ? window.JIA_z() : 80); view.hidden = false; render(); }, check: P => { el.remove(); view.style.zIndex = String(window.JIA_z ? window.JIA_z() : 80); view.hidden = false; sub = "test"; return Object.assign({ view, frame: testFrame, mcq, T, esc, readLang, done: res => { if (res && task.reading === 1) A.reading_check = res; close(); window.JG_PHASED.refresh(); } }, P); }, close: () => { el.remove(); paintToday(); } })) { } else if (task.verification === "auto_event") {   /* JG-PROD: owner 7 Oct P5e (spec §4.2 items 3, 6, 8; §2.5), a chunk (start or skip), a check set and the reading check's stages as tasks (public/runtime/jg-phased.js) */   /* JG-PROD: owner 7 Oct P5 fix (spec §4.2 item 3), Start opens the chunk at its first question as flow() orders it (it opened at the server's first id, and the questions the design's bank keeps before it were never asked) */
      const sent = S.parent_sent, FS = window.JG_ENGINE && window.JG_RUNTIME && window.JG_RUNTIME.familyShare ? window.JG_RUNTIME.familyShare(A.m0_roadmap_language) : null;   /* JG-PROD: owner 4 Oct R8, a real student shares the real parent link (Telegram or copy); the demo keeps the design's button */
      box.innerHTML = (FS ? `${sent ? `<p class="jt-wait">Sent. It completes by itself when your parent answers.</p>` : ""}<div class="jd-share"><code>${esc(FS.url)}</code><button class="dg-go" type="button" data-t="ptg">${esc(FS.telegram)}</button><button class="dg-link" type="button" data-t="pcopy">${esc(FS.copy)}</button></div><p class="dg-hint">${esc(FS.valid)}</p>` : sent ? `<p class="jt-wait">Sent. It completes by itself when your parent answers.</p>` : `<button class="dg-go" type="button" data-t="send">Send the link to my parent</button>`) + (sent && window.JG_ENGINE ? "" : `<button class="dg-link" type="button" data-t="parentview">${sent ? "Demo: answer as my parent" : "See what your parent will see"}</button>`);   /* JG-PROD: owner 4 Oct R8, the link itself, sent in Telegram or copied, before and after "Sent" (to send again); no "Demo: answer as my parent" for a real student */
      box.onclick = async e => {
        if (e.target.closest("[data-t=send]")) { const url = location.origin + "/join/" + JG_BOOT.familyCode, text = "Please answer 5 quick questions for my Jamals Global roadmap:"; try { if (navigator.share) await navigator.share({ text, url }); else await navigator.clipboard.writeText(`${text} ${url}`); } catch (err) {} S.parent_sent = true; save(); taskSheet(i); } const pb = FS && e.target.closest("[data-t=ptg],[data-t=pcopy]"); if (pb && await window.JG_RUNTIME.sendFamilyLink(pb.dataset.t === "ptg" ? "telegram" : "copy", pb, A.m0_roadmap_language) && !S.parent_sent) { S.parent_sent = true; save(); setTimeout(() => { if (el.isConnected) taskSheet(i); }, pb.dataset.t === "pcopy" ? 1200 : 0); } /* JG-PROD: real family link; owner 4 Oct R8, "Sent" only once the link has left: Telegram opened or the link copied */
        if (e.target.closest("[data-t=parentview]")) { el.remove(); openParent(); }
      };
    } else if (task.deep && D.age != null && D.age < 14 && !(S.parent && S.parent.consent)) {   // under 14: a parent says OK before the Deep modules
      box.innerHTML = `<p class="jt-gate">You're under 14, so a parent says OK first. Send them the parent check; this unlocks as soon as they agree.</p><button class="dg-link" type="button" data-t="parentview">See what your parent will see</button>`;
      box.onclick = e => { if (e.target.closest("[data-t=parentview]")) { el.remove(); openParent(); } };
    } else if (task.deep) {
      box.innerHTML = `<button class="dg-go" type="button" data-t="deep">Start · ${deepQs(task.deep).length} questions</button>`;
      box.querySelector("[data-t=deep]").onclick = () => { el.remove(); S.deep = task.deep; S.deepTask = i; S.at = deepQs(task.deep)[0].id; save(); view.style.zIndex = String(window.JIA_z ? window.JIA_z() : 80); view.hidden = false; render(); };
    } else {
      box.innerHTML = `<b class="jr-next-h">${VER.self_report}</b><textarea class="dg-text" rows="3" placeholder="Optional: a line about what you did"></textarea><button class="dg-go" type="button" data-t="did">I did it</button>`;
      box.querySelector("[data-t=did]").onclick = () => finish(box.querySelector("textarea").value.trim() || "self report");
    }
    el.addEventListener("click", e => { if (e.target.closest("[data-t=shut]")) el.remove(); if (e.target.closest("[data-t=study]")) { el.remove(); openStudy({ task }); } });
    el.addEventListener("keydown", e => { if (e.key === "Escape") el.remove(); });
    setTimeout(() => { const f = el.querySelector(".dg-go:not(:disabled), .dg-opt, input, [data-t=shut].dg-link"); if (f) f.focus({ preventScroll: true }); }, 60);
  }
  function deepDone(ok) { if (window.JG_ENGINE && !ok) { if (view._busy) return; view._busy = true; const m = QB.modules.find(x => x.id === S.deep), ans = {}, c = window.JG_PHASED && window.JG_PHASED.qids(S.deep); (c ? QB.modules.flatMap(x => x.questions).filter(q => c.includes(q.id)) : m ? m.questions.filter(q => !q.core) : []).forEach(q => { if (A[q.id] !== undefined) ans[q.id] = A[q.id]; }); window.JG_ENGINE.commit("deep_done", { module: S.deep, answers: ans }).then(r => { view._busy = false; if (r && r.snapshot) deepDone(true); }); return; }   /* JG-PROD: S7, a finished Deep module is a server commit that completes its task; under 14 it needs a parent's consent (spec §4.1) */   // a Deep module finished: the week-1 task is done   /* JG-PROD: owner 7 Oct P5e (spec §4.2 item 3), a chunk sends its own questions' answers */
    const mod = S.deep, i = S.deepTask; S.deepDone = [...new Set([...(S.deepDone || []), mod])]; S.deep = null; S.deepTask = null; save();
    view.hidden = true; const list = todayTasks(); if (list && list[i]) markDone(list[i], `profile ${mod}`);
  }
  const wt = $("wd-tasks");
  if (wt) {
    wt.addEventListener("click", e => { const li = e.target.closest("[data-jt]"); if (li && (S.unlocked || (window.JG_PHASED && window.JG_PHASED.active()))) taskSheet(+li.dataset.jt); }); JG_API.openTask = i => { if ((S.unlocked || (window.JG_PHASED && window.JG_PHASED.active())) && (todayTasks() || [])[i]) taskSheet(i); };   /* JG-PROD: owner 4 Oct R1, a Today row opens the same task sheet as its Home tile; P4d re-walk F6, only a row today still has (a tap after midnight, before the new-day reload, is ignored) */   /* JG-PROD: owner 7 Oct P5e (spec §4.2 item 1), a Phase D task opens before the roadmap is unlocked */
    wt.addEventListener("keydown", e => { const li = e.target.closest("[data-jt]"); if (li && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); taskSheet(+li.dataset.jt); } });
  }
  const pvT = document.querySelector('.pv [data-act="task"]');             // the preview button completes the next engine task too
  if (pvT) pvT.addEventListener("click", () => { const list = todayTasks(); if (!list) return; const st = taskState(), next = list.find(x => !st.done.includes(x.id)); if (next) { st.done.push(next.id); st.proofs[next.id] = "demo"; save(); setTimeout(paintToday, 1800); } }, true);
  paintToday();

  /* ================= PART 4: parents, counselors, and "what changed" ================= */
  /* ---------- the parent check: consent first, 5 questions, three languages ---------- */
  const KID = JG_ME.firstName, KID_RU = JG_ME.firstName; /* JG-PROD: identity */
  const PT = {
    en: { brand: "Jamals Global · for parents", hi: `${KID} asked you to answer 5 short questions`, time: "It takes about 3 minutes.", why: `Your answers help plan ${KID}'s path to university realistically.`,
      priv: window.JG_ENGINE ? `Only you and ${KID} see your answers. We never share or sell them.${window.JG_BOOT && JG_BOOT.core && JG_BOOT.core.m1 ? " You can delete them anytime in the parent app." : ""}` : `Only you, ${KID} and his counselor see your answers. We never share or sell them. You can delete them anytime.`, agree: `I agree that ${KID} uses Jamals Global and that these answers are stored.`,   /* JG-PROD: owner 20 Oct 2026 (M1 core 2): a live family is promised no counselor, and a deletion only where the parent app has it (CORE_M1, src/server/core/family-data.ts) */
      start: "Start", next: "Continue", back: "Back", of: (i, n) => `Question ${i} of ${n}`, done: "Thank you!", doneP: `${KID}'s roadmap now uses your answers.`, doneS: "You can follow his progress in the parent panel.", close: "Close",
      q: ["How much can the family pay per year for university?", "Savings set aside for education (optional)", "Can the family document its income? (tax records, bank statements, an employer letter)", "Would the family take an education loan?", `How do you feel about ${KID} studying abroad?`],
      hint: ["In your currency. If you're not sure, a rough amount is fine.", "", "", "Many countries need a local co-signer.", ""],
      o: { none: "None", under_10k: "Under $10,000", "10k_50k": "$10,000 – $50,000", "50k_150k": "$50,000 – $150,000", over_150k: "Over $150,000", prefer_not_to_say: "I'd rather not say", yes: "Yes", partially: "Partly", no: "No", dont_know: "I don't know", maybe: "Maybe",
        fully_supportive: "I fully support it", conditional: "I support it, with conditions", hesitant: "I'm not sure yet", against: "I'm against it" } },
    uz: { brand: "Jamals Global · ota-onalar uchun", hi: `${KID} sizdan 5 ta qisqa savolga javob berishingizni so'radi`, time: "Taxminan 3 daqiqa vaqt oladi.", why: `Javoblaringiz ${KID}ning universitetga yo'lini real rejalashtirishga yordam beradi.`,
      priv: window.JG_ENGINE ? `Javoblaringizni faqat siz va ${KID} koʻrasiz. Ular hech kimga berilmaydi va sotilmaydi.${window.JG_BOOT && JG_BOOT.core && JG_BOOT.core.m1 ? " Ularni ota-onalar ilovasida istalgan vaqtda oʻchirishingiz mumkin." : ""}` : `Javoblaringizni faqat siz, ${KID} va uning maslahatchisi ko'radi. Ular hech kimga berilmaydi va sotilmaydi. Istalgan vaqtda o'chirib yuborishingiz mumkin.`, agree: `${KID}ning Jamals Global'dan foydalanishiga va bu javoblar saqlanishiga roziman.`,   /* JG-PROD: owner 20 Oct 2026 (M1 core 2): the same in Uzbek */
      start: "Boshlash", next: "Davom etish", back: "Orqaga", of: (i, n) => `${n} ta savoldan ${i}-si`, done: "Rahmat!", doneP: `${KID}ning yo'l xaritasi endi sizning javoblaringizga asoslanadi.`, doneS: "Uning natijalarini ota-onalar panelida kuzatib borishingiz mumkin.", close: "Yopish",
      q: ["Oila universitet uchun yiliga qancha to'lay oladi?", "Ta'lim uchun ajratilgan jamg'arma (ixtiyoriy)", "Oila daromadini hujjat bilan tasdiqlay oladimi? (soliq ma'lumotlari, bank ko'chirmasi, ish joyidan ma'lumotnoma)", "Oila ta'lim krediti olishga tayyormi?", `${KID}ning chet elda o'qishiga qanday qaraysiz?`],
      hint: ["O'z valyutangizda. Aniq bilmasangiz, taxminiy summa ham bo'ladi.", "", "", "Ko'p davlatlarda mahalliy kafil talab qilinadi.", ""],
      o: { none: "Yo'q", under_10k: "10 000 dollardan kam", "10k_50k": "10 000 – 50 000 dollar", "50k_150k": "50 000 – 150 000 dollar", over_150k: "150 000 dollardan ko'p", prefer_not_to_say: "Aytmaslikni afzal ko'raman", yes: "Ha", partially: "Qisman", no: "Yo'q", dont_know: "Bilmayman", maybe: "Balki",
        fully_supportive: "To'liq qo'llab-quvvatlayman", conditional: "Ba'zi shartlar bilan qo'llab-quvvatlayman", hesitant: "Hali ikkilanyapman", against: "Qarshiman" } },
    ru: { brand: "Jamals Global · для родителей", hi: `${KID_RU} просит вас ответить на 5 коротких вопросов`, time: "Это займёт около 3 минут.", why: `Ваши ответы помогут реалистично спланировать путь ${KID_RU}а в университет.`,
      priv: window.JG_ENGINE ? `Ваши ответы видите только вы и ${KID_RU}. Мы никому их не передаём и не продаём.${window.JG_BOOT && JG_BOOT.core && JG_BOOT.core.m1 ? " Удалить их можно в любой момент в приложении для родителей." : ""}` : `Ваши ответы видят только вы, ${KID_RU} и его консультант. Мы никому их не передаём и не продаём. Вы можете удалить их в любой момент.`, agree: `Я согласен(на), чтобы ${KID_RU} пользовался Jamals Global и чтобы эти ответы сохранялись.`,   /* JG-PROD: owner 20 Oct 2026 (M1 core 2): the same in Russian */
      start: "Начать", next: "Далее", back: "Назад", of: (i, n) => `Вопрос ${i} из ${n}`, done: "Спасибо!", doneP: `Теперь план ${KID_RU}а учитывает ваши ответы.`, doneS: "Следить за его успехами можно в родительской панели.", close: "Закрыть",
      q: ["Сколько семья может платить за университет в год?", "Сбережения, отложенные на образование (необязательно)", "Может ли семья подтвердить доход документами? (налоговые данные, выписки из банка, справка с работы)", "Готова ли семья взять образовательный кредит?", `Как вы относитесь к учёбе ${KID_RU}а за границей?`],
      hint: ["В вашей валюте. Если не уверены, подойдёт примерная сумма.", "", "", "Во многих странах нужен местный поручитель.", ""],
      o: { none: "Нет", under_10k: "Меньше 10 000 $", "10k_50k": "10 000 – 50 000 $", "50k_150k": "50 000 – 150 000 $", over_150k: "Больше 150 000 $", prefer_not_to_say: "Предпочитаю не говорить", yes: "Да", partially: "Частично", no: "Нет", dont_know: "Не знаю", maybe: "Возможно",
        fully_supportive: "Полностью поддерживаю", conditional: "Поддерживаю, с условиями", hesitant: "Пока сомневаюсь", against: "Против" } },
  };
  const PQ = [{ id: "m7_annual_budget", money: true }, { id: "m7_assets", opts: ["none", "under_10k", "10k_50k", "50k_150k", "over_150k", "prefer_not_to_say"], optional: true },
    { id: "m7_income_documentable", opts: ["yes", "partially", "no", "dont_know"] }, { id: "m7_loans", opts: ["yes", "maybe", "no"] }, { id: "m8_parent_attitude", opts: ["fully_supportive", "conditional", "hesitant", "against"] }];
  const pview = document.createElement("div"); pview.className = "jp-view"; pview.id = "jp-view"; pview.hidden = true;
  pview.setAttribute("role", "dialog"); pview.setAttribute("aria-modal", "true"); pview.setAttribute("aria-label", "Parent check");
  view.parentElement.appendChild(pview);
  let PL = "uz", PS = null;                                                // language (Uzbek first for Uzbek parents) and the parent's answers
  function openParent() { PS = { i: -1, a: {}, consent: !!(S.parent && S.parent.consent) }; pview.style.zIndex = String(window.JIA_z ? window.JIA_z() : 85); pview.hidden = false; paintParent(); }
  function paintParent() {
    const t = PT[PL], i = PS.i, n = PQ.length;
    const top = `<div class="jp-top"><b class="jp-brand">${esc(t.brand)}</b><div class="jp-lang" role="group" aria-label="Language">${[["uz", "O'zbekcha"], ["ru", "Русский"], ["en", "English"]].map(([k, v]) => `<button type="button" data-lang="${k}" aria-pressed="${PL === k}">${v}</button>`).join("")}</div></div>`;
    if (i === -1) {
      pview.innerHTML = `${top}<div class="jp-body"><h2>${esc(t.hi)}</h2><p class="jp-lead">${esc(t.time)} ${esc(t.why)}</p><div class="jp-priv">🔒 ${esc(t.priv)}</div>
        <label class="jp-agree"><input type="checkbox" id="jp-ok"${PS.consent ? " checked" : ""}> <span>${esc(t.agree)}</span></label></div>
        <div class="jp-foot"><button class="dg-go" type="button" data-p="go" id="jp-go"${PS.consent ? "" : " disabled"}>${esc(t.start)}</button></div>`;
      $("jp-ok").onchange = e => { PS.consent = e.target.checked; $("jp-go").disabled = !PS.consent; };
      return;
    }
    if (i >= n) { pview.innerHTML = `${top}<div class="jp-body jp-done"><div class="jp-check" aria-hidden="true">✓</div><h2>${esc(t.done)}</h2><p class="jp-lead">${esc(t.doneP)}</p><p class="jp-lead">${esc(t.doneS)}</p></div><div class="jp-foot"><button class="dg-go" type="button" data-p="close">${esc(t.close)}</button></div>`; return; }
    const q = PQ[i], v = PS.a[q.id];
    const input = q.money ? `<div class="dg-money"><input class="dg-field" type="number" min="0" inputmode="numeric" id="jp-amt" value="${esc(v ? v.amount : "")}" placeholder="0" aria-labelledby="jp-q"><select id="jp-cur" aria-label="Currency">${["UZS", "USD", "EUR", "RUB", "KZT"].map(c => `<option${(v ? v.currency : "UZS") === c ? " selected" : ""}>${c}</option>`).join("")}</select></div>`
      : `<div class="dg-opts" role="radiogroup" aria-labelledby="jp-q">${q.opts.map(o => `<button type="button" role="radio" class="dg-opt" data-o="${o}" aria-checked="${v === o}"><span>${esc(t.o[o])}</span></button>`).join("")}</div>`;
    pview.innerHTML = `${top}<div class="jp-body"><p class="jp-step">${esc(t.of(i + 1, n))}</p><div class="jp-bar"><i style="width:${Math.round(i / n * 100)}%"></i></div><h2 id="jp-q">${esc(t.q[i])}</h2>${t.hint[i] ? `<p class="dg-hint">${esc(t.hint[i])}</p>` : ""}${input}</div>
      <div class="jp-foot"><button class="dg-go" type="button" data-p="next" id="jp-next"${v != null || q.optional ? "" : " disabled"}>${esc(t.next)}</button><button class="dg-link" type="button" data-p="back">${esc(t.back)}</button></div>`;
    if (q.money) { const upd = () => { const a = $("jp-amt").value, c = $("jp-cur").value, r = { UZS: 1 / 12600, USD: 1, EUR: 1.08, RUB: 1 / 92, KZT: 1 / 480 }[c]; PS.a[q.id] = a === "" ? undefined : { amount: a, currency: c, usd: Math.round(+a * r), confidence: "high", by: "parent" }; $("jp-next").disabled = a === ""; }; $("jp-amt").oninput = upd; $("jp-cur").onchange = upd; }
  }
  pview.addEventListener("click", e => {
    const l = e.target.closest("[data-lang]"); if (l) { PL = l.dataset.lang; paintParent(); return; }
    const o = e.target.closest("[data-o]"); if (o) { PS.a[PQ[PS.i].id] = o.dataset.o; pview.querySelectorAll("[data-o]").forEach(b => b.setAttribute("aria-checked", String(b === o))); $("jp-next").disabled = false; return; }
    const b = e.target.closest("[data-p]"); if (!b || b.disabled) return;
    const a = b.dataset.p;
    if (a === "go") { PS.i = 0; paintParent(); }
    else if (a === "back") { PS.i = Math.max(-1, PS.i - 1); paintParent(); }
    else if (a === "next") { if (window.JG_ENGINE && PS.i + 1 >= PQ.length) { const hold = ev => ev.stopImmediatePropagation(); pview.addEventListener("click", hold, true); b.disabled = true; parentDone(ok => { pview.removeEventListener("click", hold, true); b.disabled = false; if (ok) { PS.i++; paintParent(); } }); return; } PS.i++; if (PS.i >= PQ.length) parentDone(); paintParent(); }   /* JG-PROD: S7, the family check is an awaited server commit; a failure keeps the last question on screen, and while it is in flight the view takes no click (Back, a language, an answer, a second Continue), so PS.i and the answers sent stay put (spec §4.1) */
    else if (a === "close") { pview.hidden = true; if (PS.changes) showChanges(PS.changes); }
  });
  pview.addEventListener("keydown", e => { if (e.key === "Escape") { e.preventDefault(); pview.hidden = true; } });
  function parentDone(then) { if (then) { const ans = {}; PQ.forEach(q => { if (PS.a[q.id] !== undefined) ans[q.id] = PS.a[q.id]; }); window.JG_ENGINE.commit("parent_flow_done", { answers: ans, consent: !!PS.consent, language: PL }).then(r => { if (r && r.snapshot) { parentDone(); if (r.changes) PS.changes = r.changes; } then(!!(r && r.snapshot)); }); return; }   /* JG-PROD: S7, the parent's answers go to the server, which re-plans and completes the parent-check task (spec §4.1, Q6) */   // the parent's answers outrank the student's guesses
    const before = snapshot();
    PQ.forEach(q => { if (PS.a[q.id] !== undefined) A[q.id] = PS.a[q.id]; });
    S.parentAnswers = Object.assign({}, S.parentAnswers, PS.a);             // kept apart too: a parent may answer before the student's diagnostic
    S.answers = A; S.parent = { done: true, consent: window.JG_ENGINE && D.age != null && D.age < 14 ? !!(S.parent && S.parent.consent) : true, at: ymd(new Date()), lang: PL }; S.parent_sent = true; save();   /* JG-PROD: owner 20 Oct 2026 (M1 core 1): under 14 the check on her own phone is a preview: only the parent app's consent counts (src/server/core/consent.ts) */
    const list = todayTasks(), task = list && list.find(x => x.verification === "auto_event");
    if (task) markDone(task, "parent answered");
    PS.changes = changesSince(before, "Your parent answered the family check.");
    if (window.JIA_notify) window.JIA_notify({ text: `<b>Your parent answered.</b> Your roadmap now uses the family's real numbers.` });
  }

  /* ---------- re-diagnosis: update what you know, see exactly what changed ---------- */
  function snapshot() { const d = derive(A); return { R: roadmap(), sc: JG_API.scorecard(A, d), eng: d.english_tested }; }
  function changesSince(before, lead) {
    RM = null; D = derive(A);
    const R = roadmap(), sc = JG_API.scorecard(A, D), out = [], om = new Map(before.R.milestones.map(m => [m.id, m])), nm = new Map(R.milestones.map(m => [m.id, m]));
    const months = (a, b) => Math.round((new Date(b) - new Date(a)) / 2629800000);
    if (before.eng !== D.english_tested && D.english_tested) out.push(`English: ${before.eng || "not tested"} → ${D.english_tested}.`);
    for (const [id, p] of om) if (!nm.has(id)) out.push(p.kind === "language" ? `Reached: ${p.title_i18n} ✓` : `No longer needed: ${p.title_i18n}`);
    for (const [id, m] of nm) {
      const p = om.get(id);
      if (!p) { out.push(`New: ${m.title_i18n}${m.due ? ` · by ${fmtM(m.due)}` : ""}`); continue; }
      if (p.due && m.due && p.due !== m.due) { const d = months(p.due, m.due); if (d) out.push(`${m.title_i18n}: ${fmtM(p.due)} → ${fmtM(m.due)} (${Math.abs(d)} month${Math.abs(d) > 1 ? "s" : ""} ${d < 0 ? "earlier" : "later"})`); }
      if (p.locked && !m.locked) out.push(`Unlocked now: ${m.title_i18n}`);
    }
    AXES.forEach(([k, n]) => { const a = before.sc.axes[k].rag, b = sc.axes[k].rag; if (a !== b) out.push(`${n}: ${a} → ${b}. ${sc.axes[k].gap_sentence_i18n}`); });
    if (!out.length) out.push("Nothing on your roadmap had to move. Good: the plan still fits.");
    S.changelog = [...(S.changelog || []), { at: ymd(new Date()), what_changed_i18n: `${lead} ${out.slice(0, 2).join(" ")}` }]; save(); RM = null;
    return { lead, list: out };
  }
  function showChanges(ch) {
    if (!S.unlocked) { if (window.JIA_notify) window.JIA_notify({ text: "<b>Saved.</b> This will shape your roadmap once you finish the diagnostic." }); return; }   // no roadmap yet
    openRoadmap();
    const el = document.createElement("div"); el.className = "jr-sheet"; el.id = "jr-sheet";
    el.innerHTML = `<div class="jr-sheet-bg" data-r="shut"></div><div class="jr-card" role="dialog" aria-modal="true" aria-labelledby="jc-h"><p class="dg-mod">Your roadmap was updated</p><h3 id="jc-h">What changed</h3><p class="jr-why">${esc(ch.lead)}</p>
      <ul class="jc-list">${ch.list.map(x => `<li>${esc(x)}</li>`).join("")}</ul><div class="jr-acts"><button class="dg-go" type="button" data-r="shut">See my roadmap</button></div></div>`;
    el.style.zIndex = String(+rv.style.zIndex + 1); rv.appendChild(el);
    setTimeout(() => el.querySelector(".dg-go").focus({ preventScroll: true }), 50);
  }
  const TO_CEFR = (test, s) => test === "IELTS" ? (s >= 8.5 ? "C2" : s >= 7 ? "C1" : s >= 5.5 ? "B2" : s >= 4 ? "B1" : "A2") : test === "TOEFL" ? (s >= 114 ? "C2" : s >= 95 ? "C1" : s >= 72 ? "B2" : s >= 42 ? "B1" : "A2") : null;
  function updateSheet() {
    const el = document.createElement("div"); el.className = "jr-sheet"; el.id = "jr-sheet";
    el.innerHTML = `<div class="jr-sheet-bg" data-r="shut"></div><div class="jr-card" role="dialog" aria-modal="true" aria-labelledby="ju-h"><p class="dg-mod">Keep your roadmap true</p><h3 id="ju-h">What's new?</h3>
      <div class="ju-opts">
        <!-- JG-PROD: owner 3 Oct R4, one attempt: the English check is not retaken from here -->
        <button type="button" class="dg-opt" data-u="score"><span>📄 I got an official test score</span></button>
        <button type="button" class="dg-opt" data-u="grades"><span>📈 My average changed</span></button>
        <button type="button" class="dg-opt" data-u="budget"><span>💰 Our budget changed</span></button>
        <button type="button" class="dg-opt" data-u="parent"><span>👪 Ask a parent to answer the family check</span></button>
      </div><div class="ju-form" id="ju-form"></div><div class="jr-acts"><button class="dg-link" type="button" data-r="redo">Open my diagnostic</button><button class="dg-link" type="button" data-r="shut">Close</button></div></div>`;
    el.style.zIndex = String(+rv.style.zIndex + 1); rv.appendChild(el);
    el.querySelector(".ju-opts").onclick = e => {
      const b = e.target.closest("[data-u]"); if (!b) return; const u = b.dataset.u, f = $("ju-form"), before = snapshot();
      el.querySelectorAll("[data-u]").forEach(x => x.setAttribute("aria-checked", String(x === b)));
      const apply = (lead, kind, payload) => { if (!window.JG_ENGINE) { el.remove(); showChanges(changesSince(before, lead)); return; } const ok = $("ju-ok"); if (ok) ok.disabled = true; window.JG_ENGINE.commit(kind, payload).then(r => { if (ok) ok.disabled = false; if (r && r.snapshot) { el.remove(); showChanges(r.changes || changesSince(before, lead)); } }); };   /* JG-PROD: S7, a new test score, average or budget is an awaited server commit; "What changed" is the server's (spec §4.1) */
      if (u === "english") { el.remove(); rv.hidden = true; S.recheck = { from: before }; save(); const q = QB.modules.find(m => m.id === "M4").questions.find(x => x.id === "m4_english_screener"); view.style.zIndex = String(window.JIA_z ? window.JIA_z() : 80); view.hidden = false; miniTest("english_screener", q); }
      else if (u === "parent") { el.remove(); openParent(); }
      else if (u === "score") {
        f.innerHTML = `<div class="dg-money"><select class="dg-field" id="ju-t" aria-label="Test">${["IELTS", "TOEFL", "SAT", "DTM"].map(x => `<option>${x}</option>`).join("")}</select><input class="dg-field" type="number" step="any" id="ju-s" placeholder="Score" aria-label="Score"></div><button class="dg-go" type="button" id="ju-ok" disabled>Update my roadmap</button>`;
        $("ju-s").oninput = () => { $("ju-ok").disabled = !$("ju-s").value; };
        $("ju-ok").onclick = () => { const t = $("ju-t").value, sc = +$("ju-s").value; A.m5_tests_taken = [...(A.m5_tests_taken || []), { test: t, score: sc, date: ymd(new Date()), official: true }];
          const lvl = TO_CEFR(t, sc); if (lvl) A.m4_english_screener = { level: lvl, confidence: 1, source: `${t} ${sc}` }; save(); apply(`Official ${t} ${sc} added${lvl ? ` (counts as ${lvl}; certificates outrank our check)` : ""}.`, "test_score", { test: t, score: sc }); };   /* JG-PROD: S7, test_score */
      } else if (u === "grades") {
        const sc = scaleOf(A), [nm, lo, hi, st] = SCALES[sc]; f.innerHTML = `<div class="dg-range"><b class="dg-big" id="ju-gv">${esc(A.m3_average || "–")}</b><input type="range" id="ju-g" min="${lo}" max="${hi}" step="${st}" value="${esc(A.m3_average || (lo + hi) / 2)}" aria-label="New average"><div class="dg-ends"><span>${lo}</span><span>${hi} · ${nm}</span></div></div><button class="dg-go" type="button" id="ju-ok" disabled>Update my roadmap</button>`;   /* JG-PROD: owner 3 Oct R1, a new average on the student's own scale, on the design's slider; an average kept with no scale opens on the scale its value can only be on (scaleOf, P4b final review I3), never 85 on 2-5 */
        $("ju-g").oninput = () => { $("ju-gv").textContent = $("ju-g").value; $("ju-ok").disabled = false; }; $("ju-ok").onclick = () => { A.m3_average = $("ju-g").value; A.m1_grading_scale = sc; save(); apply(`Average updated to ${A.m3_average}${SCALES[sc][4] !== 5 ? ` of ${SCALES[sc][4]}` : ""}.`, "report_card", { average: A.m3_average, scale: sc }); };   /* JG-PROD: S7, report_card; owner 3 Oct R1, with its scale */
      } else if (u === "budget") {
        f.innerHTML = `<div class="dg-money"><input class="dg-field" type="number" id="ju-b" placeholder="Per year" aria-label="Budget per year"><select class="dg-field" id="ju-c" aria-label="Currency">${["USD", "UZS", "EUR"].map(x => `<option>${x}</option>`).join("")}</select></div><button class="dg-go" type="button" id="ju-ok" disabled>Update my roadmap</button>`;
        $("ju-b").oninput = () => { $("ju-ok").disabled = !$("ju-b").value; };
        $("ju-ok").onclick = () => { const a = +$("ju-b").value, c = $("ju-c").value, usd = Math.round(a * { USD: 1, UZS: 1 / 12600, EUR: 1.08 }[c]); A.m7_annual_budget = { amount: String(a), currency: c, usd, confidence: "medium" }; if (usd >= 60000) A.m7_aid_need = "none"; else if (usd >= 15000) A.m7_aid_need = "partial"; save(); apply(`Budget updated to about $${usd.toLocaleString("en-US")} a year.`, "budget_changed", { amount: a, currency: c }); };   /* JG-PROD: S7, budget_changed */
      }
    };
  }
  function recheckDone(res, rc) { if (window.JG_ENGINE) { window.JG_ENGINE.commit("test_score", { english_check: { level: res.level } }).then(r => { if (r && r.snapshot) showChanges(r.changes || changesSince(snapshot(), `New English check: ${res.level}.`)); }); return; }   /* JG-PROD: S7, a new English check is a server commit (spec §4.1) */
    const snap = rc && rc.from && rc.from.R ? rc.from : snapshot();
    showChanges(changesSince(snap, `New English check: ${res.level}.`));
  }

  /* ---------- counselor reviews, booked through Community with coins ---------- */
  const COUNSELORS = [{ id: "c_malika", name: "Malika Rahimova", tag: "Admissions counselor · US and UK" }, { id: "c_timur", name: "Timur Sharipov", tag: "Admissions counselor · Asia and Europe" }];
  const REVIEW_PRICE = 150;
  function book(mid) {
    const m = roadmap().milestones.find(x => x.id === mid); if (!m) return;
    const P = window.JIA_people || { PEOPLE: {}, AV: {} }, extra = m.kind === "language" ? "kamila" : m.kind === "test" ? "aziza" : null;
    const people = [...COUNSELORS, ...(extra && P.PEOPLE[extra] ? [{ id: extra, name: P.PEOPLE[extra].name, tag: P.PEOPLE[extra].tag, av: P.AV[extra] }] : [])];
    const free = !(S.reviewsUsed > 0), price = free ? 0 : REVIEW_PRICE, have = window.JIA_coins ? window.JIA_coins.get() : 0;
    const days = []; for (let d = new Date(), k = 0; days.length < 3 && k < 10; k++) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0) days.push(new Date(d)); }
    const slots = days.flatMap(d => ["16:00", "18:30"].map(h => `${d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })} · ${h}`));
    let who = people[0].id, when = slots[0];
    const el = document.createElement("div"); el.className = "jr-sheet"; el.id = "jr-sheet";
    const paint = () => {
      el.innerHTML = `<div class="jr-sheet-bg" data-r="shut"></div><div class="jr-card" role="dialog" aria-modal="true" aria-labelledby="jb-h"><p class="dg-mod">Counselor review · ${esc(m.title_i18n)}</p><h3 id="jb-h">Who checks it with you?</h3>
        <div class="jb-people">${people.map(p => `<button type="button" class="dg-opt" data-who="${p.id}" aria-checked="${who === p.id}">${p.av ? `<img class="jb-av" src="${p.av}" alt="">` : `<span class="jb-av">${esc(p.name.split(" ").map(x => x[0]).join(""))}</span>`}<span><b>${esc(p.name)}</b><small>${esc(p.tag)}</small></span></button>`).join("")}</div>
        <b class="jr-next-h">When? (Tashkent time, 30 minutes)</b><div class="dg-chips">${slots.map(s => `<button type="button" class="dg-chip" data-when="${esc(s)}" aria-pressed="${when === s}">${esc(s)}</button>`).join("")}</div>
        <p class="jb-price">${free ? "Your first review is free." : `${REVIEW_PRICE} coins · you have ${have}.`}</p>
        <div class="jr-acts"><button class="dg-go" type="button" data-r="confirm"${!free && have < price ? " disabled" : ""}>${free ? "Book · free" : `Book · 🪙 ${REVIEW_PRICE}`}</button>${!free && have < price ? `<button class="dg-link" type="button" data-r="coins">Get coins in the shop</button>` : ""}<button class="dg-link" type="button" data-r="shut">Cancel</button></div></div>`;
    };
    paint(); el.style.zIndex = String(+rv.style.zIndex + 2); rv.appendChild(el);
    el.addEventListener("click", e => {
      const w = e.target.closest("[data-who]"), t = e.target.closest("[data-when]"), b = e.target.closest("[data-r]");
      if (w) { who = w.dataset.who; paint(); } else if (t) { when = t.dataset.when; paint(); }
      else if (b && b.dataset.r === "coins") { el.remove(); if (window.JIA_openShop) window.JIA_openShop(); }
      else if (b && b.dataset.r === "confirm") {
        if (price && !(window.JIA_coins && window.JIA_coins.spend(price, { reason: "review", ref: mid }))) return;   /* JG-PROD: S26, the counselor review's debit (the booking itself is P3) */
        const p = people.find(x => x.id === who); S.reviews = Object.assign({}, S.reviews, { [mid]: { who: p.name, slot: when, at: ymd(new Date()) } }); S.reviewsUsed = (S.reviewsUsed || 0) + 1; save();
        if (window.JIA_notify) window.JIA_notify({ text: `<b>Review booked</b> with ${esc(p.name)}, ${esc(when)}. They'll message you in Direct.` });
        el.remove(); openRoadmap(); sheet(mid);
      }
      e.stopPropagation();
      if (b && b.dataset.r === "shut") el.remove();
    });
  }

  /* ---------- the shared parent link opens the parent check ---------- */
  const pvP = document.querySelector('.pv [data-act="parentcheck"]'); if (pvP) pvP.addEventListener("click", openParent);
  if (/#parent\b/.test(location.hash)) setTimeout(openParent, 600);
  window.JG_openParent = openParent;

  /* ================= STUDY ROOM: where the prep hours happen. 25/50-minute sessions build the dream, brick by brick ================= */
  const DOME = {"color": "/d/student-mobile/media/3e9998f32b3543fa.webp", "stone": "/d/student-mobile/media/80aa223a382d5fa1.webp", "credit": "Photo: Beyond My Ken, Wikimedia Commons, CC BY-SA 4.0", "w": 720, "h": 479};                                                   // the real photo and a stone copy of it (credit shown in the room)
  const SR_KEY = "jg.study.v1", COLS = 30, ROWS = 20;
  let SR = (() => { try { return JSON.parse(localStorage.getItem(SR_KEY)) || null; } catch (e) { return null; } })() || { uni: "MIT", bricks: 143, target: COLS * ROWS, cracked: [], log: {}, sessions: [] };
  const srSave = () => { try { localStorage.setItem(SR_KEY, JSON.stringify(SR)); } catch (e) {} };
  const dayLog = (k = ymd(new Date())) => (SR.log[k] = SR.log[k] || { minutes: 0, bricks: 0, sessions: 0 });
  const hm = min => `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, "0")}m`;
  const bricksTxt = n => `${n} brick${n === 1 ? "" : "s"}`;
  let liveN = null;
  JG_API.studyLive = (now = new Date()) => {                               // realistic for Tashkent's time of day, drifting a little
    const h = ((now.getUTCHours() + 5) % 24) + now.getUTCMinutes() / 60, i = Math.floor(h);
    const C = [120, 90, 70, 60, 60, 80, 160, 300, 380, 420, 440, 460, 520, 640, 760, 880, 1000, 1150, 1320, 1520, 1720, 1800, 1600, 900], base = C[i] + (C[(i + 1) % 24] - C[i]) * (h - i);
    liveN = liveN == null ? base : liveN + (base - liveN) * .2 + (Math.random() - .5) * base * .03;
    return { at: now.toISOString(), studying_now: Math.max(20, Math.round(liveN)) };
  };
  const SQUAD_IDS = ["madina", "sardor", "dilnoza", "asadbek"];
  JG_API.squadStudying = (now = new Date()) => { if (window.JG_ENGINE) return [];   /* JG-PROD: owner 4 Oct R11, a real student has no squad of invented people studying beside them (the Study Room's faces, "Your squad, studying now") */                           // only avatar, first name, subject and minutes: no chat
    const P = window.JIA_people || { PEOPLE: {}, AV: {} }, subj = ["SAT", "IELTS", "AP Calculus", "Olympiad"], t = Math.floor(now.getTime() / 60000);
    return SQUAD_IDS.map((id, i) => ({ user_id: id, first_name: String(P.PEOPLE[id] ? P.PEOPLE[id].name : id).split(" ")[0], avatar: P.AV[id] || "", subject: subj[i], minutes: 4 + ((t * (i + 3)) % 44), studying: (t + i * 7) % 5 !== 0 })).filter(x => x.studying);
  };
  JG_API.startSession = o => { const s = { id: `ss_${Date.now()}`, subject: o.subject, task_id: o.task_id || null, minutes_planned: o.minutes, started_at: new Date().toISOString(), ends_at: new Date(Date.now() + o.minutes * 60000).toISOString(), status: "running" }; if (window.JG_ENGINE) window.JG_ENGINE.startSession(s, v => Object.assign(s, { id: v.id, subject: v.subject, task_id: v.task_id, minutes_planned: v.minutes_planned, started_at: v.started_at, ends_at: v.ends_at })); return s; };   /* JG-PROD: S14, the session is the server's: its clock sets the end, and one already running on the other device is joined */
  JG_API.completeSession = s => { const b = Math.round(s.minutes_planned / 25); if (window.JG_ENGINE) window.JG_ENGINE.completeSession(s.id, r => { SR.bricks = r.dream.bricks; srSave(); const x = r.session.dbh_bonus || 0; if (x && window.JIA_notify) window.JIA_notify({ text: `<b>Double Brick Hour:</b> +${x} bonus brick${x === 1 ? "" : "s"}.` }); try { refreshStudyCards(); } catch (e) {} }); return Object.assign({}, s, { status: "completed", ended_at: new Date().toISOString(), minutes_studied: s.minutes_planned, bricks_awarded: b, xp_awarded: b * 10 }); };   /* JG-PROD: S14, S18, the server settles the session (bricks, XP, the Double Brick Hour bonus in the design's words) and the build shows its count */
  JG_API.breakSession = (s, reason) => { if (window.JG_ENGINE) window.JG_ENGINE.breakSession(s.id, reason); const m = Math.floor((Date.now() - new Date(s.started_at)) / 60000); return Object.assign({}, s, { status: reason === "stopped" ? "stopped" : "broken", break_reason: reason, ended_at: new Date().toISOString(), minutes_studied: Math.max(0, Math.min(m, s.minutes_planned)), bricks_awarded: 0, xp_awarded: 0 }); };   /* JG-PROD: S14, a stopped or left session is reported; it earns no brick */
  JG_API.studyDay = (date = ymd(new Date())) => Object.assign({ date }, SR.log[date] || { minutes: 0, bricks: 0, sessions: 0 });
  JG_API.dreamBuild = () => ({ university: SR.uni, bricks_done: SR.bricks, bricks_target: SR.target, cracked: SR.cracked.length, photo_credit: DOME.credit });

  /* ---------- the dream, drawn: real photo revealed brick by brick, from the ground up ---------- */
  const imgC = new Image(), imgS = new Image(); imgC.src = DOME.color; imgS.src = DOME.stone;
  const cell = i => ({ x: i % COLS, y: ROWS - 1 - Math.floor(i / COLS) });
  function drawBuild(cv, prog, crackNow) {
    const g = cv.getContext("2d"), W = cv.width, H = cv.height, bw = W / COLS, bh = H / ROWS, sw = DOME.w / COLS, sh = DOME.h / ROWS;
    if (!imgC.complete || !imgS.complete) { const again = () => drawBuild(cv, prog, crackNow); imgC.addEventListener("load", again, { once: true }); imgS.addEventListener("load", again, { once: true }); return; }
    g.drawImage(imgS, 0, 0, W, H);
    const done = Math.min(SR.bricks, SR.target);
    for (let i = 0; i < done; i++) { const c = cell(i); g.drawImage(imgC, c.x * sw, c.y * sh, sw, sh, c.x * bw, c.y * bh, bw + .5, bh + .5); }
    g.strokeStyle = "rgba(255,255,255,.16)"; g.lineWidth = Math.max(1, W / 900);
    for (let r = 0; r <= ROWS; r++) { g.beginPath(); g.moveTo(0, r * bh); g.lineTo(W, r * bh); g.stroke(); }
    for (let r = 0; r < ROWS; r++) for (let c = 0; c <= COLS; c++) { const x = (c + (r % 2 ? .5 : 0)) * bw; g.beginPath(); g.moveTo(x, r * bh); g.lineTo(x, (r + 1) * bh); g.stroke(); }
    if (done < SR.target && (prog != null || crackNow)) {
      const c = cell(done), x = c.x * bw, y = c.y * bh;
      if (prog) { const ph = bh * prog; g.drawImage(imgC, c.x * sw, c.y * sh + sh * (1 - prog), sw, sh * prog, x, y + bh - ph, bw, ph); }
      g.strokeStyle = crackNow ? "#8a8f8c" : "#5ff0a8"; g.lineWidth = Math.max(2, W / 360); g.strokeRect(x + 1, y + 1, bw - 2, bh - 2);
      if (crackNow) { g.fillStyle = "rgba(90,96,92,.85)"; g.fillRect(x + 1, y + 1, bw - 2, bh - 2); g.strokeStyle = "#1f2422"; g.lineWidth = Math.max(1.5, W / 600); g.beginPath(); g.moveTo(x + bw * .2, y + 2); g.lineTo(x + bw * .45, y + bh * .45); g.lineTo(x + bw * .35, y + bh * .6); g.lineTo(x + bw * .7, y + bh - 2); g.stroke(); }
    }
  }
  function buildCanvas(host, prog, crackNow) {
    const cv = document.createElement("canvas"), w = Math.round(Math.min(host.clientWidth || 340, 700) * Math.min(2, window.devicePixelRatio || 1));
    cv.width = w; cv.height = Math.round(w * DOME.h / DOME.w); cv.setAttribute("role", "img"); cv.setAttribute("aria-label", `${SR.uni}: ${SR.bricks} of ${SR.target} bricks built`);
    host.textContent = ""; host.appendChild(cv); drawBuild(cv, prog, crackNow); return cv;
  }

  /* ---------- the room ---------- */
  const srv = document.createElement("div"); srv.className = "zr-view"; srv.id = "zr-view"; srv.hidden = true;
  srv.setAttribute("role", "dialog"); srv.setAttribute("aria-modal", "true"); srv.setAttribute("aria-label", "Study Room");
  view.parentElement.appendChild(srv);
  const pill = document.createElement("button"); pill.type = "button"; pill.className = "zr-pill"; pill.id = "zr-pill"; pill.hidden = true; view.parentElement.appendChild(pill);
  pill.addEventListener("click", () => { srv.hidden = false; pill.hidden = true; paintRun(); });
  let run = null, pick = { subject: "SAT", minutes: 25, task_id: null, task_title: null }, tickT = 0, wake = null, hiddenAt = 0, graceT = 0, cv = null, srBack = null;
  const SUBJECTS = ["SAT", "IELTS", "AP", "Olympiad", "DTM", "Other"];
  function openStudy(o) {
    if (!run && window.JG_ENGINE && window.JG_ENGINE.session()) { run = Object.assign(window.JG_ENGINE.session(), { lockOk: false }); lockScreen(); clearInterval(tickT); tickT = setInterval(tick, 250); } if (run) { srv.hidden = false; pill.hidden = true; paintRun(); return; }   /* JG-PROD: S14, a session still running (after a reload, or started on the other device) resumes here */
    if (o && o.task) pick = Object.assign({}, pick, { subject: o.task.short, task_id: o.task.id, task_title: o.task.title_i18n });
    srBack = document.activeElement; srv.style.zIndex = String(window.JIA_z ? window.JIA_z() : 75); srv.hidden = false; setupRoom();
  }
  const top = (x = "Close") => `<div class="zr-top"><span class="zr-now"><i class="zr-dot" aria-hidden="true"></i><span id="zr-live">${JG_API.studyLive().studying_now.toLocaleString("en-US")}</span> studying now</span><button class="zr-x" type="button" data-s="close" aria-label="${x}">×</button></div>`;
  function setupRoom() {
    const tasks = (typeof todayTasks === "function" && todayTasks()) || [];
    srv.innerHTML = `${top()}<div class="zr-body"><h2 class="zr-h">Study Room</h2><p class="zr-sub">Your notebook, not your screen. Every 25 minutes lays a brick of ${esc(SR.uni)}.</p>
      <b class="zr-lab">What are you studying?</b><div class="zr-chips">${SUBJECTS.map(x => `<button type="button" class="zr-chip" data-sub="${x}" aria-pressed="${!pick.task_id && pick.subject === x}">${x}</button>`).join("")}
      ${tasks.map(t => `<button type="button" class="zr-chip" data-task="${t.id}" aria-pressed="${pick.task_id === t.id}">${esc(t.short)} · today</button>`).join("")}</div>
      <b class="zr-lab">How long?</b><div class="zr-len"><button type="button" data-min="25" aria-pressed="${pick.minutes === 25}"><b>25 min</b>1 brick</button><button type="button" data-min="50" aria-pressed="${pick.minutes === 50}"><b>50 min</b>2 bricks</button></div>
      <div class="zr-build" id="zr-build"></div><div class="zr-build-l"><span>🧱 ${esc(SR.uni)} · ${SR.bricks} / ${SR.target} bricks</span><span>${Math.round(SR.bricks / SR.target * 100)}%</span></div><p class="zr-credit">${esc(DOME.credit)}</p></div>
      <div class="zr-foot"><button class="zr-start" type="button" data-s="start">Start · ${pick.minutes} min</button></div>`;
    buildCanvas($("zr-build"));
    setTimeout(() => { const st = srv.querySelector(".zr-start"); if (st) st.focus({ preventScroll: true }); }, 60);
  }
  async function lockScreen() {
    try { if (navigator.wakeLock && navigator.wakeLock.request) { wake = await navigator.wakeLock.request("screen"); if (run) run.lockOk = true; wake.addEventListener("release", () => { wake = null; }); } } catch (e) { wake = null; }
  }
  function releaseLock() { try { if (wake) wake.release(); } catch (e) {} wake = null; }
  function startRun() {
    run = JG_API.startSession({ subject: pick.task_title || pick.subject, task_id: pick.task_id, minutes: pick.minutes }); run.lockOk = false;
    lockScreen(); paintRun(); clearInterval(tickT); tickT = setInterval(tick, 250);
  }
  function paintRun() {
    if (!run || srv.hidden) return;
    const friends = S.together ? S.together.members.map(w => ({ first_name: firstN(w), avatar: (PPL2().AV || {})[w] || "", subject: "Together", minutes: Math.max(1, Math.floor((Date.now() - new Date(S.together.started_at)) / 60000)) })) : JG_API.squadStudying();
    srv.innerHTML = `${top("Leave the room (the session keeps going)")}<div class="zr-body zr-run">
      <div class="zr-timer"><svg viewBox="0 0 230 230" aria-hidden="true"><circle class="trk" cx="115" cy="115" r="106"/><circle class="prg" id="zr-prg" cx="115" cy="115" r="106" stroke-dasharray="666" stroke-dashoffset="666"/></svg>
        <span class="zr-time" id="zr-time" role="timer" aria-label="Time left">--:--</span><span class="zr-what">${esc(run.subject)}</span></div>
      <p class="zr-hint">📱 Put your phone face down</p>${S.together ? `<p class="zr-held" id="zr-held"></p>` : ""}
      <div class="zr-build" id="zr-build"></div><div class="zr-build-l"><span>🧱 ${esc(SR.uni)} · ${SR.bricks} / ${SR.target}</span><span>brick ${SR.bricks + 1} in progress</span></div>
      ${friends.length ? `<b class="zr-lab">${S.together ? "Studying together with you" : "Your squad, studying now"}</b><div class="zr-friends">${friends.map(f => `<div class="zr-f">${f.avatar ? `<img src="${f.avatar}" alt="">` : `<span class="zr-av"></span>`}<span><b>${esc(f.first_name)}</b><small>📖 ${esc(f.subject)} · ${f.minutes} min</small></span></div>`).join("")}</div>` : ""}
      <p class="zr-credit">${esc(DOME.credit)}</p></div>
      <div class="zr-foot"><div class="zr-actions"><button class="zr-ghost" type="button" data-s="jamol">💬 Ask Jamol</button><button class="zr-ghost" type="button" data-s="stop">Stop</button></div></div>`;
    cv = buildCanvas($("zr-build"), 0); tick();
  }
  let lastBrickPaint = 0;
  function tick() {
    if (!run) return;
    const total = run.minutes_planned * 60000, left = new Date(run.ends_at) - Date.now();
    if (left <= 0) { complete(); return; }
    if (srv.hidden) { pill.hidden = false; pill.textContent = `🧱 ${fmt(left)} · back to the Study Room`; return; }
    const t = $("zr-time"); if (t) t.textContent = fmt(left);
    const p = $("zr-prg"), f = 1 - left / total; if (p) p.style.strokeDashoffset = String(666 * (1 - f));
    if (cv && Date.now() - lastBrickPaint > 2000) { lastBrickPaint = Date.now(); drawBuild(cv, f); }
  }
  const fmt = ms => { const s = Math.ceil(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };
  function record(res) {
    SR.sessions = [...SR.sessions, res].slice(-60); const d = dayLog();
    d.minutes += res.minutes_studied; d.bricks += res.bricks_awarded; if (res.status === "completed") d.sessions += 1; srSave();
  }
  function complete() {
    clearInterval(tickT); releaseLock(); const res = JG_API.completeSession(run); run = null; pill.hidden = true;
    const seasonBefore = JG_API.season ? JG_API.season().progress : 0;
    record(res); SR.bricks = Math.min(SR.target, SR.bricks + res.bricks_awarded); srSave();
    setTimeout(() => { try { seasonCheck(seasonBefore); } catch (err) {} }, 2500);   // a crossed season threshold is a medal
    if (S.together) endTogether(true);                                     // study together: bricks for everyone, held messages delivered
    document.dispatchEvent(new CustomEvent("jia:daydone", { detail: { source: "study" } }));   // a completed session counts toward today's streak
    const L = window.JIA_league; if (L && res.xp_awarded) { L.ME.xp += res.xp_awarded; L.ME.week += res.xp_awarded; try { L.paint(); } catch (e) {} }
    srv.hidden = false; srv.style.zIndex = String(window.JIA_z ? window.JIA_z() : 75);
    const d = dayLog();
    srv.innerHTML = `${top()}<div class="zr-body zr-result">${mascot("cele", "zr-mascot cele")}<h2 class="zr-h">${res.bricks_awarded > 1 ? `${res.bricks_awarded} bricks laid` : "Brick laid"}</h2>
      <p class="zr-sub">+${res.xp_awarded} league XP · today counts for your streak</p><div class="zr-build" id="zr-build"></div>
      <div class="zr-build-l"><span>🧱 ${esc(SR.uni)} · ${SR.bricks} / ${SR.target}</span><span>Today: ${bricksTxt(d.bricks)} · ${hm(d.minutes)}</span></div></div>
      <div class="zr-foot"><button class="zr-start" type="button" data-s="again">Another ${pick.minutes} min</button><button class="zr-ghost" type="button" data-s="close">Done</button></div>`;
    buildCanvas($("zr-build")); refreshStudyCards();
  }
  function crack(reason) {
    if (!run) return;
    clearInterval(tickT); releaseLock(); clearTimeout(graceT); const res = JG_API.breakSession(run, reason); run = null; pill.hidden = true;
    record(res); if (S.together) endTogether(false); if (reason !== "stopped") SR.cracked = [...SR.cracked, ymd(new Date())].slice(-100); srSave();
    srv.hidden = false; srv.style.zIndex = String(window.JIA_z ? window.JIA_z() : 75);
    srv.innerHTML = `${top()}<div class="zr-body zr-result">${mascot("concern", "zr-mascot sad")}<h2 class="zr-h">${reason === "stopped" ? "You stopped early" : "The brick cracked"}</h2>
      <p class="zr-sub">${reason === "stopped" ? "This brick stays unfinished." : "You left the app mid-session, so this brick stays unfinished."} No coins or streak lost.</p>
      <div class="zr-build" id="zr-build"></div><div class="zr-build-l"><span>🧱 ${esc(SR.uni)} · ${SR.bricks} / ${SR.target}</span><span>${res.minutes_studied} min still counted</span></div></div>
      <div class="zr-foot"><button class="zr-start" type="button" data-s="again">Start again</button><button class="zr-ghost" type="button" data-s="close">Close</button></div>`;
    buildCanvas($("zr-build"), null, true); refreshStudyCards();
  }
  document.addEventListener("visibilitychange", () => {                    // leaving the app cracks the brick; a dark screen alone never does
    if (!run) return;
    if (document.hidden) { hiddenAt = Date.now(); if (run.lockOk) graceT = setTimeout(() => { if (document.hidden && run) crack("left_app"); }, 10000); }
    else { clearTimeout(graceT); if (run && run.lockOk && hiddenAt && Date.now() - hiddenAt > 10000) crack("left_app"); else if (run) { lockScreen(); tick(); } hiddenAt = 0; }
  });
  srv.addEventListener("click", e => {
    const sub = e.target.closest("[data-sub]"), tk = e.target.closest("[data-task]"), mn = e.target.closest("[data-min]"), b = e.target.closest("[data-s]");
    if (sub) { pick = Object.assign({}, pick, { subject: sub.dataset.sub, task_id: null, task_title: null }); setupRoom(); return; }
    if (tk) { const t = (todayTasks() || []).find(x => x.id === tk.dataset.task); if (t) pick = Object.assign({}, pick, { subject: t.short, task_id: t.id, task_title: t.title_i18n }); setupRoom(); return; }
    if (mn) { pick.minutes = +mn.dataset.min; setupRoom(); return; }
    if (!b) return;
    const a = b.dataset.s;
    if (a === "start" || a === "again") startRun();
    else if (a === "close") { srv.hidden = true; if (run) { pill.hidden = false; tick(); } else if (srBack && document.contains(srBack)) try { srBack.focus({ preventScroll: true }); } catch (err) {} }
    else if (a === "jamol") { if (window.JIA_openJamol) window.JIA_openJamol(null); }   // the timer keeps running under the sheet
    else if (a === "stop") { b.outerHTML = `<button class="zr-ghost" type="button" data-s="stopyes">Stop? This brick stays unfinished</button>`; setTimeout(() => { const y = srv.querySelector("[data-s=stopyes]"); if (y) y.outerHTML = `<button class="zr-ghost" type="button" data-s="stop">Stop</button>`; }, 4000); }
    else if (a === "stopyes") crack("stopped");
  });
  srv.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    const z = +srv.style.zIndex || 0, above = [...srv.parentElement.children].some(el => el !== srv && !el.hidden && getComputedStyle(el).display !== "none" && (+getComputedStyle(el).zIndex || 0) > z);
    if (above) return;                                                     // another screen (Jamol) is on top: it closes first
    e.preventDefault(); srv.querySelector("[data-s=close]").click();
  });

  /* ---------- Today: the room's card, the dream's progress, and the evening recap ---------- */
  function refreshStudyCards() {
    const n = JG_API.studyLive().studying_now.toLocaleString("en-US"), P = window.JIA_people || { AV: {} };
    const l = $("zr-card-live"); if (l) l.textContent = n; const r = $("zr-live"); if (r) r.textContent = n;
    const cb = $("zr-card-bricks"); if (cb) cb.textContent = SR.bricks;
    const fc = $("zr-card-faces"); if (fc) fc.innerHTML = JG_API.squadStudying().map(f => f.avatar ? `<img src="${f.avatar}" alt="">` : "<span></span>").join("");
    let dl = $("zr-domeline"); const st = $("wd-stake");
    if (!dl && st) { st.insertAdjacentHTML("afterend", `<p class="zr-domeline" id="zr-domeline"></p>`); dl = $("zr-domeline"); }
    if (dl) dl.textContent = `🧱 ${SR.uni} · ${SR.bricks} / ${SR.target} bricks · study to build it`;
    paintRecap();
    try { refreshComeBack(); } catch (e) {}                                // not ready during start-up
  }
  function paintRecap() {
    const host = $("zr-card"); if (!host) return;
    const hour = new Date().getHours(), show = hour >= 19 || S.recapDemo; let el = $("zr-recap");
    if (!show) { if (el) el.remove(); return; }
    const d = dayLog(), st = typeof taskState === "function" ? taskState() : { done: [] }, list = (typeof todayTasks === "function" && todayTasks()) || null;
    const done = list ? st.done.length : Math.round(((window.JIA_today && window.JIA_today.level) || 0) / 25), of = list ? list.length : 4;
    const great = d.bricks >= 2 || done >= 3, none = !d.bricks && !done, face = none ? "sleepy" : great ? "delighted" : "curious";
    const html = `<div class="zr-recap ${great ? "great" : none ? "none" : "ok"}" id="zr-recap" role="status">${mascot(face, "zr-recap-img")}<span><b>Today</b><p>${bricksTxt(d.bricks)} · ${hm(d.minutes)} · ${done}/${of} tasks</p><small>${none ? "Still time for one brick before bed." : great ? "A strong day. Rest well." : "Good work. One more brick?"}</small></span></div>`;
    if (el) el.outerHTML = html; else host.insertAdjacentHTML("beforebegin", html);
  }
  const statsEl = $("stats");
  if (statsEl && !$("zr-card")) statsEl.insertAdjacentHTML("beforebegin", `<button class="zr-card" id="zr-card" type="button" aria-label="Study Room: start a focus session">
    <span class="zr-card-top"><b>Study Room</b><span class="zr-now"><i class="zr-dot" aria-hidden="true"></i><span id="zr-card-live">…</span> studying now</span></span>
    <span class="zr-card-mid"><span class="zr-faces" id="zr-card-faces"></span><span class="zr-card-build">🧱 ${esc(SR.uni)} · <b id="zr-card-bricks">${SR.bricks}</b> / ${SR.target} bricks</span></span><span class="zr-go">Start</span></button>`);
  if ($("zr-card")) $("zr-card").addEventListener("click", () => openStudy());
  setInterval(() => { if (!document.hidden) { const n = JG_API.studyLive().studying_now.toLocaleString("en-US"); ["zr-card-live", "zr-live"].forEach(id => { const x = $(id); if (x) x.textContent = n; }); } }, 5000);
  const pvq = a => document.querySelector(`.pv [data-act="${a}"]`);
  if (pvq("zr-finish")) pvq("zr-finish").addEventListener("click", () => { if (!run) { openStudy(); startRun(); } run.ends_at = new Date(Date.now() - 1).toISOString(); tick(); });
  if (pvq("zr-leave")) pvq("zr-leave").addEventListener("click", () => { if (!run) { openStudy(); startRun(); } run.lockOk = true; crack("left_app"); });
  if (pvq("zr-recap")) pvq("zr-recap").addEventListener("click", () => { S.recapDemo = true; save(); paintRecap(); const r = $("zr-recap"); if (r) r.scrollIntoView({ block: "center", behavior: "smooth" }); });
  window.JG_openStudy = openStudy;
  refreshStudyCards();

  /* ================= A REASON TO COME BACK: squad (week), your week, season, class (year) ================= */
  const PPL = () => window.JIA_people || { PEOPLE: {}, AV: {} };
  const wkStart = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
  const wkDays = () => [...Array(7)].map((_, i) => { const d = wkStart(); d.setDate(d.getDate() + i); return d; });
  const hash = (s, n) => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % n; };
  const QK = "jg.squad.v1";
  let SQ = (() => { try { return JSON.parse(localStorage.getItem(QK)) || null; } catch (e) { return null; } })() || { cheers: {}, blocked: [], reported: [], remind: false };
  const sqSave = () => { try { localStorage.setItem(QK, JSON.stringify(SQ)); } catch (e) {} };
  const meAvatar = () => { const m = /url\(["']?([^"')]+)/.exec(getComputedStyle(document.querySelector(".avatar") || document.body).getPropertyValue("--photo") || ""); return m ? m[1] : ""; };
  JG_API.squad = () => {                                                   // 4–6 students, same stage, similar route; no chat, only cheers
    const P = PPL(), days = wkDays(), today = ymd(new Date());
    const members = [{ user_id: "me", first_name: JG_ME.firstName, avatar: meAvatar(), me: true }, ...SQUAD_IDS.map(id => ({ user_id: id, first_name: String(P.PEOPLE[id] ? P.PEOPLE[id].name : id).split(" ")[0], avatar: P.AV[id] || "" }))].filter(m => !SQ.blocked.includes(m.user_id)); /* JG-PROD: identity */
    members.forEach(m => {
      m.week = days.map(d => { const k = ymd(d); if (d.getDay() === 0) return "rest"; if (k > today) return "future";
        if (m.me) { const t = (S.days || {})[k], l = SR.log[k], back = Math.round((new Date(today) - new Date(k)) / 864e5), L = window.JIA_league;
          return (l && l.sessions) || (t && t.done.length) || (k < today && L && back <= L.ME.streak) ? "done" : k === today ? "open" : "missed"; }
        const v = hash(m.user_id + k, 10); return k === today ? (v < 5 ? "done" : v < 7 ? "studying" : "open") : v < 9 ? "done" : "freeze"; });
      m.today = m.week[(new Date().getDay() + 6) % 7];
      m.week_bricks = m.me ? days.reduce((n, d) => n + ((SR.log[ymd(d)] || {}).bricks || 0), 0) : 6 + hash(m.user_id + ymd(days[0]), 16);
    });
    const week = days.map((d, i) => d.getDay() === 0 ? "rest" : ymd(d) > today ? "future" : members.every(m => ["done", "freeze", "rest"].includes(m.week[i])) ? "done" : ymd(d) === today ? "open" : "missed");
    return { id: "sq_road_mit", name: "Road to MIT squad", stage: (S.result && S.result.stage) || "S2", members,
      weekly_goal: { bricks_target: 120, bricks_done: members.reduce((n, m) => n + m.week_bricks, 0) }, group_streak: { days: 9 + week.filter(x => x === "done").length, week } };
  };
  JG_API.sendCheer = (to, emoji) => ({ id: `ch_${Date.now()}`, from: "me", to, emoji, at: new Date().toISOString() });
  JG_API.reportMember = (id, reason) => ({ id: `rp_${Date.now()}`, member: id, reason, status: "received" });
  JG_API.blockMember = id => ({ member: id, blocked: true });
  const ST = { done: ["✓", "Done today"], studying: ["📖", "Studying now"], open: ["⏳", "Not yet"], freeze: ["🧊", "Streak freeze"], missed: ["·", "Missed"], rest: ["🌙", "Rest day"], future: ["", ""] };
  const layer = (id, cls) => { let el = $(id); if (!el) { el = document.createElement("div"); el.id = id; el.className = cls; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); view.parentElement.appendChild(el); } el.style.zIndex = String(window.JIA_z ? window.JIA_z() : 78); el.hidden = false; return el; };
  function openSquad() {
    const q = JG_API.squad(), el = layer("zq-view", "zq-view"), g = q.weekly_goal;
    el.setAttribute("aria-label", "Your squad");
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-q="close" aria-label="Close">‹</button><p class="dg-tt">Your squad</p><span class="dg-timer"></span></div><div class="zq-body">
      <div class="zq-goal"><b>${esc(q.name)}</b><small>Stage ${esc(q.stage)} · ${q.members.length} students</small><p>🧱 ${g.bricks_done} / ${g.bricks_target} bricks together this week</p><i><em style="width:${Math.min(100, g.bricks_done / g.bricks_target * 100)}%"></em></i></div>
      <div class="zq-streak"><b>🔥 ${q.group_streak.days}-day group streak</b><div class="zq-days">${wkDays().map((d, i) => `<span class="${q.group_streak.week[i]}"><small>${"MTWTFSS"[i]}</small><i>${q.group_streak.week[i] === "rest" ? "🌙" : q.group_streak.week[i] === "done" ? "✓" : ""}</i></span>`).join("")}</div>
        <p>A day counts when everyone does one session or one roadmap task. Sunday is rest, and a streak freeze covers your own day.</p></div>
      <div class="zq-list">${q.members.map(m => { const s = ST[m.today] || ST.open, c = SQ.cheers[m.user_id]; return `<div class="zq-m${m.me ? " me" : ""}">${m.avatar ? `<img src="${m.avatar}" alt="">` : `<span class="zq-av"></span>`}
        <span class="zq-mt"><b>${esc(m.first_name)}${m.me ? " (you)" : ""}</b><small>${s[0]} ${s[1]} · ${bricksTxt(m.week_bricks)} this week</small></span>
        ${m.me ? "" : `<span class="zq-ch" role="group" aria-label="Cheer ${esc(m.first_name)}">${["👋", "🔥", "👏"].map(e => `<button type="button" data-cheer="${m.user_id}" data-e="${e}" aria-pressed="${c === e}" aria-label="Send ${e}">${e}</button>`).join("")}</span><button type="button" class="zq-more" data-more="${m.user_id}" aria-label="Report or block ${esc(m.first_name)}">⋯</button>`}</div>`; }).join("")}</div>
      <p class="zq-note">Squads cheer, they don't chat. It keeps you focused and keeps everyone safe.</p></div>`;
  }
  document.addEventListener("click", e => {
    const v = $("zq-view"); if (!v || v.hidden || !v.contains(e.target)) return;
    const b = e.target.closest("[data-q]"), ch = e.target.closest("[data-cheer]"), mo = e.target.closest("[data-more]"), act = e.target.closest("[data-mod]");
    if (b && b.dataset.q === "close") v.hidden = true;
    else if (ch) { JG_API.sendCheer(ch.dataset.cheer, ch.dataset.e); SQ.cheers[ch.dataset.cheer] = ch.dataset.e; sqSave(); ch.parentElement.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === ch))); ch.classList.remove("pop"); void ch.offsetWidth; ch.classList.add("pop"); }
    else if (mo) { const id = mo.dataset.more, card = mo.closest(".zq-m"); const old = card.nextElementSibling; if (old && old.classList.contains("zq-menu")) { old.remove(); return; }
      card.insertAdjacentHTML("afterend", `<div class="zq-menu"><button type="button" data-mod="report" data-id="${id}">Report</button><button type="button" data-mod="block" data-id="${id}">Block</button></div>`); }
    else if (act) { const id = act.dataset.id, menu = act.closest(".zq-menu");
      if (act.dataset.mod === "report") { JG_API.reportMember(id, "reported_from_squad"); SQ.reported = [...new Set([...SQ.reported, id])]; sqSave(); menu.innerHTML = `<p>Thanks. Our safety team will review this, and they won't know it was you.</p>`; }
      else { JG_API.blockMember(id); SQ.blocked = [...new Set([...SQ.blocked, id])]; sqSave(); openSquad(); refreshComeBack(); } }
  });

  /* ---------- Your Week: a Sunday recap, shared like a medal story ---------- */
  JG_API.weekRecap = () => {
    const days = wkDays(), L = window.JIA_league, q = JG_API.squad();
    const sum = f => days.reduce((n, d) => n + f(ymd(d)), 0);
    return { week_start: ymd(days[0]), week_end: ymd(days[6]), bricks: sum(k => (SR.log[k] || {}).bricks || 0), minutes: sum(k => (SR.log[k] || {}).minutes || 0),
      tasks: sum(k => ((S.days || {})[k] || { done: [] }).done.length), streak: L ? L.ME.streak : 0, league_xp: L ? L.ME.week : 0, squad_goal: q.weekly_goal, card: JG_API.cardWeek ? JG_API.cardWeek() : null };
  };
  function weekStory(style) {
    const w = JG_API.weekRecap(), c = document.createElement("canvas"), W = 1080, H = 1920; c.width = W; c.height = H;
    const g = c.getContext("2d"), F = (wt, px) => `${wt} ${px}px Raleway, system-ui, sans-serif`, bg = g.createLinearGradient(0, 0, 0, H);
    if (style === "jade") { bg.addColorStop(0, "#1f8f5f"); bg.addColorStop(1, "#073a26"); } else { bg.addColorStop(0, "#15271f"); bg.addColorStop(1, "#040806"); }
    g.fillStyle = bg; g.fillRect(0, 0, W, H); g.textAlign = "center";
    g.fillStyle = "#f5c542"; g.font = F(700, 42); g.fillText("J A M A L S   G L O B A L", W / 2, 150);
    const f = d => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    g.fillStyle = "#fff"; g.font = F(700, 96); g.fillText("My week", W / 2, 290); g.fillStyle = "rgba(255,255,255,.7)"; g.font = F(600, 38); g.fillText(`${f(w.week_start)} – ${f(w.week_end)}`, W / 2, 350);
    const b = document.createElement("canvas"); b.width = 900; b.height = Math.round(900 * DOME.h / DOME.w); drawBuild(b); g.save(); g.beginPath(); g.roundRect ? g.roundRect(90, 420, 900, b.height, 36) : g.rect(90, 420, 900, b.height); g.clip(); g.drawImage(b, 90, 420); g.restore();
    g.fillStyle = "rgba(255,255,255,.85)"; g.font = F(700, 34); g.fillText(`🧱 ${SR.uni} · ${SR.bricks} / ${SR.target} bricks`, W / 2, 420 + b.height + 60);
    const tiles = [[bricksTxt(w.bricks), "this week"], [hm(w.minutes), "focused"], [String(w.tasks), "roadmap tasks"], [`🔥 ${w.streak}`, "day streak"], [`${w.league_xp} XP`, "league this week"], [`${w.squad_goal.bricks_done}/${w.squad_goal.bricks_target}`, "squad bricks"]];
    const y0 = 420 + b.height + 120;
    tiles.forEach(([v, l], i) => { const x = 90 + (i % 2) * 460, y = y0 + Math.floor(i / 2) * 185; g.fillStyle = "rgba(255,255,255,.08)"; g.beginPath(); g.roundRect ? g.roundRect(x, y, 440, 170, 28) : g.rect(x, y, 440, 170); g.fill(); g.fillStyle = "#fff"; g.font = F(700, 60); g.fillText(v, x + 220, y + 88); g.fillStyle = "rgba(255,255,255,.7)"; g.font = F(600, 30); g.fillText(l, x + 220, y + 136); });
    const cw = JG_API.cardWeek ? JG_API.cardWeek() : null; if (cw) { g.fillStyle = "#f5c542"; g.font = F(800, 46); g.fillText(`Your card: ${cw.from} → ${cw.to}`, W / 2, y0 + 610); }
    g.fillStyle = "rgba(255,255,255,.8)"; g.font = F(600, 34); g.fillText("Studying with Jamals Global", W / 2, H - 72); g.fillStyle = "#f5c542"; g.font = F(700, 30); g.fillText("#JamalsGlobal", W / 2, H - 30);
    return c;
  }
  function openWeek() {
    const w = JG_API.weekRecap(), el = layer("zw-view", "zq-view"); el.setAttribute("aria-label", "Your week");
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-w="close" aria-label="Close">‹</button><p class="dg-tt">Your week</p><span class="dg-timer"></span></div><div class="zq-body">
      <div class="zw-prev" id="zw-prev"></div><div class="zw-tiles"><span><b>${bricksTxt(w.bricks)}</b>this week</span><span><b>${hm(w.minutes)}</b>focused</span><span><b>${w.tasks}</b>roadmap tasks</span><span><b>🔥 ${w.streak}</b>day streak</span><span><b>${w.league_xp} XP</b>league</span><span><b>${w.squad_goal.bricks_done}/${w.squad_goal.bricks_target}</b>squad bricks</span>${w.card ? `<span><b>${w.card.from} → ${w.card.to}</b>your card</span>` : ""}</div></div>
      <div class="dg-foot"><button class="dg-go" type="button" data-w="share">Share my week</button></div>`;
    if (w.card && tierOf(w.card.from) !== tierOf(w.card.to) && S.cardUpShown !== w.week_start) { S.cardUpShown = w.week_start; save(); setTimeout(() => openCard(w.card), 700); }   // tier changed: upgrade moment
    const img = new Image(); img.alt = "Your week as a story"; img.src = weekStory("night").toDataURL("image/jpeg", .8); $("zw-prev").appendChild(img);
    el.onclick = e => { const b = e.target.closest("[data-w]"); if (!b) return; if (b.dataset.w === "close") el.hidden = true;
      else if (window.JIA_medals && window.JIA_medals.shareStory) window.JIA_medals.shareStory([weekStory("night"), weekStory("jade")], { title: "Share your week", labels: ["Night", "Jade"], caption: `🧱 My week on Jamals Global: ${bricksTxt(w.bricks)}, ${hm(w.minutes)} of focus. #JamalsGlobal`, name: `jamals-global-week-${w.week_start}.png` }); };
  }

  /* ---------- SAT Season: 6–8 weeks, its own medals and a live finale ---------- */
  const SEASON = { id: "sat_fall_2026", name: "SAT Season", starts: "2026-09-07", ends: "2026-11-01", target: 40, finale: { title: "SAT Season finale: live mock and awards", at: "2026-11-01T18:00:00+05:00" },
    medals: [{ id: "season_sat_10", name: "SAT Season: 10 bricks", need: 10, rare: "Rare" }, { id: "season_sat_25", name: "SAT Season: 25 bricks", need: 25, rare: "Epic" }, { id: "season_sat_40", name: "SAT Season finisher", need: 40, rare: "Legendary" }] };
  JG_API.season = () => {
    const mine = SR.sessions.filter(s => s.status === "completed" && /SAT/i.test(s.subject) && s.ended_at >= SEASON.starts).reduce((n, s) => n + s.bricks_awarded, 0), progress = 7 + mine;
    const left = Math.max(0, Math.ceil((new Date(SEASON.ends) - new Date()) / 864e5));
    return Object.assign({}, SEASON, { days_left: left, progress, medals: SEASON.medals.map(m => Object.assign({}, m, { earned: progress >= m.need })) });
  };
  function seasonCheck(before) {                                           // a crossed threshold becomes a medal ceremony
    const s = JG_API.season(), stk = window.JIA_ach ? window.JIA_ach.img("trophy") : "";
    s.medals.forEach(m => { if (before < m.need && s.progress >= m.need && window.JIA_celebrate) window.JIA_celebrate({ id: m.id, name: m.name, rare: m.rare, desc: `${m.need} SAT bricks this season`, img: stk }); });
  }
  function openSeason() {
    const s = JG_API.season(), el = layer("zs-view", "zq-view"); el.setAttribute("aria-label", s.name);
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-z="close" aria-label="Close">‹</button><p class="dg-tt">${esc(s.name)}</p><span class="dg-timer"></span></div><div class="zq-body">
      <div class="zq-goal zs"><b>📘 ${esc(s.name)}</b><small>${s.days_left} days left · ends ${new Date(s.ends).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</small><p>${s.progress} / ${s.target} SAT bricks this season</p><i><em style="width:${Math.min(100, s.progress / s.target * 100)}%"></em></i></div>
      <b class="jr-next-h">Season medals</b><div class="zs-medals">${s.medals.map(m => `<div class="zs-m${m.earned ? " on" : ""}"><span>${m.earned ? "🏅" : "🔒"}</span><b>${esc(m.name)}</b><small>${m.rare} · ${m.need} bricks</small></div>`).join("")}</div>
      <div class="zs-fin"><b>🎤 ${esc(s.finale.title)}</b><small>${new Date(s.finale.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tashkent" })} (Tashkent) · Live</small><button type="button" class="dg-go ghost" data-z="remind" aria-pressed="${SQ.remind}">${SQ.remind ? "✓ We'll remind you" : "Remind me"}</button></div>
      <p class="zq-note">Study SAT in the Study Room to fill the season. Every 25 minutes counts.</p></div>`;
    el.onclick = e => { const b = e.target.closest("[data-z]"); if (!b) return; if (b.dataset.z === "close") el.hidden = true; else { SQ.remind = !SQ.remind; sqSave(); openSeason(); } };
  }

  /* ---------- the class of your graduation year: a badge and a ranking by the same XP ---------- */
  JG_API.classOf = () => {
    const year = S.done && S.answers && derive(S.answers).graduation_date ? +derive(S.answers).graduation_date.slice(0, 4) : 2027, L = window.JIA_league, xp = L ? L.ME.xp : 0;
    const names = ["Kamola R.", "Bekzod T.", "Laylo S.", "Timur A.", "Nigora K.", "Jasur M.", "Sevara D.", "Aziz N.", "Diyora U.", "Otabek F."];
    const top = names.map((n, i) => ({ first_name: n, xp: xp + 2400 - i * 190 })), total = 1284, rank = 37;
    return { year, members_count: total, my_rank: rank, my_xp: xp, top };
  };
  function openClass() {
    const c = JG_API.classOf(), el = layer("zc-view", "zq-view"); el.setAttribute("aria-label", `Class of ${c.year}`);
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-c="close" aria-label="Close">‹</button><p class="dg-tt">Class of ${c.year}</p><span class="dg-timer"></span></div><div class="zq-body">
      <div class="zq-goal"><b>🎓 Class of ${c.year}</b><small>Everyone finishing school in ${c.year}, ranked by the same XP as your league</small><p>You're #${c.my_rank} of ${c.members_count.toLocaleString("en-US")}</p></div>
      <ol class="zc-list">${c.top.map((m, i) => `<li><span>${i + 1}</span><b>${esc(m.first_name)}</b><em>${m.xp.toLocaleString("en-US")} XP</em></li>`).join("")}<li class="me"><span>${c.my_rank}</span><b>You</b><em>${c.my_xp.toLocaleString("en-US")} XP</em></li></ol></div>`;
    el.onclick = e => { if (e.target.closest("[data-c=close]")) el.hidden = true; };
  }
  function classBadge() {                                                  // shown on your own profile
    const pv = $("pf-view"); if (!pv || pv.hidden || !pv.textContent.includes(JG_ME.fullName) || $("zc-badge")) return; /* JG-PROD: identity */
    const h = pv.querySelector("h1, h2"); if (h) h.insertAdjacentHTML("afterend", `<button type="button" class="zc-badge" id="zc-badge">🎓 Class of ${JG_API.classOf().year}</button>`);
    const bd = $("zc-badge"); if (bd) bd.onclick = openClass;
  }
  if ($("pf-view")) new MutationObserver(() => setTimeout(classBadge, 30)).observe($("pf-view"), { attributes: true, attributeFilter: ["hidden"] });

  /* ---------- Today: season banner, squad card, Your Week card, class row ---------- */
  function refreshComeBack() {
    const card = $("zr-card"); if (!card) return;
    ["zb-season", "zb-squad", "zb-week", "zb-class"].forEach(id => { const x = $(id); if (x) x.remove(); });
    const s = JG_API.season(), q = JG_API.squad(), c = JG_API.classOf(), sunday = new Date().getDay() === 0 || S.weekDemo;
    card.insertAdjacentHTML("beforebegin", `<button type="button" class="zb zb-season" id="zb-season"><span><b>📘 ${esc(s.name)}</b><small>${s.days_left} days left · ${s.progress} / ${s.target} bricks</small></span><i><em style="width:${Math.min(100, s.progress / s.target * 100)}%"></em></i></button>`);
    card.insertAdjacentHTML("afterend", `<button type="button" class="zb zb-squad" id="zb-squad"><span class="zr-faces">${q.members.slice(0, 5).map(m => m.avatar ? `<img src="${m.avatar}" alt="">` : "<span></span>").join("")}</span><span><b>Your squad · 🔥 ${q.group_streak.days}</b><small>${q.weekly_goal.bricks_done} / ${q.weekly_goal.bricks_target} bricks together this week</small></span></button>
      ${sunday && !window.JG_ENGINE /* JG-PROD: C2/C3, no Sunday "Your week" for a live student until P5: its squad tile adds invented classmates (final review runtime C2, owner to decide) */ ? `<button type="button" class="zb zb-week" id="zb-week"><span><b>🗓 Your week is ready</b><small>Share it as a story</small></span></button>` : ""}
      <button type="button" class="zb zb-class" id="zb-class"><span><b>🎓 Class of ${c.year}</b><small>You're #${c.my_rank} of ${c.members_count.toLocaleString("en-US")}</small></span></button>`);
    $("zb-season").onclick = openSeason; $("zb-squad").onclick = openSquad; $("zb-class").onclick = openClass; if ($("zb-week")) $("zb-week").onclick = openWeek;
  }
  if (pvq("zr-week")) pvq("zr-week").addEventListener("click", () => { S.weekDemo = true; save(); refreshComeBack(); openWeek(); });
  document.addEventListener("keydown", e => { if (e.key !== "Escape") return; const v = ["cg-view", "jl-view", "mn-view", "mf-view", "sy-view", "np-view", "lab-view", "cr-view", "jn-view", "jn-intro", "why-view", "cb-view", "ob-view", "jf-mini", "jx-board", "jc-q", "jc-help", "jc-found", "jc-voice", "jc-club", "jc-clubs", "fy-view", "pst-view", "pu-view", "pp-view", "ms-view", "cup-view", "pc-view", "jd-view", "zc-view", "zs-view", "zw-view", "zq-view"].map(id => $(id)).find(x => x && !x.hidden); if (v) { e.preventDefault(); v.hidden = true; } });
  refreshComeBack();

  /* ================= ONE SOURCE OF TRUTH: the scorecard drives the player card, the Home circles and the readiness ring ================= */
  const DEMO_A = { m0_dob: "2009-04-12", m0_residence_country: "UZ", m1_status: "in_school", m1_grade: "11", m2_destinations: ["US"], m3_average: "4.9", m3_gpa4: "3.9",
    m3_math_test: { rung: "calculus", confidence: .9 }, m3_olympiads: [{ subject: "Math", level: "national" }], m4_english_screener: { level: "C1", confidence: 1, source: "IELTS 7.5" },
    m5_tests_taken: [{ test: "SAT", score: 1570, official: true }, { test: "IELTS", score: 7.5, official: true }, { test: "AP", score: 5, official: true }],
    m7_annual_budget: { amount: "30000", currency: "USD", usd: 30000 }, m7_aid_need: "partial", m8_parent_attitude: "fully_supportive", m9_hours_per_week: "15", m10_passport: { choice: "yes" } };
  const srcA = () => (S.done && S.answers ? S.answers : window.JG_ENGINE ? S.answers || {} : DEMO_A);   /* JG-PROD: S15, the demo persona's answers (DEMO_A) only on the design's own account; a real student's own, so the bubbles show "—" */
  const CEFR_V = { A0: 35, A1: 42, A2: 52, B1: 66, B2: 80, C1: 88, C2: 95 }, CEFR_IELTS = { A1: 3, A2: 4, B1: 5, B2: 6, C1: 7, C2: 8 };
  const CODES = { academics: "ACA", math: "MTH", language: "LAN", tests: "TST", activities: "ACT", narrative: "STY", money: "MON", family: "FAM", logistics: "DOC", capacity: "TIM" };
  const tierOf = n => (n >= 87 ? "jade" : n >= 75 ? "gold" : n >= 60 ? "silver" : "bronze");
  JG_API.playerCard = () => {
    const a = srcA(), d = derive(a), sc = JG_API.scorecard(a, d), base = { green: 84, yellow: 68, red: 49 };
    const best = t => (a.m5_tests_taken || []).filter(x => String(x.test).toUpperCase() === t && (x.official === true || x.official === "true")).map(x => +x.score).sort((x, y) => y - x)[0];   /* JG-PROD: owner 3 Oct R7, P4b final review I2: official scores only (src/engine/card.ts), as the update sheet sends; R7 upper-cased the diagnostic's own rows, which P1's card never matched */   /* JG-PROD: owner 4 Oct P4g S2 M (review), and the first run's own rows before a reload ("sat", "ielts", as the step stores them), so Home's SAT and IELTS bubbles do not read "—" beside the "% ready" built from them */
    const val = k => {
      let v = base[(sc.axes[k] || {}).rag] || 60;
      if (k === "language") v = CEFR_V[d.english_tested || (a.m4_english_screener || {}).level] || v;
      if (k === "tests") { const s = best("SAT"), i = best("IELTS"); if (s) v = Math.max(v, Math.round(40 + (s - 400) / 1200 * 59)); if (i) v = Math.max(v, Math.round(i / 9 * 99)); }
      const av = avgOf(a); if (k === "academics" && av) v = Math.max(v, Math.min(97, Math.round(av.five / 5 * 99)));   /* JG-PROD: owner 3 Oct R1 */
      if (k === "math") { const r = RUNGS.indexOf((a.m3_math_test || {}).rung || d.math_tested); if (r >= 0) v = Math.max(v, 45 + r * 7); }
      return Math.max(30, Math.min(99, v + hash(k + (a.m0_dob || ""), 5) - 2));
    };
    const stats = AXES.map(([k, n]) => ({ key: k, name: n, code: CODES[k], value: val(k) })), front = stats.slice(0, 6);
    const overall = Math.round((front.reduce((n, s) => n + s.value, 0) * 2 + stats.slice(6).reduce((n, s) => n + s.value, 0)) / 16);
    const ie = best("IELTS");
    return { overall, tier: tierOf(overall), stage: d.stage || "S3", name: a === DEMO_A ? JG_ME.fullName : "You", country: a.m0_residence_country || "UZ", front, back: stats, /* JG-PROD: identity */
      sat: best("SAT") || null, ielts: ie || null, ielts_est: ie || CEFR_IELTS[d.english_tested || (a.m4_english_screener || {}).level] || null,
      gpa4: a.m3_gpa4 ? +a.m3_gpa4 : avgOf(a) ? (avgOf(a).scale === "gpa_4" ? avgOf(a).value : Math.round(avgOf(a).five / 5 * 40) / 10) : null, ap: best("AP") || null, age: d.age, medals: (a.m3_olympiads || []).length };   /* JG-PROD: owner 3 Oct R1 */
  };
  JG_API.readiness = () => JG_API.playerCard().overall;
  function syncHome() {                                                    // the Home circles and the readiness ring read the same card
    const c = JG_API.playerCard(), av = window.JG_ENGINE ? avgOf(srcA()) : null, vals = { SAT: c.sat, IELTS: c.ielts, GPA: av ? av.value : c.gpa4, Average: av ? av.value : null, "AP avg": c.ap }, max = { SAT: 1600, IELTS: 9, GPA: av ? av.of : 4, Average: av ? av.of : 5, "AP avg": 5 };   /* JG-PROD: owner 4 Oct R13 (P4e G5), a real student's own average on his own scale (4.3 of 5), never a GPA converted from it (WIUT's page says the university converts it itself); the demo keeps the design's card; G5 review: "Average" is the same value once the bubble is called so */
    document.querySelectorAll(".bubble").forEach(b => { const l = b.querySelector(".txt span"), k = l ? l.dataset.k || l.textContent : "", v = l ? vals[k] : undefined; if (!l || !(k in vals)) return;   /* JG-PROD: owner 6 Oct P4h H1 review: the key is the label's data-k (the design's English, M:002:58, D:001:84), so a translated label still finds its value */
      b.querySelector(".txt b").textContent = v == null ? "—" : v; b.style.setProperty("--off", (2 * Math.PI * 48 * (1 - Math.min((v || 0) / max[k], 1))).toFixed(1)); if (window.JG_ENGINE && (k === "GPA" || k === "Average")) { const own = !!av && av.scale !== "gpa_4", li = [...($("sr") || { children: [] }).children].find(x => (x.dataset.k || x.textContent.split(":")[0]) === k); b.querySelector(".txt i").textContent = own ? `of ${av.of}` : "of 4.0"; if (li) li.dataset.k = own ? "Average" : "GPA"; l.dataset.k = l.textContent = own ? "Average" : "GPA"; } });   /* JG-PROD: owner 4 Oct R13 (P4e G5), the bubble names his own scale; G5 review: and calls a school average "Average", not "GPA" (bubble and screen-reader line); JG-PROD: owner 6 Oct P4h H1 review, keyed by data-k (the line's text is written from its key on the next line) */
    const sr = $("sr"); if (sr) [...sr.children].forEach(li => { const k = li.dataset.k || Object.keys(vals).find(x => li.textContent.startsWith(x + ":")); if (k in vals) li.textContent = `${k}: ${vals[k] == null ? "not taken yet" : vals[k]} of ${max[k]}`; });   /* JG-PROD: owner 6 Oct P4h H1 review: each line found by its data-k (M:002:66, D:001:90), so a translated line is still rewritten */
    const JK = window.JG_ENGINE && window.JG_ENGINE.cache, ov = !JK ? c.overall : JK.ready ? JK.ready.value : null; if (ov != null) window.JG_readiness = () => ov;   /* JG-PROD: S15, readiness is the server's; before a result the chart keeps its first-launch 1 %; owner 4 Oct R14r, a real student's is his "% ready" (the engine's v2), not the card's overall (the demo keeps the design's card) */
    const C = window.JG_ENGINE && window.JG_ENGINE.chance && window.JG_ENGINE.chance(), n = $("rm-ready-n"); if (n && ov != null) n.textContent = C ? C.num : `${ov}%`; const t = $("tipA"); if (t && ov != null) t.textContent = C ? C.tag : `${ov}% ready`; const r = $("rm-ready"); if (r && ov != null) r.setAttribute("aria-label", C ? `${C.chanceFor}: ${C.long}` : `${ov}% ready for university`); const u = document.querySelector(".rm-left-u, .rm-ready-u"); if (u && C) u.textContent = C.ring;   /* JG-PROD: S15 */   /* JG-PROD: owner 7 Oct P5d, one number on Home: his chance's number, tag and words, the ring's unit "chance" (owner decision 1) */
    paintCardHome();
  }

  /* ---------- the player card: rating up front, all 10 on the back, tap to flip ---------- */
  const meFace = () => meAvatar();
  function cardHTML(c, cls = "") {
    const flagE = COUNTRY[c.country] ? flag(c.country) : "🏳️";
    return `<div class="pc-card t-${c.tier} ${cls}" role="button" tabindex="0" aria-label="Player card: overall ${c.overall}, ${c.tier} tier. Tap to flip."><div class="pc-inner">
      <div class="pc-face pc-front"><div class="pc-top"><span class="pc-ovr"><b>${c.overall}</b><small>${esc(c.stage)}</small></span><span class="pc-flag">${flagE}</span></div>
        <div class="pc-photo" style="${meFace() ? `background-image:url('${meFace()}')` : ""}"></div><b class="pc-name">${esc(c.name.toUpperCase())}</b>
        <div class="pc-stats">${c.front.map(s => `<span><b>${s.value}</b>${s.code}</span>`).join("")}</div><span class="pc-brand">JAMALS GLOBAL · ${c.tier.toUpperCase()}</span></div>
      <div class="pc-face pc-back"><b class="pc-bt">All 10 · ${c.overall}</b>${c.back.map(s => `<div class="pc-row"><span>${esc(s.name)}</span><i><em style="width:${s.value}%"></em></i><b>${s.value}</b></div>`).join("")}<span class="pc-brand">Tap to flip back</span></div>
    </div></div>`;
  }
  function paintCardHome() {
    const rm = $("rm"); if (!rm) return; const c = JG_API.playerCard(); let h = $("pc-home");
    const html = `<section class="pc-home" id="pc-home" aria-label="Your player card"><div class="pc-mini" data-pc="open">${cardHTML(c, "sm")}</div><div class="pc-side"><b>Your player card</b><p>${c.tier[0].toUpperCase() + c.tier.slice(1)} · ${c.overall} overall</p><small>Tiers: bronze → silver → gold → Jade. Your card updates every Sunday.</small><button type="button" class="pc-btn" data-pc="open">Open card</button></div></section>`;
    if (h) h.outerHTML = html; else rm.insertAdjacentHTML("afterend", html);
  }
  function cardStory(c) {
    const cv = document.createElement("canvas"), W = 1080, H = 1920; cv.width = W; cv.height = H; const g = cv.getContext("2d"), F = (w, p) => `${w} ${p}px Raleway, system-ui, sans-serif`;
    const T = { bronze: ["#6b4226", "#c98b5e"], silver: ["#6d7a86", "#dfe6ec"], gold: ["#8a6508", "#f5d77a"], jade: ["#0b4f37", "#3fd29a"] }[c.tier];
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#0c1a14"); bg.addColorStop(1, "#040806"); g.fillStyle = bg; g.fillRect(0, 0, W, H); g.textAlign = "center";
    g.fillStyle = "#f5c542"; g.font = F(700, 40); g.fillText("J A M A L S   G L O B A L", W / 2, 150);
    const cg = g.createLinearGradient(240, 300, 840, 1500); cg.addColorStop(0, T[1]); cg.addColorStop(1, T[0]); g.fillStyle = cg; g.beginPath(); (g.roundRect ? g.roundRect(190, 260, 700, 1100, 60) : g.rect(190, 260, 700, 1100)); g.fill();
    g.fillStyle = "#10271e"; g.textAlign = "left"; g.font = F(800, 150); g.fillText(String(c.overall), 250, 440); g.font = F(700, 44); g.fillText(c.stage, 262, 500);
    g.textAlign = "center"; g.font = F(800, 58); g.fillText(c.name.toUpperCase(), W / 2, 900);
    c.front.forEach((s, i) => { const x = 330 + (i % 3) * 210, y = 1030 + Math.floor(i / 3) * 150; g.font = F(800, 64); g.fillText(String(s.value), x, y); g.font = F(700, 34); g.fillText(s.code, x, y + 46); });
    g.font = F(700, 34); g.fillText(`${c.tier.toUpperCase()} TIER`, W / 2, 1320);
    g.fillStyle = "#fff"; g.font = F(700, 50); g.fillText("My Jamals Global player card", W / 2, 1520); g.fillStyle = "rgba(255,255,255,.7)"; g.font = F(600, 36); g.fillText("Built from my real scorecard", W / 2, 1580);
    g.fillStyle = "#f5c542"; g.font = F(700, 32); g.fillText("#JamalsGlobal", W / 2, H - 70);
    return cv;
  }
  function openCard(up) {
    const c = JG_API.playerCard(), el = layer("pc-view", "zq-view pc-view"); el.setAttribute("aria-label", "Your player card");
    const prev = up ? up.from : null;
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-pc="close" aria-label="Close">‹</button><p class="dg-tt">Your player card</p><span class="dg-timer"></span></div><div class="zq-body pc-body">
      ${up ? `<p class="pc-up-h" id="pc-up-h">Your card: ${prev} → ${c.overall}</p>` : ""}<div class="pc-stage">${cardHTML(up ? Object.assign({}, c, { overall: prev, tier: tierOf(prev) }) : c, "lg")}</div>
      ${up ? mascot("cele", "pc-jamol") : ""}<p class="zq-note">Tap the card to see all 10. It comes from your scorecard, like your Home circles and readiness ring.</p></div>
      <div class="dg-foot"><button class="dg-go" type="button" data-pc="share">Share as a story</button></div>`;
    if (up && tierOf(prev) !== c.tier) setTimeout(() => { const card = el.querySelector(".pc-card"); if (!card) return; card.outerHTML = cardHTML(c, "lg pc-upgrade"); const h = $("pc-up-h"); if (h) h.textContent = `Your card: ${prev} → ${c.overall} · upgraded to ${c.tier[0].toUpperCase() + c.tier.slice(1)}`; }, 1200);
  }
  document.addEventListener("click", e => {
    const f = e.target.closest(".pc-card"); if (f && !f.closest(".pc-mini")) { f.classList.toggle("flip"); return; }
    const b = e.target.closest("[data-pc]"); if (!b) return; const a = b.dataset.pc;
    if (a === "open") openCard(); else if (a === "close") $("pc-view").hidden = true;
    else if (a === "share" && window.JIA_medals && window.JIA_medals.shareStory) window.JIA_medals.shareStory([cardStory(JG_API.playerCard())], { title: "Share your card", labels: ["Card"], caption: `My Jamals Global player card: ${JG_API.playerCard().overall}. #JamalsGlobal`, name: "jamals-global-player-card.png" });
  });
  document.addEventListener("keydown", e => { const f = e.target.closest && e.target.closest(".pc-card"); if (f && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); f.classList.toggle("flip"); } });
  JG_API.cardWeek = () => { const JC = window.JG_ENGINE ? window.JG_ENGINE.cache.card : undefined; if (window.JG_ENGINE && !JC) return null; const now = JC ? JC.overall : JG_API.playerCard().overall; return { from: JC ? (JC.week_from != null ? JC.week_from : now) : S.cardPrev || now - 3, to: now }; };   /* JG-PROD: S16, the change since this week's first snapshot, not now − 3; no card yet, no change (final review runtime C2) */

  /* ================= JG DAILY: one tough question a day, the same for everyone ================= */
  const DAILY = [
    ["SAT Math", "If 3x + 7 = 2x − 5, what is x?", ["−12", "−2", "2", "12"], 0, "Subtract 2x from both sides: x + 7 = −5, so x = −12."],
    ["IELTS Vocabulary", "Which is closest in meaning to “meticulous”?", ["Careless", "Very careful and precise", "Quick", "Generous"], 1, "Meticulous means showing great attention to detail."],
    ["Olympiad Logic", "A clock shows 3:15. What is the angle between the hands?", ["0°", "7.5°", "15°", "22.5°"], 1, "The minute hand points at 3. The hour hand has moved a quarter of the way to 4: a quarter of 30° is 7.5°."],
    ["SAT Reading", "“The committee's decision was provisional.” Provisional most nearly means…", ["Final", "Temporary", "Secret", "Unanimous"], 1, "Provisional means arranged for now and possibly changed later."],
    ["Olympiad Math", "What is the last digit of 7^2026?", ["1", "3", "7", "9"], 3, "Last digits of powers of 7 repeat 7, 9, 3, 1. 2026 leaves remainder 2 when divided by 4, so the digit is 9."],
    ["IELTS Grammar", "Which sentence is correct?", ["If I would have time, I will call you.", "If I have time, I will call you.", "If I had time, I will call you.", "If I have time, I would called you."], 1, "First conditional: if + present simple, then will + verb."],
    ["SAT Math", "A shirt costs $40 after a 20% discount. What was the original price?", ["$48", "$50", "$52", "$60"], 1, "80% of the price is $40, so the price is 40 ÷ 0.8 = $50."] ];
  const DAILY_START = new Date("2026-05-06T00:00:00");
  const classYear = () => (JG_API.classOf ? JG_API.classOf().year : 2027);
  JG_API.daily = (date = ymd(new Date())) => {
    const n = Math.floor((new Date(date + "T00:00:00") - DAILY_START) / 864e5) + 1, q = DAILY[((n - 1) % 7 + 7) % 7];
    return { number: n, date, subject: q[0], question: q[1], options: q[2], cohort: `Class of ${classYear()}`, pct_correct: 38 + hash(date, 40) };
  };
  JG_API.answerDaily = (date, choice, seconds) => {
    const d = JG_API.daily(date), q = DAILY[((d.number - 1) % 7 + 7) % 7], ok = choice === q[3], L = window.JIA_league;
    const t = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
    return { number: d.number, correct: ok, correct_index: q[3], explanation: q[4], seconds, xp: ok ? 20 : 10, share_text: `JG Daily #${d.number} ${ok ? "✅" : "❌"} ${t} 🔥${L ? L.ME.streak : 0}` };
  };
  JG_API.dailyThread = date => [["Sevara", "Did it with the remainder trick, took me a minute."], ["Timur", "Nice one. Anyone got a faster way?"], ["Laylo", "Wrote it out on paper first, it helped."]].map(([n, t], i) => ({ id: `c${i}`, first_name: n, text: t, at: date }));
  JG_API.postDaily = (date, text) => ({ id: `c_${Date.now()}`, first_name: "You", text, at: new Date().toISOString() });
  function dailyState() { S.daily = S.daily || {}; return S.daily[ymd(new Date())]; }
  function paintDailyCard() {
    const host = $("zr-card"); if (!host) return; const d = JG_API.daily(), st = dailyState(), old = $("jd-card");
    const html = `<button type="button" class="zb jd-card" id="jd-card"><span><b>JG Daily #${d.number} · ${esc(d.subject)}</b><small>${st ? `${st.correct ? "✅" : "❌"} ${st.time} · discussion open` : "One tough question. Same for everyone today."}</small></span><em class="jd-go">${st ? "See" : "Answer"}</em></button>`;
    if (old) old.outerHTML = html; else host.insertAdjacentHTML("beforebegin", html); $("jd-card").onclick = openDaily;
  }
  let dT0 = 0;
  function openDaily() {
    const d = JG_API.daily(), st = dailyState(), el = layer("jd-view", "zq-view"); el.setAttribute("aria-label", `JG Daily number ${d.number}`);
    const opts = d.options.map((o, i) => `<button type="button" class="dg-opt${st ? (i === st.correct_index ? " ok" : i === st.choice ? " bad" : "") : ""}" data-jd="${i}"${st ? " disabled" : ""}><span>${esc(o)}</span></button>`).join("");
    const thread = st ? [...JG_API.dailyThread(d.date), ...((S.dailyPosts || {})[d.date] || [])] : [];
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-jd="close" aria-label="Close">‹</button><p class="dg-tt">JG Daily #${d.number}</p><span class="dg-timer" id="jd-timer">${st ? "" : "0:00"}</span></div><div class="zq-body">
      <p class="dg-mod">${esc(d.subject)}</p><h2 class="jd-q">${esc(d.question)}</h2><div class="dg-opts">${opts}</div>
      ${st ? `<div class="jd-res ${st.correct ? "ok" : "bad"}"><b>${st.correct ? "Correct" : "Not this time"} · +${st.xp} XP</b><p>${esc(st.explanation)}</p><small>${d.pct_correct}% of ${esc(d.cohort)} got this</small></div>
        <div class="jd-share"><code>${esc(st.share_text)}</code><button type="button" class="dg-go" data-jd="share">Share</button><button type="button" class="dg-link" data-jd="copy">Copy result</button></div>
        <b class="jr-next-h">Discussion</b><ul class="jd-thread">${thread.map(c => `<li><b>${esc(c.first_name)}</b><p>${esc(c.text)}</p><button type="button" class="jd-rep" data-jd="report" aria-label="Report this comment">Report</button></li>`).join("")}</ul>
        <div class="jd-post"><input class="dg-field" id="jd-in" maxlength="200" placeholder="Add to the discussion (be kind)"><button type="button" class="dg-go" data-jd="post">Post</button></div>`
      : `<p class="zq-note">The discussion opens after you answer, so there are no spoilers.</p>`}</div>`;
    if (!st) { dT0 = Date.now(); clearInterval(openDaily.t); openDaily.t = setInterval(() => { const t = $("jd-timer"); if (!t || el.hidden) return clearInterval(openDaily.t); const s = Math.floor((Date.now() - dT0) / 1000); t.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }, 500); }
    el.onclick = async e => {
      const b = e.target.closest("[data-jd]"); if (!b || b.disabled) return; const a = b.dataset.jd;
      if (a === "close") { el.hidden = true; clearInterval(openDaily.t); }
      else if (/^\d$/.test(a)) answerDaily(+a, Math.max(1, Math.round((Date.now() - dT0) / 1000)));
      else if (a === "copy") { try { await navigator.clipboard.writeText(dailyState().share_text); b.textContent = "Copied ✓"; } catch (err) { b.textContent = dailyState().share_text; } }
      else if (a === "share" && window.JIA_medals && window.JIA_medals.shareStory) window.JIA_medals.shareStory([dailyStory()], { title: "Share your result", labels: ["Daily"], caption: `${dailyState().share_text} #JamalsGlobal`, name: `jg-daily-${d.number}.png` });
      else if (a === "post") { const v = ($("jd-in").value || "").trim(); if (!v) return; S.dailyPosts = S.dailyPosts || {}; S.dailyPosts[d.date] = [...(S.dailyPosts[d.date] || []), JG_API.postDaily(d.date, v)]; save(); openDaily(); }
      else if (a === "report") { b.textContent = "Reported"; b.disabled = true; }
    };
  }
  function answerDaily(choice, seconds) {
    const d = JG_API.daily(), r = JG_API.answerDaily(d.date, choice, seconds), L = window.JIA_league;
    S.daily = S.daily || {}; S.daily[d.date] = Object.assign({ choice, time: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}` }, r); save();
    if (L) { L.ME.xp += r.xp; L.ME.week += r.xp; try { L.paint(); } catch (e) {} }
    clearInterval(openDaily.t); openDaily(); paintDailyCard();
  }
  function dailyStory() {
    const st = dailyState(), d = JG_API.daily(), cv = document.createElement("canvas"), W = 1080, H = 1920; cv.width = W; cv.height = H;
    const g = cv.getContext("2d"), F = (w, p) => `${w} ${p}px Raleway, system-ui, sans-serif`, bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#15271f"); bg.addColorStop(1, "#040806"); g.fillStyle = bg; g.fillRect(0, 0, W, H); g.textAlign = "center";
    g.fillStyle = "#f5c542"; g.font = F(700, 40); g.fillText("J A M A L S   G L O B A L", W / 2, 170);
    g.fillStyle = "#fff"; g.font = F(800, 110); g.fillText(`JG Daily #${d.number}`, W / 2, 520); g.fillStyle = "rgba(255,255,255,.7)"; g.font = F(600, 44); g.fillText(d.subject, W / 2, 600);
    g.fillStyle = "#fff"; g.font = F(800, 180); g.fillText(`${st.correct ? "✅" : "❌"} ${st.time}`, W / 2, 900); g.font = F(800, 120); g.fillText(`🔥 ${window.JIA_league ? window.JIA_league.ME.streak : 0}`, W / 2, 1110);
    g.fillStyle = "rgba(255,255,255,.8)"; g.font = F(600, 44); g.fillText(`${d.pct_correct}% of ${d.cohort} got this`, W / 2, 1300);
    g.fillStyle = "#f5c542"; g.font = F(700, 36); g.fillText("Can you beat me? #JamalsGlobal", W / 2, H - 90); return cv;
  }

  /* ================= GHOST MODE: race the real path of someone who got in (mock until alumni consent) ================= */
  const GHOSTS = [
    { id: "malika", first_name: "Malika", admitted: "MIT '29", path: [[14, 5.5, 1, "Joined the regional math olympiad"], [15, 6.5, 2, "Took the national olympiad and started a robotics club"], [16, 7.5, 3, "Did summer research with a university lab"], [17, 8, 4, "Applied Early Action with essays on her robotics club"]] },
    { id: "javohir", first_name: "Javohir", admitted: "MIT '28", path: [[14, 5, 0, "Finished Algebra 2 a year early"], [15, 6, 1, "Won a regional physics medal"], [16, 7, 2, "Built an app used by 300 students at his school"], [17, 7.5, 3, "Scored 1550 on the SAT and applied"]] },
    { id: "sabina", first_name: "Sabina", admitted: "MIT '30", path: [[14, 6, 1, "Read 30 English books in a year"], [15, 7, 1, "Started tutoring younger students in math"], [16, 7.5, 2, "Won a national informatics medal"], [17, 8, 3, "Applied with a strong research essay"]] } ];
  JG_API.ghosts = () => GHOSTS.map(g => ({ id: g.id, first_name: g.first_name, admitted: g.admitted, path: g.path.map(([age, ielts, medals, did]) => ({ age, ielts, olympiad_medals: medals, did })) }));
  JG_API.ghostCompare = id => {
    const g = JG_API.ghosts().find(x => x.id === id); if (!g) return null; const c = JG_API.playerCard(), age = Math.max(14, Math.min(17, c.age || 15));
    const at = g.path.find(p => p.age === age), you = { ielts: c.ielts_est, ielts_official: !!c.ielts, olympiad_medals: c.medals };
    return { ghost: g.id, age, ghost_at_age: at, you, behind: (you.ielts || 0) < at.ielts || you.olympiad_medals < at.olympiad_medals, next_step: at.did };
  };
  function ghostYear(y) {                                                  // the ghost's dotted lane beside your timeline
    if (!S.ghost) return ""; const g = JG_API.ghosts().find(x => x.id === S.ghost), c = JG_API.playerCard(); if (!g || c.age == null) return "";
    const age = c.age + (+y - new Date().getFullYear()), at = g.path.find(p => p.age === age); if (!at) return "";
    return `<li class="jr-ghost" aria-label="${esc(g.first_name)} at ${age}"><i aria-hidden="true">👻</i><span><b>${esc(g.first_name)} at ${age}</b> IELTS ${at.ielts} · ${at.olympiad_medals} medal${at.olympiad_medals === 1 ? "" : "s"} · ${esc(at.did)}</span></li>`;
  }
  function ghostCard() {
    if (!S.ghost) return `<button type="button" class="jr-ghostbtn" data-r="ghostpick">👻 Race a ghost: someone who got into your dream school</button>`;
    const g = JG_API.ghosts().find(x => x.id === S.ghost), cmp = JG_API.ghostCompare(S.ghost); if (!g || !cmp) return "";
    const a = cmp.ghost_at_age, y = cmp.you, added = (S.ghostAdds || []).includes(a.did);
    return `<div class="jr-ghostcard"><b>👻 You vs ${esc(g.first_name)}, ${esc(g.admitted)}</b><p>At ${cmp.age}, ${esc(g.first_name)} had IELTS ${a.ielts} and ${a.olympiad_medals} olympiad medal${a.olympiad_medals === 1 ? "" : "s"}. You: ${y.ielts ? (y.ielts_official ? y.ielts : `about ${y.ielts} (from your English check)`) : "no score yet"} and ${y.olympiad_medals}.</p>
      ${cmp.behind ? `<p class="jr-ghostnext">${esc(g.first_name)}'s next step at your age: <b>${esc(a.did)}</b></p><button type="button" class="dg-go" data-r="ghostadd"${added ? " disabled" : ""}>${added ? "Added to your roadmap ✓" : "Add it as a task"}</button>` : `<p class="jr-ghostnext">You're ahead of ${esc(g.first_name)}'s pace. Keep going.</p>`}
      <button type="button" class="dg-link" data-r="ghostpick">Change ghost</button></div>`;
  }
  function ghostPick() {
    const el = document.createElement("div"); el.className = "jr-sheet"; el.id = "jr-sheet";
    el.innerHTML = `<div class="jr-sheet-bg" data-r="shut"></div><div class="jr-card" role="dialog" aria-modal="true" aria-labelledby="jg-h"><p class="dg-mod">Ghost mode · shared with their consent</p><h3 id="jg-h">Who do you want to race?</h3>
      <div class="jb-people">${JG_API.ghosts().map(g => `<button type="button" class="dg-opt" data-ghost="${g.id}" aria-checked="${S.ghost === g.id}"><span class="jb-av">👻</span><span><b>${esc(g.first_name)}, ${esc(g.admitted)}</b><small>At 15: IELTS ${g.path[1].ielts} · ${g.path[1].olympiad_medals} medals</small></span></button>`).join("")}</div>
      <div class="jr-acts">${S.ghost ? `<button class="dg-link" type="button" data-r="ghostoff">Turn ghost off</button>` : ""}<button class="dg-link" type="button" data-r="shut">Close</button></div></div>`;
    el.style.zIndex = String(+rv.style.zIndex + 1); rv.appendChild(el);
    el.addEventListener("click", e => { const b = e.target.closest("[data-ghost]"); if (b) { S.ghost = b.dataset.ghost; save(); openRoadmap(); } else if (e.target.closest("[data-r=ghostoff]")) { S.ghost = null; save(); openRoadmap(); } });
  }
  rv.addEventListener("click", e => {
    const b = e.target.closest("[data-r]"); if (!b) return;
    if (b.dataset.r === "ghostpick") ghostPick();
    else if (b.dataset.r === "ghostadd") { const cmp = JG_API.ghostCompare(S.ghost); S.ghostAdds = [...new Set([...(S.ghostAdds || []), cmp.next_step])]; save(); RM = null; openRoadmap(); if (window.JIA_notify) window.JIA_notify({ text: `<b>Added to your roadmap.</b> ${esc(cmp.next_step)}` }); }
  });

  /* ---------- demo controls and first paint ---------- */
  if (pvq("jd-answer")) pvq("jd-answer").addEventListener("click", () => { if (!dailyState()) { openDaily(); dT0 = Date.now() - 48000; const d = JG_API.daily(), q = DAILY[((d.number - 1) % 7 + 7) % 7]; answerDaily(q[3], 48); } else openDaily(); });
  if (pvq("pc-upgrade")) pvq("pc-upgrade").addEventListener("click", () => { const now = JG_API.playerCard().overall, lo = { jade: 85, gold: 73, silver: 58, bronze: now - 3 }[tierOf(now)]; S.cardPrev = lo; save(); openCard({ from: lo }); });
  window.JG_API = JG_API;                                                  // the mock backend's interface, reachable for tests and the backend team
  syncHome(); paintDailyCard(); if (window.JG_ENGINE) document.addEventListener("jg:snapshot", () => { const st = window.JG_ENGINE.cache.study; if (st && !run) { SR.uni = st.uni; SR.bricks = st.bricks; SR.target = st.target; } const cb = document.querySelector("#zr-card .zr-card-build"); if (cb) cb.innerHTML = `🧱 ${esc(SR.uni)} · <b id="zr-card-bricks">${SR.bricks}</b> / ${SR.target} bricks`; refreshStudyCards(); syncHome(); const pf = window.JG_ENGINE.cache.profile || {}, sb = document.querySelector(".sb-role"), tb = document.querySelector("#tb-me .tb-mn small"); if (sb) sb.textContent = ["College applicant", pf.grade].filter(Boolean).join(" · "); if (tb) tb.textContent = window.JG_ENGINE.meLine(" · "); });   /* JG-PROD: owner 4 Oct R13 (P4e G5), the Study Room card's dream and bricks and Home's average follow a newer snapshot (the runtime's "jg:snapshot"), so the first run's "Your dream uni · 0 / 600 bricks" and "—" do not wait for a reload; a session running here settles its own bricks; G5 review: so do the desktop sidebar's "College applicant · Grade 9" and the top bar's grade and school (as the server draws them, SB_ROLE / TB_SUB) */

  /* ================= MOCK SATURDAY: a full timed mock, everyone starts together ================= */
  const MQ = {
    sat: [["Math", [["If f(x) = 2x² − 3, what is f(−2)?", ["−11", "5", "11", "−5"], 1, "2 × (−2)² − 3 = 2 × 4 − 3 = 5."], ["Where does y = 3x − 4 cross the x-axis?", ["x = 4/3", "x = −4/3", "x = 3/4", "x = −4"], 0, "Set y = 0: 3x = 4, so x = 4/3."], ["A car travels 150 km in 2.5 hours. What is its average speed?", ["50 km/h", "60 km/h", "65 km/h", "75 km/h"], 1, "150 ÷ 2.5 = 60 km/h."]]],
      ["Reading and Writing", [["The findings were so ___ that other labs quickly confirmed them.", ["ambiguous", "robust", "fragile", "obscure"], 1, "Robust results hold up when others repeat the work."], ["Which sentence is correct?", ["Each of the students have a book.", "Each of the students has a book.", "Each of the students having a book.", "Each of the student have books."], 1, "“Each” is singular, so it takes “has”."], ["“Mitigate” most nearly means…", ["worsen", "lessen", "ignore", "measure"], 1, "To mitigate is to make something less severe."]]]],
    ielts: [["Reading", [["“Abundant” means…", ["rare", "plentiful", "expensive", "useless"], 1, "Abundant means existing in large quantities."], ["By next year, she ___ here for ten years.", ["works", "will have worked", "has worked", "worked"], 1, "Future perfect: an action complete by a future time."], ["Which is closest to “decline” as a noun?", ["increase", "decrease", "stability", "peak"], 1, "A decline is a decrease."]]],
      ["Writing and Grammar", [["Which sentence is correct?", ["The number of students have increased.", "The number of students has increased.", "A number of students has increased.", "The numbers of student has increased."], 1, "“The number” is singular: has increased."], ["In a Task 1 report, which phrase describes a small change?", ["rocketed", "rose slightly", "plummeted", "doubled"], 1, "“Rose slightly” describes a small increase."], ["“Consequently” shows…", ["contrast", "a result", "an example", "time"], 1, "Consequently introduces a result."]]]],
    dtm: [["Math", [["What is 25% of 360?", ["80", "90", "95", "120"], 1, "360 ÷ 4 = 90."], ["What is √144?", ["11", "12", "14", "72"], 1, "12 × 12 = 144."], ["If 2x + 5 = 17, what is x?", ["5", "6", "7", "11"], 1, "2x = 12, so x = 6."]]],
      ["Logic", [["Next number: 2, 6, 12, 20, 30, …", ["40", "42", "44", "36"], 1, "The gaps grow by 2: +4, +6, +8, +10, +12."], ["A rectangle is 8 by 5. What is its perimeter?", ["13", "26", "40", "21"], 1, "2 × (8 + 5) = 26."], ["Which number is prime?", ["21", "27", "29", "33"], 2, "29 has no divisors other than 1 and itself."]]]] };
  const MS_SUBJ = ["SAT", "IELTS", "AP", "Olympiad", "School subjects", "DTM (Uzbekistan)"], bankOf = s => (s === "IELTS" ? "ielts" : /^DTM/.test(s) ? "dtm" : "sat");
  const nextSat = () => { const n = new Date(), d = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), 5, 0, 0)); while (d.getUTCDay() !== 6 || d <= n) d.setUTCDate(d.getUTCDate() + 1); return d; };   // Saturday 10:00 Tashkent
  JG_API.mockSaturday = () => ({ id: `ms_${ymd(nextSat())}`, starts_at: (S.msDemoAt ? new Date(S.msDemoAt) : nextSat()).toISOString(), registered_count: 2341 + hash(ymd(new Date()), 300), subjects: MS_SUBJ, my_registration: S.msReg || null, section_minutes: 6 });
  JG_API.registerMock = subject => ({ mock_id: JG_API.mockSaturday().id, subject, registered: true });
  JG_API.mockTest = subject => ({ subject, sample: true, sections: MQ[bankOf(subject)].map(([name, qs]) => ({ name, minutes: 6, questions: qs.map(([q, o]) => ({ q, options: o })) })) });
  JG_API.submitMock = (subject, answers) => {
    const secs = MQ[bankOf(subject)], review = []; let score = 0;
    secs.forEach(([name, qs], si) => qs.forEach(([q, o, a, why], qi) => { const your = (answers[si] || [])[qi]; if (your === a) score++; review.push({ section: name, q, your: your == null ? null : o[your], correct: o[a], ok: your === a, why }); }));
    const max = review.length, top = [5, 18, 35, 55, 75][Math.min(4, max - score)], names = ["Kamola", "Bekzod", "Laylo", "Timur", "Nigora"];
    return { score, max, percentile_top: top, cohort: `Class of ${classYear()}`, leaderboard: names.map((n, i) => ({ first_name: n, score: Math.max(0, max - Math.floor(i / 2)) })), review };
  };
  let MS = null;                                                           // the running mock
  function paintMockCards() {
    const m = JG_API.mockSaturday(), reg = m.my_registration, sat = new Date().getDay() === 6 || S.msDemoAt;
    const lrow = $("ls-live-row"); if (lrow && !$("ms-lcard")) (lrow.closest("section") || lrow).insertAdjacentHTML("afterend", `<button type="button" class="zb ms-card" id="ms-lcard"></button>`);
    const lc = $("ms-lcard"); if (lc) { lc.innerHTML = `<span><b>📝 Mock Saturday</b><small>Full timed mock · every Saturday 10:00 · ${m.registered_count.toLocaleString("en-US")} registered</small></span><em class="jd-go">${reg ? `${esc(reg)} ✓` : "Register"}</em>`; lc.onclick = openMock; }
    const old = $("ms-tcard"); if (old) old.remove();
    if (sat && $("zr-card")) { $("zr-card").insertAdjacentHTML("beforebegin", `<button type="button" class="zb ms-card" id="ms-tcard"><span><b>📝 Mock Saturday today</b><small>${reg ? `You're in: ${esc(reg)}` : "Register now, it starts at 10:00"}</small></span><em class="jd-go">Open</em></button>`); $("ms-tcard").onclick = openMock; }
  }
  function openMock() {
    const m = JG_API.mockSaturday(), el = layer("ms-view", "zq-view"); el.setAttribute("aria-label", "Mock Saturday");
    if (MS && MS.stage === "test") return paintTest(el);
    const reg = m.my_registration, left = new Date(m.starts_at) - Date.now();
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-ms="close" aria-label="Close">‹</button><p class="dg-tt">Mock Saturday</p><span class="dg-timer"></span></div><div class="zq-body">
      <div class="zq-goal ms-lobby"><b>${reg ? `Lobby · ${esc(reg)}` : "Register for Saturday"}</b><small>Everyone starts at the same time</small><p id="ms-count">${left > 0 ? `Starts in ${cd(left)}` : "Starting…"} · ${m.registered_count.toLocaleString("en-US")} registered</p></div>
      ${reg ? `<p class="zq-note">2 sections, ${m.section_minutes} minutes each. Put your phone face down between questions and keep paper ready. This prototype uses a short sample test.</p><button type="button" class="dg-link" data-ms="change">Change subject</button>`
        : `<b class="jr-next-h">Choose your mock</b><div class="dg-opts">${MS_SUBJ.map(x => `<button type="button" class="dg-opt" data-reg="${esc(x)}"><span>${esc(x)}</span></button>`).join("")}</div>`}</div>`;
    el.onclick = e => {
      const b = e.target.closest("[data-ms]"), r = e.target.closest("[data-reg]");
      if (r) { S.msReg = r.dataset.reg; JG_API.registerMock(S.msReg); save(); paintMockCards(); openMock(); }
      else if (b && b.dataset.ms === "close") { el.hidden = true; }
      else if (b && b.dataset.ms === "change") { S.msReg = null; save(); paintMockCards(); openMock(); }
    };
    clearInterval(openMock.t); if (reg) openMock.t = setInterval(() => { const l = new Date(JG_API.mockSaturday().starts_at) - Date.now(), c = $("ms-count"); if (el.hidden) return clearInterval(openMock.t);
      if (l <= 0) { clearInterval(openMock.t); startMock(); } else if (c) c.textContent = `Starts in ${cd(l)} · ${JG_API.mockSaturday().registered_count.toLocaleString("en-US")} registered`; }, 500);
  }
  const cd = ms => { const s = Math.ceil(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h ? `${h}:${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}` : `${m}:${String(s % 60).padStart(2, "0")}`; };
  function startMock() {
    const t = JG_API.mockTest(S.msReg || "SAT"); MS = { stage: "test", subject: t.subject, test: t, si: 0, qi: 0, answers: [], order: {}, secEnd: Date.now() + t.sections[0].minutes * 60000 };
    paintTest($("ms-view"));
  }
  function paintTest(el) {
    const sec = MS.test.sections[MS.si], q = sec.questions[MS.qi], key = `${MS.si}.${MS.qi}`; MS.order[key] = MS.order[key] || shuffle(q.options.map((_, i) => i));
    el.innerHTML = `<div class="dg-top"><span class="dg-timer"></span><p class="dg-tt">Section ${MS.si + 1} of ${MS.test.sections.length} · ${esc(sec.name)}</p><span class="dg-timer" id="ms-tl"></span></div><div class="zq-body">
      <p class="dg-mod">${esc(MS.subject)} · question ${MS.qi + 1} of ${sec.questions.length}${MS.test.sample ? " · sample" : ""}</p><h2 class="jd-q">${esc(q.q)}</h2>
      <div class="dg-opts">${MS.order[key].map(i => `<button type="button" class="dg-opt" data-ma="${i}"><span>${esc(q.options[i])}</span></button>`).join("")}</div></div>`;
    el.onclick = e => { const b = e.target.closest("[data-ma]"); if (!b) return; (MS.answers[MS.si] = MS.answers[MS.si] || [])[MS.qi] = +b.dataset.ma; nextQ(el); };
    clearInterval(paintTest.t); paintTest.t = setInterval(() => { const l = MS && MS.secEnd - Date.now(), tl = $("ms-tl"); if (!MS || MS.stage !== "test") return clearInterval(paintTest.t);
      if (l <= 0) { MS.qi = 99; nextQ(el); } else if (tl) tl.textContent = cd(l); }, 500);
  }
  function nextQ(el) {
    const sec = MS.test.sections[MS.si];
    if (MS.qi + 1 < sec.questions.length) { MS.qi++; return paintTest(el); }
    if (MS.si + 1 < MS.test.sections.length) { MS.si++; MS.qi = 0; MS.secEnd = Date.now() + MS.test.sections[MS.si].minutes * 60000; return paintTest(el); }
    clearInterval(paintTest.t); const r = JG_API.submitMock(MS.subject, MS.answers); MS = { stage: "done" }; S.msDemoAt = null; S.msLast = { subject: S.msReg, score: r.score, max: r.max, at: ymd(new Date()) }; save();
    const L = window.JIA_league; if (L) { L.ME.xp += 30; L.ME.week += 30; try { L.paint(); } catch (err) {} }
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-ms="close" aria-label="Close">‹</button><p class="dg-tt">Your Mock Saturday</p><span class="dg-timer"></span></div><div class="zq-body">
      <div class="zq-goal"><b>${r.score} / ${r.max}</b><small>${esc(S.msReg || "SAT")} · sample mock</small><p>Top ${r.percentile_top}% of ${esc(r.cohort)} · +30 XP</p></div>
      <b class="jr-next-h">Leaderboard</b><ol class="zc-list">${r.leaderboard.map((x, i) => `<li><span>${i + 1}</span><b>${esc(x.first_name)}</b><em>${x.score} / ${r.max}</em></li>`).join("")}<li class="me"><span>…</span><b>You</b><em>${r.score} / ${r.max}</em></li></ol>
      <b class="jr-next-h">Review every answer</b><div class="ms-review">${r.review.map(x => `<div class="ms-r ${x.ok ? "ok" : "bad"}"><small>${esc(x.section)}</small><b>${esc(x.q)}</b><p>${x.ok ? "✓" : "✗"} Your answer: ${esc(x.your || "no answer")}${x.ok ? "" : ` · Correct: ${esc(x.correct)}`}</p><p class="ms-why">${esc(x.why)}</p></div>`).join("")}</div></div>`;
    el.onclick = e => { if (e.target.closest("[data-ms=close]")) el.hidden = true; };
    paintMockCards();
  }

  /* ================= PARENT PLEDGE (student side): the same shape the parents' panel writes ================= */
  const monthEnd = () => { const d = new Date(); return ymd(new Date(d.getFullYear(), d.getMonth() + 1, 0)); };
  JG_API.pledges = () => {
    const mk = ymd(new Date()).slice(0, 7), monthBricks = Object.keys(SR.log).filter(k => k.startsWith(mk)).reduce((n, k) => n + SR.log[k].bricks, 0);
    const P = [{ id: "pl_1", from: "mom", goalType: "bricks", goalTarget: 100, progress: 62 + monthBricks, reward: "New headphones", deadline: monthEnd(), status: "active" }];
    P.forEach(p => { if (S.pledgeDone && S.pledgeDone[p.id]) p.progress = Math.max(p.progress, p.goalTarget); if (p.progress >= p.goalTarget) p.status = (S.pledgeTold || {})[p.id] ? "claimed" : "reached"; });
    return P;   // goalType: bricks | tasks | streak | score (e.g. IELTS 6.5)
  };
  JG_API.notifyParent = (pledgeId, kind = "pledge_reached") => ({ id: `nt_${Date.now()}`, pledge_id: pledgeId, kind, sent_at: new Date().toISOString() });
  const WHO = { mom: "Mom", dad: "Dad" }, GOAL = { bricks: n => `${n} bricks`, tasks: n => `${n} completed tasks`, streak: n => `a ${n}-day streak`, score: n => `a score of ${n}` };
  function paintPledge() {
    const host = $("pc-home"); if (!host || window.JG_ENGINE) return; const p = JG_API.pledges()[0], w = WHO[p.from] || "Parent", pct = Math.min(100, Math.round(p.progress / p.goalTarget * 100));   /* JG-PROD: C3, no design pledge for a live student (Q19's default mirrored; final review runtime C3, owner to decide) */
    const days = Math.max(0, Math.ceil((new Date(p.deadline + "T23:59:59") - new Date()) / 864e5)), old = $("pl-card");
    const html = `<section class="pl-card ${p.status}" id="pl-card" aria-label="${w}'s pledge"><div class="pl-top"><b>${w}'s pledge</b><small>${p.status === "active" ? `${days} days left` : p.status === "reached" ? "Reached!" : `${w} knows ✓`}</small></div>
      <p>${GOAL[p.goalType](p.goalTarget)} this month → <b>${esc(p.reward)}</b></p><i class="pl-bar"><em style="width:${pct}%"></em></i><small class="pl-n">${Math.min(p.progress, p.goalTarget)} / ${p.goalTarget}</small>
      ${p.status === "reached" ? `<button type="button" class="dg-go" data-pl="tell">Tell ${w}</button>` : ""}</section>`;
    if (old) old.outerHTML = html; else host.insertAdjacentHTML("afterend", html);
    const t = document.querySelector("#pl-card [data-pl=tell]"); if (t) t.onclick = () => { JG_API.notifyParent(p.id); S.pledgeTold = Object.assign({}, S.pledgeTold, { [p.id]: true }); save(); paintPledge(); if (window.JIA_notify) window.JIA_notify({ text: `<b>${w} got your message.</b> ${esc(p.reward)} is on its way.` }); };
  }
  function pledgeReached(p) {
    if ((S.pledgeCeleb || {})[p.id]) return; S.pledgeCeleb = Object.assign({}, S.pledgeCeleb, { [p.id]: true }); save();
    if (window.JIA_celebrate) window.JIA_celebrate({ id: `pledge_${p.id}`, name: `${WHO[p.from] || "Parent"}'s pledge: done`, rare: "Epic", desc: `${GOAL[p.goalType](p.goalTarget)} → ${p.reward}`, img: window.JIA_ach ? window.JIA_ach.img("trophy") : "" });
  }

  /* ================= SCHOOL CUP: schools compete on total bricks, city by city (totals only, never names) ================= */
  JG_API.schoolCup = (city = "Tashkent") => {
    const base = [["Presidential School Tashkent", 1960], ["Lyceum No. 1", 1720], ["School No. 110", 1284], ["Al-Khwarizmi School", 1190], ["School No. 64", 1015], ["Westminster Lyceum", 960], ["School No. 21", 880], ["Mirzo Ulugbek Lyceum", 815]];
    const mine = Object.keys(SR.log).filter(k => k >= ymd(wkStart())).reduce((n, k) => n + SR.log[k].bricks, 0);
    const schools = base.map(([name, b]) => ({ name, bricks: b + hash(name + ymd(wkStart()), 40) + (name === "School No. 110" ? mine : 0) })).sort((a, b) => b.bricks - a.bricks);
    const rank = schools.findIndex(x => x.name === "School No. 110") + 1;
    return { week_start: ymd(wkStart()), city, my_school: { name: "School No. 110", rank, bricks: schools[rank - 1].bricks }, schools, show_on_profile: !!S.showSchool };
  };
  function paintCupCard() {
    const host = $("zb-class"); if (!host) return; const c = JG_API.schoolCup(), old = $("zb-cup");
    const html = `<button type="button" class="zb zb-cup" id="zb-cup"><span><b>🏫 School Cup</b><small>${esc(c.my_school.name)} is #${c.my_school.rank} in ${esc(c.city)} this week</small></span></button>`;
    if (old) old.remove(); host.insertAdjacentHTML("afterend", html); $("zb-cup").onclick = openCup;
  }
  function openCup() {
    const c = JG_API.schoolCup(), el = layer("cup-view", "zq-view"); el.setAttribute("aria-label", "School Cup");
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-cup="close" aria-label="Close">‹</button><p class="dg-tt">School Cup · ${esc(c.city)}</p><span class="dg-timer"></span></div><div class="zq-body">
      <div class="zq-goal"><b>🏫 ${esc(c.my_school.name)} · #${c.my_school.rank}</b><small>Total bricks this week, city by city. Only school totals are public, never names.</small><p>${c.my_school.bricks.toLocaleString("en-US")} bricks · every session you do counts</p></div>
      <ol class="zc-list">${c.schools.map((x, i) => `<li${x.name === c.my_school.name ? ' class="me"' : ""}><span>${i + 1}</span><b>${esc(x.name)}</b><em>${x.bricks.toLocaleString("en-US")}</em></li>`).join("")}</ol>
      <button type="button" class="dg-go" data-cup="invite">Invite classmates</button>
      <label class="jp-agree cup-opt"><input type="checkbox" id="cup-show"${c.show_on_profile ? " checked" : ""}> <span>Show my school on my profile (off by default)</span></label></div>`;
    $("cup-show").onchange = e => { S.showSchool = e.target.checked; save(); };
    el.onclick = async e => { const b = e.target.closest("[data-cup]"); if (!b) return; if (b.dataset.cup === "close") el.hidden = true;
      else { const text = `Help ${c.my_school.name} climb the School Cup on Jamals Global: every 25 minutes of study counts.`; try { if (navigator.share) await navigator.share({ text, url: location.href.split("#")[0] }); else { await navigator.clipboard.writeText(text); b.textContent = "Invite copied ✓"; } } catch (err) {} } };
  }
  const _badge = classBadge;                                              // the profile also shows the school, only if you opted in
  classBadge = function () { _badge(); const pv = $("pf-view"); if (!pv || pv.hidden || !pv.textContent.includes(JG_ME.fullName) || !S.showSchool || $("cup-badge")) return; const bd = $("zc-badge"); if (bd) bd.insertAdjacentHTML("afterend", ` <span class="zc-badge" id="cup-badge">🏫 ${esc(JG_API.schoolCup().my_school.name)}</span>`); }; /* JG-PROD: identity */

  /* ---------- demo controls and first paint ---------- */
  if (pvq("ms-now")) pvq("ms-now").addEventListener("click", () => { if (!S.msReg) S.msReg = "SAT"; S.msDemoAt = Date.now() + 10000; MS = null; save(); paintMockCards(); openMock(); });
  if (pvq("pl-done")) pvq("pl-done").addEventListener("click", () => { S.pledgeDone = Object.assign({}, S.pledgeDone, { pl_1: true }); save(); paintPledge(); pledgeReached(JG_API.pledges()[0]); const c = $("pl-card"); if (c) c.scrollIntoView({ block: "center", behavior: "smooth" }); });
  const _rcb = refreshComeBack;                                           // after every session: pledge progress, cup, mock cards
  refreshComeBack = function () { _rcb(); try { paintCupCard(); paintPledge(); paintMockCards(); const p = JG_API.pledges()[0]; if (!window.JG_ENGINE && p.status === "reached") pledgeReached(p); } catch (e) {} };   /* JG-PROD: C3, no "pledge done" ceremony for a live student (final review runtime C3) */
  paintMockCards(); paintPledge(); paintCupCard();
  const pl0 = JG_API.pledges()[0]; if (!window.JG_ENGINE && pl0.status === "reached") setTimeout(() => pledgeReached(pl0), 1500);   /* JG-PROD: C3, no load-time "pledge done" ceremony for a live student (final review runtime C3) */

  /* ================= CHAT & COMMUNITY 1: clubs, help desk, study together ================= */
  const CH = () => window.JIA_chat;
  const PPL2 = () => window.JIA_people || { PEOPLE: {}, AV: {} };
  const firstN = id => String((PPL2().PEOPLE[id] || { name: id }).name).split(" ")[0];
  let dlP2 = null;
  const dlCap = () => dlP2 || (dlP2 = window.claude && typeof window.claude.use === "function" ? Promise.resolve(window.claude.use("downloads")).catch(() => null) : Promise.resolve(null));
  async function saveFile(name, blob) {
    const dl = await Promise.race([dlCap(), new Promise(r => setTimeout(() => r(null), 1500))]);
    if (dl) { try { await dl.save({ filename: name, data: blob }); return "saved"; } catch (e) { if (e && e.code === "declined") return "declined"; } }
    const a = document.createElement("a"), u = URL.createObjectURL(blob); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); return "link";
  }

  /* ---------- clubs: an announcement channel (admins post) + topic threads, like a channel with its discussion group ---------- */
  const CLUBS = [
    { id: "mit", name: "MIT applicants", about: "For everyone aiming at MIT: essays, activities, SAT 1500+.", members: 1240, admins: ["aziza"], host: "aziza", hours: "SAT office hours", topics: [["intro", "Introduce yourself"], ["essays", "Essays and activities"], ["sat", "SAT 1500+"]] },
    { id: "olymp", name: "Olympiad math", about: "Problems, camps and regional dates.", members: 860, admins: ["javlon"], host: "javlon", hours: "Olympiad problem hour", topics: [["pod", "Problem of the day"], ["camps", "Camps and dates"]] },
    { id: "ielts7", name: "IELTS 7+", about: "Speaking partners, writing feedback, test dates.", members: 2030, admins: ["kamila"], host: "kamila", hours: "Speaking practice hour", topics: [["speak", "Speaking partners"], ["writing", "Writing Task 2"]] },
    { id: "premed", name: "Pre-med", about: "Biology, chemistry and research for future doctors.", members: 540, admins: ["bekzod"], host: null, topics: [["bio", "Biology olympiad"], ["research", "Research ideas"]] },
    { id: "germany", name: "Germany route", about: "Studienkolleg, TUM, German language.", members: 410, admins: ["aziza"], host: null, topics: [["kolleg", "Studienkolleg"], ["german", "German A1 → B1"]] },
    { id: "coding", name: "Coding", about: "Projects, olympiad informatics, first internships.", members: 980, admins: ["javlon"], host: "javlon", hours: "Code review hour", topics: [["projects", "Show your project"], ["informatics", "Informatics olympiad"]] } ];
  const JC_SEED = { intro: [["dilnoza", "Hi all! Dilnoza, grade 11, SAT 1580 last spring. Ask me anything about the math section."], ["sardor", "Sardor here, IELTS 8.5. Happy to read essays."]], essays: [["nilufar", "Is it okay to write the Common App essay about a small moment?"], ["aziza", "Yes. Small, specific moments often work best. Show what you noticed."]], sat: [["asadbek", "Anyone doing the Saturday mock? Let's compare Section 2."]] };
  const clubState = () => { if (window.JG_ENGINE && S.onboarded && S.onboarded.clubs) { S.myClubs = (S.myClubs || []).filter(id => !S.onboarded.clubs.includes(id)); delete S.onboarded.clubs; } S.myClubs = S.myClubs || (window.JG_ENGINE ? [] : ["mit", "ielts7"]); S.foundedClubs = S.foundedClubs || []; return S.myClubs; };   /* JG-PROD: owner 4 Oct R11, a real student is not joined to clubs automatically; they join the ones they choose; one whose day one ran before this change leaves the clubs it joined for them, once */
  function ensureClubChats(JC_c) {
    const X = CH(); if (!X) return; const { CHATS, M } = X, ann = `g:club_${JC_c.id}_ann`;
    if (!CHATS[ann]) CHATS[ann] = { id: ann, kind: "group", club: JC_c.id, channel: true, adminMe: JC_c.admins.includes("me"), name: "Announcements", members: window.JG_ENGINE ? [] : JC_c.admins.filter(a => PPL2().PEOPLE[a]), time: "09:00", unread: 0,   /* JG-PROD: owner 4 Oct R13, a real student's club channel has no invented admin in it */
      msgs: [M(null, "Announcements", "", { system: true }), ...(window.JG_ENGINE ? [] : [M(JC_c.admins[0], `Welcome to ${JC_c.name}! Rules: be kind, no private contact info, no outside links. Report anything that feels off.`, "09:00")])] };   /* JG-PROD: owner 4 Oct R13, nothing posted by an invented admin (nor put in a founder's mouth): the channel keeps its own line */
    JC_c.topics.forEach(([tid, title]) => { const id = `g:club_${JC_c.id}_${tid}`; if (!CHATS[id]) CHATS[id] = { id, kind: "group", club: JC_c.id, topic: tid, name: title, members: window.JG_ENGINE ? [] : ["dilnoza", "sardor", "nilufar"].filter(w => PPL2().PEOPLE[w]), time: "10:12", unread: 0, msgs: window.JG_ENGINE ? [] : (JC_SEED[tid] || [["dilnoza", `Starting the ${title.toLowerCase()} thread. Share what you're working on.`]]).map(([w, t], i) => M(w, t, `10:${10 + i}`)) }; });   /* JG-PROD: owner 4 Oct R13, a real student's club threads start empty, with no invented members (Dilnoza's "SAT 1580 last spring", Sardor, Nilufar): the thread says "Say hello to the group" */
  }
  JG_API.clubs = () => { const mine = clubState(); return [...CLUBS, ...S.foundedClubs.filter(f => f.status === "approved")].map(JC_c => ({ id: JC_c.id, name: JC_c.name, about: JC_c.about, members: JC_c.members, admins: JC_c.admins, founder: JC_c.founder || null, joined: mine.includes(JC_c.id), topics: JC_c.topics.map(([id, title]) => ({ id, title })), office_hours: JC_c.host ? JG_API.officeHours(JC_c.id) : null })); };
  JG_API.joinClub = id => { const JC_m = clubState(); if (!JC_m.includes(id)) JC_m.push(id); save(); return { club_id: id, joined: true }; };
  JG_API.leaveClub = id => { S.myClubs = clubState().filter(x => x !== id); save(); return { club_id: id, joined: false }; };
  JG_API.foundClub = ({ name, about }) => { const f = { id: `u_${Date.now()}`, name, about, members: 1, admins: ["me"], founder: "me", host: null, topics: [["intro", "Introduce yourself"], ["general", "General"]], status: "pending_review", created_at: new Date().toISOString() }; clubState(); S.foundedClubs.push(f); save(); return { club_id: f.id, status: f.status }; };
  JG_API.approveClub = id => { const f = (S.foundedClubs || []).find(x => x.id === id); if (f) { f.status = "approved"; f.members = 340; JG_API.joinClub(id); save(); } return { club_id: id, status: f ? f.status : "missing" }; };
  JG_API.officeHours = id => { const JC_c = CLUBS.find(x => x.id === id); if (!JC_c || !JC_c.host || window.JG_ENGINE) return null; const JC_d = new Date(); JC_d.setDate(JC_d.getDate() + ((4 - JC_d.getDay() + 7) % 7 || 7)); JC_d.setHours(18, 0, 0, 0);   /* JG-PROD: owner 4 Oct R13, no office hours on a real student's club: the host is an invented teacher (the owner sends the roster) and its "Demo: go live now" opens a voice room of invented people */
    return { club_id: id, host: JC_c.host, host_name: (PPL2().PEOPLE[JC_c.host] || {}).name || JC_c.host, verified_teacher: true, title: JC_c.hours, starts_at: S.ohLive === id ? new Date().toISOString() : JC_d.toISOString(), status: S.ohLive === id ? "live" : "scheduled", listeners: S.ohLive === id ? 37 : 0 }; };
  const allClubs = () => [...CLUBS, ...(S.foundedClubs || [])];
  function paintClubStrip() {
    const seg = document.querySelector(".cm-seg"); if (!seg) return; const mine = JG_API.clubs().filter(JC_c => JC_c.joined), old = $("jc-strip");
    const unread = mine.reduce((n, JC_c) => n + (((CH() || {}).CHATS || {})[`g:club_${JC_c.id}_ann`] || { unread: 0 }).unread, 0);
    const html = `<div class="jc-strip" id="jc-strip"><button type="button" class="jc-tile" data-jc="clubs"><b>Clubs${unread ? ` <em>${unread}</em>` : ""}</b><small>${mine.map(JC_c => esc(JC_c.name)).join(" · ") || "Find your people"}</small></button><button type="button" class="jc-tile help" data-jc="help"><b>Help Desk</b><small>Ask, answer, earn volunteer hours</small></button></div>`;
    if (old) old.outerHTML = html; else seg.insertAdjacentHTML("beforebegin", html);
  }
  function openClubs() {
    const el = layer("jc-clubs", "zq-view"), cl = JG_API.clubs(); el.setAttribute("aria-label", "Clubs");
    const row = JC_c => `<button type="button" class="jc-row" data-club="${JC_c.id}"><span class="jc-ic">${esc(JC_c.name.slice(0, 1))}</span><span><b>${esc(JC_c.name)}</b><small>${window.JG_ENGINE ? "" : `${JC_c.members.toLocaleString("en-US")} members · `}${esc(JC_c.about)}</small></span>${JC_c.joined ? `<em class="jc-in">Joined</em>` : ""}</button>`;   /* JG-PROD: owner 4 Oct R13, no invented member counts ("1,240 members") on a real student's clubs: each club says what it is for */
    const pend = (S.foundedClubs || []).filter(f => f.status === "pending_review");
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-jc="close" aria-label="Close">‹</button><p class="dg-tt">Clubs</p><span class="dg-timer"></span></div><div class="zq-body">
      <b class="jr-next-h">Your clubs</b>${cl.filter(JC_c => JC_c.joined).map(row).join("") || `<p class="zq-note">Join a club to meet people on your route.</p>`}
      ${pend.map(f => `<div class="jc-row pending"><span class="jc-ic">⏳</span><span><b>${esc(f.name)}</b><small>Waiting for a JG admin to approve</small></span></div>`).join("")}
      <b class="jr-next-h">Discover</b>${cl.filter(JC_c => !JC_c.joined).map(row).join("")}
      <button type="button" class="dg-go ghost" data-jc="found">Found a club</button></div>`;
  }
  function openClub(id) {
    const JC_c = allClubs().find(x => x.id === id), info = JG_API.clubs().find(x => x.id === id); if (!JC_c || !info) return; ensureClubChats(JC_c);
    const el = layer("jc-club", "zq-view"), oh = info.office_hours, X = CH(), ann = X && X.CHATS[`g:club_${JC_c.id}_ann`]; el.setAttribute("aria-label", JC_c.name);
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-jc="back" aria-label="Back">‹</button><p class="dg-tt">${esc(JC_c.name)}</p><span class="dg-timer"></span></div><div class="zq-body">
      <div class="zq-goal"><b>${esc(JC_c.name)}</b>${window.JG_ENGINE ? (JC_c.founder === "me" ? "<small>You founded it</small>" : "") /* JG-PROD: owner 4 Oct R13, a real student's club page names no invented member count ("1,240 members") and no invented admin (the teacher roster is the owner's to send); the student who founded it still reads so */ : `<small>${info.members.toLocaleString("en-US")} members · admins: ${JC_c.admins.map(a => a === "me" ? "you" : esc(firstN(a))).join(", ")}${JC_c.founder === "me" ? " · you founded it" : ""}</small>`}<p>${esc(JC_c.about)}</p></div>
      <button type="button" class="jc-row" data-open="g:club_${JC_c.id}_ann"><span class="jc-ic">📣</span><span><b>Announcements</b><small>${ann && ann.unread ? `${ann.unread} new · ` : ""}Only admins post here</small></span></button>
      <b class="jr-next-h">Topics</b>${JC_c.topics.map(([tid, title]) => `<button type="button" class="jc-row" data-open="g:club_${JC_c.id}_${tid}"><span class="jc-ic">#</span><span><b>${esc(title)}</b><small>Discussion · filtered and moderated</small></span></button>`).join("")}
      ${oh ? `<div class="jc-oh ${oh.status}"><b>🎙 ${esc(oh.title)} · ${esc(oh.host_name)} <span class="jc-ver">verified teacher</span></b><small>${oh.status === "live" ? `Live now · ${oh.listeners} listening` : new Date(oh.starts_at).toLocaleString("en-US", { weekday: "short", hour: "2-digit", minute: "2-digit" })}</small><button type="button" class="dg-go${oh.status === "live" ? "" : " ghost"}" data-jc="${oh.status === "live" ? "voice" : "ohlive"}">${oh.status === "live" ? "Join the voice room" : "Demo: go live now"}</button></div>` : ""}
      <button type="button" class="dg-link" data-jc="${info.joined ? "leave" : "join"}" data-id="${JC_c.id}">${info.joined ? "Leave club" : "Join club"}</button></div>`;
    el.dataset.club = id;
  }
  function openVoice(id) {
    const oh = JG_API.officeHours(id); if (!oh) return; const el = layer("jc-voice", "zq-view jc-voice"), P = PPL2(); el.setAttribute("aria-label", oh.title);   /* JG-PROD: owner 4 Oct R13, no voice room without office hours (a real student's clubs have none): any way in does nothing instead of reading the title of null */
    const people = [oh.host, "dilnoza", "sardor", "nilufar", "asadbek"].filter(w => P.PEOPLE[w]);
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-jc="vclose" aria-label="Leave">‹</button><p class="dg-tt">${esc(oh.title)}</p><span class="dg-timer"></span></div><div class="zq-body">
      <p class="zq-note">Voice room · ${oh.listeners} listening · you're muted until the host lets you speak</p>
      <div class="jc-stage">${people.map((w, i) => `<span class="jc-spk${i === 0 ? " talking" : ""}"><img src="${P.AV[w] || ""}" alt=""><b>${esc(firstN(w))}</b><small>${i === 0 ? "host · speaking" : "listening"}</small></span>`).join("")}</div>
      <div class="jc-vbtns"><button type="button" class="dg-go ghost" data-jc="hand">✋ Raise hand</button><button type="button" class="dg-go" data-jc="vclose">Leave quietly</button></div></div>`;
  }
  function foundClubForm() {
    const el = layer("jc-found", "zq-view"); el.setAttribute("aria-label", "Found a club");
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-jc="fclose" aria-label="Close">‹</button><p class="dg-tt">Found a club</p><span class="dg-timer"></span></div><div class="zq-body">
      <input class="dg-field" id="jc-fname" maxlength="40" placeholder="Club name, e.g. JG Robotics Club"><textarea class="dg-text" id="jc-fabout" rows="3" maxlength="200" placeholder="What is it for? Who should join?"></textarea>
      <p class="zq-note">A JG admin reviews every new club. Once approved, you become its admin and your profile shows you founded it.</p><button type="button" class="dg-go" data-jc="fsend">Send for approval</button></div>`;
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-jc], [data-club], [data-open]"); if (!b || !b.closest(".jc-strip, #jc-clubs, #jc-club, #jc-voice, #jc-found, #jc-help, #jc-q")) return;
    if (b.dataset.club) return openClub(b.dataset.club);
    if (b.dataset.open) { const X = CH(); if (X) { ["jc-club", "jc-clubs"].forEach(id => { const v = $(id); if (v) v.hidden = true; }); X.CHATS[b.dataset.open].unread = 0; X.open(b.dataset.open); paintClubStrip(); } return; }
    const a = b.dataset.jc, hide = id => { const v = $(id); if (v) v.hidden = true; };
    if (a === "clubs") openClubs(); else if (a === "help") openHelp(); else if (a === "close") hide("jc-clubs"); else if (a === "back") { hide("jc-club"); openClubs(); }
    else if (a === "join" || a === "leave") { JG_API[a === "join" ? "joinClub" : "leaveClub"](b.dataset.id); openClub(b.dataset.id); paintClubStrip(); }
    else if (a === "ohlive") { S.ohLive = $("jc-club").dataset.club; save(); openClub(S.ohLive); }
    else if (a === "voice") openVoice($("jc-club").dataset.club); else if (a === "vclose") hide("jc-voice"); else if (a === "hand") { b.textContent = "✋ Hand raised"; b.disabled = true; }
    else if (a === "found") foundClubForm(); else if (a === "fclose") hide("jc-found");
    else if (a === "fsend") { const n = $("jc-fname").value.trim(), ab = $("jc-fabout").value.trim(), X = CH(); if (n.length < 3) return;
      const bad = X && X.screen ? X.screen(`${n} ${ab}`) : null; if (bad && bad.blocked) { b.textContent = "Please remove contact details or links"; return; }
      const r = JG_API.foundClub({ name: n, about: ab }); hide("jc-found"); openClubs(); if (window.JIA_notify) window.JIA_notify({ text: `<b>Sent for approval.</b> A JG admin reviews new clubs, usually within a day.` });
      if (!window.JG_ENGINE) setTimeout(() => { JG_API.approveClub(r.club_id); paintClubStrip(); if (!$("jc-clubs").hidden) openClubs(); if (window.JIA_notify) window.JIA_notify({ text: `<b>${esc(n)} is approved.</b> You're its founder and admin.` }); }, 6000); }   /* JG-PROD: owner 20 Oct 2026 (M1, "untrue to a child"), no club approved by nobody six seconds after a real student sends it ("is approved. You're its founder and admin.", 340 members): it waits for a JG admin, as its row says; the demo keeps the design's */
    else if (help(a, b)) return;
  });
  const leadLine = () => { const f = (S.foundedClubs || []).find(x => x.status === "approved"); return f ? `Founder, ${f.name} · ${f.members} members` : ""; };

  /* ---------- help desk: public questions, upvotes, best answers, honest volunteer hours ---------- */
  const HQ = [
    { id: "hq1", asker: "Sevara", grade: 8, subject: "Math", title: "How do I factor x² − 5x + 6?", body: "I keep getting the signs wrong.", answers: [{ id: "a1", by: "Timur", cls: 2027, text: "Find two numbers that multiply to 6 and add to −5: −2 and −3. So (x − 2)(x − 3).", votes: 14, best: true, verified: true }] },
    { id: "hq2", asker: "Jasur", grade: 9, subject: "English", title: "When do I use “since” and when “for”?", body: "", answers: [] },
    { id: "hq3", asker: "Diyora", grade: 7, subject: "Physics", title: "Why does ice float?", body: "Isn't ice solid and heavier?", answers: [{ id: "a2", by: "Laylo", cls: 2027, text: "Ice is less dense than liquid water: its molecules lock into an open lattice, so the same mass takes more space.", votes: 9, best: false, verified: false }] },
    { id: "hq4", asker: "Otabek", grade: 8, subject: "Math", title: "What is 15% of 240 quickly?", body: "", answers: [] } ];
  JG_API.helpDesk = () => HQ.map(q => Object.assign({}, q, { answers: [...q.answers, ...((S.helpAns || {})[q.id] || [])].sort((a, b) => (b.best - a.best) || (b.votes - a.votes)) }));
  JG_API.answerHelp = (qid, text) => { const a = { id: `my_${Date.now()}`, by: "You", cls: classYear(), text, votes: 0, best: false, verified: false, mine: true, at: new Date().toISOString() }; S.helpAns = S.helpAns || {}; S.helpAns[qid] = [...(S.helpAns[qid] || []), a]; save(); return a; };
  JG_API.voteAnswer = (qid, aid) => ({ question_id: qid, answer_id: aid, voted: true });
  JG_API.markBest = (qid, aid, by) => { const a = ((S.helpAns || {})[qid] || []).find(x => x.id === aid); if (a) { a.best = true; a.verified = by === "teacher" || a.verified; save(); } return { question_id: qid, answer_id: aid, best: true, by }; };
  JG_API.volunteerHours = () => {
    const mine = Object.values(S.helpAns || {}).flat(), acc = mine.filter(a => a.best), ver = acc.filter(a => a.verified), base = 239;
    return { verified_answers: base + ver.length, verified_hours: (base + ver.length) / 2, pending_answers: acc.length - ver.length, rule: "0.5 hours per accepted answer, counted only after a teacher checks it", certificate_ready: base + ver.length >= 2 };
  };
  let hqOpen = null;
  function openHelp() {
    const el = layer("jc-help", "zq-view"), v = JG_API.volunteerHours(); el.setAttribute("aria-label", "Help Desk");
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-jc="hclose" aria-label="Close">‹</button><p class="dg-tt">Help Desk</p><span class="dg-timer"></span></div><div class="zq-body">
      <div class="zq-goal"><b>🤝 ${v.verified_hours} verified volunteer hours</b><small>${esc(v.rule)}${v.pending_answers ? ` · ${v.pending_answers} waiting for a teacher` : ""}</small><button type="button" class="pc-btn jc-cert" data-jc="cert">Download certificate</button></div>
      <p class="zq-note">Everything here is public and filtered. No private messages from Help Desk.</p>
      ${JG_API.helpDesk().map(q => `<button type="button" class="jc-row" data-jc="q" data-id="${q.id}"><span class="jc-ic">${esc(q.subject.slice(0, 1))}</span><span><b>${esc(q.title)}</b><small>${esc(q.subject)} · asked by ${esc(q.asker)}, grade ${q.grade} · ${q.answers.length} answer${q.answers.length === 1 ? "" : "s"}</small></span></button>`).join("")}</div>`;
  }
  function openQ(id) {
    const q = JG_API.helpDesk().find(x => x.id === id); hqOpen = id; const el = layer("jc-q", "zq-view"); el.setAttribute("aria-label", q.title);
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-jc="qclose" aria-label="Back">‹</button><p class="dg-tt">${esc(q.subject)}</p><span class="dg-timer"></span></div><div class="zq-body">
      <h2 class="jd-q">${esc(q.title)}</h2>${q.body ? `<p class="sr-sub jc-qbody">${esc(q.body)}</p>` : ""}<small class="lt-note">Asked by ${esc(q.asker)}, grade ${q.grade}</small>
      ${q.answers.map(a => `<div class="jc-ans${a.best ? " best" : ""}"><p>${esc(a.text)}</p><small>${esc(a.by)} · Class of ${a.cls}${a.best ? " · ✓ best answer" : ""}${a.verified ? " · checked by a teacher" : ""}</small>
        <span class="jc-abtn"><button type="button" data-jc="up" data-id="${a.id}">▲ ${a.votes}</button>${a.mine && !a.best ? `<button type="button" data-jc="demoaccept" data-id="${a.id}">Demo: asker accepts, teacher checks</button>` : ""}<button type="button" data-jc="rep">Report</button></span></div>`).join("")}
      <textarea class="dg-text" id="jc-ans" rows="3" maxlength="600" placeholder="Write a clear, kind answer. No contact details or links."></textarea><small class="lt-note" id="jc-ansmsg"></small><button type="button" class="dg-go" data-jc="answer">Post answer</button></div>`;
  }
  function help(a, b) {
    const hide = id => { const v = $(id); if (v) v.hidden = true; };
    if (a === "hclose") hide("jc-help"); else if (a === "q") openQ(b.dataset.id); else if (a === "qclose") { hide("jc-q"); openHelp(); }
    else if (a === "up") { b.textContent = `▲ ${parseInt(b.textContent.slice(2), 10) + 1}`; b.disabled = true; JG_API.voteAnswer(hqOpen, b.dataset.id); }
    else if (a === "rep") { b.textContent = "Reported"; b.disabled = true; }
    else if (a === "answer") { const t = $("jc-ans").value.trim(), X = CH(), bad = X && X.screen ? X.screen(t) : null; if (t.length < 10) return;
      if (bad && bad.blocked) { $("jc-ansmsg").textContent = "Please remove contact details or links, then post."; return; } JG_API.answerHelp(hqOpen, bad && bad.clean ? bad.clean : t); openQ(hqOpen); }
    else if (a === "demoaccept") { JG_API.markBest(hqOpen, b.dataset.id, "asker"); JG_API.markBest(hqOpen, b.dataset.id, "teacher"); openQ(hqOpen); if (window.JIA_notify) window.JIA_notify({ text: `<b>Answer accepted and checked.</b> +0.5 verified volunteer hours.` }); }
    else if (a === "cert") certificate(b); else return false; return true;
  }
  async function certificate(btn) {
    const v = JG_API.volunteerHours(), cv = document.createElement("canvas"), W = 1600, H = 1130; cv.width = W; cv.height = H; const g = cv.getContext("2d"), F = (w, p, f = "Raleway, system-ui, sans-serif") => `${w} ${p}px ${f}`;
    g.fillStyle = "#fbf8f1"; g.fillRect(0, 0, W, H); g.strokeStyle = "#1d6b4c"; g.lineWidth = 10; g.strokeRect(40, 40, W - 80, H - 80); g.strokeStyle = "#c9a646"; g.lineWidth = 3; g.strokeRect(62, 62, W - 124, H - 124);
    g.textAlign = "center"; g.fillStyle = "#1d6b4c"; g.font = F(700, 34); g.fillText("J A M A L S   G L O B A L", W / 2, 170);
    g.fillStyle = "#10271e"; g.font = F(700, 70, "Georgia, serif"); g.fillText("Certificate of Volunteer Service", W / 2, 290);
    g.font = F(600, 32); g.fillStyle = "#4a5a52"; g.fillText("This certifies that", W / 2, 380); g.fillStyle = "#10271e"; g.font = F(700, 66, "Georgia, serif"); g.fillText(JG_ME.fullName, W / 2, 470); /* JG-PROD: identity */
    g.font = F(600, 34); g.fillStyle = "#4a5a52"; g.fillText("served as a Peer tutor on Jamals Global, answering younger students' questions", W / 2, 550);
    g.fillStyle = "#1d6b4c"; g.font = F(800, 88); g.fillText(`${v.verified_hours} verified hours`, W / 2, 680);
    g.fillStyle = "#4a5a52"; g.font = F(600, 30); g.fillText(`${v.verified_answers} accepted answers, each checked by a teacher · 0.5 hours per answer`, W / 2, 750);
    const id = `JG-PT-${new Date().getFullYear()}-${String(v.verified_answers).padStart(4, "0")}`; g.font = F(600, 26); g.fillText(`Issued ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · Certificate ID ${id} · verify at jamalsglobal`, W / 2, 900);
    g.fillStyle = "#10271e"; g.font = F(700, 28); g.fillText("Jamals Global Academic Team", W / 2, 990);
    const blob = await new Promise(r => cv.toBlob(r, "image/png")), res = await saveFile(`jamals-global-peer-tutor-certificate.png`, blob);
    btn.textContent = res === "declined" ? "Not saved" : "Certificate saved ✓";
  }

  /* ---------- study together: a shared Study Room for a whole chat; messages wait for the break ---------- */
  JG_API.startTogether = chatId => { const X = CH(), JC_c = X && X.CHATS[chatId], members = JC_c ? (JC_c.kind === "dm" ? [JC_c.with] : (JC_c.members || [])) : []; return { chat_id: chatId, members, minutes: 25, started_at: new Date().toISOString(), ends_at: new Date(Date.now() + 25 * 60000).toISOString(), held: [] }; };
  JG_API.heldMessages = chatId => (S.together && S.together.chat_id === chatId ? S.together.held : []);
  function startTogether(chatId) {
    const X = CH(); if (!X || !X.CHATS[chatId]) return; if (S.together) endTogether(false);
    S.together = JG_API.startTogether(chatId); save(); pick = Object.assign({}, pick, { subject: "Together", task_id: null, task_title: `Together: ${X.CHATS[chatId].name || firstN(X.CHATS[chatId].with)}`, minutes: 25 });
    openStudy(); startRun(); paintHeld();
    clearInterval(startTogether.t); startTogether.t = setInterval(() => { if (!S.together) return clearInterval(startTogether.t); const w = S.together.members[S.together.held.length % Math.max(1, S.together.members.length)];
      if (w && !window.JG_ENGINE) { S.together.held.push({ who: w, text: ["Stuck on number 7, let's talk at the break", "Done with the reading part", "This set is hard 😅", "Remind me to ask about essays"][S.together.held.length % 4], time: CH().now ? CH().now() : "" }); save(); paintHeld(); } }, 15000);   /* JG-PROD: owner 20 Oct 2026 (M1, "untrue to a child"), no held message invented in a real student's name for a chat's members ("Stuck on number 7, let's talk at the break"): the banner counts what is really held, none */
  }
  function paintHeld() {
    const n = S.together ? S.together.held.length : 0, X = CH(), openId = X && X.openId ? X.openId() : null;
    let h = $("jc-held"); const head = $("cm-thead");
    if (head && !h) { head.insertAdjacentHTML("afterend", `<p class="jc-held" id="jc-held" role="status" hidden></p>`); h = $("jc-held"); }
    if (h) { const on = S.together && openId === S.together.chat_id; h.hidden = !on; h.textContent = on ? `🔒 ${n} message${n === 1 ? "" : "s"} waiting for the break · studying together` : ""; }
    const r = $("zr-held"); if (r) r.textContent = S.together ? `🔒 ${n} message${n === 1 ? "" : "s"} waiting for the break` : "";
  }
  function endTogether(completed) {
    const T = S.together; if (!T) return; clearInterval(startTogether.t); const X = CH(), JC_c = X && X.CHATS[T.chat_id];
    if (JC_c) { JC_c.msgs.push(X.M(null, completed ? `Break · everyone laid a brick · ${T.held.length} held message${T.held.length === 1 ? "" : "s"} delivered` : `Session ended · ${T.held.length} held message${T.held.length === 1 ? "" : "s"} delivered`, "", { system: true }));
      T.held.forEach(JC_m => JC_c.msgs.push(X.M(JC_m.who, JC_m.text, JC_m.time))); JC_c.unread = (JC_c.unread || 0) + T.held.length; if (X.rerenderOpen) X.rerenderOpen(); if (X.renderConvs) X.renderConvs(); }
    S.together = null; save(); paintHeld();
  }
  document.addEventListener("jia:thread", e => {                           // every opened chat: channel lock, club tag, Study together button, held banner
    const JC_c = e.detail.chat, inp = $("cm-th-in"), head = $("cm-thead"); if (!JC_c || !inp) return;
    const locked = !!JC_c.channel && !JC_c.adminMe; inp.disabled = locked; if (locked) inp.placeholder = "Only admins post here · discuss in the topics";
    if (JC_c.club) { const tg = $("cm-th-tag"); if (tg) { const cl = allClubs().find(x => x.id === JC_c.club); tg.textContent = `${cl ? cl.name + " · " : ""}${JC_c.channel ? "announcements, admins post" : "public topic, moderated"}`; } }
    let btn = $("jc-together"); if (head && !btn) { head.insertAdjacentHTML("beforeend", `<button type="button" class="jc-together" id="jc-together" aria-label="Study together">📚 Study together</button>`); btn = $("jc-together"); btn.onclick = () => { const X = CH(); if (X && X.openId()) startTogether(X.openId()); }; }
    if (btn) btn.hidden = !!JC_c.channel; paintHeld();
  });

  /* ---------- demo controls and first paint ---------- */
  if (pvq("jc-msg")) pvq("jc-msg").addEventListener("click", () => { const JC_c = CLUBS[0], X = CH(); ensureClubChats(JC_c); JG_API.joinClub(JC_c.id); const ch = X.CHATS[`g:club_${JC_c.id}_ann`];
    ch.msgs.push(X.M(JC_c.admins[0], "New this week: a free essay workshop on Thursday at 19:00. Bring one paragraph you're proud of.", X.now ? X.now() : "")); ch.unread = (ch.unread || 0) + 1; paintClubStrip();
    if (window.JIA_notify) window.JIA_notify({ text: `<b>${esc(JC_c.name)}</b> · new announcement` }); });
  if (pvq("jc-together")) pvq("jc-together").addEventListener("click", () => { const X = CH(); if (!X) return; X.open("g:sat"); setTimeout(() => startTogether("g:sat"), 400); });
  if (pvq("jc-break")) pvq("jc-break").addEventListener("click", () => { if (!S.together) return; if (typeof run !== "undefined" && run) { run.ends_at = new Date(Date.now() - 1).toISOString(); tick(); } else endTogether(true); });
  const _badge3 = classBadge;                                             // profile: peer-tutor hours and the founder line
  classBadge = function () { _badge3(); const JC_pv = $("pf-view"); if (!JC_pv || JC_pv.hidden || !JC_pv.textContent.includes(JG_ME.fullName)) return; const bd = $("zc-badge"); if (!bd) return; /* JG-PROD: identity */
    const v = JG_API.volunteerHours(); if (!$("vt-badge")) bd.insertAdjacentHTML("afterend", ` <span class="zc-badge" id="vt-badge">🤝 Peer tutor · ${v.verified_hours} h</span>`);
    const ll = leadLine(), el = $("jc-lead"); if (ll && !el) bd.parentElement.insertAdjacentHTML("afterend", `<p class="jc-lead" id="jc-lead">${esc(ll)}</p>`); else if (el) el.textContent = ll; };
  clubState().forEach(id => { const cl = allClubs().find(x => x.id === id); if (cl) ensureClubChats(cl); });   // your clubs' chats exist from the start
  paintClubStrip();

  /* ================= CHAT & COMMUNITY 2: math-friendly chat, @Jamol, English coach, friend streaks ================= */
  (() => { const P = PPL2(), src = (/src="([^"]+)"/.exec(mascot("delighted", "x")) || [])[1] || "";   // Jamol can speak in chats
    if (P.PEOPLE && !P.PEOPLE.jamol) P.PEOPLE.jamol = { name: "Jamol", kind: "bot", tag: "AI study assistant" }; if (P.AV) P.AV.jamol = src; window.JG_jamolAv = src; })();
  window.JG_coachOn = () => !!S.coach;
  let jxMJ = null;                                                         // MathJax SVG build: script only, loads on the first formula
  const jxLoadMJ = () => jxMJ || (jxMJ = new Promise((res, rej) => {
    window.MathJax = { tex: { inlineMath: [["$", "$"], ["\\(", "\\)"]], displayMath: [["$$", "$$"]], processEscapes: true }, svg: { fontCache: "global" }, startup: { typeset: false }, options: { enableMenu: false } };
    const sc = document.createElement("script"); sc.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg.min.js"; sc.async = true;
    sc.onload = () => Promise.resolve(window.MathJax.startup && window.MathJax.startup.promise).then(res); sc.onerror = rej; document.head.appendChild(sc); }));
  const JX_MATHY = /\$\$[\s\S]+?\$\$|\\\([\s\S]+?\\\)|\$[^$\n]*[\\^_=][^$\n]*\$/;
  function jxTypeset(root) {
    const els = [...(root.querySelectorAll ? root.querySelectorAll(".cm-bub") : [])].filter(b => !b.dataset.jx && JX_MATHY.test(b.textContent)); if (!els.length) return;
    els.forEach(b => { b.dataset.jx = "1"; }); jxLoadMJ().then(() => window.MathJax.typesetPromise(els)).catch(() => els.forEach(b => b.classList.add("jx-raw")));
  }
  const jxSeen = new Set();
  function jxOnNew(node) {                                                 // every new message in any chat: math, @Jamol, the English coach
    const X = CH(); if (!X || node.nodeType !== 1) return; jxTypeset(node.closest(".cm-feed, #cm-feed, .cm-thread") || node);
    const el = node.matches && node.matches(".cm-msg.me") ? node : null; if (!el || !el.dataset.mid || jxSeen.has(el.dataset.mid)) return; jxSeen.add(el.dataset.mid);
    const chatId = el.closest(".cm-thread") ? X.openId() : "global", chat = X.CHATS[chatId]; if (!chat) return;
    const m = chat.msgs.find(x => String(x.id) === el.dataset.mid); if (!m || !m.text || m.jxDone) return; m.jxDone = true;
    if (/@jamol\b/i.test(m.text)) jxJamol(chatId, m);
    if (jxEnglish(m.text)) { jxPractice(); if (S.coach) jxCoach(chatId, m); }
  }
  new MutationObserver(ms => ms.forEach(x => x.addedNodes.forEach(jxOnNew))).observe(document.body, { childList: true, subtree: true });
  let jxSampleP = null;
  async function jxAsk(prompt) {
    jxSampleP = jxSampleP || (window.claude && window.claude.use ? window.claude.use("sample").catch(() => null) : Promise.resolve(null));
    const s = await Promise.race([jxSampleP, new Promise(r => setTimeout(() => r(null), 1500))]); if (!s) return null;
    try { const r = await s([{ role: "user", content: prompt }], { modelTier: "quick", cache: false }); return String((r && r.text) || "").trim() || null; } catch (e) { return null; }
  }
  const jxCtx = chat => chat.msgs.filter(x => !x.system && x.text).slice(-6).map(x => `${x.who === "me" ? "Student" : x.who === "jamol" ? "Jamol" : firstN(x.who)}: ${x.text}`).join("\n");

  /* ---------- @Jamol explains a step to the whole group (study questions only) ---------- */
  JG_API.askJamolInChat = (chatId, question) => ({ chat_id: chatId, question, rules: "study questions only; answers from lesson materials; 2-4 sentences; may use $...$ math" });
  async function jxJamol(chatId, m) {
    const X = CH(), chat = X.CHATS[chatId]; JG_API.askJamolInChat(chatId, m.text);
    const q = m.text.replace(/@jamol\b/ig, "").trim();
    const ans = await jxAsk(`You are Jamol, the Jamals Global study assistant for students aged 12-19. A student tagged you in a group chat. Explain the step they ask about in 2-4 short sentences, clearly and kindly, as if to the whole group. You may write math as $...$. Only answer study questions (math, sciences, languages, tests, applications). If the question is not about studying, reply exactly: I can only help with study questions here.\n\nRecent chat:\n${jxCtx(chat)}\n\nQuestion: ${q}`)
      || (/[=^]|solve|factor|x\b/i.test(q) ? "Let's take it one step at a time: move every x-term to one side and the numbers to the other, then divide by the number in front of x. For example, $3x + 7 = 2x - 5$ gives $x = -12$." : "I can't reach my lesson notes right now. Try again in a minute, or open me from Lessons.");
    chat.msgs.push(X.M("jamol", ans, X.now ? X.now() : "")); if (X.rerenderChat) X.rerenderChat(chatId);
  }

  /* ---------- solve together: a photo of a problem becomes a shared whiteboard ---------- */
  JG_API.startWhiteboard = (chatId, messageId) => ({ board_id: `wb_${messageId}`, chat_id: chatId, participants: ["me", "dilnoza", "sardor"], background: `message:${messageId}` });
  function jxPhotoButton() {
    const inp = $("cm-th-in"); if (!inp || $("jx-cam")) return;
    inp.insertAdjacentHTML("beforebegin", `<button type="button" class="jx-cam" id="jx-cam" aria-label="Send a photo of a problem">📷</button><input type="file" id="jx-file" accept="image/*" hidden>`);
    $("jx-cam").onclick = () => $("jx-file").click();
    $("jx-file").onchange = e => { const f = e.target.files[0]; if (!f) return; const img = new Image(), url = URL.createObjectURL(f);
      img.onload = () => { const k = Math.min(1, 900 / Math.max(img.width, img.height)), cv = document.createElement("canvas"); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k); cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url); jxSendImage(cv.toDataURL("image/jpeg", .8)); };
      img.src = url; e.target.value = ""; };
  }
  function jxSendImage(dataUrl) { const X = CH(), id = X && X.openId(); if (!id) return; X.CHATS[id].msgs.push(X.M("me", "", X.now ? X.now() : "", { image: dataUrl })); X.rerenderChat(id); }
  function jxBoard(mid) {
    const X = CH(), chatId = X.openId(), m = (X.CHATS[chatId] || { msgs: [] }).msgs.find(x => String(x.id) === String(mid)); if (!m || !m.image) return; JG_API.startWhiteboard(chatId, mid);
    const el = layer("jx-board", "zq-view jx-board"); el.setAttribute("aria-label", "Solve together");
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-jx="close" aria-label="Close">‹</button><p class="dg-tt">Solve together${window.JG_ENGINE ? "" : " · 3 here"}</p>${"" /* JG-PROD: owner 20 Oct 2026 (M1, "untrue to a child"), a real student's board names nobody "here": nobody else is (the demo keeps the design's) */}<span class="dg-timer"></span></div>
      <div class="jx-wrap"><div class="jx-stage" id="jx-stage"><img src="${m.image}" alt="The problem"><canvas id="jx-cv"></canvas>${window.JG_ENGINE ? "" : `<span class="jx-cur" data-n="0">Dilnoza</span><span class="jx-cur b" data-n="1">Sardor</span>`}</div></div>${"" /* JG-PROD: owner 20 Oct 2026 (M1, "untrue to a child"), no invented cursors (Dilnoza, Sardor) on a real student's board: the mocked loop below then moves none */}
      <div class="jx-tools"><button type="button" data-pen="#1d7a4c" aria-pressed="true" aria-label="Green pen"></button><button type="button" data-pen="#d0533d" aria-label="Red pen"></button><button type="button" data-pen="#2b5f9e" aria-label="Blue pen"></button><button type="button" class="dg-link" data-jx="clear">Clear mine</button></div>`;
    const cv = $("jx-cv"), st = $("jx-stage"), g = cv.getContext("2d"); let pen = "#1d7a4c", drawing = false, last = null, mine = [];
    const fit = () => { const r = st.getBoundingClientRect(); cv.width = r.width * 2; cv.height = r.height * 2; g.setTransform(2, 0, 0, 2, 0, 0); g.lineCap = "round"; g.lineWidth = 3; mine.forEach(s => { g.strokeStyle = s.c; g.beginPath(); s.p.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke(); }); };
    const img = st.querySelector("img"); if (img.complete) fit(); else img.onload = fit;
    const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.onpointerdown = e => { drawing = true; last = pos(e); mine.push({ c: pen, p: [last] }); cv.setPointerCapture(e.pointerId); };
    cv.onpointermove = e => { if (!drawing) return; const p = pos(e); g.strokeStyle = pen; g.beginPath(); g.moveTo(last[0], last[1]); g.lineTo(p[0], p[1]); g.stroke(); mine[mine.length - 1].p.push(p); last = p; };
    cv.onpointerup = () => { drawing = false; };
    el.onclick = e => { const b = e.target.closest("[data-pen], [data-jx]"); if (!b) return; if (b.dataset.pen) { pen = b.dataset.pen; el.querySelectorAll("[data-pen]").forEach(x => x.setAttribute("aria-pressed", String(x === b))); }
      else if (b.dataset.jx === "clear") { mine = []; g.clearRect(0, 0, cv.width, cv.height); } else if (b.dataset.jx === "close") { el.hidden = true; cancelAnimationFrame(jxBoard.raf); } };
    const curs = [...el.querySelectorAll(".jx-cur")], t0 = performance.now();              // other people's cursors (mocked)
    const loop = now => { if (el.hidden) return; const t = (now - t0) / 1000, r = st.getBoundingClientRect();
      curs.forEach((c, i) => { const x = r.width * (.3 + .25 * Math.sin(t * (.6 + i * .2) + i * 2)), y = r.height * (.45 + .3 * Math.cos(t * (.5 + i * .15) + i)); c.style.transform = `translate(${x}px, ${y}px)`;
        if (Math.floor(t * 2) % 7 === i * 3 && Math.random() < .08) { g.strokeStyle = i ? "rgba(43,95,158,.7)" : "rgba(208,83,61,.7)"; g.beginPath(); g.arc(x, y, 12, 0, Math.PI * 1.6); g.stroke(); } });
      jxBoard.raf = requestAnimationFrame(loop); };
    jxBoard.raf = requestAnimationFrame(loop);
  }
  document.addEventListener("click", e => { const s = e.target.closest("[data-solve]"); if (s) { e.stopPropagation(); jxBoard(s.dataset.solve); } }, true);

  /* ---------- English coach (opt-in): a more natural way to say it, only you see it ---------- */
  const jxEnglish = t => { const w = t.replace(/@\w+/g, "").trim().split(/\s+/).filter(x => /[a-z]/i.test(x)); return w.length >= 3 && /^[\x20-\x7E’“”…—–\s]+$/.test(t); };
  const jxWeek = () => ymd(wkStart());
  function jxPractice() { S.engPractice = S.engPractice || {}; S.engPractice[jxWeek()] = (S.engPractice[jxWeek()] || 0) + 1; save(); jxCoachChip(); }
  JG_API.englishPractice = () => ({ week_start: jxWeek(), messages: (S.engPractice || {})[jxWeek()] || 0, coach_on: !!S.coach });
  JG_API.coachTip = (text, suggestion) => ({ original: text, suggestion, visible_to: "author_only" });
  async function jxCoach(chatId, m) {
    const X = CH(), out = await jxAsk(`You are an English coach for a teenager chatting with friends. If this chat message has a grammar mistake or sounds unnatural, reply with ONLY a more natural version of the same message, same meaning and tone, casual is fine. If it is already fine, reply with exactly: OK\n\nMessage: ${m.text}`);
    if (!out || /^ok\.?$/i.test(out) || out.toLowerCase() === m.text.toLowerCase()) return;
    m.coachTip = out.replace(/^["“]|["”]$/g, ""); JG_API.coachTip(m.text, m.coachTip); X.rerenderChat(chatId);
  }
  function jxCoachChip() {
    const inp = $("cm-th-in"); if (!inp) return; let c = $("jx-coach");
    if (!c) { (inp.closest(".cm-comp, form") || inp.parentElement).insertAdjacentHTML("beforebegin", `<button type="button" class="jx-coach" id="jx-coach"></button>`); c = $("jx-coach"); c.onclick = () => { S.coach = !S.coach; save(); jxCoachChip(); }; }
    const p = JG_API.englishPractice(); c.setAttribute("aria-pressed", String(p.coach_on)); c.textContent = `🗣 English coach: ${p.coach_on ? "on" : "off"}${p.messages ? ` · ${p.messages} English message${p.messages === 1 ? "" : "s"} this week` : ""}`;
  }
  document.addEventListener("click", e => { if (e.target.closest(".jx-coachoff")) { S.coach = false; save(); jxCoachChip(); const X = CH(); if (X && X.openId()) X.rerenderChat(X.openId()); } });

  /* ---------- friend streaks: both study every day; Sunday rest; freezes apply ---------- */
  const JX_FS = window.JG_ENGINE ? {} : { dilnoza: 12, sardor: 5, madina: 29, nilufar: 6, asadbek: 2 }, JX_FS_TODAY = { dilnoza: true, madina: true, nilufar: true, sardor: false, asadbek: false };   /* JG-PROD: owner 4 Oct R11, no invented friend streak ("🔥 29 days together" with the buddy Madina) or its celebrations for a real student */
  const jxMeToday = () => { const k = ymd(new Date()), l = SR.log[k], t = (S.days || {})[k]; return !!((l && l.sessions) || (t && t.done.length)); };
  JG_API.friendStreaks = () => Object.keys(JX_FS).filter(id => PPL2().PEOPLE[id]).map(id => { const both = jxMeToday() && JX_FS_TODAY[id], sunday = new Date().getDay() === 0;
    return { friend_id: id, first_name: firstN(id), days: JX_FS[id] + (both && !sunday ? 1 : 0), today: { me: jxMeToday(), friend: !!JX_FS_TODAY[id] }, rest_day: "sunday", freeze_available: true }; });
  window.JG_fstreak = id => { const f = JG_API.friendStreaks().find(x => x.friend_id === id); return f && f.days > 1 ? ` <span class="jx-fs" title="${f.days}-day friend streak">🔥 ${f.days}</span>` : ""; };
  function jxStreakMilestones() {
    JG_API.friendStreaks().forEach(f => { if (![7, 30, 100, 365].includes(f.days)) return; const key = `${f.friend_id}_${f.days}`; S.fsCeleb = S.fsCeleb || {}; if (S.fsCeleb[key]) return; S.fsCeleb[key] = true; save();
      if (window.JIA_celebrate) window.JIA_celebrate({ id: `fs_${key}`, name: `${f.days}-day streak with ${f.first_name}`, rare: f.days >= 100 ? "Legendary" : f.days >= 30 ? "Epic" : "Rare", desc: "You both studied every day", img: window.JIA_ach ? window.JIA_ach.img("fire") || window.JIA_ach.img("trophy") : "" }); });
    const X = CH(); if (X && X.renderConvs) X.renderConvs();
  }
  document.addEventListener("jia:thread", e => {                           // chat header extras: friend streak, photo button, coach chip
    const c = e.detail.chat, tg = $("cm-th-tag"); if (c && c.kind === "dm" && tg) { const f = JG_API.friendStreaks().find(x => x.friend_id === c.with); if (f && f.days > 1) tg.textContent += ` · 🔥 ${f.days} days together`; }
    jxPhotoButton(); jxCoachChip();
  });
  const _rcb2 = refreshComeBack; refreshComeBack = function () { _rcb2(); try { jxStreakMilestones(); } catch (e) {} };

  /* ---------- demo controls ---------- */
  if (pvq("jx-coach")) pvq("jx-coach").addEventListener("click", () => { const X = CH(); if (!X) return; S.coach = true; save(); X.open("g:sat");
    setTimeout(() => { const c = X.CHATS["g:sat"], m = X.M("me", "I am agree with your idea about the mock test", X.now ? X.now() : ""); m.jxDone = true; m.coachTip = "I agree with your idea about the mock test."; c.msgs.push(m); jxPractice(); X.rerenderChat("g:sat"); }, 400); });
  (() => { const X = CH(); if (!X || window.JG_ENGINE) return;   /* JG-PROD: owner 4 Oct R11, the invented study friends (Madina, Dilnoza) never message a real student */                                 // study friends you already talk to in Direct
    [["madina", "Done with today's session? Don't break our streak 🔥"], ["dilnoza", "I did 2 bricks already, your turn"]].forEach(([w, t]) => { const id = `dm:${w}`; if (!X.CHATS[id] && PPL2().PEOPLE[w]) X.CHATS[id] = { id, kind: "dm", with: w, time: "08:40", unread: 1, msgs: [X.M(w, t, "08:40")] }; });
    X.renderConvs(); })();

  /* ================= CHAT & COMMUNITY 3: flex, earned stickers, day-one onboarding, faster moderation ================= */
  /* ---------- flex: streak, card rating, league, class year next to every student's name ---------- */
  const JF_LEAGUES = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
  JG_API.flex = who => {
    const P = PPL2(), p = P.PEOPLE[who]; if (!p || !["student", "scorer"].includes(p.kind)) return null;
    const rating = 62 + hash(who + "r", 30); return { user_id: who, streak: 3 + hash(who + "s", 60), rating, tier: tierOf(rating), league: JF_LEAGUES[Math.min(4, Math.floor((rating - 60) / 7))], class_year: 2026 + hash(who + "y", 4) };
  };
  window.JG_flex = who => { const f = JG_API.flex(who); return f ? `<button type="button" class="jf-flex" data-flex="${who}" aria-label="${f.streak}-day streak, card ${f.rating}, ${f.league} league, class of ${f.class_year}. Open mini profile">🔥${f.streak} · ${f.rating} · ${f.league} · '${String(f.class_year).slice(2)}</button>` : ""; };
  function jfMini(who) {
    const f = JG_API.flex(who), P = PPL2(), p = P.PEOPLE[who]; if (!f) return; const el = layer("jf-mini", "zq-view jf-mini"); el.setAttribute("aria-label", `${p.name}, mini profile`);
    el.innerHTML = `<div class="jf-card"><img src="${P.AV[who] || ""}" alt=""><b>${esc(p.name)}</b><small>${esc(p.tag || "")}</small>
      <div class="jf-stats"><span><b>🔥 ${f.streak}</b>day streak</span><span class="t-${f.tier}"><b>${f.rating}</b>${f.tier} card</span><span><b>${f.league}</b>league</span><span><b>'${String(f.class_year).slice(2)}</b>class of ${f.class_year}</span></div>
      <div class="jf-acts"><button type="button" class="dg-go" data-jf="profile">Open profile</button><button type="button" class="dg-link" data-jf="report">Report or block</button><button type="button" class="dg-link" data-jf="close">Close</button></div></div>`;
    el.onclick = e => { const b = e.target.closest("[data-jf]"); if (!b && e.target === el) { el.hidden = true; return; } if (!b) return; const a = b.dataset.jf; el.hidden = true;
      if (a !== "close" && window.JIA_openProfile) { window.JIA_openProfile(who); if (a === "report") setTimeout(() => { const m = $("pf-more"); if (m) m.click(); }, 450); } };
  }
  document.addEventListener("click", e => { const f = e.target.closest("[data-flex]"); if (f) { e.stopPropagation(); e.preventDefault(); jfMini(f.dataset.flex); } }, true);

  /* ---------- earned stickers: some unlock only through progress ---------- */
  const jfSvg = (bg, fg, top, bottom) => `<svg viewBox="0 0 120 120" class="jf-stk" aria-hidden="true"><defs><radialGradient id="g${top.length}${bottom.length}" cx=".35" cy=".3"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><circle cx="60" cy="60" r="54" fill="${bg}"/><circle cx="60" cy="60" r="54" fill="url(#g${top.length}${bottom.length})"/><circle cx="60" cy="60" r="46" fill="none" stroke="${fg}" stroke-width="3" stroke-dasharray="4 4"/><text x="60" y="62" text-anchor="middle" font-size="34">${top}</text><text x="60" y="90" text-anchor="middle" font-family="Raleway, sans-serif" font-weight="800" font-size="12" fill="${fg}">${bottom}</text></svg>`;
  let jfDome = "";
  (() => { const img = new Image(); img.onload = () => { const c = document.createElement("canvas"); c.width = c.height = 120; const g = c.getContext("2d"); g.beginPath(); g.arc(60, 60, 56, 0, Math.PI * 2); g.clip(); const s = img.height; g.drawImage(img, (img.width - s) / 2, 0, s, s, 0, 0, 120, 120); jfDome = c.toDataURL("image/webp", .7); jfPaintEarned(); }; img.src = DOME.color; })();
  JG_API.stickers = () => {
    const L = window.JIA_league, card = JG_API.playerCard(), season = JG_API.season(), vh = JG_API.volunteerHours();
    return [{ id: "earn:mit", name: window.JG_ENGINE ? "The Dome" : "MIT Dome", unlocked: SR.bricks >= 100, how: window.JG_ENGINE ? "Lay 100 bricks in the Study Room" : "Lay 100 bricks for MIT in the Study Room" },   /* JG-PROD: owner 3 Oct R14, P4b final review I3 (m6): a real student's Study Room builds their own goal, so the sticker never asks for MIT; the design's own words without an engine */
      { id: "earn:streak30", name: "30-day streak", unlocked: !!L && L.ME.streak >= 30, how: "Reach a 30-day streak" },
      { id: "earn:gold", name: "Gold card", unlocked: ["gold", "jade"].includes(card.tier), how: "Get your player card to Gold (75+)" },
      { id: "earn:sat", name: "SAT Season", unlocked: season.progress >= 10 || !!S.stkDemo, how: "Earn the SAT Season 10-brick medal" },
      { id: "earn:tutor", name: "Peer tutor", unlocked: vh.verified_hours >= 10, how: "Reach 10 verified volunteer hours" }];
  };
  const jfArt = id => ({ "earn:mit": jfDome ? `<img class="jf-stk" src="${jfDome}" alt="">` : jfSvg("#e8efe9", "#1d6b4c", "🏛️", "MIT"), "earn:streak30": jfSvg("#ffe7d6", "#b4471b", "🔥", "30 DAYS"), "earn:gold": jfSvg("#fff1c4", "#8a6508", "🥇", "GOLD CARD"),
    "earn:sat": jfSvg("#dfe9ff", "#1b3f8f", "📘", "SAT SEASON"), "earn:tutor": jfSvg("#efe9ff", "#5a3fb0", "🤝", "PEER TUTOR") })[id];
  function jfPaintEarned() {
    const grid = $("stk-grid"), list = window.JIA_STICKERS; if (!grid || !list) return; grid.querySelectorAll(".jf-earn").forEach(x => x.remove());
    const st = JG_API.stickers(); st.forEach(s => { const i = list.findIndex(x => x.id === s.id); if (s.unlocked) { if (i < 0) list.push({ id: s.id, html: jfArt(s.id), label: s.name }); else list[i].html = jfArt(s.id); } });
    grid.insertAdjacentHTML("beforeend", `<p class="jf-earn jf-eh">Earned stickers</p>` + st.map(s => s.unlocked ? `<button type="button" class="jf-earn" data-stk="${s.id}" aria-label="${esc(s.name)} sticker">${jfArt(s.id)}</button>`
      : `<button type="button" class="jf-earn jf-locked" disabled title="${esc(s.how)}" aria-label="${esc(s.name)} sticker, locked. ${esc(s.how)}">${jfArt(s.id)}<small>🔒 ${esc(s.how)}</small></button>`).join(""));
  }

  /* ---------- day one: a squad, 2 clubs, a study buddy; nobody lands in an empty app ---------- */
  // NATIVE CHECK: the Uzbek and Russian lines below are new and need a native speaker's review.
  if (!window.JG_ENGINE) PQ.push({ id: "m8_buddy_pref", opts: ["any", "same_gender"] });   /* JG-PROD: owner 4 Oct R11, buddy matching is gone for a real student, so a real family is not asked about a study buddy (the bank has no m8_buddy_pref: their answers came back 422); the design's "5 short questions" stays */
  if (!window.JG_ENGINE) { Object.assign(PT.en, { hi: `${KID} asked you to answer 6 short questions` }); PT.en.q.push(`Study buddy: who can ${KID} be matched with?`); PT.en.hint.push("A study buddy is another student at the same stage. They study together in the app and never exchange contact details."); Object.assign(PT.en.o, { any: "Any student at the same stage", same_gender: "Same gender only" }); }   /* JG-PROD: owner 4 Oct R11, buddy matching is gone for a real student, so a real family is not asked about a study buddy (the bank has no m8_buddy_pref: their answers came back 422); the design's "5 short questions" stays */
  if (!window.JG_ENGINE) { Object.assign(PT.uz, { hi: `${KID} sizdan 6 ta qisqa savolga javob berishingizni so'radi` }); PT.uz.q.push(`${KID} uchun o'quv hamkori kim bo'lishi mumkin?`); PT.uz.hint.push("O'quv hamkori — shu bosqichdagi boshqa o'quvchi. Ular ilovada birga o'qishadi va shaxsiy kontaktlarini almashmaydi."); Object.assign(PT.uz.o, { any: "Bir xil bosqichdagi istalgan o'quvchi", same_gender: "Faqat bir xil jinsdagi o'quvchi" }); }   /* JG-PROD: owner 4 Oct R11, buddy matching is gone for a real student, so a real family is not asked about a study buddy (the bank has no m8_buddy_pref: their answers came back 422); the design's "5 short questions" stays */
  if (!window.JG_ENGINE) { Object.assign(PT.ru, { hi: `${KID_RU} просит вас ответить на 6 коротких вопросов` }); PT.ru.q.push(`С кем можно подобрать учебного партнёра для ${KID_RU}а?`); PT.ru.hint.push("Учебный партнёр — другой ученик того же этапа. Они занимаются вместе в приложении и не обмениваются контактами."); Object.assign(PT.ru.o, { any: "Любой ученик того же этапа", same_gender: "Только того же пола" }); }   /* JG-PROD: owner 4 Oct R11, buddy matching is gone for a real student, so a real family is not asked about a study buddy (the bank has no m8_buddy_pref: their answers came back 422); the design's "5 short questions" stays */
  JG_API.onboard = () => {
    const a = S.done && S.answers ? S.answers : {}, d = derive(a), P = PPL2(), pref = (S.parentAnswers || {}).m8_buddy_pref || a.m8_buddy_pref || "any", me = a.m0_gender || "m";
    const clubs = []; if ((d.rules_set || []).includes("US")) clubs.push("mit"); if (d.requires_english && CEFR.indexOf(d.english_tested || "A0") < CEFR.indexOf("B2")) clubs.push("ielts7");
    if ((S.parallel || []).includes("DE")) clubs.push("germany"); if ((a.m3_olympiads || []).length) clubs.push("olymp"); ["ielts7", "coding"].forEach(c => clubs.push(c));
    const buddies = [{ user_id: "madina", gender: "f", route: "US + South Korea", grade: 9 }, { user_id: "timur", gender: "m", route: "US + Türkiye", grade: 9 }, { user_id: "asadbek", gender: "m", route: "US + Germany", grade: 10 }].filter(b => P.PEOPLE[b.user_id]);
    const pick = buddies.find(b => pref === "same_gender" ? b.gender === me : true) || buddies[0];
    return { squad: { id: "sq_road_mit", name: "Road to MIT squad", stage: d.stage || "S2", members: SQUAD_IDS.filter(x => P.PEOPLE[x]) }, clubs: [...new Set(clubs)].slice(0, 2),
      buddy: pick ? { user_id: pick.user_id, first_name: firstN(pick.user_id), stage: d.stage || "S2", grade: pick.grade, route: pick.route, reason: "Same stage, same dream route, both working towards English B2", parent_pref: pref } : null,
      welcome: SQUAD_IDS.filter(x => P.PEOPLE[x]).map((x, i) => ({ from: x, emoji: ["👋", "🔥", "👏", "👋"][i % 4] })) };
  };
  function obRun(then) {
    const o = JG_API.onboard(), P = PPL2(), el = layer("ob-view", "zq-view ob-view"); let step = 0; el.setAttribute("aria-label", "Welcome to Jamals Global");
    o.clubs.forEach(id => JG_API.joinClub(id)); S.onboarded = { at: ymd(new Date()), buddy: o.buddy && o.buddy.user_id, clubs: o.clubs }; save(); paintClubStrip();
    const face = (w, i) => `<span class="ob-face" style="--d:${i * .25}s"><img src="${P.AV[w] || ""}" alt=""><i>${(o.welcome[i] || {}).emoji || "👋"}</i></span>`;
    const steps = [
      () => `${mascot("delighted", "ob-jam")}<h2>You're in a squad</h2><p class="sr-sub ob-sub">${esc(o.squad.name)} · stage ${esc(o.squad.stage)} · they study when you do</p><div class="ob-faces">${o.squad.members.map(face).join("")}</div><small class="lt-note">Your squad cheered: ${o.welcome.map(w => w.emoji).join(" ")}</small>`,
      () => `${mascot("point", "ob-jam")}<h2>You joined 2 clubs</h2><p class="sr-sub ob-sub">Picked for your route. You can leave or join others anytime.</p>${o.clubs.map(id => { const c = allClubs().find(x => x.id === id); return c ? `<div class="jc-row"><span class="jc-ic">${esc(c.name.slice(0, 1))}</span><span><b>${esc(c.name)}</b><small>${c.members.toLocaleString("en-US")} members · ${esc(c.about)}</small></span></div>` : ""; }).join("")}`,
      () => o.buddy ? `${mascot("cele", "ob-jam")}<h2>Meet your study buddy</h2><div class="ob-buddy"><img src="${P.AV[o.buddy.user_id] || ""}" alt=""><b>${esc(o.buddy.first_name)}</b><small>Grade ${o.buddy.grade} · stage ${esc(o.buddy.stage)} · ${esc(o.buddy.route)}</small><p>${esc(o.buddy.reason)}.</p>${o.buddy.parent_pref === "same_gender" ? `<small class="lt-note">Matched with your parent's choice: same gender only</small>` : ""}</div>` : `<h2>Your study buddy is on the way</h2>` ];
    const paint = () => { el.innerHTML = `<div class="dg-top"><span class="dg-timer"></span><p class="dg-tt">Day one · ${step + 1} of 3</p><span class="dg-timer"></span></div><div class="zq-body ob-body">${steps[step]()}</div>
      <div class="dg-foot">${step < 2 ? `<button class="dg-go" type="button" data-ob="next">Next</button>` : `${o.buddy ? `<button class="dg-go" type="button" data-ob="hi">Say hi to ${esc(o.buddy.first_name)}</button>` : ""}<button class="dg-link" type="button" data-ob="done">Start studying</button>`}</div>`; };
    el.onclick = e => { const b = e.target.closest("[data-ob]"); if (!b) return; const a = b.dataset.ob;
      if (a === "next") { step++; paint(); return; } el.hidden = true;
      if (a === "hi" && o.buddy) { const X = CH(), id = `dm:${o.buddy.user_id}`; if (X) { if (!X.CHATS[id]) X.CHATS[id] = { id, kind: "dm", with: o.buddy.user_id, time: X.now ? X.now() : "", unread: 0, msgs: [] };
        X.CHATS[id].msgs.push(X.M(null, "You're study buddies now: same stage, same route. Say hi and plan your first session together.", "", { system: true })); X.CHATS[id].buddy = true; X.renderConvs();
        document.querySelector('#tb-track button[data-i="4"]').click(); setTimeout(() => X.open(id), 350); } }
      else if (typeof then === "function") then(); };
    paint();
  }

  /* ---------- faster moderation: an AI pre-check marks every post, story and reel clean or flagged ---------- */
  JG_API.moderationQueue = () => S.modQueue || [];
  JG_API.precheck = async item => {
    const X = CH(), scr = X && X.screen ? X.screen(item.text || "") : null;
    const out = window.JG_MOD ? await window.JG_MOD.precheck(item) : await jxAsk(`You check content for a study app used by students aged 12-19. Reply with JSON only. If this ${item.type} caption is fine, reply {"status":"clean"}. If it contains bullying, sexual content, violence, self-harm, hate, scams, personal contact details or outside links, reply {"status":"flagged","reason":"<a few words>"}.\n\nCaption: ${item.text || "(no text)"}`);   /* JG-PROD: owner 20 Oct 2026 (M1), a real student's caption is pre-checked on the server (POST /api/v1/ai/precheck, public/runtime/jg-moderation.js), never by an AI call from the page */
    let r = null; try { r = JSON.parse((out || "").match(/\{[\s\S]*\}/)[0]); } catch (e) { r = null; }
    if (!r || !/^(clean|flagged)$/.test(r.status)) r = scr && scr.blocked ? { status: "flagged", reason: scr.phone ? "contact details" : scr.link ? "outside link" : "language" } : { status: "clean", reason: "" };
    const entry = { item_id: `${item.type}_${Date.now()}`, type: item.type, text: item.text || "", media_checked: false, ai: { status: r.status, reason: r.reason || "", engine: out ? "sample" : "filter", checked_at: new Date().toISOString() }, admin: { status: "pending", one_tap_approve: r.status === "clean" }, submitted_at: new Date().toISOString() };
    S.modQueue = [entry, ...(S.modQueue || [])].slice(0, 50); save(); return entry;
  };
  document.addEventListener("jia:review", e => { JG_API.precheck(e.detail || {}); });

  /* ---------- demo controls, refresh and first paint ---------- */
  if (pvq("jf-unlock")) pvq("jf-unlock").addEventListener("click", () => { S.stkDemo = true; save(); jfPaintEarned(); if (window.JIA_notify) window.JIA_notify({ text: `<b>New sticker unlocked:</b> SAT Season. Find it under Earned stickers.` }); });
  if (pvq("ob-run")) pvq("ob-run").addEventListener("click", () => obRun(null));
  const _rcb3 = refreshComeBack; refreshComeBack = function () { _rcb3(); try { jfPaintEarned(); } catch (e) {} };
  jfPaintEarned();


  /* ================= UNIVERSITY PASSPORT: every university you really explore stamps your passport ================= */
  const PP_PHOTOS = {"kaist": {"img": "/d/student-mobile/media/8369a4a40d90674c.webp", "credit": "Photo: Rickinasia, Wikimedia Commons, CC BY-SA 4.0"}, "bogazici": {"img": "/d/student-mobile/media/2b4b5be8deb61158.webp", "credit": "Photo: Furkan Akkurt, Wikimedia Commons, CC BY-SA 4.0"}, "tum": {"img": "/d/student-mobile/media/579bc02e3a2037e9.webp", "credit": "Photo: Katercarlox from Munich, Germany, Wikimedia Commons, CC BY 2.0"}, "nuuz": {"img": "/d/student-mobile/media/d9cf0aec13dbc329.webp", "credit": "Photo: MinaUktamova, Wikimedia Commons, CC BY 4.0"}, "harvard": {"img": "/d/student-mobile/media/fbb6fd0e9131f2c4.webp", "credit": "Photo: Kenneth C. Zirkel, Wikimedia Commons, CC BY 4.0"}};
  const PP_UNIS = [
    { id: "mit", name: "MIT", city: "Cambridge, USA", route: "US", img: DOME.color, credit: DOME.credit, ink: "#b3261e", live: "MIT admissions Q&A · Oct 8",
      quiz: [["Which city is MIT in?", ["Boston", "Cambridge", "New York", "Chicago"], 1], ["When was MIT founded?", ["1636", "1861", "1901", "1946"], 1], ["The Great Dome sits on which building?", ["Building 10", "Building 1", "The library", "The stadium"], 0]] },
    { id: "harvard", name: "Harvard University", city: "Cambridge, USA", route: "US", ink: "#8b1e3f", live: "Harvard info session · Oct 15",
      quiz: [["Harvard was founded in…", ["1636", "1776", "1861", "1900"], 0], ["Which state is Harvard in?", ["New York", "California", "Massachusetts", "Texas"], 2], ["Harvard is the oldest university in…", ["Europe", "the United States", "Asia", "Canada"], 1]] },
    { id: "kaist", name: "KAIST", city: "Daejeon, South Korea", route: "KR", ink: "#1f4fa3", live: "KAIST international admissions · Oct 12",
      quiz: [["KAIST's main campus is in…", ["Seoul", "Busan", "Daejeon", "Incheon"], 2], ["KAIST was founded in…", ["1946", "1971", "1995", "2005"], 1], ["KAIST is best known for…", ["Science and technology", "Fashion design", "Only law", "Music"], 0]] },
    { id: "bogazici", name: "Boğaziçi University", city: "Istanbul, Türkiye", route: "TR", ink: "#0f6e6e", live: "Boğaziçi open day online · Oct 19",
      quiz: [["Boğaziçi University is in…", ["Ankara", "Izmir", "Istanbul", "Antalya"], 2], ["Its campus overlooks the…", ["Bosphorus", "Nile", "Danube", "Rhine"], 0], ["Its main language of teaching is…", ["English", "French", "German", "Arabic"], 0]] },
    { id: "tum", name: "Technical University of Munich", city: "Munich, Germany", route: "DE", ink: "#2b5f9e", live: "TUM study info online · Oct 22",
      quiz: [["TUM is in which city?", ["Berlin", "Munich", "Hamburg", "Cologne"], 1], ["TUM was founded in…", ["1868", "1920", "1956", "1989"], 0], ["TUM is known above all for…", ["Engineering and science", "Only art", "Only law", "Only music"], 0]] },
    { id: "nuuz", name: "National University of Uzbekistan", city: "Tashkent, Uzbekistan", route: "UZ_HOME", ink: "#1d7a4c", live: "NUUz open day · Oct 26",
      quiz: [["The National University of Uzbekistan is in…", ["Samarkand", "Tashkent", "Bukhara", "Namangan"], 1], ["It was founded in…", ["1918", "1956", "1991", "2002"], 0], ["It is named after…", ["Mirzo Ulugbek", "Alisher Navoi", "Ibn Sina", "Al-Khwarizmi"], 0]] } ];
  PP_UNIS.forEach(u => { if (!u.img && PP_PHOTOS[u.id]) { u.img = PP_PHOTOS[u.id].img; u.credit = PP_PHOTOS[u.id].credit; } });
  JG_API.universityTour = id => { const u = PP_UNIS.find(x => x.id === id); return u ? { university_id: id, photos: [{ src: u.img, credit: u.credit }], live_session: u.live } : null; };
  JG_API.universityQuiz = id => { const u = PP_UNIS.find(x => x.id === id); return u ? u.quiz.map(([q, o]) => ({ q, options: o })) : []; };
  JG_API.stampPassport = (id, via) => { const u = PP_UNIS.find(x => x.id === id); return { university_id: id, name: u.name, city: u.city, date: ymd(new Date()), via }; };
  JG_API.passport = () => {
    const stamps = S.stamps || [], have = new Set(stamps.map(s => s.university_id)), par = S.parallel || [];
    const order = u => (par.includes(u.route) ? 0 : u.route === "US" ? 1 : 2);
    return { stamps, suggestions: PP_UNIS.filter(u => !have.has(u.id)).sort((a, b) => order(a) - order(b)).map(u => ({ university_id: u.id, name: u.name, city: u.city, reason: par.includes(u.route) ? "your parallel route" : u.route === "US" ? "your dream route" : "worth a look" })) };
  };
  const stampSVG = (s, big) => { const u = PP_UNIS.find(x => x.id === s.university_id) || {}, rot = (hash(s.university_id, 17) - 8), d = new Date(s.date + "T12:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    return `<svg class="pp-stamp${big ? " big" : ""}" viewBox="0 0 160 110" style="transform:rotate(${rot}deg);color:${u.ink || "#1d7a4c"}" role="img" aria-label="${esc(s.name)} stamp, ${esc(d)}"><rect x="4" y="4" width="152" height="102" rx="18" fill="none" stroke="currentColor" stroke-width="4"/><rect x="11" y="11" width="138" height="88" rx="13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3"/>
      <text x="80" y="40" text-anchor="middle" fill="currentColor" font-family="Raleway, sans-serif" font-weight="800" font-size="${s.name.length > 16 ? 11 : 15}"${s.name.length > 14 ? ' textLength="132" lengthAdjust="spacingAndGlyphs"' : ""}>${esc(s.name.toUpperCase())}</text><text x="80" y="60" text-anchor="middle" fill="currentColor" font-family="Raleway, sans-serif" font-weight="700" font-size="10">${esc((u.city || "").toUpperCase())}</text>
      <text x="80" y="83" text-anchor="middle" fill="currentColor" font-family="Raleway, sans-serif" font-weight="800" font-size="12" letter-spacing="1">★ ${esc(d)} ★</text></svg>`; };
  function paintPassportCard() {
    const h = $("ex-title"), hd = h && h.closest("header"); if (!hd) return; const p = JG_API.passport(), n = p.suggestions[0], old = $("pp-card");
    const html = `<button type="button" class="zb pp-card" id="pp-card"><span><b>🛂 Your JG passport · ${p.stamps.length} stamp${p.stamps.length === 1 ? "" : "s"}</b><small>${n ? `Stamp next: ${esc(n.name)} (${n.reason})` : "Every university stamped. Impressive."}</small></span><em class="jd-go">Open</em></button>`;
    if (old) old.outerHTML = html; else hd.insertAdjacentHTML("afterend", html); $("pp-card").onclick = openPassport;
  }
  function openPassport() {
    const p = JG_API.passport(), el = layer("pp-view", "zq-view"); el.setAttribute("aria-label", "Your JG passport");
    const slots = Math.max(6, Math.ceil((p.stamps.length + 1) / 2) * 2);
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-pp="close" aria-label="Close">‹</button><p class="dg-tt">Your JG passport</p><span class="dg-timer"></span></div><div class="zq-body">
      <div class="pp-book"><div class="pp-cover"><b>JAMALS GLOBAL</b><small>University passport · ${p.stamps.length} stamp${p.stamps.length === 1 ? "" : "s"}</small></div>
        <div class="pp-page">${[...Array(slots)].map((_, i) => p.stamps[i] ? `<span class="pp-slot">${stampSVG(p.stamps[i])}</span>` : `<span class="pp-slot empty">Stamp here</span>`).join("")}</div></div>
      <b class="jr-next-h">Stamp next</b><div class="pp-list">${p.suggestions.map(s => { const u = PP_UNIS.find(x => x.id === s.university_id); return `<button type="button" class="pp-uni" data-uni="${u.id}">${u.img ? `<img src="${u.img}" alt="">` : ""}<span><b>${esc(u.name)}</b><small>${esc(u.city)} · ${esc(s.reason)}</small></span></button>`; }).join("") || `<p class="zq-note">You've stamped every university here.</p>`}</div>
      <p class="zq-note">Explore to stamp: take the photo tour, pass a 3-question quiz, or attend a live session.</p></div>`;
    el.onclick = e => { const b = e.target.closest("[data-pp]"), u = e.target.closest("[data-uni]"); if (b) el.hidden = true; else if (u) openUni(u.dataset.uni); };
  }
  function openUni(id) {
    const u = PP_UNIS.find(x => x.id === id), t = JG_API.universityTour(id), el = layer("pu-view", "zq-view"); el.setAttribute("aria-label", u.name);
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-pu="close" aria-label="Back">‹</button><p class="dg-tt">${esc(u.name)}</p><span class="dg-timer"></span></div><div class="zq-body">
      ${t.photos.map(ph => `<figure class="pu-photo"><img src="${ph.src}" alt="${esc(u.name)}"><figcaption>${esc(ph.credit || "")}</figcaption></figure>`).join("")}<p class="dg-mod">${esc(u.city)}</p>
      <div class="pu-ways"><button type="button" class="dg-go" data-pu="tour">I took the photo tour</button><button type="button" class="dg-go ghost" data-pu="quiz">3-question quiz</button><button type="button" class="dg-link" data-pu="live">I attended: ${esc(t.live_session)}</button></div><div id="pu-quiz"></div></div>`;
    el.onclick = e => {
      const b = e.target.closest("[data-pu]"), o = e.target.closest("[data-uq]"); if (o) return;
      if (!b) return; const a = b.dataset.pu;
      if (a === "close") el.hidden = true; else if (a === "tour" || a === "live") stamp(id, a); else if (a === "quiz") uniQuiz(id);
    };
  }
  function uniQuiz(id) {
    const u = PP_UNIS.find(x => x.id === id), box = $("pu-quiz"); let k = 0, right = 0;
    const step = () => { if (k >= 3) { if (right >= 2) stamp(id, "quiz"); else box.innerHTML = `<p class="jt-miss">${right} of 3. Take the tour and try again.</p>`; return; }
      const [q, o] = u.quiz[k]; box.innerHTML = `<b class="jr-next-h">Quiz · ${k + 1} of 3</b><p class="jt-q">${esc(q)}</p><div class="dg-opts">${o.map((x, i) => `<button type="button" class="dg-opt" data-uq="${i}"><span>${esc(x)}</span></button>`).join("")}</div>`; };
    box.onclick = e => { const b = e.target.closest("[data-uq]"); if (!b) return; if (+b.dataset.uq === u.quiz[k][2]) right++; k++; step(); };
    step(); box.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  function stamp(id, via) {
    if ((S.stamps || []).some(s => s.university_id === id)) { openPassport(); return; }
    const s = JG_API.stampPassport(id, via); S.stamps = [...(S.stamps || []), s]; save();
    const L = window.JIA_league; if (L) { L.ME.xp += 15; L.ME.week += 15; try { L.paint(); } catch (e) {} }
    const el = layer("pst-view", "zq-view pst-view"); el.setAttribute("aria-label", `Stamped: ${s.name}`);
    el.innerHTML = `<div class="pst-wrap"><div class="pst-anim">${stampSVG(s, true)}</div><b>Stamped: ${esc(s.name)}</b><small>+15 XP · ${JG_API.passport().stamps.length} in your passport</small><button type="button" class="dg-go" data-pst="ok">See my passport</button></div>`;
    el.onclick = e => { if (e.target.closest("[data-pst]")) { el.hidden = true; const pu = $("pu-view"); if (pu) pu.hidden = true; openPassport(); } };
    paintPassportCard();
  }

  /* ================= LETTER TO FUTURE YOU: sealed until Decision Day, private, a P.S. once a year ================= */
  JG_API.letter = () => (S.letter ? { status: S.letter.opened ? "opened" : "sealed", sealed_at: S.letter.sealed_at, opens_on: "decision_day", ps_count: (S.letter.ps || []).length } : { status: "none" });
  JG_API.sealLetter = text => ({ sealed_at: new Date().toISOString(), opens_on: "decision_day", length: text.length });
  JG_API.addLetterPS = text => ({ at: new Date().toISOString(), length: text.length });
  JG_API.openLetter = () => (S.letter ? { text: S.letter.text, sealed_at: S.letter.sealed_at, ps: S.letter.ps || [] } : null);
  const yearlyDay = () => { const L = window.JIA_league; return !!(L && L.ME.streak > 0 && L.ME.streak % 365 === 0); };
  const fmtLong = d => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  function letterSection() {
    const lt = JG_API.letter();
    return `<section class="fy-card" id="fy-card">${lt.status === "none" ? `<b>✉️ Letter to future you</b><p>Write to the you who opens their university decision. Only you can ever read it.</p><button type="button" class="dg-go" data-fy="write">Write my letter</button>`
      : `<div class="fy-sealed"><span class="fy-seal sm" aria-hidden="true">JG</span><span><b>✉️ Sealed ${fmtLong(lt.sealed_at)}</b><small>Opens on your Decision Day${lt.ps_count ? ` · ${lt.ps_count} P.S.` : ""}</small></span></div>
        ${yearlyDay() ? `<button type="button" class="dg-link" data-fy="ps">Add this year's P.S.</button>` : `<small class="fy-note">You can add a P.S. once a year, on your yearly medal day.</small>`}`}</section>`;
  }
  function openLetterEditor(ps) {
    const el = layer("fy-view", "zq-view fy-view"); el.setAttribute("aria-label", ps ? "Add a P.S." : "Letter to future you");
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-fy="close" aria-label="Close">‹</button><p class="dg-tt">${ps ? "This year's P.S." : "Letter to future you"}</p><span class="dg-timer"></span></div><div class="zq-body">
      <p class="sr-sub fy-sub">${ps ? "A few lines for the future you. Once added, it's sealed too." : "Dear future me… What are you scared of today? What do you hope is true when you open this? Only you can ever read it, not your parents or counselors. Once sealed, it can't be edited."}</p>
      <textarea class="dg-text fy-text" id="fy-text" rows="10" maxlength="4000" placeholder="${ps ? "P.S. …" : "Dear future me,"}"></textarea><small class="fy-note" id="fy-count">At least 40 characters</small></div>
      <div class="dg-foot"><button class="dg-go" type="button" data-fy="${ps ? "addps" : "seal"}" id="fy-seal" disabled>${ps ? "Seal the P.S." : "Seal it"}</button></div>`;
    const ta = $("fy-text"); ta.oninput = () => { const n = ta.value.trim().length; $("fy-seal").disabled = n < 40; $("fy-count").textContent = n < 40 ? `At least 40 characters (${n})` : `${n} characters · ready to seal`; };
    setTimeout(() => ta.focus({ preventScroll: true }), 80);
  }
  function sealAnim(done) {
    const el = layer("fy-view", "zq-view fy-view");
    el.innerHTML = `<div class="fy-stage"><div class="fy-env"><span class="fy-paper"></span><span class="fy-flap"></span><span class="fy-seal big" aria-hidden="true">JG</span></div><b class="fy-h">Sealed</b><small class="fy-sm">Opens on your Decision Day</small></div>`;
    setTimeout(() => { el.hidden = true; done(); }, 2600);
  }
  function openingMoment() {
    let L = JG_API.openLetter(), sample = false;
    if (!L) { sample = true; L = { text: "Dear future me,\n\nThis is a sample, because you haven't sealed your own letter yet. Write yours from your profile, and on Decision Day it opens right here.", sealed_at: new Date().toISOString(), ps: [] }; }
    const el = layer("fy-view", "zq-view fy-view fy-open"); el.setAttribute("aria-label", "Your letter opens");
    el.innerHTML = `<div class="fy-stage"><div class="fy-env opening"><span class="fy-flap"></span><span class="fy-seal big crack" aria-hidden="true">JG</span></div>
      <article class="fy-letter"><small>Written ${fmtLong(L.sealed_at)}${sample ? " · sample" : ""}</small><p>${esc(L.text).replace(/\n/g, "<br>")}</p>${L.ps.map(p => `<p class="fy-ps"><b>P.S. (${fmtLong(p.at)})</b> ${esc(p.text)}</p>`).join("")}</article>
      ${mascot("delighted", "fy-jamol")}<button type="button" class="dg-go" data-fy="close">Close</button></div>`;
    el.onclick = e => { if (e.target.closest("[data-fy=close]")) el.hidden = true; };
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-fy]"); if (!b || b.disabled) return; const a = b.dataset.fy;
    if (a === "write") openLetterEditor(false); else if (a === "ps") openLetterEditor(true);
    else if (a === "close") { const v = $("fy-view"); if (v) v.hidden = true; }
    else if (a === "seal") { const t = $("fy-text").value.trim(); JG_API.sealLetter(t); S.letter = { text: t, sealed_at: new Date().toISOString(), ps: [] }; save(); sealAnim(refreshProfileExtras); }
    else if (a === "addps") { const t = $("fy-text").value.trim(); JG_API.addLetterPS(t); S.letter.ps = [...(S.letter.ps || []), { at: new Date().toISOString(), text: t }]; save(); sealAnim(refreshProfileExtras); }
  });
  function refreshProfileExtras() {                                        // your own profile: passport stamps and the sealed letter
    const pv = $("pf-view"); if (!pv || pv.hidden || !pv.textContent.includes(JG_ME.fullName)) return; /* JG-PROD: identity */
    const old = $("fy-card"); const html = letterSection(), bd = $("zc-badge");
    if (old) old.outerHTML = html; else if (bd) (window.JG_ENGINE && $("pf-actions") || bd.parentElement).insertAdjacentHTML("afterend", html);   /* JG-PROD: owner 4 Oct P4g S4, screenshot 5: the letter (and "Your why" and "My style", which follow it) goes in under the profile's own header, bio, stats and actions (as wide as they are, .fy-card's P4g S4 rule), not into the header's row beside the avatar, where each was squeezed to a word a line and its button clipped; the demo keeps the design's place */
    if (bd && !$("pp-badge")) bd.insertAdjacentHTML("afterend", ` <button type="button" class="zc-badge" id="pp-badge">🛂 ${JG_API.passport().stamps.length} stamps</button>`);
    const pb = $("pp-badge"); if (pb) { pb.textContent = `🛂 ${JG_API.passport().stamps.length} stamps`; pb.onclick = openPassport; }
  }
  const _badge2 = classBadge; classBadge = function () { _badge2(); refreshProfileExtras(); };
  if (pvq("fy-open")) pvq("fy-open").addEventListener("click", openingMoment);
  paintPassportCard();
  /* ================= DESIGN PASS: the new features in the app's polished style ================= */
  const img3d = k => { const s = (window.JIA_STICKERS || []).find(x => x.id === "3d:" + k), m = s && /src="([^"]+)"/.exec(s.html); return m ? m[1] : ""; };
  const tile3d = (k, cls = "") => `<span class="dz-3d ${cls}" aria-hidden="true"><img src="${img3d(k)}" alt=""></span>`;

  /* ---------- Today: season, daily, squad, class, cup ---------- */
  function dzToday() {
    const s = JG_API.season(), q = JG_API.squad(), c = JG_API.classOf(), cup = JG_API.schoolCup(), set = (id, html) => { const el = $(id); if (el) el.outerHTML = html; };
    set("zb-season", `<button type="button" class="dz-card dz-season" id="zb-season" aria-label="SAT Season: ${s.days_left} days left, ${s.progress} of ${s.target} bricks">
      <span class="dz-txt"><small class="dz-kicker">Season · ${s.days_left} days left</small><b>SAT Season</b><span class="dz-sub">${s.progress} / ${s.target} SAT bricks · 3 season medals to win</span>
      <span class="dz-track"><em style="width:${Math.min(100, s.progress / s.target * 100)}%"></em>${[10, 25, 40].map(n => `<i class="dz-ms${s.progress >= n ? " on" : ""}" style="left:${Math.min(100, n / s.target * 100)}%"></i>`).join("")}</span></span>${tile3d("sat", "big")}</button>`);
    set("zb-squad", `<button type="button" class="dz-row" id="zb-squad"><span class="dz-faces">${q.members.slice(0, 4).map(m => m.avatar ? `<img src="${m.avatar}" alt="">` : "<span></span>").join("")}</span>
      <span class="dz-txt"><b>Your squad <em class="dz-fire">🔥 ${q.group_streak.days}</em></b><span class="dz-sub">${q.weekly_goal.bricks_done} / ${q.weekly_goal.bricks_target} bricks together this week</span><span class="dz-mini"><em style="width:${Math.min(100, q.weekly_goal.bricks_done / q.weekly_goal.bricks_target * 100)}%"></em></span></span><i class="dz-chev" aria-hidden="true">›</i></button>`);
    set("zb-class", `<button type="button" class="dz-row" id="zb-class">${tile3d("backpack")}<span class="dz-txt"><b>Class of ${c.year}</b><span class="dz-sub">Everyone graduating in ${c.year}, ranked by XP</span></span><span class="dz-rank">#${c.my_rank}<small>of ${c.members_count.toLocaleString("en-US")}</small></span></button>`);
    set("zb-cup", `<button type="button" class="dz-row" id="zb-cup">${tile3d("trophy")}<span class="dz-txt"><b>School Cup</b><span class="dz-sub">${esc(cup.my_school.name)} · ${esc(cup.city)} · this week</span></span><span class="dz-rank">#${cup.my_school.rank}<small>in city</small></span></button>`);
    [["zb-season", openSeason], ["zb-squad", openSquad], ["zb-class", openClass], ["zb-cup", openCup]].forEach(([id, fn]) => { const el = $(id); if (el) el.onclick = fn; });
  }
  paintDailyCard = function () {
    const host = $("zr-card"); if (!host) return; const d = JG_API.daily(), st = dailyState(), old = $("jd-card");
    const html = `<button type="button" class="dz-card dz-daily" id="jd-card" aria-label="JG Daily number ${d.number}, ${esc(d.subject)}${st ? ", answered" : ""}">
      <span class="dz-txt"><small class="dz-kicker">JG Daily #${d.number} · ${esc(d.subject)}</small><b class="dz-q">${esc(d.question)}</b>
      <span class="dz-sub">${st ? `${st.correct ? "✅" : "❌"} ${st.time} · ${d.pct_correct}% of ${esc(d.cohort)} got it` : "Same question for everyone today · +20 XP"}</span><span class="dz-pill">${st ? "See the discussion →" : "Answer →"}</span></span>${tile3d("brain", "big")}</button>`;
    if (old) old.outerHTML = html; else host.insertAdjacentHTML("beforebegin", html); $("jd-card").onclick = openDaily;
  };
  paintMockCards = function () {
    const m = JG_API.mockSaturday(), reg = m.my_registration, sat = new Date().getDay() === 6 || S.msDemoAt;
    const lrow = $("ls-live-row"); if (lrow && !$("ms-lcard")) (lrow.closest("section") || lrow).insertAdjacentHTML("afterend", `<button type="button" id="ms-lcard"></button>`);
    const lc = $("ms-lcard"); if (lc) { lc.className = "dz-card dz-mock"; lc.innerHTML = `<span class="dz-txt"><small class="dz-kicker">Every Saturday · 10:00 Tashkent</small><b>Mock Saturday</b><span class="dz-sub">A full timed mock, everyone starts together · ${m.registered_count.toLocaleString("en-US")} registered</span><span class="dz-pill">${reg ? `✓ Registered · ${esc(reg)}` : "Register →"}</span></span>${tile3d("books", "big")}`; lc.onclick = openMock; }
    const old = $("ms-tcard"); if (old) old.remove();
    if (sat && $("zr-card")) { $("zr-card").insertAdjacentHTML("beforebegin", `<button type="button" class="dz-card dz-mock" id="ms-tcard"><span class="dz-txt"><small class="dz-kicker">Today · 10:00</small><b>Mock Saturday</b><span class="dz-sub">${reg ? `You're in: ${esc(reg)}` : "Register now, it starts at 10:00"}</span><span class="dz-pill">Open →</span></span>${tile3d("books", "big")}</button>`); $("ms-tcard").onclick = openMock; }
  };

  /* ---------- Home: player card showcase and the pledge ---------- */
  paintCardHome = function () {
    const rm = $("rm"); if (!rm) return; const c = JG_API.playerCard(), T = { bronze: [0, 60, "Silver"], silver: [60, 75, "Gold"], gold: [75, 87, "Jade"], jade: [87, 99, ""] }[c.tier];
    const pct = c.tier === "jade" ? 100 : Math.round((c.overall - T[0]) / (T[1] - T[0]) * 100), tierName = c.tier[0].toUpperCase() + c.tier.slice(1);
    const html = `<section class="pc-home dz-pc t-${c.tier}" id="pc-home" aria-label="Your player card"><div class="pc-mini" data-pc="open">${cardHTML(c, "sm")}</div>
      <div class="pc-side"><small class="dz-kicker">Your player card</small><b>${c.overall}<span> overall</span></b><span class="dz-tier">${tierName} tier</span>
      ${c.tier === "jade" ? `<span class="dz-sub">Top tier. Keep it.</span>` : `<span class="dz-next"><em style="width:${pct}%"></em></span><span class="dz-sub">${T[1] - c.overall} to ${T[2]} · updates every Sunday</span>`}
      <button type="button" class="pc-btn" data-pc="open">Open card</button></div></section>`;
    const h = $("pc-home"); if (h) h.outerHTML = html; else rm.insertAdjacentHTML("afterend", html);
  };
  paintPledge = function () {
    const host = $("pc-home"); if (!host || window.JG_ENGINE) return; const p = JG_API.pledges()[0], w = WHO[p.from] || "Parent", pct = Math.min(100, Math.round(p.progress / p.goalTarget * 100));   /* JG-PROD: C3, no design pledge for a live student (Q19's default mirrored; final review runtime C3, owner to decide) */
    const days = Math.max(0, Math.ceil((new Date(p.deadline + "T23:59:59") - new Date()) / 864e5)), old = $("pl-card");
    const html = `<section class="dz-pledge ${p.status}" id="pl-card" aria-label="${w}'s pledge"><span class="dz-gift" aria-hidden="true">🎁</span>
      <span class="dz-txt"><small class="dz-kicker">${w}'s pledge · ${p.status === "active" ? `${days} days left` : p.status === "reached" ? "Reached!" : `${w} knows ✓`}</small><b>${esc(p.reward)}</b>
      <span class="dz-sub">for ${GOAL[p.goalType](p.goalTarget)} this month</span><span class="dz-bar"><em style="width:${pct}%"></em></span>
      <span class="dz-num"><b>${Math.min(p.progress, p.goalTarget)}</b> / ${p.goalTarget}${p.goalType === "bricks" ? " bricks · 1 brick = 25 minutes in the Study Room" : ""}</span>
      ${p.status === "reached" ? `<button type="button" class="dg-go dz-tell" data-pl="tell">Tell ${w}</button>` : ""}</span></section>`;
    if (old) old.outerHTML = html; else host.insertAdjacentHTML("afterend", html);
    const t = document.querySelector("#pl-card [data-pl=tell]"); if (t) t.onclick = () => { JG_API.notifyParent(p.id); S.pledgeTold = Object.assign({}, S.pledgeTold, { [p.id]: true }); save(); paintPledge(); if (window.JIA_notify) window.JIA_notify({ text: `<b>${w} got your message.</b> ${esc(p.reward)} is on its way.` }); };
  };

  /* ---------- Explore: a real-looking passport ---------- */
  paintPassportCard = function () {
    const h = $("ex-title"), hd = h && h.closest("header"); if (!hd) return; const p = JG_API.passport(), n = p.suggestions[0], old = $("pp-card");
    const html = `<button type="button" class="dz-passport" id="pp-card" aria-label="Your JG passport, ${p.stamps.length} stamps"><span class="dz-pp-cover"><small>JAMALS GLOBAL</small><b>University passport</b><span>${p.stamps.length} stamp${p.stamps.length === 1 ? "" : "s"} · tap to open</span></span>
      <span class="dz-pp-stamps">${p.stamps.slice(-2).map(s => stampSVG(s)).join("") || `<span class="dz-pp-empty">Your first stamp goes here</span>`}</span>
      ${n ? `<span class="dz-pp-next">Stamp next: <b>${esc(n.name)}</b> · ${esc(n.reason)}</span>` : ""}</button>`;
    if (old) old.outerHTML = html; else hd.insertAdjacentHTML("afterend", html); $("pp-card").onclick = openPassport;
  };

  /* ---------- Community: clubs and help desk tiles; a clearer English coach ---------- */
  paintClubStrip = function () {
    const seg = document.querySelector(".cm-seg"); if (!seg) return; const mine = JG_API.clubs().filter(c => c.joined), old = $("jc-strip"), v = JG_API.volunteerHours();
    const unread = mine.reduce((n, c) => n + (((CH() || {}).CHATS || {})[`g:club_${c.id}_ann`] || { unread: 0 }).unread, 0);
    const html = `<div class="jc-strip dz-strip" id="jc-strip"><button type="button" class="jc-tile" data-jc="clubs">${tile3d("robot")}<span><b>Clubs${unread ? ` <em>${unread}</em>` : ""}</b><small>${mine.length} joined · find your people</small></span></button>
      <button type="button" class="jc-tile help" data-jc="help">${tile3d("brain")}<span><b>Help Desk</b><small>${v.verified_hours} h volunteered</small></span></button></div>`;
    if (old) old.outerHTML = html; else seg.insertAdjacentHTML("beforebegin", html);
  };
  jxCoachChip = function () {
    const inp = $("cm-th-in"); if (!inp) return; let c = $("jx-coach");
    if (!c) { (inp.closest(".cm-comp, form") || inp.parentElement).insertAdjacentHTML("beforebegin", `<button type="button" class="jx-coach" id="jx-coach"></button>`); c = $("jx-coach"); c.onclick = () => { S.coach = !S.coach; save(); jxCoachChip(); }; }
    const p = JG_API.englishPractice(); c.setAttribute("aria-pressed", String(p.coach_on));
    c.innerHTML = p.coach_on ? `🗣 <b>English coach on</b> · private tips under your English messages${p.messages ? ` · ${p.messages} this week` : ""}` : `🗣 <b>English coach off</b> · tap to get private tips on your English`;
  };

  /* ---------- bricks that look like a real wall: 20 per row, 30 rows, running bond ---------- */
  const BR_C = 20, BR_R = 30;
  drawBuild = function (cv, prog, crackNow) {
    const g = cv.getContext("2d"), W = cv.width, H = cv.height, bw = W / BR_C, bh = H / BR_R, sx = DOME.w / W, sy = DOME.h / H;
    if (!imgC.complete || !imgS.complete) { const again = () => drawBuild(cv, prog, crackNow); imgC.addEventListener("load", again, { once: true }); imgS.addEventListener("load", again, { once: true }); return; }
    g.drawImage(imgS, 0, 0, W, H); g.fillStyle = "rgba(12,30,22,.22)"; g.fillRect(0, 0, W, H);
    const done = Math.min(SR.bricks, SR.target);
    const parts = i => { const r = Math.floor(i / BR_C), c = i % BR_C, y = H - (r + 1) * bh, x0 = c * bw + (r % 2 ? bw / 2 : 0); return x0 + bw <= W + .01 ? [[x0, y, bw]] : [[x0, y, W - x0], [0, y, x0 + bw - W]]; };
    const photo = (x, y, w, h, f) => g.drawImage(imgC, x * sx, (y + h * (1 - f)) * sy, w * sx, h * f * sy, x, y + h * (1 - f), w, h * f);
    for (let i = 0; i < done; i++) parts(i).forEach(([x, y, w]) => { photo(x, y, w, bh, 1); const t = (hash("b" + i, 11) - 5) / 110;
      g.fillStyle = t > 0 ? `rgba(255,236,214,${t})` : `rgba(40,18,8,${-t})`; g.fillRect(x, y, w, bh); g.fillStyle = "rgba(255,255,255,.13)"; g.fillRect(x, y, w, bh * .16); g.fillStyle = "rgba(0,0,0,.16)"; g.fillRect(x, y + bh * .8, w, bh * .2); });
    const mw = Math.max(1, W / 380); g.fillStyle = "rgba(232,224,210,.6)";
    for (let r = 0; r <= BR_R; r++) g.fillRect(0, H - r * bh - mw / 2, W, mw);
    for (let r = 0; r < BR_R; r++) { const y = H - (r + 1) * bh; for (let c = 0; c < BR_C; c++) g.fillRect(((c * bw + (r % 2 ? bw / 2 : 0)) % W) - mw / 2, y, mw, bh); }
    if (done < SR.target && (prog != null || crackNow)) parts(done).forEach(([x, y, w]) => {
      if (prog) photo(x, y, w, bh, prog); g.strokeStyle = crackNow ? "#8a8f8c" : "#5ff0a8"; g.lineWidth = Math.max(2, W / 360); g.strokeRect(x + 1, y + 1, w - 2, bh - 2);
      if (crackNow) { g.fillStyle = "rgba(90,96,92,.85)"; g.fillRect(x + 1, y + 1, w - 2, bh - 2); g.strokeStyle = "#1f2422"; g.lineWidth = Math.max(1.5, W / 600); g.beginPath(); g.moveTo(x + w * .2, y + 2); g.lineTo(x + w * .45, y + bh * .55); g.lineTo(x + w * .72, y + bh - 2); g.stroke(); } });
  };

  /* ---------- the licensed photo credits move from Home into settings ---------- */
  (() => { const d = document.querySelector(".rm-credits"), out = $("set-out"); if (!d) return; if (out) { d.classList.add("dz-credits"); d.querySelector("summary").textContent = "About · photo credits"; out.insertAdjacentElement("beforebegin", d); } else d.hidden = true; })();

  const _rcb4 = refreshComeBack; refreshComeBack = function () { _rcb4(); try { dzToday(); paintDailyCard(); paintPledge(); } catch (e) {} };
  syncHome(); paintPledge(); paintPassportCard(); paintMockCards(); paintClubStrip(); paintDailyCard(); dzToday();

  /* ================= COMEBACK PLAN: 3+ days away → a light 3-day plan, never a pile of overdue tasks ================= */
  const cbActiveDays = () => { const d = new Set(); Object.keys(SR.log || {}).forEach(k => { if ((SR.log[k].sessions || 0) > 0 || (SR.log[k].minutes || 0) > 0) d.add(k); }); Object.keys(S.days || {}).forEach(k => { if ((S.days[k].done || []).length) d.add(k); }); return d; };
  JG_API.awayStatus = () => {
    const last = S.awayDemoLast || [...cbActiveDays()].sort().pop() || ymd(new Date()), freezes = S.freezeDays || [];
    let away = 0; const d = new Date(last + "T12:00:00"), t = new Date(ymd(new Date()) + "T12:00:00"); d.setDate(d.getDate() + 1);
    for (; d < t; d.setDate(d.getDate() + 1)) { if ((window.JG_LEAGUE && window.JG_LEAGUE.restDay ? window.JG_LEAGUE.restDay(ymd(d)) : d.getDay() === 0) || freezes.includes(ymd(d))) continue; away++; } /* JG-PROD: m1 league (20 Oct 2026), the comeback counts her real rest and freeze days (public/runtime/jg-league.js restDay; the design's every-Sunday otherwise) */
    return { last_active: last, days_away: away, not_counted: "Sundays (rest day) and streak-freeze days", comeback_needed: away >= 3 };
  };
  const CB_EASY = [[window.JG_ENGINE ? "Read your roadmap's next step" : "Answer today's JG Daily", 3], ["Read one page of your English lesson", 5], ["Write 3 sentences: one thing you want this month", 5]]; /* JG-PROD: owner 26 Sep JG_CUTS + m1 league (20 Oct 2026), a real student's first comeback step is her roadmap's next step, never the cut JG Daily */
  JG_API.comebackPlan = () => {
    const cb = S.comeback; if (!cb) return null; const R = S.unlocked ? roadmap() : null, now = new Date(ymd(new Date()) + "T00:00:00");
    const soon = R ? R.milestones.filter(m => m.hard_deadline && m.due && new Date(m.due) >= now && (new Date(m.due) - now) / 864e5 <= 30).map(m => ({ title: m.title_i18n, due: m.due })) : [];
    return { id: cb.id, started: cb.started, current_day: Math.max(0, cb.days.findIndex(x => !(x.session && x.task))) + 1, finished: cb.days.every(x => x.session && x.task),
      days: cb.days.map((x, i) => ({ day: i + 1, session: { minutes: 25, done: x.session }, task: { title: CB_EASY[i][0], minutes: CB_EASY[i][1], done: x.task } })), hard_deadlines: soon, medal: "Back in the game" };
  };
  JG_API.completeComebackStep = (day, kind) => { const x = S.comeback && S.comeback.days[day - 1]; if (x) { x[kind] = true; save(); } return JG_API.comebackPlan(); };
  JG_API.bringBack = memberId => ({ to: memberId, cheer: "👋", notification: "Your squad misses you. One short session?", sent_at: new Date().toISOString() });
  JG_API.why = () => ({ text: S.why || "", video: null, updated_at: S.whyAt || null });
  JG_API.setWhy = text => { const t = String(text || "").trim(), i = t.slice(0, 160).search(/\s\S*$/); S.why = t.length <= 160 ? t : `${(i > 0 ? t.slice(0, i) : t.slice(0, 159)).replace(/[\s.,;:!?–—-]+$/, "")}…`; S.whyAt = new Date().toISOString(); save(); return JG_API.why(); };   /* JG-PROD: owner 3 Oct R9 (Task 12 review I1), the diagnostic's m9_why (up to 100 words) is quoted back as "Your why": a long one is cut at a word with "…", never mid-word, and stays within the editor's 160 */
  function cbCheck(show) {
    const st = JG_API.awayStatus(); if (!st.comeback_needed || (S.comeback && S.comeback.for === st.last_active)) return;
    S.comeback = { id: `cb_${Date.now()}`, for: st.last_active, started: ymd(new Date()), days: [0, 1, 2].map(() => ({ session: false, task: false })), seen: (SR.log[ymd(new Date())] || {}).sessions || 0 }; save();
    if (show !== false) cbWelcome(); cbCard();
  }
  function cbWelcome() {
    const p = JG_API.comebackPlan(), w = JG_API.why(), el = layer("cb-view", "zq-view cb-view"); if (!p) return; el.setAttribute("aria-label", "Welcome back");
    el.innerHTML = `<div class="zq-body cb-body">${mascot("delighted", "cb-jam")}<h2>Good to see you, ${JG_ME.firstName /* JG-PROD: identity */}</h2><p class="sr-sub cb-sub">Let's ease back in: three light days, then you're back in the game.</p>
      ${w.text ? `<blockquote class="cb-why">“${esc(w.text)}”<small>You, on day one · <button type="button" class="dg-link" data-cb="why">change</button></small></blockquote>` : `<button type="button" class="dg-link" data-cb="why">Add your why</button>`}
      <div class="cb-plan">${p.days.map(d => `<div class="cb-day${d.day === p.current_day ? " now" : ""}"><b>Day ${d.day}</b><span>🧱 One ${d.session.minutes}-minute session</span><span>✓ ${esc(d.task.title)} · ${d.task.minutes} min</span></div>`).join("")}</div>
      ${p.hard_deadlines.length ? `<div class="cb-dl"><b>Coming up, don't miss these:</b>${p.hard_deadlines.map(x => `<span>${esc(x.title)} · ${fmtD(x.due)}</span>`).join("")}</div>` : `<p class="zq-note">Nothing urgent in the next 30 days. Real deadlines always stay visible here.</p>`}</div>
      <div class="dg-foot"><button class="dg-go" type="button" data-cb="start">Start day ${p.current_day} · 25 min</button><button class="dg-link" type="button" data-cb="later">Later</button></div>`;
    el.onclick = e => { const b = e.target.closest("[data-cb]"); if (!b) return; const a = b.dataset.cb; if (a === "why") return whyEditor(() => cbWelcome()); el.hidden = true; if (a === "start") { openStudy(); } };
  }
  function cbCard() {
    const old = $("cb-card"); if (old) old.remove(); const p = JG_API.comebackPlan(), tv = document.querySelector(".tv-today"); if (tv) tv.classList.toggle("cb-mode", !!p);   // no overdue pile during a comeback
    const rt = $("rt-title"), host = (rt && tv && [...tv.children].find(ch => ch.contains(rt))) || $("zb-season") || $("zr-card"); if (!p || !host) return;
    const d = p.days[p.current_day - 1];
    host.insertAdjacentHTML("beforebegin", `<div class="dz-row cb-card" id="cb-card" role="group" aria-label="Comeback plan, day ${p.current_day} of 3">${mascot("delighted", "cb-mini")}
      <span class="dz-txt"><b>Comeback · day ${p.current_day} of 3</b><span class="cb-steps"><button type="button" data-cbs="session" aria-pressed="${d.session.done}">🧱 25-min session</button><button type="button" data-cbs="task" aria-pressed="${d.task.done}">✓ ${esc(d.task.title)}</button></span>
      <span class="cb-dots">${p.days.map(x => `<i class="${x.session.done && x.task.done ? "on" : ""}"></i>`).join("")}</span></span></div>`);
    $("cb-card").onclick = e => { const b = e.target.closest("[data-cbs]"); if (!b) return;
      if (b.dataset.cbs === "session") { if (!d.session.done) openStudy(); return; }
      if (b.dataset.cbs === "task" && !d.task.done) { if (p.current_day === 1) { if (window.JG_ENGINE) { if (typeof openRoadmap === "function") openRoadmap(); } else if (typeof openDaily === "function") openDaily(); } JG_API.completeComebackStep(p.current_day, "task"); cbProgress(); } }; /* JG-PROD: owner 26 Sep JG_CUTS + m1 league (20 Oct 2026), a real student's first comeback step is her roadmap's next step, never the cut JG Daily */
  }
  function cbProgress() {
    const p = JG_API.comebackPlan(); if (!p) return;
    if (p.finished) { S.comebacks = [...(S.comebacks || []), { id: S.comeback.id, finished: ymd(new Date()) }]; S.comeback = null; save(); const c = $("cb-card"); if (c) c.remove(); const tv = document.querySelector(".tv-today"); if (tv) tv.classList.remove("cb-mode");
      if (window.JIA_celebrate) window.JIA_celebrate({ id: "back_in_game", name: "Back in the game", rare: "Epic", desc: "Three comeback days, done", img: img3d("summit") }); return; }
    cbCard();
  }
  const _rcb5 = refreshComeBack; refreshComeBack = function () {                       // a finished Study Room session ticks today's comeback session
    _rcb5(); try { if (S.comeback) { const n = (SR.log[ymd(new Date())] || {}).sessions || 0; if (n > (S.comeback.seen || 0)) { S.comeback.seen = n; const p = JG_API.comebackPlan(); JG_API.completeComebackStep(p.current_day, "session"); } cbProgress(); } } catch (e) {} };
  ST.away = ["🌙", "Away for a few days"];
  const _squad = JG_API.squad; JG_API.squad = () => { const q = _squad(); q.members.forEach(m => { m.away_days = m.user_id === "asadbek" ? 4 : 0; if (m.away_days >= 3) m.today = "away"; }); return q; };
  const _openSquad = openSquad; openSquad = function () {
    _openSquad(); JG_API.squad().members.filter(m => m.away_days >= 3).forEach(m => { const card = document.querySelector(`#zq-view [data-more="${m.user_id}"]`); const row = card && card.closest(".zq-m"); if (!row || row.querySelector(".cb-bring")) return;
      row.insertAdjacentHTML("beforeend", `<button type="button" class="cb-bring" data-bring="${m.user_id}">👋 Bring ${esc(m.first_name)} back</button>`); });
  };
  document.addEventListener("click", e => { const b = e.target.closest("[data-bring]"); if (!b) return; const r = JG_API.bringBack(b.dataset.bring); b.textContent = "Sent 👋 · they'll get a gentle nudge"; b.disabled = true; if (window.JIA_notify) window.JIA_notify({ text: `<b>Cheer sent.</b> ${esc(firstN(r.to))} gets a 👋 and a gentle nudge.` }); });

  /* ---------- "why do I want this?": asked on day one, replayed on the way back, editable anytime ---------- */
  function whyEditor(then) {
    const el = layer("why-view", "zq-view why-view"); el.setAttribute("aria-label", "Why do you want this?");
    el.innerHTML = `<div class="zq-body cb-body">${mascot("point", "cb-jam")}<h2>Why do you want this?</h2><p class="sr-sub cb-sub">One line for the future you. It comes back on the hard days. You can change it anytime.</p>
      <textarea class="dg-text" id="why-in" rows="3" maxlength="160" placeholder="e.g. To show my little sister that a kid from Tashkent can get into MIT.">${esc(S.why || "")}</textarea>
      <button type="button" class="dg-link" data-why="video">🎥 Record 10 seconds instead</button></div>
      <div class="dg-foot"><button class="dg-go" type="button" data-why="save">Save</button><button class="dg-link" type="button" data-why="skip">Skip for now</button></div>`;
    el.onclick = e => { const b = e.target.closest("[data-why]"); if (!b) return; const a = b.dataset.why;
      if (a === "video") { if (window.JIA_notify) window.JIA_notify({ text: "Video answers come with the app. Write one line for now." }); return; }
      if (a === "save") JG_API.setWhy($("why-in").value); el.hidden = true; refreshProfileExtras(); if (typeof then === "function") then(); };
    setTimeout(() => { const t = $("why-in"); if (t) t.focus({ preventScroll: true }); }, 80);
  }
  const _obRun = obRun; obRun = function (then) { const w = (S.answers || {}).m9_why; if (!S.why && typeof w === "string" && w.trim()) JG_API.setWhy(w); if (globalThis.JG_ENGINE) { if (typeof then === "function") then(); return; } _obRun(then); };   /* JG-PROD: owner 3 Oct R9, no second "why" on day one: the diagnostic's own answer (m9_why) becomes "Your why"; whyEditor stays on the profile card and the comeback screen */ /* JG-PROD: owner 4 Oct R11, a real student's day one goes straight to the roadmap: no squad, no auto-joined clubs, no study buddy (invented people) */
  const _rpe = refreshProfileExtras; refreshProfileExtras = function () { _rpe(); const lc = $("fy-card"); if (!lc) return; let w = $("why-card");
    const html = `<section class="fy-card why-card" id="why-card"><b>💭 Your why</b><p>${S.why ? `“${esc(S.why)}”` : "Add one line about why you want this. It comes back on hard days."}</p><button type="button" class="dg-link" data-whyedit>${S.why ? "Change" : "Add your why"}</button></section>`;
    if (window.JG_ENGINE && !S.why) { if (w) w.remove(); return; } if (w) w.outerHTML = html; else lc.insertAdjacentHTML("beforebegin", html); };   /* JG-PROD: owner 4 Oct P4g fix K5 (S1 everywhere), a real student's profile shows "Your why" only when he has one (S1 removed the question that wrote it), not an empty "Add your why"; the demo keeps the design's card */
  document.addEventListener("click", e => { if (e.target.closest("[data-whyedit]")) whyEditor(); });

  /* ================= ONE-LINE JOURNAL → ESSAY SEEDS (private by design) ================= */
  const JN_KEY = "jg.journal.v1";                                          // prototype: this device only. Real app: end-to-end encrypted (see backend requirements)
  const JN_MOCK = ["Taught Grandma how to send voice messages on Telegram. She sent nine of them to my aunt in Moscow.", "Robotics: our line-follower kept spinning in circles. The sensor was upside down. We laughed for ten minutes.",
    "Dad took me to Chorsu bazaar at 6 am. He knows every seller by name and bargains like it's chess.", "Got 3/7 on the mock olympiad. Walked home the long way to think.", "Helped my little sister with fractions by drawing a pizza. She finally got it.",
    "Ms. Kamila said my essay opening sounds like everyone else's. She's right.", "Power cut during SAT practice. Finished the section by phone flashlight.", "Our neighbor fixes phones in his garage. Watched him replace a screen in 12 minutes.",
    "Read about the MIT police-car-on-the-Dome hack. I want to build something people still talk about in 30 years.", "Couldn't sleep again. Everything feels like too much before the mock.",
    "Taught three kids at school to solve a Rubik's cube. One of them already beats my time.", "Mom made plov for my robotics team. It was gone in ten minutes.", "Translated a medicine label for an old man at the pharmacy. English was actually useful today.",
    "Froze in the practice speaking test and didn't finish my second answer.", "Built a tiny app that tells our building when the gas comes back on. 14 neighbours use it.", "Grandpa told me he studied engineering in 1974 with no calculators, only a slide rule.",
    "Stayed after school to fix the classroom projector. The teacher now calls me 'the engineer'.", "Ran along the Anhor canal at 6 am. First time I didn't stop.", "Argued with Timur about whether AI will replace doctors. Changed my mind halfway.",
    "An olympiad problem took me three days. The answer was one line.", "Tutored my cousin in English on a video call. She said I explain like a teacher.", "Presented our robot at the school fair. A first grader asked the best question of the day.",
    "Visited Ulugbek's observatory in Samarkand. He measured the year to within a minute, 600 years ago.", "Forty lines of code with no errors. Then one missing bracket broke everything.",
    "Helped Grandma video-call her sister. They hadn't seen each other in eleven years. Nobody talked for the first minute.", "Scored 1570 on a practice SAT. Told only Mom.", "Our robot lost in round two. We already know what to change.",
    "Walked my sister to school and she explained photosynthesis to me.", "Asked a question in the admissions live Q&A. My hands were shaking."];
  let JN = (() => { try { const x = JSON.parse(localStorage.getItem(JN_KEY)); if (x && x.entries) return x; } catch (e) {} const t = new Date();
    return { intro_seen: false, entries: window.JG_ENGINE ? [] : JN_MOCK.map((text, i) => { const d = new Date(t); d.setDate(t.getDate() - (JN_MOCK.length - i) - Math.floor(i / 3)); return { id: `j${i}`, date: ymd(d), text }; }) }; })(); if (window.JG_ENGINE) JN.entries = JN.entries.filter(e => !/^j\d+$/.test(e.id));   /* JG-PROD: owner 20 Oct 2026 (m1 jamol; the owner's map 19 Oct: the journal's promises were untrue), R13 hide what is invented: a real student's journal starts empty, never with the design's 29 sample lines, and a sample line saved before is dropped */
  const jnSave = () => { try { localStorage.setItem(JN_KEY, JSON.stringify(JN)); } catch (e) {} };
  JG_API.journalPrivacy = () => ["Only you can read your journal", "It never appears in the parents' panel", "Teachers, counselors and other students can't see it", "It stays on this device and is never saved on our servers, so not even the Jamals Global team can read it", "Jamol reads it only when you tap Find my essay seeds: then your lines go to our AI provider, Anthropic, for that one answer", "You can delete any line, or all of it, anytime"];   /* JG-PROD: owner 20 Oct 2026 (m1 jamol; the owner's map 19 Oct: the journal's promises were untrue): the journal stays on the device (public/runtime/jg-journal.js), so the line says that, and where the lines go on the tap */
  JG_API.journal = () => ({ entries: JN.entries.slice().sort((a, b) => (a.date < b.date ? 1 : -1)), intro_seen: JN.intro_seen });
  JG_API.addJournal = text => { const e = { id: `j_${Date.now()}`, date: ymd(new Date()), text: String(text).trim().slice(0, 240) }; JN.entries.push(e); jnSave(); return e; };
  JG_API.deleteJournal = id => { JN.entries = JN.entries.filter(e => e.id !== id); jnSave(); return { deleted: id }; };
  const JN_HEAVY = /can'?t sleep|couldn'?t sleep|too much|hopeless|worthless|give up|hate myself|no point|alone|panic/i;
  JG_API.essaySeeds = async () => {
    const list = JG_API.journal().entries, byId = Object.fromEntries(list.map(e => [e.id, e])); if (window.JG_ENGINE && list.length < 3) return { seeds: [], wellbeing: null, none: "few" };   /* JG-PROD: owner 20 Oct 2026 (m1 jamol; the owner's map 19 Oct: the journal's promises were untrue): with fewer than three of her own lines nothing is sent */
    const out = await jxAsk(`You are Jamol, an essay coach for a student applying to universities. The student asked you to read their private one-line journal to find essay seeds. Pick the 3 strongest seeds for a personal essay (small, specific, real moments that show character). Reply with JSON only: {"seeds":[{"title":"...","entry_ids":["j1","j2"],"why":"one or two sentences"}],"wellbeing":{"concern":true|false,"note":"one kind sentence if concern, else empty"}}. Set concern to true only if some lines suggest the student is struggling emotionally.\n\nJournal:\n${list.map(e => `${e.id} (${e.date}): ${e.text}`).join("\n")}`);
    let r = null; try { r = JSON.parse((out || "").match(/\{[\s\S]*\}/)[0]); } catch (err) { r = null; }
    if (!r || !Array.isArray(r.seeds) || !r.seeds.length) r = window.JG_ENGINE ? { seeds: [], wellbeing: null, none: "ai" } : { seeds: [   /* JG-PROD: owner 20 Oct 2026 (m1 jamol; the owner's map 19 Oct: the journal's promises were untrue), R13: no invented seeds for a real student when the AI gives none */
      { title: "The day you taught your grandma Telegram", entry_ids: ["j0", "j24"], why: "Patience, family and technology in one small scene. It could be your Common App essay about who you are at home." },
      { title: "Power cuts, flashlights and a gas-alert app", entry_ids: ["j6", "j14"], why: "You turn everyday problems in your building into something useful. That's an engineer's story, told through real details." },
      { title: "Six in the morning at Chorsu bazaar", entry_ids: ["j2"], why: "Watching your dad bargain 'like chess' shows how you notice people. Great for a 'describe your community' prompt." }], wellbeing: null };
    r.seeds = r.seeds.slice(0, 3).map(s => Object.assign({}, s, { lines: (s.entry_ids || []).map(id => byId[id]).filter(Boolean) }));
    const heavy = list.filter(e => JN_HEAVY.test(e.text)); if (!r.wellbeing || typeof r.wellbeing.concern !== "boolean") r.wellbeing = { concern: heavy.length > 0, note: "" };
    if (r.wellbeing.concern && !r.wellbeing.note) r.wellbeing.note = "Some of your lines sound heavy. That's more common than it looks, and you don't have to carry it alone.";
    return r;
  };
  function jnIntro(then) {
    const el = layer("jn-intro", "zq-view jn-view"); el.setAttribute("aria-label", "About your journal");
    el.innerHTML = `<div class="zq-body cb-body">${mascot("point", "cb-jam")}<h2>One line a day</h2>
      <div class="jn-why"><b>Why we ask</b><p>Great essays come from small, real moments, and you forget them fast.</p></div>
      <div class="jn-why"><b>How it helps</b><p>When essay season comes, Jamol finds essay seeds in your own lines. “The day you taught your grandma to use Telegram could be your Common App essay.”</p></div>
      <div class="jn-why lock"><b>🔒 It's private</b><ul>${JG_API.journalPrivacy().map(x => `<li>${esc(x)}.</li>`).join("")}</ul></div></div>
      <div class="dg-foot"><button class="dg-go" type="button" data-jn="ok">Got it</button></div>`;
    el.onclick = e => { if (e.target.closest("[data-jn=ok]")) { JN.intro_seen = true; jnSave(); el.hidden = true; if (typeof then === "function") then(); } };
  }
  const _paintRecap = paintRecap; paintRecap = function () {                  // the evening recap asks one optional line
    _paintRecap(); const r = $("zr-recap"); if (!r || r.querySelector(".jn-line") || (window.JG_ENGINE && $("jn-line"))) return; const today = ymd(new Date()), wrote = JN.entries.some(e => e.date === today);   /* JG-PROD: owner 10 Oct (delegated call, teen walk), one note row: the line stands after the recap, not inside it, so each repaint of a real student's page added another (two inputs with the id jn-in) */
    if (S.jnSkip === today && !wrote) return;
    r.insertAdjacentHTML("afterend", `<div class="jn-line" id="jn-line">${wrote ? `<span>📓 Saved to your journal</span><button type="button" class="dg-link" data-jn="open">Open journal</button>`
      : `<input class="dg-field" id="jn-in" maxlength="240" placeholder="What happened today? One line, 30 seconds" aria-label="What happened today? One line"><button type="button" class="dg-go" data-jn="save">Save</button><button type="button" class="dg-link" data-jn="skip">Skip</button>`}</div>`);
    const inp = $("jn-in"); if (inp) inp.addEventListener("focus", () => { if (!JN.intro_seen) jnIntro(() => $("jn-in") && $("jn-in").focus()); }, { once: true });
  };
  function jnOpen(autoSeeds) {
    const el = layer("jn-view", "zq-view jn-view"), J = JG_API.journal(); el.setAttribute("aria-label", "Your journal");
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-jn="close" aria-label="Close">‹</button><p class="dg-tt">Your journal 🔒</p><span class="dg-timer"></span></div><div class="zq-body">
      <p class="zq-note">Only you can read this. Jamol reads it only when you tap the button below: your lines then go to our AI provider, Anthropic, for that one answer.</p><button type="button" class="dg-go" data-jn="seeds">✨ Find my essay seeds</button><div id="jn-seeds"></div><!-- JG-PROD: owner 20 Oct 2026 (m1 jamol; the owner's map 19 Oct: the journal's promises were untrue): the tap says where the lines go -->
      <div class="jn-list">${J.entries.map(e => `<div class="jn-e"><small>${fmtD(e.date)}</small><p>${esc(e.text)}</p><button type="button" class="jn-del" data-jndel="${e.id}" aria-label="Delete this line">×</button></div>`).join("")}</div></div>`;
    if (autoSeeds) setTimeout(jnSeeds, 200);
  }
  async function jnSeeds() {
    const box = $("jn-seeds"); if (!box) return; box.innerHTML = `<p class="zq-note">Jamol is reading your journal…</p>`; const r = await JG_API.essaySeeds();
    box.innerHTML = (r.wellbeing && r.wellbeing.concern ? `<div class="jn-care">${mascot("curious", "jn-care-img")}<div><b>Before the essays: how are you doing?</b><p>${esc(r.wellbeing.note)}</p>
      <p>Talking helps: a parent, a school psychologist or your Jamals Global counselor. If you ever feel unsafe, call <b>103</b> right away.</p><small>This stays private. Nobody was told.</small></div></div>` : "") +
      r.seeds.map((s, i) => `<div class="jn-seed"><small>Essay seed ${i + 1}</small><b>${esc(s.title)}</b>${s.lines.map(l => `<blockquote>“${esc(l.text)}”<cite>${fmtD(l.date)}</cite></blockquote>`).join("")}<p>${esc(s.why)}</p></div>`).join("") + (r.none ? `<p class="zq-note">${r.none === "few" ? "Write a few more lines first. Jamol needs at least three to find essay seeds." : "Jamol couldn't read your journal right now. Try again later."}</p>` : "");   /* JG-PROD: owner 20 Oct 2026 (m1 jamol; the owner's map 19 Oct: the journal's promises were untrue): an honest line instead of invented seeds */
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-jn], [data-jndel]"); if (!b) return;
    if (b.dataset.jndel) { JG_API.deleteJournal(b.dataset.jndel); jnOpen(); return; }
    const a = b.dataset.jn;
    if (a === "save") { const v = ($("jn-in").value || "").trim(); if (!v) return; const go = () => { JG_API.addJournal(v); const l = $("jn-line"); if (l) l.remove(); paintRecap(); }; if (!JN.intro_seen) jnIntro(go); else go(); }
    else if (a === "skip") { S.jnSkip = ymd(new Date()); save(); const l = $("jn-line"); if (l) l.remove(); }
    else if (a === "open") jnOpen(); else if (a === "close") { const v = $("jn-view"); if (v) v.hidden = true; } else if (a === "seeds") jnSeeds();
  });

  /* ---------- demo controls, first paint ---------- */
  if (pvq("cb-away")) pvq("cb-away").addEventListener("click", () => { const k = new Date(); let n = 0; while (n < 4) { k.setDate(k.getDate() - 1); if (k.getDay() !== 0) n++; } k.setDate(k.getDate() - 1); S.awayDemoLast = ymd(k); S.comeback = null; save(); cbCheck(true); });
  if (pvq("jn-write")) pvq("jn-write").addEventListener("click", () => { S.recapDemo = true; S.jnSkip = null; save(); document.querySelector('#tb-track button[data-i="0"]').click(); setTimeout(() => { paintRecap(); const i = $("jn-in"); if (i) { i.scrollIntoView({ block: "center" }); i.focus(); } }, 350); });
  if (pvq("jn-seeds")) pvq("jn-seeds").addEventListener("click", () => { if (!JN.intro_seen) jnIntro(() => jnOpen(true)); else jnOpen(true); });
  cbCheck(true); if (S.comeback) cbCard();

  /* ================= JG CREATORS: good study reels earn a badge, coins and a spotlight ================= */
  const CR_COINS = 30, fmtK = n => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));
  const crState = () => (S.creator = S.creator || { reels: [{ id: "r1", title: "SAT math: 3 tricks for linear equations", status: "approved", views: 8400, saves: 610 }, { id: "r2", title: "How I got IELTS 7.5 in 5 months", status: "approved", views: 10200, saves: 890 }, { id: "r3", title: "Olympiad logic: the clock-angle trick", status: "checking", views: 0, saves: 0 }] });
  JG_API.creator = () => {
    const c = crState(), ok = c.reels.filter(r => r.status === "approved"), views = ok.reduce((n, r) => n + r.views, 0), saves = ok.reduce((n, r) => n + r.saves, 0);
    return { approved_reels: ok.length, badge: ok.length >= 3, needed_for_badge: 3, coins_per_reel: CR_COINS, coins_earned: ok.length * CR_COINS, views, saves, helped: Math.round(saves * 1.4),
      activity_line: `Created ${ok.length} study video${ok.length === 1 ? "" : "s"} · ${fmtK(views)} views`, reels: c.reels.slice(), review: "AI pre-check, then admin review",
      featured_this_week: { user_id: "dilnoza", first_name: "Dilnoza", reel_title: "SAT math in 60 seconds: percentages" } };
  };
  JG_API.approveReel = id => {                                             // an admin approves after the AI pre-check (mocked here)
    const c = crState(), r = c.reels.find(x => x.id === id) || c.reels.find(x => x.status === "checking"); if (!r) return null; const before = JG_API.creator().badge;
    r.status = "approved"; r.views = r.views || 3100 + hash(r.id, 900); r.saves = r.saves || 240 + hash(r.id + "s", 80); save();
    if (window.JIA_coins && window.JIA_coins.add) try { window.JIA_coins.add(CR_COINS); } catch (e) {}
    const after = JG_API.creator(); if (!before && after.badge && window.JIA_celebrate) window.JIA_celebrate({ id: "jg_creator", name: "JG Creator", rare: "Epic", desc: "3 approved study reels", img: img3d("laptop") });
    return { reel_id: r.id, status: "approved", coins: CR_COINS, creator: after };
  };
  function crCard() {
    const strip = $("jc-strip"); if (!strip) return; const c = JG_API.creator(), old = $("cr-card");
    const html = `<button type="button" class="dz-row cr-card" id="cr-card">${tile3d("laptop")}<span class="dz-txt"><b>Creator studio${c.badge ? ` <em class="cr-badge">JG Creator</em>` : ""}</b>
      <span class="dz-sub">${c.badge ? `${esc(c.activity_line)} · helped ${c.helped.toLocaleString("en-US")} students` : `${c.approved_reels} / 3 approved reels to the Creator badge`}</span><span class="dz-sub cr-feat">⭐ Creator of the week: ${esc(c.featured_this_week.first_name)} · “${esc(c.featured_this_week.reel_title)}”</span></span><i class="dz-chev" aria-hidden="true">›</i></button>`;
    if (old) old.outerHTML = html; else strip.insertAdjacentHTML("afterend", html); $("cr-card").onclick = crStudio;
  }
  function crStudio() {
    const c = JG_API.creator(), el = layer("cr-view", "zq-view"); el.setAttribute("aria-label", "Creator studio");
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-cr="close" aria-label="Close">‹</button><p class="dg-tt">Creator studio</p><span class="dg-timer"></span></div><div class="zq-body">
      <div class="zq-goal cr-hero"><b>${c.badge ? "🎬 JG Creator" : `🎬 ${c.approved_reels} of 3 approved reels`}</b><small>${c.badge ? "Your study reels help other students every day" : "Three approved study reels earn the Creator badge"}</small>${c.badge ? "" : `<i><em style="width:${Math.min(100, c.approved_reels / 3 * 100)}%"></em></i>`}</div>
      <div class="zw-tiles"><span><b>${fmtK(c.views)}</b>views</span><span><b>${fmtK(c.saves)}</b>saves</span><span><b>${c.helped.toLocaleString("en-US")}</b>students helped</span><span><b>🪙 ${c.coins_earned}</b>earned</span><span><b>${c.approved_reels}</b>approved</span><span><b>+${c.coins_per_reel}</b>per reel</span></div>
      <div class="cr-line"><small>For your applications</small><b>${esc(c.activity_line)}</b><button type="button" class="dg-link" data-cr="copy">Copy</button></div>
      <b class="jr-next-h">Your reels</b>${c.reels.map(r => `<div class="jc-row cr-reel"><span class="jc-ic">▶</span><span><b>${esc(r.title)}</b><small>${r.status === "approved" ? `✓ Approved · ${fmtK(r.views)} views · ${fmtK(r.saves)} saves` : "Checking… AI pre-check, then an admin"}</small></span></div>`).join("")}
      <p class="zq-note">Every reel is checked before it goes live, and all Community rules apply. Each approved reel earns ${c.coins_per_reel} coins; one creator is featured every week.</p></div>
      <div class="dg-foot"><button class="dg-go" type="button" data-cr="new">Make a study reel</button></div>`;
    el.onclick = async e => { const b = e.target.closest("[data-cr]"); if (!b) return; const a = b.dataset.cr;
      if (a === "close") el.hidden = true; else if (a === "copy") { try { await navigator.clipboard.writeText(c.activity_line); b.textContent = "Copied ✓"; } catch (err) { b.textContent = c.activity_line; } }
      else if (a === "new") { el.hidden = true; const n = $("cm-rl-new"); if (n) n.click(); } };
  }

  /* ================= PROJECT LAB: real projects, student-only teams of neighbouring stages ================= */
  const LAB_OPEN = [
    { id: "p_bus", kind: "App", title: "Bus Tracker Tashkent", pitch: "A web app that shows when school buses arrive, using real GPS data from two schools.", owner: "sardor", stages: ["S2", "S3"], roles: ["Frontend developer", "Designer", "Data collector"], team: ["sardor", "timur"] },
    { id: "p_air", kind: "Research", title: "Air quality near Tashkent schools", pitch: "Measure PM2.5 with low-cost sensors at 10 schools and publish the open data.", owner: "dilnoza", stages: ["S3", "S4"], roles: ["Data analyst", "Field volunteer", "Writer"], team: ["dilnoza"] },
    { id: "p_pod", kind: "Podcast", title: "First-gen abroad: a student podcast", pitch: "Interview Uzbek students at universities abroad about how they got in.", owner: "madina", stages: ["S1", "S2"], roles: ["Host", "Audio editor"], team: ["madina"] } ];
  const LAB_SHOW = [{ id: "s1", title: "Uzbek Sign Language app", team: "4 students · S3", summary: "600 signs with videos, now used by two schools for deaf students.", featured: true },
    { id: "s2", title: "Chorsu price tracker", team: "3 students · S2", summary: "Daily bazaar prices, cited by a local news site.", featured: false },
    { id: "s3", title: "Olympiad problem bank in Uzbek", team: "5 students · S3–S4", summary: "800 translated problems with worked solutions.", featured: true }];
  const labState = () => (S.lab = S.lab || { applied: {}, mine: { id: "p_books", kind: "Charity drive", title: "Books for Karakalpakstan", pitch: "Collect 1,000 English books for village schools near Nukus.", stages: ["S2", "S3"], team: ["asadbek", "nilufar", "timur"], showcase: null,
    milestones: [{ week: 1, title: "Partner with 3 schools", done: true, proof: "Photo: 3 signed partner letters", feedback: { by: "javlon", text: "Great start. Keep the letters for your portfolio.", verified: true } },
      { week: 2, title: "Collect the first 250 books", done: true, proof: "Photo: 263 books in the school hall", feedback: null }, { week: 3, title: "Sort books by reading level", done: false }, { week: 4, title: "Deliver the books to Nukus", done: false }] } });
  const myStage = () => (JG_API.playerCard().stage || "S2");
  const STAGE_I = { S1: 1, S2: 2, S3: 3, S4: 4 };
  JG_API.labProjects = () => LAB_OPEN.map(p => { const me = STAGE_I[myStage()], open = p.stages.map(x => STAGE_I[x]); return Object.assign({}, p, { can_apply: open.includes(me), applied_role: labState().applied[p.id] || null, rule: "students only, same or neighbouring stage" }); });
  JG_API.applyToProject = (id, role) => { const p = JG_API.labProjects().find(x => x.id === id); if (!p || !p.can_apply) return { status: "not_allowed" }; labState().applied[id] = role; save(); return { project_id: id, role, status: "applied" }; };
  JG_API.myProject = () => labState().mine;
  JG_API.submitMilestone = (projectId, week, proof) => { const m = labState().mine.milestones.find(x => x.week === week); if (!m) return null; m.done = true; m.proof = proof; m.submitted_at = new Date().toISOString(); save();
    setTimeout(() => { m.feedback = { by: "javlon", text: "Solid work this week. Photograph the sorted shelves for the showcase.", verified: true }; save(); if (!$("lab-view") || $("lab-view").hidden) return; labOpen("mine"); }, 1500); return m; };
  JG_API.submitToShowcase = projectId => { const m = labState().mine; m.showcase = { status: "in_review", submitted_at: new Date().toISOString() }; save();
    setTimeout(() => { m.showcase = { status: "featured", featured_at: new Date().toISOString() }; save(); if (window.JIA_notify) window.JIA_notify({ text: "<b>Featured in JG Showcase.</b> It's on your portfolio now." }); refreshProfileExtras(); }, 3000); return m.showcase; };
  JG_API.showcase = () => LAB_SHOW.concat(labState().mine.showcase && labState().mine.showcase.status === "featured" ? [{ id: "s_me", title: labState().mine.title, team: "4 students · S2–S3", summary: labState().mine.pitch, featured: true }] : []);
  JG_API.portfolio = () => { const out = [], c = JG_API.creator(), m = labState().mine; if (c.badge) out.push(`JG Creator · ${c.activity_line}`); if (m.showcase && m.showcase.status === "featured") out.push(`${m.title} · Featured in JG Showcase`); return out; };
  function labEnsureChat() { const X = CH(), id = "g:proj_books"; if (!X || X.CHATS[id]) return id; const m = labState().mine;
    X.CHATS[id] = { id, kind: "group", project: m.id, name: m.title, members: m.team.filter(w => PPL2().PEOPLE[w]), time: "11:20", unread: 0, msgs: [X.M("asadbek", "Found two more schools that want books!", "11:05"), X.M("nilufar", "I can sort the B1 books on Saturday.", "11:20")] }; X.renderConvs(); return id; }
  function labCard() {
    const pp = $("pp-card"); if (!pp) return; const old = $("lab-card"), n = JG_API.labProjects().length;
    const html = `<button type="button" class="dz-row lab-card" id="lab-card">${tile3d("robot")}<span class="dz-txt"><b>Project Lab</b><span class="dz-sub">Build something real with a team · ${n} teams looking for teammates</span></span><i class="dz-chev" aria-hidden="true">›</i></button>`;
    if (old) old.outerHTML = html; else pp.insertAdjacentHTML("afterend", html); $("lab-card").onclick = () => labOpen("find");
  }
  function labOpen(tab = "find") {
    const el = layer("lab-view", "zq-view"), P = PPL2(), faces = ids => `<span class="dz-faces">${ids.map(w => P.AV[w] ? `<img src="${P.AV[w]}" alt="">` : "<span></span>").join("")}</span>`; el.setAttribute("aria-label", "Project Lab");
    const tabs = `<div class="lab-tabs" role="tablist">${[["find", "Find a team"], ["mine", "My team"], ["show", "Showcase"]].map(([k, l]) => `<button type="button" role="tab" data-lab="${k}" aria-selected="${tab === k}">${l}</button>`).join("")}</div>`;
    let body = "";
    if (tab === "find") body = JG_API.labProjects().map(p => `<div class="lab-p"><small class="lab-kind">${esc(p.kind)} · stages ${p.stages.join("–")}</small><b>${esc(p.title)}</b><p>${esc(p.pitch)}</p><div class="lab-meta">${faces(p.team)}<span>by ${esc(firstN(p.owner))} · ${p.team.length} on the team</span></div>
      <div class="lab-roles">${p.roles.map(r => p.applied_role === r ? `<span class="lab-applied">✓ Applied as ${esc(r)}</span>` : `<button type="button" data-apply="${p.id}" data-role="${esc(r)}"${p.can_apply && !p.applied_role ? "" : " disabled"}>${esc(r)}</button>`).join("")}</div>${p.can_apply ? "" : `<small class="lab-rule">Open to stages ${p.stages.join("–")}. Teams keep ages close.</small>`}</div>`).join("");
    else if (tab === "mine") { const m = JG_API.myProject(), next = m.milestones.find(x => !x.done), all = !next;
      body = `<div class="zq-goal"><b>${esc(m.title)}</b><small>${esc(m.kind)} · stages ${m.stages.join("–")} · you + ${m.team.length}</small><p>${esc(m.pitch)}</p></div><div class="lab-meta">${faces(m.team)}<button type="button" class="dg-link" data-lab="chat">Open team chat</button></div>
        <b class="jr-next-h">Weekly milestones</b>${m.milestones.map(x => `<div class="lab-m${x.done ? " done" : ""}"><b>Week ${x.week} · ${esc(x.title)}</b>${x.done ? `<small>✓ ${esc(x.proof || "Proof submitted")}</small>` : x === next ? `<div class="lab-proof"><input class="dg-field" id="lab-link" placeholder="Paste a link to your proof, or add a photo"><button type="button" class="dg-go" data-lab="proof">Submit proof</button></div>` : `<small>Coming up</small>`}
          ${x.feedback ? `<div class="lab-fb"><b>${esc(firstN(x.feedback.by))} · verified teacher</b><p>${esc(x.feedback.text)}</p></div>` : x.done ? `<small class="lab-wait">Waiting for teacher feedback…</small>` : ""}</div>`).join("")}
        ${all ? (m.showcase ? `<p class="lab-show-st">${m.showcase.status === "featured" ? "⭐ Featured in JG Showcase · on your portfolio" : "In review for the Showcase…"}</p>` : `<button type="button" class="dg-go" data-lab="submit">Submit to the Showcase</button>`) : ""}`; }
    else body = JG_API.showcase().map(s => `<div class="lab-p"><small class="lab-kind">${esc(s.team)}${s.featured ? " · ⭐ Featured" : ""}</small><b>${esc(s.title)}</b><p>${esc(s.summary)}</p></div>`).join("") + `<p class="zq-note">Every project is reviewed by an admin before it appears here.</p>`;
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-lab="close" aria-label="Close">‹</button><p class="dg-tt">Project Lab</p><span class="dg-timer"></span></div><div class="zq-body">${tabs}${body}</div>`;
    el.onclick = e => { const b = e.target.closest("[data-lab], [data-apply]"); if (!b || b.disabled) return;
      if (b.dataset.apply) { JG_API.applyToProject(b.dataset.apply, b.dataset.role); labOpen("find"); if (window.JIA_notify) window.JIA_notify({ text: `<b>Applied as ${esc(b.dataset.role)}.</b> The team lead will reply in Community.` }); return; }
      const a = b.dataset.lab; if (a === "close") el.hidden = true; else if (["find", "mine", "show"].includes(a)) labOpen(a);
      else if (a === "chat") { el.hidden = true; const id = labEnsureChat(); document.querySelector('#tb-track button[data-i="4"]').click(); setTimeout(() => CH().open(id), 300); }
      else if (a === "proof") { const v = ($("lab-link").value || "").trim(); if (!v) return; const m = JG_API.myProject(); JG_API.submitMilestone(m.id, m.milestones.find(x => !x.done).week, v); labOpen("mine"); }
      else if (a === "submit") { JG_API.submitToShowcase(JG_API.myProject().id); labOpen("mine"); } };
  }
  const _rpe2 = refreshProfileExtras; refreshProfileExtras = function () { _rpe2(); const bd = $("zc-badge"); if (!bd) return; const c = JG_API.creator();
    if (c.badge && !$("cr-pbadge")) bd.insertAdjacentHTML("afterend", ` <span class="zc-badge" id="cr-pbadge">🎬 JG Creator</span>`);
    const pf = JG_API.portfolio(), old = $("pf-portfolio"); if (old) old.remove(); if (pf.length) { const w = $("why-card") || $("fy-card"); if (w) w.insertAdjacentHTML("beforebegin", `<section class="fy-card" id="pf-portfolio"><b>🏅 Portfolio</b>${pf.map(x => `<p>${esc(x)}</p>`).join("")}</section>`); } };

  /* ---------- demo controls, first paint ---------- */
  if (pvq("cr-approve")) pvq("cr-approve").addEventListener("click", () => { const r = JG_API.approveReel(); if (!r) { crState().reels.push({ id: `r${Date.now()}`, title: "Essay openings that aren't clichés", status: "checking", views: 0, saves: 0 }); JG_API.approveReel(); }
    crCard(); if (window.JIA_notify) window.JIA_notify({ text: `<b>Your reel was approved.</b> +${CR_COINS} coins` }); if ($("cr-view") && !$("cr-view").hidden) crStudio(); });
  if (pvq("lab-mile")) pvq("lab-mile").addEventListener("click", () => { const m = JG_API.myProject(), n = m.milestones.find(x => !x.done); if (n) JG_API.submitMilestone(m.id, n.week, "Photo: demo proof"); labOpen("mine"); });
  const _pcs = paintClubStrip; paintClubStrip = function () { _pcs(); try { crCard(); } catch (e) {} };
  const _ppc = paintPassportCard; paintPassportCard = function () { _ppc(); try { labCard(); } catch (e) {} };
  crCard(); labCard();

  /* ================= RIVALS (opt-in): one rival at your exact level, head to head every week ================= */
  const RV_POOL = ["timur", "sardor", "dilnoza"], RV_OVR = { timur: 78, sardor: 81, dilnoza: 77 };
  const weekBricks = (from = wkStart(new Date())) => { let n = 0; for (let i = 0; i < 7; i++) { const d = new Date(from); d.setDate(from.getDate() + i); n += (SR.log[ymd(d)] || {}).bricks || 0; } return n; };
  const rvState = () => (S.rival = S.rival || { on: false, id: null, history: [] });
  const rvBricks = (id, at = new Date()) => { const w = wkStart(at), days = Math.min(7, (at - w) / 864e5); return Math.round(days * (1.9 + hash(id + ymd(w), 9) / 10)); };
  JG_API.rival = () => { const r = rvState(); if (!r.on) return { on: false, rule: "same stage, similar card score" };
    const id = r.id || RV_POOL[0], me = weekBricks(), them = rvBricks(id), c = JG_API.playerCard();
    return { on: true, rival: { user_id: id, first_name: firstN(id), avatar: PPL2().AV[id] || "", stage: c.stage, overall: RV_OVR[id] }, me: { overall: c.overall },
      week: { starts: ymd(wkStart(new Date())), me_bricks: me, rival_bricks: them }, status: me > them ? "ahead" : me < them ? "behind" : "tied", medal: "Rival week won", history: r.history }; };
  JG_API.setRival = on => { const r = rvState(); r.on = !!on; if (on && !r.id) r.id = RV_POOL[0]; save(); return JG_API.rival(); };
  JG_API.newRival = () => { const r = rvState(); r.id = RV_POOL[(RV_POOL.indexOf(r.id) + 1) % RV_POOL.length]; r.on = true; save(); return JG_API.rival(); };
  function rvWeekEnd(demo) {                                               // a new week settles last week's head to head
    const r = rvState(); if (!r.on) return; const last = new Date(wkStart(new Date())); last.setDate(last.getDate() - 7); const key = ymd(last);
    if (!demo && (r.settled === key || r.history.some(h => h.week === key))) return; r.settled = key;
    const res = demo ? { week: ymd(wkStart(new Date())), me: Math.max(weekBricks() + 4, rvBricks(r.id) + 2), rival: rvBricks(r.id) } : { week: key, me: weekBricks(last), rival: rvBricks(r.id, new Date(last.getTime() + 7 * 864e5 - 1)) };
    res.rival_id = r.id; res.won = res.me > res.rival; r.history.push(res); save();
    if (res.won && window.JIA_celebrate) window.JIA_celebrate({ id: `rival_${res.week}`, name: "Rival week won", rare: "Rare", desc: `You ${res.me} · ${firstN(r.id)} ${res.rival} bricks`, img: img3d("trophy") });
  }
  function rvCard() {
    const old = $("rv-card"); const host = $("zb-season"); if (!host) return; const R = JG_API.rival(); let html;
    if (!R.on) html = `<div class="dz-row rv-card" id="rv-card">${tile3d("summit")}<span class="dz-txt"><b>Want a rival?</b><span class="dz-sub">One student at your exact level: same stage, similar card score. A new head to head every week.</span></span><button type="button" class="dz-pill rv-go" data-rv="on">Match me</button></div>`;
    else { const me = R.week.me_bricks, th = R.week.rival_bricks, tot = Math.max(1, me + th), days = Math.max(0, 7 - Math.floor((new Date() - wkStart(new Date())) / 864e5));
      html = `<div class="rv-card on" id="rv-card"><small class="dz-kicker">Your rival · this week</small><div class="rv-vs"><span class="rv-p"><img src="${(JG_API.squad().members.find(m => m.user_id === "me") || {}).avatar || ""}" alt=""><b>${me}</b><small>You</small></span><em>VS</em>
        <span class="rv-p"><img src="${R.rival.avatar}" alt=""><b>${th}</b><small>${esc(R.rival.first_name)} · ${R.rival.overall}</small></span></div><i class="rv-bar"><em style="width:${me / tot * 100}%"></em></i>
        <p class="rv-st">${R.status === "ahead" ? `You're ahead by ${me - th}. Keep it.` : R.status === "tied" ? "All square. One brick breaks the tie." : `${th - me + 1} brick${th - me + 1 === 1 ? "" : "s"} to pass ${esc(R.rival.first_name)}`} · ${days} day${days === 1 ? "" : "s"} left</p>
        <div class="rv-acts"><button type="button" data-rv="new">New rival</button><button type="button" data-rv="off">Switch off</button></div></div>`; }
    if (old) old.outerHTML = html; else host.insertAdjacentHTML("afterend", html);
    $("rv-card").onclick = e => { const b = e.target.closest("[data-rv]"); if (!b) return; const a = b.dataset.rv; if (a === "on") JG_API.setRival(true); else if (a === "off") JG_API.setRival(false); else if (a === "new") JG_API.newRival(); rvCard(); };
  }
  setInterval(() => { if (!document.hidden && $("rv-card") && JG_API.rival().on) rvCard(); }, 60000);   // live: the rival keeps studying

  /* ================= ALMOST THERE: how close the next step is, from real numbers only ================= */
  JG_API.almostThere = () => {
    const out = [], add = (id, left, text, pct, action) => { if (left > 0) out.push({ id, left, text, pct: Math.max(0, Math.min(99, Math.round(pct))), action }); };
    const c = JG_API.playerCard(), T = { bronze: [60, "Silver"], silver: [75, "Gold"], gold: [87, "Jade"] }[c.tier];
    if (T) add("card", T[0] - c.overall, `${T[0] - c.overall} overall to ${T[1]} tier`, c.overall / T[0] * 100, "card");
    const L = window.JIA_league; if (L && L.standings) { const st = L.standings(), k = st.findIndex(r => r.who === "me");
      if (k >= 5) { const need = st[4].xp - st[k].xp + 1; add("league", need, `${need} XP from promotion${need <= 20 ? ", one session gets you there" : ""}`, st[k].xp / st[4].xp * 100, "league"); } }
    const s = JG_API.season(), nx = [10, 25, 40].find(n => n > s.progress); if (nx) add("season", nx - s.progress, `${nx - s.progress} SAT brick${nx - s.progress === 1 ? "" : "s"} to the next season medal`, s.progress / nx * 100, "season");
    const q = JG_API.squad().weekly_goal; add("squad", q.bricks_target - q.bricks_done, `Your squad is ${q.bricks_target - q.bricks_done} bricks from the weekly goal`, q.bricks_done / q.bricks_target * 100, "squad");
    const pp = JG_API.passport(), have = pp.stamps.length % 6; add("passport", 6 - have, `${6 - have} stamp${6 - have === 1 ? "" : "s"} to finish this passport page`, have / 6 * 100, "passport");
    const pl = JG_API.pledges()[0]; if (pl && pl.status === "active") add("pledge", pl.goalTarget - pl.progress, `${pl.goalTarget - pl.progress}${pl.goalType === "bricks" ? " bricks" : ""} to ${pl.reward}`, pl.progress / pl.goalTarget * 100, "pledge");
    const rv = JG_API.rival(); if (rv.on && rv.status !== "ahead") add("rival", rv.week.rival_bricks - rv.week.me_bricks + 1, `${rv.week.rival_bricks - rv.week.me_bricks + 1} bricks to pass ${rv.rival.first_name}`, rv.week.me_bricks / (rv.week.rival_bricks + 1) * 100, "rival");
    const b = JG_API.dreamBuild(), np = Math.floor(b.bricks_done / b.bricks_target * 10) * 10 + 10, tg = Math.ceil(np / 100 * b.bricks_target);
    if (np <= 100) add("build", tg - b.bricks_done, `${tg - b.bricks_done} bricks to ${np}% of ${b.university}`, (b.bricks_done - (np - 10) / 100 * b.bricks_target) / (b.bricks_target / 10) * 100, "study");
    return out.sort((a, b) => b.pct - a.pct);
  };
  const AT_GO = { card: () => { const b = document.querySelector("#pc-home [data-pc]"); if (b) b.click(); }, season: () => openSeason(), squad: () => openSquad(), passport: () => openPassport(), study: () => openStudy(), rival: () => openStudy(), pledge: () => openStudy(), league: () => { const b = $("lg-card"); if (b) b.click(); } };
  function atCard() {
    const host = $("pl-card") || $("pc-home"); if (!host) return; const L = JG_API.almostThere().slice(0, 3), old = $("at-card"); if (old) old.remove(); if (!L.length) return;
    host.insertAdjacentHTML("afterend", `<section class="at-card" id="at-card" aria-label="Almost there"><small class="dz-kicker">Almost there</small>${L.map(x => `<button type="button" class="at-row" data-at="${x.action}"><span class="at-ring" style="--p:${x.pct}"><b>${x.left}</b></span><span>${esc(x.text)}</span><i class="dz-chev" aria-hidden="true">›</i></button>`).join("")}</section>`);
    $("at-card").onclick = e => { const b = e.target.closest("[data-at]"); if (b && AT_GO[b.dataset.at]) AT_GO[b.dataset.at](); };
  }
  function atInline() { if ((window.JG_CUTS || {}).almostThere) return;                                                    // the same real numbers, right where the progress is
    const s = JG_API.season(), nx = [10, 25, 40].find(n => n > s.progress), sb = document.querySelector("#zb-season .dz-sub"); if (sb && nx) sb.textContent = `${s.progress} / ${s.target} SAT bricks · ${nx - s.progress} to the next medal`;
    const q = JG_API.squad().weekly_goal, qb = document.querySelector("#zb-squad .dz-sub"); if (qb) qb.textContent = q.bricks_done >= q.bricks_target ? "Weekly goal reached together ✓" : `${q.bricks_target - q.bricks_done} bricks to your weekly goal · ${q.bricks_done} / ${q.bricks_target}`;
    const pp = JG_API.passport(), left = 6 - pp.stamps.length % 6, pc = document.querySelector("#pp-card .dz-pp-cover span"); if (pc) pc.textContent = `${pp.stamps.length} stamp${pp.stamps.length === 1 ? "" : "s"} · ${left} to finish this page`;
  }
  function diagHeadStart() {                                               // a new build starts a little filled: the diagnostic is the first 3 bricks
    if (!S.unlocked || S.diagBricks || window.JG_ENGINE) return; SR.bricks = (SR.bricks || 0) + 3; SR.diagCredit = { bricks: 3, reason: "AI diagnostic", date: ymd(new Date()) };   /* JG-PROD: S17, the server lays the three head-start bricks at unlock and the projection shows them */
    try { localStorage.setItem(SR_KEY, JSON.stringify(SR)); } catch (e) {} S.diagBricks = true; save();
  }

  /* ================= VELVET-ROPE CLUBS: earn your way in ================= */
  const VELVET = { d100: { icon: "💯", req: "a 100-day streak", met: () => JIA_league.ME.streak >= 100, prog: () => `${JIA_league.ME.streak} / 100 days` },
    gold: { icon: "🥇", req: "a gold player card", met: () => ["gold", "jade"].includes(JG_API.playerCard().tier), prog: () => `Your card: ${JG_API.playerCard().tier} · ${JG_API.playerCard().overall}` },
    creators: { icon: "🎬", req: "the JG Creator badge", met: () => JG_API.creator().badge, prog: () => `${JG_API.creator().approved_reels} / 3 approved reels` } };
  CLUBS.push({ id: "d100", name: "100-Day Club", about: "For 100-day streaks. Quiet, serious and very consistent.", members: 86, admins: ["aziza"], founder: null, topics: [["intro", "Introduce yourself"], ["routines", "Routines that stuck"]] },
    { id: "gold", name: "Gold Card Lounge", about: "For gold and jade player cards. Strategy swaps with the top of the app.", members: 312, admins: ["aziza"], founder: null, topics: [["intro", "Introduce yourself"], ["plans", "Application plans"]] },
    { id: "creators", name: "Top Creators", about: "For JG Creators: collabs, early features and a monthly creators' call.", members: 48, admins: ["aziza"], founder: null, topics: [["intro", "Introduce yourself"], ["collabs", "Collabs"]] });
  const VR_MOCK = { madina: ["d100"], dilnoza: ["creators"], sardor: ["gold"] };
  JG_API.velvetClubs = () => Object.keys(VELVET).map(id => { const c = JG_API.clubs().find(x => x.id === id), v = VELVET[id]; return Object.assign({}, c, { velvet: true, icon: v.icon, requirement: v.req, eligible: v.met(), progress: v.prog() }); });
  JG_API.velvetBadges = who => (who === "me" ? JG_API.clubs().filter(c => VELVET[c.id] && c.joined).map(c => c.id) : VR_MOCK[who] || []).map(id => ({ club_id: id, icon: VELVET[id].icon }));
  const _joinClub = JG_API.joinClub; JG_API.joinClub = id => (VELVET[id] && !VELVET[id].met() ? { status: "locked", requirement: VELVET[id].req } : _joinClub(id));
  const _openClubs = openClubs; openClubs = function () {
    _openClubs(); const v = $("jc-clubs"); if (!v) return; v.querySelectorAll(".jc-row").forEach(r => { const c = JG_API.clubs().find(x => x.id === r.dataset.club); if (VELVET[r.dataset.club] && !r.closest(".vr-sec") && !(c && c.joined)) r.remove(); });
    const disc = [...v.querySelectorAll(".jr-next-h, h3, .dg-sec")].find(h => /discover/i.test(h.textContent)), at = disc || v.querySelector(".jc-row:last-of-type");
    const html = `<div class="vr-sec"><b class="jr-next-h">Earn your way in</b>${JG_API.velvetClubs().map(c => `<button type="button" class="jc-row vr-row${c.eligible ? " open" : ""}" ${c.eligible ? `data-club="${c.id}"` : `data-vr="${c.id}"`}><span class="jc-ic vr-ic">${c.icon}</span><span><b>${esc(c.name)}</b><small>${c.eligible ? (c.joined ? "You're in" : "You've earned it: join now") : `🔒 Needs ${esc(c.requirement)} · ${esc(c.progress)}`}</small></span>${c.joined ? `<em class="jc-in">Joined</em>` : c.eligible ? `<em class="jc-in">Join</em>` : `<em class="vr-lock">🔒</em>`}</button>`).join("")}</div>`;
    if (at) at.insertAdjacentHTML("beforebegin", html); else v.insertAdjacentHTML("beforeend", html);
  };
  document.addEventListener("click", e => { const b = e.target.closest("[data-vr]"); if (!b) return; const c = JG_API.velvetClubs().find(x => x.id === b.dataset.vr); if (c && window.JIA_notify) window.JIA_notify({ text: `<b>${esc(c.name)}</b> opens with ${esc(c.requirement)}. You're at ${esc(c.progress)}.` }); });
  const _jgFlex = window.JG_flex; window.JG_flex = who => { const base = _jgFlex(who), vb = JG_API.velvetBadges(who); return base + (vb.length ? `<span class="vr-badges" aria-label="Member of ${vb.map(x => x.club_id).join(", ")}">${vb.map(x => x.icon).join("")}</span>` : ""); };

  /* ---------- wiring, demo, first paint ---------- */
  const _rcb6 = refreshComeBack; refreshComeBack = function () { _rcb6(); try { rvCard(); atInline(); atCard(); } catch (e) {} };
  const _dzT = dzToday; dzToday = function () { _dzT(); try { rvCard(); atInline(); } catch (e) {} };
  const _ppc2 = paintPassportCard; paintPassportCard = function () { _ppc2(); try { atInline(); } catch (e) {} };
  const _pl2 = paintPledge; paintPledge = function () { _pl2(); try { atCard(); } catch (e) {} };
  if (pvq("rv-beat")) pvq("rv-beat").addEventListener("click", () => { if (!JG_API.rival().on) JG_API.setRival(true); rvWeekEnd(true); rvCard(); });
  diagHeadStart(); rvWeekEnd(false); rvCard(); atInline(); atCard();
  (() => { const X = CH(); if (!X) return; try { if (X.rerenderChat) X.rerenderChat(); if (X.rerenderOpen) X.rerenderOpen(); } catch (e) {} })();   // redraw so velvet badges show next to names

  /* ================= STYLE SHOP: looks you buy with coins earned by studying ================= */
  const SY_BG = {"bg_bodleian": {"img": "/d/student-mobile/media/24658ff045a0f3a1.webp", "credit": "chensiyuan, Wikimedia Commons, CC BY-SA 4.0"}, "bg_mitsnow": {"img": "/d/student-mobile/media/7750ba4da2e17af2.webp", "credit": "Peacearth, Wikimedia Commons, CC BY-SA 4.0"}, "bg_kings": {"img": "/d/student-mobile/media/4979f13f5bfed7d7.webp", "credit": "Dmitry Tonkonog, Wikimedia Commons, CC BY-SA 3.0"}, "bg_widener": {"img": "/d/student-mobile/media/3b50d02e1c7f90a2.webp", "credit": "Chris Rycroft, Wikimedia Commons, CC BY 2.0"}};
  const SY_ITEMS = [
    { id: "fr_jade", kind: "frame", name: "Jade glow frame", price: 150 }, { id: "fr_gold", kind: "frame", name: "Gold filigree frame", price: 250 }, { id: "fr_neon", kind: "frame", name: "Midnight neon frame", price: 200 },
    { id: "bb_ocean", kind: "bubble", name: "Ocean bubbles", price: 80, color: "#1f6fb8" }, { id: "bb_sunset", kind: "bubble", name: "Sunset bubbles", price: 80, color: "#d0602f" }, { id: "bb_graphite", kind: "bubble", name: "Graphite bubbles", price: 60, color: "#2f3437" }, { id: "bb_lilac", kind: "bubble", name: "Lilac bubbles", price: 80, color: "#7556c9" },
    { id: "th_night", kind: "theme", name: "Night profile", price: 180 }, { id: "th_sand", kind: "theme", name: "Sand profile", price: 150 }, { id: "th_ocean", kind: "theme", name: "Ocean profile", price: 150 },
    { id: "bg_bodleian", kind: "bg", name: "The Bodleian at night", price: 300 }, { id: "bg_mitsnow", kind: "bg", name: "MIT dome in snow", price: 300 }, { id: "bg_kings", kind: "bg", name: "King's College Chapel", price: 250 }, { id: "bg_widener", kind: "bg", name: "Widener in a snowstorm", price: 250 }];
  const SY_KIND = { frame: "Card frames", bubble: "Chat bubbles", theme: "Profile themes", bg: "Study Room backgrounds" };
  const syState = () => (S.style = S.style || { owned: ["bb_graphite"], active: {} });
  JG_API.styleShop = () => { const st = syState(); return { coins: window.JIA_coins ? window.JIA_coins.get() : 0, items: SY_ITEMS.map(x => Object.assign({}, x, { owned: st.owned.includes(x.id), active: st.active[x.kind] === x.id, credit: SY_BG[x.id] ? SY_BG[x.id].credit : null })) }; };
  JG_API.buyStyle = id => { const st = syState(), x = SY_ITEMS.find(i => i.id === id); if (!x) return { ok: false, reason: "unknown" }; if (st.owned.includes(id)) return { ok: true, already: true };
    if (!window.JIA_coins || !window.JIA_coins.spend(x.price, { reason: "style", ref: id })) return { ok: false, reason: "coins", need: x.price - (window.JIA_coins ? window.JIA_coins.get() : 0) };   /* JG-PROD: S26, the style shop's debit (ownership on the ledger is P2) */
    st.owned.push(id); st.active[x.kind] = id; save(); syApply(); return { ok: true, coins_left: window.JIA_coins.get() }; };
  JG_API.setStyle = (id, on) => { const st = syState(), x = SY_ITEMS.find(i => i.id === id); if (!x || !st.owned.includes(id)) return null; if (on) st.active[x.kind] = id; else if (st.active[x.kind] === id) delete st.active[x.kind]; save(); syApply(); return { active: Object.assign({}, st.active) }; };
  function syApply() {
    const a = syState().active, body = document.body; [...body.classList].filter(c => /^(sy-fr|sy-bb|sy-th)-/.test(c)).forEach(c => body.classList.remove(c));
    if (a.frame) body.classList.add(`sy-fr-${a.frame.slice(3)}`); if (a.theme) body.classList.add(`sy-th-${a.theme.slice(3)}`);
    if (a.bubble) { body.classList.add("sy-bb-on"); body.style.setProperty("--sy-bubble", SY_ITEMS.find(i => i.id === a.bubble).color); } else body.style.removeProperty("--sy-bubble");
    const zr = $("zr-view"); if (zr) { const bg = a.bg && SY_BG[a.bg]; zr.style.setProperty("--sy-roombg", bg ? `url("${bg.img}")` : "none"); zr.classList.toggle("sy-room", !!bg); let cr = zr.querySelector(".sy-credit");
      if (bg) { if (!cr) { zr.insertAdjacentHTML("beforeend", `<p class="sy-credit"></p>`); cr = zr.querySelector(".sy-credit"); } cr.textContent = `Background: ${bg.credit}`; } else if (cr) cr.remove(); }
  }
  function syPreview(x) {
    if (x.kind === "frame") return `<div class="sy-pv sy-pv-card sy-fr-${x.id.slice(3)}">${cardHTML(JG_API.playerCard(), "sm")}</div>`;
    if (x.kind === "bubble") return `<div class="sy-pv sy-pv-chat"><p class="sy-b them">Did you finish the SAT set?</p><p class="sy-b me" style="background:${x.color}">Yes! 18 of 20 ✅</p></div>`;
    if (x.kind === "theme") return `<div class="sy-pv sy-pv-theme sy-th-${x.id.slice(3)}"><span class="sy-av"><img src="${(JG_API.squad().members.find(m => m.user_id === "me") || {}).avatar || ""}" alt=""></span><b>${JG_ME.fullName}</b><small>Class of 2027 · S2</small></div>`; /* JG-PROD: identity */
    return `<div class="sy-pv sy-pv-bg" style="background-image:url('${SY_BG[x.id].img}')"><b>24:59</b><small>Study Room</small></div><p class="sy-cr">Photo: ${esc(SY_BG[x.id].credit)}</p>`;
  }
  function syOpen(sel) {
    const el = layer("sy-view", "zq-view"), d = JG_API.styleShop(), cur = d.items.find(i => i.id === sel) || null; el.setAttribute("aria-label", "Style shop");
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-sy="close" aria-label="Close">‹</button><p class="dg-tt">Style shop</p><span class="dg-timer">🪙 ${d.coins}</span></div><div class="zq-body">
      ${cur ? `<div class="sy-detail">${syPreview(cur)}<b>${esc(cur.name)}</b><small>${esc(SY_KIND[cur.kind])} · ${cur.owned ? (cur.active ? "On" : "Owned") : `🪙 ${cur.price}`}</small>
        ${cur.owned ? `<button type="button" class="dg-go" data-sy="toggle" data-id="${cur.id}">${cur.active ? "Switch off" : "Switch on"}</button>` : `<button type="button" class="dg-go" data-sy="buy" data-id="${cur.id}"${d.coins < cur.price ? " disabled" : ""}>${d.coins < cur.price ? `${cur.price - d.coins} more coins to go` : `Buy for 🪙 ${cur.price}`}</button>`}
        <button type="button" class="dg-link" data-sy="list">Back to all styles</button></div>`
      : Object.keys(SY_KIND).map(k => `<b class="jr-next-h">${SY_KIND[k]}</b><div class="sy-grid">${d.items.filter(i => i.kind === k).map(i => `<button type="button" class="sy-item${i.active ? " on" : ""}" data-sy="open" data-id="${i.id}">
        <span class="sy-sw sy-sw-${i.kind}${i.kind === "frame" ? ` sy-fr-${i.id.slice(3)}` : i.kind === "theme" ? ` sy-th-${i.id.slice(3)}` : ""}" style="${i.kind === "bubble" ? `background:${i.color}` : i.kind === "bg" ? `background-image:url('${SY_BG[i.id].img}')` : ""}"></span><b>${esc(i.name)}</b><small>${i.owned ? (i.active ? "✓ On" : "Owned") : `🪙 ${i.price}`}</small></button>`).join("")}</div>`).join("") + `<p class="zq-note">Styles are bought only with coins earned by studying. Switch them on and off anytime in your profile.</p>`}</div>`;
    el.onclick = e => { const b = e.target.closest("[data-sy]"); if (!b || b.disabled) return; const a = b.dataset.sy;
      if (a === "close") el.hidden = true; else if (a === "list") syOpen(); else if (a === "open") syOpen(b.dataset.id); else if (a === "toggle") { const it = JG_API.styleShop().items.find(i => i.id === b.dataset.id); JG_API.setStyle(it.id, !it.active); syOpen(it.id); refreshProfileExtras(); }
      else if (a === "buy") { const r = JG_API.buyStyle(b.dataset.id); if (r.ok) { if (window.JIA_notify) window.JIA_notify({ text: `<b>${esc(SY_ITEMS.find(i => i.id === b.dataset.id).name)}</b> is yours and switched on.` }); refreshProfileExtras(); } syOpen(b.dataset.id); } };
  }
  document.addEventListener("click", e => { const c = e.target.closest('#cs-chips [data-c="style"]'); if (!c) return; e.stopPropagation(); e.preventDefault(); syOpen(); }, true);
  const _rpe3 = refreshProfileExtras; refreshProfileExtras = function () { _rpe3(); const lc = $("fy-card"); if (!lc) return; const d = JG_API.styleShop(), own = d.items.filter(i => i.owned), old = $("sy-mine"); if (old) old.remove();
    lc.insertAdjacentHTML("afterend", `<section class="fy-card" id="sy-mine"><b>🎨 My style</b>${own.map(i => `<label class="sy-tog"><span>${esc(i.name)}<small>${esc(SY_KIND[i.kind])}</small></span><input type="checkbox" data-sytog="${i.id}"${i.active ? " checked" : ""}></label>`).join("") || "<p>Nothing yet.</p>"}<button type="button" class="dg-link" data-syopen>Open the Style shop</button></section>`); };
  document.addEventListener("change", e => { const t = e.target.closest("[data-sytog]"); if (t) { JG_API.setStyle(t.dataset.sytog, t.checked); refreshProfileExtras(); } });
  document.addEventListener("click", e => { if (e.target.closest("[data-syopen]")) syOpen(); });
  const _openStudy2 = openStudy; openStudy = function () { const r = _openStudy2.apply(this, arguments); try { syApply(); } catch (e) {} return r; };

  /* ================= DOUBLE BRICK HOUR: a few surprise hours a week, bricks count double ================= */
  JG_API.doubleBrickHour = (now = new Date()) => {
    const w = wkStart(now), slots = [], used = new Set(); for (let i = 0; slots.length < 3 && i < 12; i++) { const day = hash(`dbh${ymd(w)}${i}`, 6); if (used.has(day)) continue; used.add(day); const d = new Date(w); d.setDate(w.getDate() + day); d.setHours(10 + hash(`dbhh${ymd(w)}${i}`, 10), 0, 0, 0); slots.push(d); }
    if (S.dbhDemo && now - S.dbhDemo < 36e5) slots.push(new Date(S.dbhDemo)); slots.sort((a, b) => a - b);
    const live = slots.find(s => now >= s && now - s < 36e5), next = slots.find(s => s > now), sq = JG_API.squad().members.filter(m => m.user_id !== "me");
    return { active: !!live, multiplier: 2, starts_at: live ? live.toISOString() : null, ends_at: live ? new Date(live.getTime() + 36e5).toISOString() : null, next: next ? { starts_at: next.toISOString() } : null,
      this_week: slots.map(s => ({ starts_at: s.toISOString() })), window: "a random hour between 10:00 and 20:00", squad_in: live && !window.JG_ENGINE ? sq.filter((m, i) => hash(m.user_id + (live ? live.getTime() : 0), 3) > 0 || i === 0).map(m => m.user_id) : [] };   /* JG-PROD: owner 14 Oct 2026, nothing invented looks real on a real account: the banner named sample squad members as "in" ("Madina, Sardor, Asadbek shu yerda"); with no real presence a real student's banner names no one (the league of 15 stays by his ruling); the demo keeps the design's line */
  };
  function dbhBanner() {
    const D = JG_API.doubleBrickHour(), ex = document.querySelectorAll(".dbh-banner"); if (!D.active) { ex.forEach(x => x.remove()); return; }
    const left = Math.max(0, new Date(D.ends_at) - new Date()), mm = String(Math.floor(left / 6e4)).padStart(2, "0"), ss = String(Math.floor(left % 6e4 / 1e3)).padStart(2, "0"), P = PPL2();
    if (ex.length) { ex.forEach(b => { const t = b.querySelector(".dbh-t"); if (t) t.textContent = `Double Brick Hour · ${mm}:${ss}`; }); return; }   // only the countdown changes each second
    const html = `<button type="button" class="dbh-banner"><span class="dbh-bolt" aria-hidden="true">⚡</span><span class="dz-txt"><b class="dbh-t">Double Brick Hour · ${mm}:${ss}</b><span class="dz-sub">Every brick counts twice.${D.squad_in.length ? ` ${D.squad_in.map(firstN).join(", ")} ${D.squad_in.length === 1 ? "is" : "are"} in.` : ""}</span></span><span class="dz-faces">${D.squad_in.slice(0, 3).map(w => P.AV[w] ? `<img src="${P.AV[w]}" alt="">` : "").join("")}</span></button>`;
    [$("rt-title") && [...document.querySelector(".tv-today").children].find(ch => ch.contains($("rt-title"))), $("pc-home")].forEach(h => { if (h) h.insertAdjacentHTML("beforebegin", html); });
    document.querySelectorAll(".dbh-banner").forEach(b => { b.onclick = () => openStudy(); });
  }
  let dbhWas = false;
  function dbhTick() {
    const D = JG_API.doubleBrickHour(); if (D.active && !dbhWas) { dbhWas = true; S.dbhSeen = (SR.log[ymd(new Date())] || {}).bricks || 0; save(); peopleNote("dbh_start"); } if (!D.active) dbhWas = false;
    if (D.active) { const now = (SR.log[ymd(new Date())] || {}).bricks || 0, gain = now - (S.dbhSeen || 0);   // bricks earned during the hour count twice
      if (gain > 0 && !window.JG_ENGINE) { SR.bricks += gain; SR.log[ymd(new Date())].bricks = now + gain; S.dbhSeen = now + gain; try { localStorage.setItem(SR_KEY, JSON.stringify(SR)); } catch (e) {} save(); if (window.JIA_notify) window.JIA_notify({ text: `<b>Double Brick Hour:</b> +${gain} bonus brick${gain === 1 ? "" : "s"}.` }); } }   /* JG-PROD: S18, no top-up from the page; the server's bonus arrives with the session (Q16) */
    dbhBanner();
  }
  setInterval(() => { if (!document.hidden) dbhTick(); }, 1000);

  /* ================= NOTIFICATIONS ABOUT PEOPLE: real news at your study time, max 3 a day ================= */
  const NP_TYPES = {
    squad_goal: () => { const g = JG_API.squad().weekly_goal, left = g.bricks_target - g.bricks_done; return left > 0 ? `Your squad is ${left} bricks from the weekly goal.` : "Your squad hit the weekly goal. Nice work, all of you."; },
    rival_passed: () => { const r = JG_API.rival(); return `${r.on ? r.rival.first_name : "Timur"} just passed you. ${r.on ? `${r.week.rival_bricks} vs ${r.week.me_bricks} bricks this week.` : ""}`.trim(); },
    ghost_pace: () => { let g = null; try { g = (JG_API.ghosts() || [])[0]; } catch (e) {} const n = g && (g.first_name || g.name) ? String(g.first_name || g.name).split(" ")[0] : "Malika"; return `At this point ${n} already had IELTS 7.0. You're 1 band away.`; },
    dbh_start: () => "Double Brick Hour just started. For 60 minutes, every brick counts twice.",
    friend_streak: () => { let f = null; try { f = (JG_API.friendStreaks() || [])[0]; } catch (e) {} return f ? `${firstN(f.user_id || f.friend || "madina")} studied today. Your ${f.days || f.streak || 12}-day streak together is waiting for you.` : "Madina studied today. Your streak together is waiting for you."; },
    pledge: () => { const p = JG_API.pledges()[0]; return p ? `Mom's pledge: ${Math.max(0, p.goalTarget - p.progress)} bricks to ${p.reward}.` : "Mom's pledge is waiting for you."; } }; if (window.JG_ENGINE) delete NP_TYPES.pledge;   /* JG-PROD: C3, no pledge line among the people notifications for a live student (final review runtime C3) */
  const NP_LABEL = { squad_goal: "Squad goal", rival_passed: "Rival passed you", ghost_pace: "Ghost pace", dbh_start: "Double Brick Hour", friend_streak: "Friend streak", pledge: "Parent pledge" };
  const usualHour = () => { const h = Object.values(SR.log || {}).map(x => x.startHour).filter(n => typeof n === "number"); return h.length ? Math.round(h.reduce((a, b) => a + b, 0) / h.length) : 17; };
  JG_API.notificationPlan = (now = new Date()) => { const hr = usualHour(), sent = (S.npSent || {})[ymd(now)] || 0, quiet = now.getHours() >= 22 || now.getHours() < 7;
    return { usual_time: `${String(hr).padStart(2, "0")}:00`, max_per_day: 3, sent_today: sent, quiet_hours: { from: "22:00", to: "07:00" }, can_send_now: !quiet && sent < 3, types: Object.keys(NP_TYPES).map(t => ({ type: t, label: NP_LABEL[t], text: NP_TYPES[t]() })) }; };
  function peopleNote(type, preview) {
    const plan = JG_API.notificationPlan(); if (!preview && !plan.can_send_now) return { sent: false, reason: plan.sent_today >= 3 ? "daily limit" : "quiet hours" };
    const text = NP_TYPES[type](); if (!preview) { S.npSent = Object.assign({}, S.npSent, { [ymd(new Date())]: plan.sent_today + 1 }); save(); }
    if (window.JIA_notify) window.JIA_notify({ text: `<b>${esc(NP_LABEL[type])}.</b> ${esc(text)}` }); return { sent: true, type, text };
  }
  JG_API.previewNotification = type => peopleNote(type, true);
  function npSheet() {
    const el = layer("np-view", "zq-view"), P = JG_API.notificationPlan(); el.setAttribute("aria-label", "Notification preview");
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-np="close" aria-label="Close">‹</button><p class="dg-tt">Notifications about people</p><span class="dg-timer"></span></div><div class="zq-body">
      <div class="zq-goal"><b>Real news, at your study time</b><small>Around ${P.usual_time} · max ${P.max_per_day} a day · never ${P.quiet_hours.from}–${P.quiet_hours.to}</small></div>
      ${P.types.map(t => `<div class="np-row"><span><b>${esc(t.label)}</b><small>${esc(t.text)}</small></span><button type="button" class="dg-link" data-np="${t.type}">Preview</button></div>`).join("")}
      <p class="zq-note">Previews land in your notifications center. Real ones follow the plan above.</p></div>`;
    el.onclick = e => { const b = e.target.closest("[data-np]"); if (!b) return; if (b.dataset.np === "close") el.hidden = true; else { JG_API.previewNotification(b.dataset.np); b.textContent = "Sent ✓"; } };
  }

  /* ---------- demo controls, first paint ---------- */
  if (pvq("dbh-start")) pvq("dbh-start").addEventListener("click", () => { S.dbhDemo = Date.now(); save(); dbhTick(); });
  if (pvq("np-preview")) pvq("np-preview").addEventListener("click", npSheet);
  syApply(); dbhTick();
  (() => { const d = document.querySelector(".rm-credits"); if (d && !d.querySelector(".sy-credits")) d.insertAdjacentHTML("beforeend", `<p class="sy-credits"><b>Style shop backgrounds</b><br>the Bodleian at night: chensiyuan, Wikimedia Commons, CC BY-SA 4.0<br>MIT dome in snow: Peacearth, Wikimedia Commons, CC BY-SA 4.0<br>King's College Chapel: Dmitry Tonkonog, Wikimedia Commons, CC BY-SA 3.0<br>Widener Library: Chris Rycroft, Wikimedia Commons, CC BY 2.0</p>`); })();

  /* ================= GAME NIGHT row on Today (Mafia, CampusGuessr, JG Live, Movie night) ================= */
  const GN_TILES = [];
  function gnPaint() { const mg = $("mg-card"); if (!mg) return; const old = $("gn-row"); if (old) old.remove(); const GT = GN_TILES.filter(t => !t.where), GL = GT.length === 1 ? "This weekend" : "Game night"; if (!GT.length) return;
    mg.insertAdjacentHTML("afterend", `<section class="gn-row" id="gn-row" aria-label="${GL}"><small class="dz-kicker">${GL}</small><div class="gn-tiles">${GT.map(t => `<button type="button" class="gn-t gn-${t.id}" data-gn="${t.id}"><span aria-hidden="true">${t.icon}</span><b>${esc(t.name)}</b><small>${esc(t.sub())}</small></button>`).join("")}</div></section>`);
    $("gn-row").onclick = e => { const b = e.target.closest("[data-gn]"); const t = b && GN_TILES.find(x => x.id === b.dataset.gn); if (t) t.open(); }; }

  /* ================= MAFIA: the Telegram classic, inside JG. Players are eliminated, never killed ================= */
  const MF_TXT = { classic: { mafia: "Mafia", detective: "Detective", doctor: "Doctor", civilian: "Civilian", journalist: "Journalist", bodyguard: "Bodyguard", bad: "the Mafia", night: "The city falls asleep", visit: "the Mafia visited", town: "the town" },
    exam: { mafia: "Cheater", detective: "Proctor", doctor: "Tutor", civilian: "Student", journalist: "Reporter", bodyguard: "Hall monitor", bad: "the Cheaters", night: "The exam hall goes quiet", visit: "the Cheaters framed", town: "the hall" } };
  const MF_ICON = { mafia: "🕶️", detective: "🔍", doctor: "🩺", civilian: "🙂", journalist: "📰", bodyguard: "🛡️" }, MF_UNLOCK = { journalist: 5, bodyguard: 8 };
  const MF_ACT = { mafia: "Choose who to visit tonight", detective: "Choose who to check", doctor: "Choose who to protect", journalist: "Choose whose role to publish (once a game)", bodyguard: "Choose who to guard" };
  const mfPick = a => a[Math.floor(Math.random() * a.length)];
  const mfStats = () => (S.mafia = S.mafia || { games: 14, wins: 8, by_role: { mafia: { games: 3, wins: 2 }, detective: { games: 3, wins: 2 }, doctor: { games: 2, wins: 1 }, civilian: { games: 6, wins: 3 }, journalist: { games: 0, wins: 0 } }, mvp: 2, best_liar: 1 });
  const mfRank = w => (w >= 10 ? "Legend" : w >= 5 ? "Agent III" : w >= 3 ? "Agent II" : w >= 1 ? "Agent I" : "Rookie");
  JG_API.mafiaStats = () => { const s = mfStats(), lvl = JIA_league.ME.level; return { games: s.games, wins: s.wins, mvp_awards: s.mvp, best_liar_awards: s.best_liar, level: lvl,
    by_role: Object.fromEntries(Object.entries(s.by_role).map(([r, v]) => [r, Object.assign({}, v, { rank: mfRank(v.wins) })])), unlocked_roles: ["mafia", "detective", "doctor", "civilian"].concat(Object.keys(MF_UNLOCK).filter(r => lvl >= MF_UNLOCK[r])),
    next_unlock: Object.keys(MF_UNLOCK).filter(r => lvl < MF_UNLOCK[r]).map(r => ({ role: r, level: MF_UNLOCK[r] }))[0] || null }; };
  JG_API.mafiaRooms = mode => { const st = JG_API.playerCard().stage; return [{ id: `quick_${st}`, kind: "quick", title: `Quick join · ${st} room`, stage: st, mode: mode || "classic", players: 7, max: 12, private: false },
    { id: "squad", kind: "squad", title: "Squad room", mode: mode || "classic", players: 4, max: 12, private: true }, { id: "club_mit", kind: "club", title: "MIT applicants club room", mode: mode || "classic", players: 6, max: 12, private: true },
    { id: "friends", kind: "friends", title: "Private room for friends", mode: mode || "classic", players: 1, max: 12, private: true, invite_code: "JG-MAF-4821" }]; };
  JG_API.reportMafiaPlayer = (userId, reason) => ({ user_id: userId, reason: reason || "unfair play", status: "sent_to_moderators" });
  JG_API.voteKick = userId => ({ user_id: userId, status: "vote_started", needs: "majority of the room" });
  let MF = null, MF_T = [];
  const mfClear = () => { MF_T.forEach(clearTimeout); MF_T = []; }, mfLater = (fn, ms) => MF_T.push(setTimeout(fn, ms));
  function mfLobby(mode = S.mfMode || "classic") {
    mfClear(); S.mfMode = mode; save(); const el = layer("mf-view", "zq-view mf-view"), st = JG_API.mafiaStats(), T = MF_TXT[mode]; el.setAttribute("aria-label", "Mafia");
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-mf="close" aria-label="Close">‹</button><p class="dg-tt">Mafia</p><span class="dg-timer">🕶️</span></div><div class="zq-body">
      <div class="mf-hero"><b>${mode === "exam" ? "Exam Hall" : "Classic"}</b><small>${mode === "exam" ? "Find the cheater before the exam ends." : "Find the Mafia before they take over the city."} 6–12 players · about 20 minutes</small></div>
      <div class="lab-tabs"><button type="button" data-mf="mode" data-m="classic" aria-selected="${mode === "classic"}">Classic</button><button type="button" data-mf="mode" data-m="exam" aria-selected="${mode === "exam"}">Exam Hall</button><button type="button" data-mf="stats" aria-selected="false">My ranks</button></div>
      ${JG_API.mafiaRooms(mode).map(r => `<button type="button" class="jc-row mf-room" data-mf="join" data-room="${r.id}"><span class="jc-ic">${r.private ? "🔒" : "⚡"}</span><span><b>${esc(r.title)}</b><small>${r.players} / ${r.max} players${r.invite_code ? ` · invite code ${r.invite_code}` : ""}${r.private ? " · private" : " · starts when 8 join"}</small></span><em class="jc-in">Join</em></button>`).join("")}
      <b class="jr-next-h">Roles</b><div class="mf-roles">${["mafia", "detective", "doctor", "civilian", "journalist", "bodyguard"].map(r => `<span class="${st.unlocked_roles.includes(r) ? "" : "locked"}">${MF_ICON[r]} ${T[r]}${MF_UNLOCK[r] ? `<small>${st.unlocked_roles.includes(r) ? "unlocked" : `level ${MF_UNLOCK[r]}`}</small>` : ""}</span>`).join("")}</div>
      <p class="zq-note">Players are eliminated, never killed. Every room has the chat filter, reports and vote-kick.</p></div>`;
    el.onclick = e => { const b = e.target.closest("[data-mf]"); if (!b) return; const a = b.dataset.mf;
      if (a === "close") { mfClear(); el.hidden = true; } else if (a === "mode") mfLobby(b.dataset.m); else if (a === "join") mfStart(b.dataset.room, mode); else if (a === "stats") mfRanks(); };
  }
  function mfRanks() {
    const el = $("mf-view"), st = JG_API.mafiaStats(), T = MF_TXT[S.mfMode || "classic"];
    el.querySelector(".zq-body").innerHTML = `<div class="mf-hero"><b>${st.wins} wins · ${st.games} games</b><small>🏅 MVP ×${st.mvp_awards} · 🎭 Best liar ×${st.best_liar_awards}</small></div>
      ${Object.entries(st.by_role).map(([r, v]) => `<div class="np-row"><span><b>${MF_ICON[r]} ${T[r]} · ${v.rank}</b><small>${v.wins} wins of ${v.games} games</small></span></div>`).join("")}
      ${st.next_unlock ? `<p class="zq-note">${MF_ICON[st.next_unlock.role]} ${T[st.next_unlock.role]} unlocks at level ${st.next_unlock.level}. You're level ${st.level}.</p>` : ""}<button type="button" class="dg-link" data-mf="mode" data-m="${S.mfMode || "classic"}">Back to rooms</button>`;
  }
  function mfStart(roomId, mode) {
    const P = PPL2(), ids = ["madina", "sardor", "dilnoza", "timur", "asadbek", "nilufar", "lg0"].filter(w => P.PEOPLE[w]).slice(0, 7), me = JG_API.squad().members.find(m => m.user_id === "me") || {};
    const roles = ["mafia", "mafia", "detective", "doctor"].concat(JIA_league.ME.level >= 5 ? ["journalist"] : ["civilian"]); while (roles.length < ids.length + 1) roles.push("civilian"); roles.sort(() => Math.random() - .5);
    MF = { mode, room: roomId, day: 0, log: [], scoopUsed: false, checks: [], players: [{ id: "me", name: "You", av: me.avatar || "", me: true }].concat(ids.map(w => ({ id: w, name: firstN(w), av: P.AV[w] || "" }))).map((p, i) => Object.assign(p, { role: roles[i], alive: true })) };
    MF.me = MF.players[0]; mfScene("role");
  }
  const mfAlive = () => MF.players.filter(p => p.alive), mfP = id => MF.players.find(p => p.id === id), mfT = () => MF_TXT[MF.mode];
  const mfFace = p => `<span class="mf-face${p.alive ? "" : " out"}"><img src="${p.av}" alt=""><small>${esc(p.name)}</small></span>`;
  function mfScene(kind, extra) {
    const el = $("mf-view"); if (!el || el.hidden) return; const T = mfT(), me = MF.me; let html = "";
    if (kind === "role") html = `<div class="mf-stage mf-dark"><small class="dz-kicker">Your role · ${MF.mode === "exam" ? "Exam Hall" : "Classic"}</small><div class="mf-card"><span>${MF_ICON[me.role]}</span><b>${T[me.role]}</b><small>${me.role === "mafia" ? `Your partner: ${esc(MF.players.find(p => p.role === "mafia" && !p.me).name)}` : me.role === "civilian" ? "No night power. Your voice and your vote are your weapons." : esc(MF_ACT[me.role])}</small></div><button type="button" class="dg-go" data-mfs="night">I'm ready</button></div>`;
    if (kind === "night") { MF.day++; const acts = me.alive && MF_ACT[me.role] && !(me.role === "journalist" && MF.scoopUsed);
      html = `<div class="mf-stage mf-night"><div class="mf-sky"><i class="mf-moon"></i><div class="mf-city">${Array.from({ length: 14 }, (_, i) => `<span style="height:${40 + hash("b" + i, 60)}px"><i style="animation-delay:${.3 + i * .12}s"></i><i style="animation-delay:${.5 + i * .1}s"></i></span>`).join("")}</div></div>
        <b class="mf-title">Night ${MF.day} · ${T.night}…</b>${acts ? `<small class="mf-sub">${esc(MF_ACT[me.role])}</small><div class="mf-grid">${mfAlive().filter(p => !p.me || me.role === "doctor" || me.role === "bodyguard").filter(p => !(me.role === "mafia" && p.role === "mafia")).map(p => `<button type="button" data-mft="${p.id}">${mfFace(p)}</button>`).join("")}</div>` : `<small class="mf-sub">${me.alive ? "Close your eyes. Others are making their moves." : "You're watching from the balcony."}</small>`}</div>`;
      if (!acts) mfLater(() => mfResolve(null), 4200); }
    if (kind === "morning") html = `<div class="mf-stage mf-dawn"><small class="dz-kicker">Morning ${MF.day}</small><p class="mf-reveal">${extra.lines.map((l, i) => `<span style="animation-delay:${i * 1.1}s">${l}</span>`).join(" ")}</p>${extra.who ? `<div class="mf-out" style="animation-delay:${extra.lines.length * 1.1}s">${mfFace(extra.who)}</div>` : ""}${extra.priv ? `<p class="mf-priv">${extra.priv}</p>` : ""}<button type="button" class="dg-go" data-mfs="${extra.next || "day"}" style="animation-delay:${extra.lines.length * 1.1 + .4}s">${extra.next === "night" ? "Night falls…" : "Start the discussion"}</button></div>`;
    if (kind === "day") html = `<div class="mf-stage mf-day"><div class="mf-top"><b>Day ${MF.day} · discuss</b><span class="mf-clock" id="mf-clock">0:30</span><button type="button" class="mf-menu" data-mfs="menu" aria-label="Room menu: report or vote-kick">⋯</button></div><div class="mf-alive">${MF.players.map(mfFace).join("")}</div>
      <div class="mf-chat" id="mf-chat" aria-live="polite"></div>${me.alive ? `<div class="mf-comp"><input class="dg-field" id="mf-in" maxlength="160" placeholder="Say something… accuse, defend, bluff"><button type="button" class="mf-mic" data-mfs="voice" aria-label="Send a voice message">🎤</button><button type="button" class="dg-go" data-mfs="say">Send</button></div>` : `<p class="zq-note">You're eliminated. Keep watching and chatting in spectator mode.</p>`}<button type="button" class="dg-link" data-mfs="vote">Go to the vote now</button></div>`;
    if (kind === "vote") html = `<div class="mf-stage mf-day"><div class="mf-top"><b>Vote · who is ${T.mafia === "Mafia" ? "Mafia" : "a Cheater"}?</b><span class="mf-clock mf-ring" id="mf-clock" style="--p:100">10</span></div><div class="mf-grid mf-votegrid">${mfAlive().filter(p => !p.me).map(p => `<button type="button" data-mfv="${p.id}"${me.alive ? "" : " disabled"}>${mfFace(p)}<em class="mf-votes" id="mfv-${p.id}"></em></button>`).join("")}</div><p class="zq-note">${me.alive ? "Tap once to vote. Votes are public." : "Spectators can't vote."}</p></div>`;
    if (kind === "end") html = mfEndHTML(extra);
    el.querySelector(".zq-body").innerHTML = html; el.querySelector(".dg-tt").textContent = `Mafia · ${MF.mode === "exam" ? "Exam Hall" : "Classic"}`;
    el.onclick = mfClick; if (kind === "day") mfDay(); if (kind === "vote") mfVote();
  }
  function mfResolve(myTarget) {
    const T = mfT(), alive = mfAlive(), town = alive.filter(p => p.role !== "mafia"), me = MF.me;
    const pool = town.filter(p => !p.me || Math.random() < .35), victim = me.role === "mafia" && me.alive && myTarget ? mfP(myTarget) : mfPick(pool.length ? pool : town);
    const doc = alive.find(p => p.role === "doctor"), saved = doc ? (doc.me ? myTarget : mfPick(alive).id) : null;
    const det = alive.find(p => p.role === "detective"); let priv = "";
    if (det) { const t = det.me ? myTarget : mfPick(alive.filter(p => p !== det)).id; if (det.me && t) { const bad = mfP(t).role === "mafia"; MF.checks.push({ day: MF.day, target: t, bad }); priv = `🔍 Your check: <b>${esc(mfP(t).name)}</b> is ${bad ? `<b class="bad">${T.mafia}</b>` : "not " + T.mafia}.`; } }
    const jr = alive.find(p => p.role === "journalist"); let scoop = null; if (jr && !MF.scoopUsed && (jr.me ? myTarget : Math.random() < .4)) { const t = jr.me ? mfP(myTarget) : mfPick(alive.filter(p => p !== jr)); if (t) { scoop = t; MF.scoopUsed = true; } }
    const lines = [`Last night ${T.visit} <b>${esc(victim.name)}</b>…`], out = saved === victim.id ? null : victim;
    if (out) { out.alive = false; lines.push(`…and nobody came to help. ${out.me ? "<b>You</b> are" : `<b>${esc(out.name)}</b> is`} eliminated.`, `${out.me ? "You were" : `${esc(out.name)} was`} ${out.role === "mafia" ? "" : "a "}<b>${T[out.role]}</b> ${MF_ICON[out.role]}`); } else lines.push(`…but the ${T.doctor} was already there. ${victim.me ? "<b>You</b> stay" : `<b>${esc(victim.name)}</b> stays`} in the game!`);
    if (scoop) lines.push(`📰 Morning paper: <b>${esc(scoop.name)}</b> is the <b>${T[scoop.role]}</b>.`);
    MF.log.push({ phase: `Night ${MF.day}`, text: `${T.visit[0].toUpperCase() + T.visit.slice(1)} ${victim.me ? "you" : victim.name}${out ? `, eliminated (${T[victim.role]})` : `; the ${T.doctor} saved them`}${scoop ? ` · the ${T.journalist} published ${scoop.name}` : ""}` });
    if (mfWinner()) return mfScene("end", mfWinner()); mfScene("morning", { lines, who: out, priv });
  }
  const MF_LINES = [x => `I think ${x} is hiding something.`, x => `${x} went very quiet after the reveal…`, x => `Why is nobody talking about ${x}?`, () => "I'm just a civilian, I swear. Look at my votes.", x => `${x}, where were you last night? 😅`, () => "Let's not vote randomly this time.", x => `My gut says ${x}.`, x => `Trust me, ${x} is clean. I'd bet my streak on it.`];
  function mfDay() {
    const chat = $("mf-chat"), alive = mfAlive().filter(p => !p.me); let n = 0, left = 30;
    const post = (p, text, voice) => { if (!chat) return; chat.insertAdjacentHTML("beforeend", `<div class="mf-msg${p.me ? " me" : ""}"><img src="${p.av}" alt=""><span><b>${esc(p.name)}</b>${voice ? `<button type="button" class="mf-voice" data-mfs="play"><i></i>${voice}</button><small class="mf-tr">“${esc(text)}”</small>` : esc(text)}</span></div>`); chat.scrollTop = chat.scrollHeight; };
    MF.post = post;
    const tick = () => { if (!$("mf-chat")) return; if (n < 7 && alive.length) { const p = mfPick(alive), sus = mfPick(mfAlive().filter(x => x !== p)); post(p, mfPick(MF_LINES)(sus ? sus.name : "someone"), n % 3 === 1 ? `0:0${4 + hash(p.id + n, 6)}` : null); n++; } };
    for (let i = 0; i < 8; i++) mfLater(tick, 900 + i * 2600);
    const clk = () => { const c = $("mf-clock"); if (!c) return; left--; c.textContent = `0:${String(Math.max(0, left)).padStart(2, "0")}`; if (left <= 0) return mfScene("vote"); mfLater(clk, 1000); }; mfLater(clk, 1000);
  }
  function mfVote() {
    const alive = mfAlive(), votes = {}; let left = 10;
    const add = (from, to) => { votes[from] = to; Object.keys(votes).length; const tally = {}; Object.values(votes).forEach(t => { tally[t] = (tally[t] || 0) + 1; }); mfAlive().forEach(p => { const e = $(`mfv-${p.id}`); if (e) e.textContent = tally[p.id] ? `${tally[p.id]}` : ""; }); };
    MF.castVote = to => add("me", to);
    alive.filter(p => !p.me).forEach((p, i) => mfLater(() => { const pool = alive.filter(x => x !== p && (p.role !== "mafia" || x.role !== "mafia")); const sus = p.role === "mafia" ? mfPick(pool.filter(x => x.role !== "mafia")) : (Math.random() < .45 ? mfPick(alive.filter(x => x.role === "mafia" && x !== p)) : null) || mfPick(pool); if (sus) add(p.id, sus.id); }, 1200 + i * 900));
    const clk = () => { const c = $("mf-clock"); if (!c) return; left--; c.textContent = String(Math.max(0, left)); c.style.setProperty("--p", left * 10); if (left > 0) return mfLater(clk, 1000);
      const tally = {}; Object.values(votes).forEach(t => { tally[t] = (tally[t] || 0) + 1; }); const top = Object.entries(tally).sort((a, b) => b[1] - a[1]); const T = mfT();
      if (!top.length || (top[1] && top[1][1] === top[0][1])) { MF.log.push({ phase: `Day ${MF.day}`, text: "The vote was a tie. Nobody left." }); return mfScene("night"); }
      const out = mfP(top[0][0]); out.alive = false; MF.log.push({ phase: `Day ${MF.day}`, text: `${T.town[0].toUpperCase() + T.town.slice(1)} voted out ${out.me ? "you" : out.name} (${T[out.role]}), ${top[0][1]} votes` });
      if (mfWinner()) return mfScene("end", mfWinner()); mfScene("morning", { lines: [`${T.town[0].toUpperCase() + T.town.slice(1)} has spoken: ${out.me ? "<b>you</b> leave" : `<b>${esc(out.name)}</b> leaves`} the game…`, `${out.me ? "You were" : `${esc(out.name)} was`} ${out.role === "mafia" ? "" : "a "}<b>${T[out.role]}</b> ${MF_ICON[out.role]}`], who: out, next: "night" }); };
    mfLater(clk, 1000);
  }
  const mfWinner = () => { const a = mfAlive(), m = a.filter(p => p.role === "mafia").length; return m === 0 ? { side: "town" } : m >= a.length - m ? { side: "mafia" } : null; };
  function mfEndHTML(w) {
    const T = mfT(), meWon = (w.side === "mafia") === (MF.me.role === "mafia"), st = mfStats(), r = st.by_role[MF.me.role] = st.by_role[MF.me.role] || { games: 0, wins: 0 };
    if (!MF.recorded) { MF.recorded = true; st.games++; r.games++; if (meWon) { st.wins++; r.wins++; } save(); }
    MF.share = `JG Mafia · ${MF.mode === "exam" ? "Exam Hall" : "Classic"} · ${w.side === "town" ? `${T.town} won` : `${T.bad} won`} · I was the ${T[MF.me.role]} ${MF_ICON[MF.me.role]}${meWon ? " · 🏆" : ""}`;
    return `<div class="mf-stage mf-endbg"><small class="dz-kicker">${meWon ? "You won" : "Good game"}</small><b class="mf-title">${w.side === "town" ? `${T.town[0].toUpperCase() + T.town.slice(1)} wins! ${T.bad[0].toUpperCase() + T.bad.slice(1)} ${MF.mode === "exam" ? "were caught" : "are out"}.` : `${T.bad[0].toUpperCase() + T.bad.slice(1)} take${MF.mode === "exam" ? "" : "s"} over.`}</b>
      <b class="jr-next-h">Who was who</b><div class="mf-grid mf-whogrid">${MF.players.map(p => `<span class="mf-who${p.role === "mafia" ? " bad" : ""}">${mfFace(p)}<em>${MF_ICON[p.role]} ${T[p.role]}</em></span>`).join("")}</div>
      <b class="jr-next-h">Timeline</b><ol class="mf-tl">${MF.log.map(l => `<li><b>${esc(l.phase)}</b> ${esc(l.text)}</li>`).join("")}</ol>
      <b class="jr-next-h">Vote: MVP and Best liar</b><div class="mf-awards"><div><small>🏅 MVP</small>${MF.players.filter(p => !p.me).map(p => `<button type="button" data-mfa="mvp" data-id="${p.id}">${esc(p.name)}</button>`).join("")}</div><div><small>🎭 Best liar</small>${MF.players.filter(p => !p.me).map(p => `<button type="button" data-mfa="liar" data-id="${p.id}">${esc(p.name)}</button>`).join("")}</div></div><p class="mf-award-res" id="mf-award-res"></p>
      <div class="mf-share" id="mf-share"><small>JG MAFIA</small><b>${esc(MF.share.split(" · ").slice(2).join(" · "))}</b><span>${MF.players.length} players · ${MF.day} nights</span></div>
      <div class="mf-endacts"><button type="button" class="dg-go" data-mfs="share">Share the card</button><button type="button" class="dg-link" data-mfs="again">Play again</button></div></div>`;
  }
  function mfClick(e) {
    if (e.target.closest('[data-mf="close"]')) { mfClear(); $("mf-view").hidden = true; return; }
    const t = e.target.closest("[data-mft]"); if (t) return mfResolve(t.dataset.mft);
    const v = e.target.closest("[data-mfv]"); if (v && !v.disabled) { MF.castVote(v.dataset.mfv); $("mf-view").querySelectorAll("[data-mfv]").forEach(x => { x.disabled = true; x.classList.toggle("mine", x === v); }); return; }
    const aw = e.target.closest("[data-mfa]"); if (aw) { aw.parentElement.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === aw)); const mvp = document.querySelector('[data-mfa="mvp"].on'), liar = document.querySelector('[data-mfa="liar"].on');
      if (mvp && liar) { const detective = MF.players.find(p => p.role === "detective" && !p.me), bluffer = MF.players.find(p => p.role === "mafia" && !p.me); $("mf-award-res").innerHTML = `Room results: 🏅 MVP <b>${esc((detective || mfP(mvp.dataset.id)).name)}</b> · 🎭 Best liar <b>${esc((bluffer || mfP(liar.dataset.id)).name)}</b>`; } return; }
    const b = e.target.closest("[data-mfs]"); if (!b) return; const a = b.dataset.mfs;
    if (a === "night") mfScene("night"); else if (a === "day") mfScene("day");
    else if (a === "vote") { mfClear(); mfScene("vote"); } else if (a === "again") mfLobby(MF.mode);
    else if (a === "say") { const i = $("mf-in"), txt = (i.value || "").trim(); if (!txt) return; const bad = /\b(idiot|stupid|kill yourself|kys|dumb)\b/i.test(txt); MF.post(MF.me, bad ? "••• (filtered: be kind, it's a game)" : txt); i.value = ""; }
    else if (a === "voice") MF.post(MF.me, "I'm telling you, check the quiet ones.", "0:05");
    else if (a === "play") { b.classList.add("playing"); setTimeout(() => b.classList.remove("playing"), 2500); }
    else if (a === "menu") { const p = mfPick(mfAlive().filter(x => !x.me)); if (window.JIA_notify) window.JIA_notify({ text: `<b>Room tools:</b> report a player (goes to moderators) or start a vote-kick. Demo: reported ${esc(p.name)} → ${JG_API.reportMafiaPlayer(p.id).status.replace(/_/g, " ")}.` }); }
    else if (a === "share") { if (navigator.share) navigator.share({ text: MF.share }).catch(() => {}); else if (navigator.clipboard) navigator.clipboard.writeText(MF.share).then(() => { b.textContent = "Copied ✓"; }).catch(() => {}); }
  }
  GN_TILES.push({ id: "mafia", icon: "🕶️", name: "Mafia", sub: () => `${JG_API.mafiaRooms()[0].players} waiting in ${JG_API.playerCard().stage}`, open: () => mfLobby() });
  if (pvq("mf-play")) pvq("mf-play").addEventListener("click", () => { mfLobby("classic"); mfStart(`quick_${JG_API.playerCard().stage}`, "classic"); });
  gnPaint();

  /* ================= CAMPUSGUESSR: a real campus photo, a pin on the world map ================= */
  const CG_MAP = "M112.2 137.8 115 138.7 114.5 139.2 113 138.9 111.9 139.6 109 139.1 106.7 138 105.3 136.8 108.9 138.1 109.7 136.9 110.7 136.5 111.4 136.6 112.2 137.8ZM121.5 135.1 122.2 135.6 122 135.9 120.6 136.2 120.2 135.8 119.3 136.3 118.8 135.8 120 135.2 120.8 135.5 121.5 135.1ZM250.3 133.7 248.7 133.8 248.9 132.6 250.5 133.1 250.3 133.7ZM325.4 124.8 326.4 125.1 328.3 124.9 328.4 126.1 328 126.4 327.9 127.2 327.6 126.9 326.9 127.6 326 127.5 324.7 125.2 324.7 124.7 325.4 124.8ZM353 124.9 353.2 125.3 354 124.9 354.2 125.3 354.2 125.8 352.7 127.4 353.1 127.9 351.5 128.2 350.6 129.9 349.3 130.6 348.4 130.6 346.7 130.2 346.5 129.9 347 129.1 350.5 127 352.8 124.5 353 124.9ZM354.6 120.2 355.3 121.2 355.4 120.5 355.8 120.8 356 121.6 357.4 122 358 121.6 358.5 121.7 358 123.2 357.2 123.1 356 125.3 355.2 125.7 355.1 125.4 354.7 125.3 355.2 124.5 354.9 123.9 353.8 123.5 353.9 123.1 354.6 122.8 354.7 121.4 352.6 118.5 354.3 119.3 354.6 120.2ZM347.1 106.2 346.7 106.4 345.5 105.7 344 104.1 344.5 104.1 347.1 106.2ZM358.4 101.3 358.7 101.6 358.6 102.2 357.4 102.2 357.3 101.7 358.4 101.3ZM359.4 100.8 358.7 101 358.6 100.6 359.4 100.4 360 100.1 360 100.6 359.4 100.8ZM347.8 100.5 347.5 100.6 347.2 100.2 347.2 99.9 347.8 100.5ZM347.1 98.9 347.3 99.7 346.8 99.7 346.6 98.6 347.1 98.9ZM230.1 97.6 230.4 99.7 230.2 100 229.9 99.4 229.7 99.7 229.8 100.9 229.5 101.1 227.1 108.9 225.4 109.6 224 109 223.3 106.8 223.4 105.3 223.9 105.2 224.4 104.1 224.5 103.4 224 102.3 224.4 100.2 226.3 99.8 227.7 98.6 227.9 97.7 228.3 97.8 229.2 96 230.1 97.6ZM323.6 97.8 323.9 98.5 324.6 98.2 325.4 99 325.6 100.8 325.9 100.9 326.4 103 328.8 104.4 329.7 106.3 330.1 106.1 330.5 106.6 330.7 106.4 330.9 107.5 332.9 109.3 333.1 111.3 333.6 112.1 332.5 116.6 331.7 117 330.3 119.7 330 121.4 329.4 121.8 328.3 121.8 326.3 123 324.9 122.4 325 121.9 323.6 122.8 320.6 122 320 121.4 319.6 120.1 319.1 119.7 318.1 119.6 318.4 119.1 318.2 118.4 317.7 119.1 316.8 119.3 317.9 117.6 317.8 116.9 316.4 118.1 316 118.9 315.2 118.5 315.2 117.9 314.1 116.8 314.3 116.6 311.3 115.5 309.5 115.6 307.1 116.3 306.1 116.2 304.2 117 303.7 117.9 299.9 118 298 119.1 296.6 119 295 118.2 295 117.6 295.7 117.3 295.8 116.2 294.6 112.5 293.3 110.1 293.8 110.5 293.4 109.6 294.2 110.3 293.4 108.4 294.1 105.8 294.2 106.5 294.6 105.8 296.7 104.7 300.9 103.7 302.2 102.2 302.3 101.3 303 100.4 303.4 101.3 303.9 101.1 303.5 100.6 303.8 100.1 304.3 100.3 304.4 99.6 305.7 98.2 307.1 97.8 308.4 98.9 309.6 99 309.4 98.4 310.3 97.4 310.6 96.5 312.6 96.1 312.6 95.6 311.8 95.3 312.4 95.1 313.6 95.8 315.3 96.2 316.5 95.9 317 96.4 316 97.3 315.5 99 320.2 101.7 320.9 101.4 321.7 99 321.5 97.7 322.1 95 322.5 94.7 322.8 95.2 323.6 97.8ZM342.1 94.5 342.4 94.8 341.7 94.8 341.3 94.2 342.1 94.5ZM300.7 94.2 300.3 94.3 299 93.6 299.9 93.4 300.7 94.2ZM340.9 93.9 339.8 93.8 339.7 93.2 340.9 93.9ZM341.7 93.6 341.5 93.8 340.6 92.3 340.9 92.3 341.7 93.6ZM304.4 94.1 303.6 94.4 304 93.3 305.9 92.4 307.3 92.4 305.1 93.4 304.4 94.1ZM297.9 92.1 298.9 92.3 299.1 92.7 297.3 93 296.7 93 297.9 92.1ZM302.9 92.1 302.8 92.6 301.3 92.9 299.9 92.8 299.9 92.4 300.7 92.2 302 92.5 302.9 92.1ZM288.6 90.8 290.5 90.9 290.8 90.5 292.6 90.9 293 91.6 294.5 91.8 295.7 92.4 294.6 92.8 293.5 92.3 290.6 92.1 286.5 91.4 286.3 90.9 285.4 90.9 286.1 89.9 288.5 90.4 288.6 90.8ZM314.7 90.2 314.2 90.9 314.3 89.8 314.5 89.4 314.7 90.2ZM335.9 90.8 335.6 90.9 334.7 89.9 334.7 89 336 90.5 335.9 90.8ZM332 89.5 329.7 90.3 328.3 89.7 328.4 89.4 329.8 89.5 330 89 330.2 89.5 330.8 89.5 331.6 88.8 331.5 88.2 332.1 88.1 332.3 88.9 332 89.5ZM307.2 87.5 306.9 87.8 306.2 87.6 306 87.2 307 87.1 307.2 87.5ZM310.5 87.1 310.8 87.9 310 87.4 308.6 87.4 307.9 87.4 308.1 86.8 310.5 87.1ZM333.1 88.5 332.8 88.8 332.4 87.8 330.7 86.7 330.9 86.5 332.2 87.2 333.1 88.5ZM314.1 85.2 314.4 86.8 315.5 87.4 316.3 86.3 317.4 85.7 318.3 85.7 324.6 87.9 325.8 88.9 326 89.5 327.6 90.1 327.9 90.6 327 90.7 327.2 91.4 328.1 92 328.7 93.1 329.3 93.1 329.3 93.5 330 93.7 329.7 93.9 330.8 94.3 330.7 94.6 330 94.7 329.8 94.4 327.9 94.1 326 92.1 324.7 91.6 323.3 92.2 323.4 93 322.6 93.3 321 93.1 320.1 92.3 319.1 92.1 318.9 92.4 317.6 92.4 318 91.6 318.7 91.3 317.9 89.4 316 88.5 315.2 88.5 313.7 87.5 313 88.1 312.8 87.3 312 86.8 313.8 86.5 313.7 86.2 312.2 86.2 311.8 85.6 310.9 85.4 310.5 84.9 312.4 84.4 314 84.8 314.1 85.2ZM305.2 82.6 304.4 83.6 303.7 83.8 300.2 83.8 300 84.5 300.9 85.4 303.3 84.6 303.3 85.1 302.8 84.9 302.4 85.5 301.5 85.9 302.5 87.2 302.3 87.5 303.2 88.7 303.2 89.3 302.6 89.6 302.2 89.3 302.7 88.5 301.7 88.9 301.5 88.6 301.6 88.2 300.9 87.6 301 86.6 300.3 86.9 300.4 89.5 299.8 89.7 299.4 89.4 299.7 88.5 299.5 87.5 299.1 87.5 298.8 86.8 300 83.4 300.9 82.7 304.1 83.1 305.1 82.4 305.2 82.6ZM308.7 82.9 308.6 83.7 308.1 83.6 308 84.3 308.4 84.8 308.1 84.9 307.7 84.3 307.4 83 307.6 82.2 307.9 81.8 308 82.4 308.6 82.5 308.7 82.9ZM285.8 89.9 284.7 89.9 282.6 88.2 279.3 83.8 278.6 82.2 275.4 79 275.3 78.5 277.5 78.8 280.6 81.9 281.7 81.9 283.8 83.9 283.4 84.7 284.4 85.1 284.9 86.3 285.6 86.4 286.1 87.1 285.8 89.9ZM297.9 82.2 299 83.1 297.8 83.2 297.5 84.8 296.6 85.5 296.1 88 296 87.7 294.9 88.1 294.5 87.5 293.3 87.1 292.1 87.5 291.7 87 290.2 86.9 290.1 85.6 289.1 84.5 289 83.6 289.1 82.7 289.7 82 290.4 82.3 291.2 82.1 291.4 81.3 293 80.9 296.7 77.1 297.1 77.1 297.7 78 299.2 78.6 299.1 79 298.4 79 298.6 79.5 297.3 80.8 298 81.7 297.9 82.2ZM306.4 75.6 306.2 77.7 305.8 76.7 305.4 77.2 305.7 78 305.4 78.4 304.2 77.8 303.9 77.1 304.2 76.6 303.6 76.2 303.3 76.6 302.8 76.5 302.1 77.1 301.9 76.8 302.3 76 303.5 75.3 303.8 75.8 304.6 75.5 304.8 75 305.5 75 305.4 74.2 306.2 74.7 306.4 75.6ZM261.2 77.8 260.3 78 259.7 75.8 260.1 74.2 260.8 74.7 261.8 76.5 261.6 77.5 261.2 77.8ZM119.1 73.9 118 73.9 118.3 73.2 119.1 73.1 119.1 73.9ZM304 73.7 303 75 302.4 74.3 302.8 73.7 302.9 73.1 303.5 73.1 303.3 73.7 304.1 72.8 304 73.7ZM298.5 74.7 297.2 75.6 299 73.6 299.5 72.6 299.7 73.4 298.5 74.7ZM301.9 72.1 303.1 72.4 302.6 73.3 302 73.6 301.9 72.1ZM305.5 71.8 305.8 73 305 72.7 305.3 73.6 304.8 73.9 304.8 73.2 304.5 73.1 304.3 72.5 304.9 72.6 304.9 72.2 304.3 71.4 305.5 71.8ZM301.5 70.9 301.3 71.8 300.3 70.5 301.5 70.9ZM301.3 65.5 301.9 65.8 302.2 65.5 302.5 66.9 302.3 67.7 301.7 68.1 301.7 69.7 304 70.2 304.1 71.5 303.3 71 302.9 70.4 302.7 70.8 302 70.2 301.1 70.4 300.6 70.1 301 69.5 300.7 69.2 300.6 69.6 299.9 68.6 299.9 67.6 300.3 68 300.7 65.5 301.3 65.5ZM114.4 65.8 112.8 66.1 112.8 65.6 114.4 65.8ZM103.1 66.1 102.8 66.3 101.7 65.8 102.2 65.5 103.6 65.8 103.8 66.1 103.1 66.1ZM107.4 64.1 109.2 64.1 111.7 65.4 111.3 65.8 109 65.7 108.6 66.4 107.6 65.8 106.1 66 105.5 65.7 105.6 65.3 107.3 65.6 107.7 65.3 107.2 64.5 106.6 64.4 107.4 64.1ZM290.3 65.3 289.5 65.8 288.7 65.5 288.6 64.6 290.2 63.9 290.8 63.9 291 64.3 290.3 65.3ZM24.5 64.9 24.1 64.9 24.1 63.7 25.2 64.5 24.5 64.9ZM23.9 63.4 23.3 63.1 24 63.2 23.9 63.4ZM22.3 62.7 21.7 62.5 22.1 62.3 22.3 62.7ZM100.3 61.2 100.7 61.6 101.7 61.5 103.5 62.8 104.4 63 104.3 63.3 105.8 63.7 105 64.1 102.2 64.1 102.9 63.6 101.9 63.3 101.3 62.4 100.7 62.4 97.2 61.3 95.9 62.1 95 62.1 96.2 61.2 97.7 60.8 100.3 61.2ZM102.5 60.2 102.2 60.3 101.6 59.4 101.8 58.8 102.1 58.8 102.5 60.2ZM301.2 61.2 300.7 62 300.2 61.2 300.1 60.4 300.7 59.5 301.5 58.7 302 59 301.2 61.2ZM102.2 57.4 101.1 57.6 101 57.2 101.5 57.1 102.2 57.4ZM103 57.4 102.8 58.1 102.7 57.5 102.2 57 103 57.4ZM314.6 49.9 314.8 50.2 314.2 50.8 313.8 50.5 313.3 50.7 313 51.3 312.4 51 312.9 49.9 313.5 50.1 313.9 49.6 314.6 49.9ZM214.6 48.3 214 49 213 49.4 212.3 48.9 214.6 48.3ZM203.7 48.3 204.2 48.6 206.3 48.7 206.2 49 204.7 49.1 203.5 48.7 203.7 48.3ZM195.5 45.8 195.1 47.4 193.8 46.9 192.4 46.4 192.6 45.9 195.5 45.8ZM189.2 42.8 189.8 43.5 189.7 44.8 188.8 45.1 188.4 44.8 188.2 43 189.2 42.8ZM321 46.9 320.6 47.7 320.8 48.2 320.3 48.9 317.2 49.4 315.8 50.5 315.1 50.2 315.1 49.4 311 50.1 312 50.9 311.3 52.5 310.7 53 310.2 52.6 310.4 51.7 309.4 50.7 310.4 50.4 312.6 48.6 314.6 48.3 315.7 48.5 316.7 46.7 317.4 47.2 318.9 46.2 320.1 44.6 319.9 43.4 320.3 42.8 321.4 42.6 321.9 44 321.9 44.8 321 45.8 321 46.9ZM189.6 41.8 189.2 42.6 188.5 41.7 189.4 41 189.6 41.8ZM323.9 39.8 324.6 40 325.3 39.6 325.5 40.7 324.1 41 323.2 42 321.6 41.3 321.1 42.4 320 42.4 319.8 41.4 320.3 40.7 321.4 40.6 322 38.4 323.1 39.5 323.9 39.8ZM116.3 37.4 118 37.6 117.1 38 115.9 37.6 115.6 37.3 116 37 116.3 37.4ZM118.2 34.9 116.4 34.6 115.5 34.1 115.8 34 118.2 34.9ZM56.5 35.5 54.3 35.2 53 34.2 51.9 34 51.6 33.2 54.2 33.7 56.1 34.9 56.5 35.5ZM123.9 33.3 123.2 34.2 123.9 33.8 124.5 34.1 124.2 34.4 125.1 34.7 125.5 34.4 126.5 34.8 126.2 35.5 126.9 35.3 127.4 36.5 126.9 37.3 125.8 37.2 125.8 36.2 124.6 37.1 124 37.1 124.7 36.6 123.7 36.4 120.7 36.4 120.6 36.1 121.2 35.7 120.8 35.5 121.6 34.9 122.6 33.3 124.1 32.4 124.6 32.4 123.9 33.3ZM47.3 30 48.3 29.9 48 31 48.8 31.8 48.4 31.8 46.9 30.6 46.8 29.8 47.3 30ZM323.6 33.3 324.7 35 323.2 34.7 322.6 36.1 323.5 37.2 323.5 37.9 322.7 37.3 322.1 38 322.1 34.4 322.2 33 321.6 32.1 321.7 30.7 322.6 30.2 322.2 29.8 322.7 29.6 323.6 33.3ZM173.2 31.7 171.4 32.3 170 32.2 170.8 31.1 170.3 30.1 172.4 28.9 173.3 28.8 174.3 29.4 173.8 30.1 174 30.8 173.2 31.7ZM192.7 28.4 192.1 29.2 191 28.6 190.9 28.2 192.4 27.9 192.7 28.4ZM27 26.9 26 27.3 25.5 27 25.3 26.5 26.2 26.2 26.8 26 27.9 26.4 27 26.9ZM177 25.4 175.9 26.4 178 26.3 177.8 27.1 176.9 28 177.9 28.1 178.9 29.4 179.6 29.5 180.5 31.1 181.7 31.3 181.6 31.9 181.1 32.2 181.4 32.7 180.6 33.2 177 33.3 176.4 33.8 174.8 34 174.2 33.8 175.7 32.8 176.6 32.6 175 32.4 174.7 32 175.8 31.7 175.2 31.2 175.4 30.5 176.9 30.6 177.1 30 176.4 29.4 175.2 29.2 174.9 28.9 175.3 28.5 175 28.2 174.4 28.7 174.4 27.7 173.9 27.2 174.2 26.2 175 25.4 177 25.4ZM14.4 24.1 12.5 23.8 14.3 23.7 14.4 24.1ZM100.7 21.8 100.3 22.4 99.7 21.9 100.1 21.6 100.7 21.8ZM98.1 21.3 96.9 21.8 96.2 21.8 96 21.5 96.7 21.1 98.1 21.3ZM8.3 20.2 11.3 20.7 10.5 21 9.3 20.6 8.4 20.7 8.3 20.2ZM94.8 18.3 95 18.8 95.5 18.6 98.4 19.5 98.4 20 99.2 19.9 99.9 20.3 99 20.6 97.5 20.3 96.9 19.9 94.5 20.9 94.1 20.4 92.8 20.5 93.6 20 94.1 18.3 94.8 18.3ZM165.5 17.5 165.3 18.2 166.4 18.9 165.1 19.6 161.3 20.5 157.2 20 158.2 19.6 156 19.1 157.8 18.9 157.8 18.6 155.7 18.4 156.3 17.7 157.9 17.6 159.4 18.3 160.9 17.7 162.2 18 163.8 17.5 165.5 17.5ZM104.1 16.9 103 16.9 102.8 16.4 103.2 15.9 104.1 15.7 104.9 16 104.8 16.6 104.1 16.9ZM5 17.4 5.7 17.7 5.4 16.9 8.1 17.1 10.1 18 9.1 18.5 7.5 18.6 7.4 19.5 7 19.7 4 19.1 3.8 18.6 1.6 18.6 1.1 18.3 1.3 17.9 0.1 18.1 0.6 18.6 0 19 0 15 5.1 16.8 5 17.4ZM84.4 14.9 83.7 15.2 81.6 15 80.2 14.6 81.1 14.3 81.8 13.9 84.4 14.9ZM360 13.2 358.9 13.2 358.7 12.9 360 12.5 360 13.2ZM1.3 13.1 0 13.2 0.1 12.4 1 12.4 2.4 12.7 1.3 13.1ZM89.5 14.5 89.4 15.5 90.8 14.7 92 15.4 91.7 16.1 92.6 16.8 94.4 15.2 94.5 14.1 97.4 14.3 98.7 14.8 98.8 15.3 98 15.9 98.7 16.4 98.6 16.9 96.7 17.6 94.2 17.4 92.7 19.2 91.5 19.9 90.1 20 89.3 20.4 89.2 21 88.1 21.2 86.8 22 85.4 23.9 85.3 25.1 86.8 25.2 87.7 26.9 89.1 26.7 91 27.1 95 28.7 97.7 28.9 97.9 30.7 98.6 31.8 100.1 32.8 100.9 32.5 101.4 31.4 100.9 29.9 100.2 29.3 101.8 28.9 103.5 27.5 103.4 26.8 102.7 25.9 101.5 25.2 102.7 24.1 101.9 21.7 102.6 21.4 105.3 21.8 106.2 21.6 108.6 22.9 110.4 22.9 110.7 25 112.4 25.8 113.8 25.2 115.4 23.7 118.6 27 118.2 27.7 120.4 28.8 122.7 29.4 123.1 30.2 124.2 30.7 124.3 31.9 122.9 32.6 121.2 32.9 120 33.8 113.6 33.8 112.8 34.5 111.5 34.9 108.9 37.2 109.7 37 111.3 35.7 113.4 34.9 114.9 34.8 115.8 35.3 114.9 35.9 115.5 37.8 116.8 38.3 118.5 38.1 119.5 37 119.6 37.7 120.2 38.1 116.7 39.3 114.6 40.5 113.9 40.4 113.8 39.5 115.6 38.7 112.9 38.9 113 39.2 112 39.7 109.9 40.3 109.2 41.1 109.5 42.2 109.9 42.2 109.8 41.9 110 42.4 107.1 42.8 106.3 43.1 108.1 43.1 106.7 43.4 106 43.2 105.7 43.5 106 43.6 105.8 44.3 105.1 45.1 104.5 44.5 104.9 45.6 104.1 46.8 104.3 46.1 103.8 45.7 103.7 44.8 103.7 45.9 103 45.8 103.7 46.1 103.7 47 104 47.1 104.3 48.4 103.6 49.2 101.4 50.1 98.7 52.6 98.5 53.3 99.9 57.1 99.6 58.8 98.8 58.8 97.1 56.1 97.1 54.9 95.9 53.9 94.9 54.4 93.6 53.6 90.8 53.7 90.4 53.8 90.8 54.7 89.8 54.9 89.1 54.9 88.4 54.3 86.8 54.2 85.3 54.5 83.4 55.7 82.6 56.6 82.9 58.1 82.3 59.7 82.1 61.6 83.7 64.7 85.6 65.9 88.6 65.1 89.2 64.7 89.7 63 90.4 62.7 93.2 62.7 93.2 63.2 92.6 63.7 92.2 65.7 91.7 65.5 91.8 67 91.1 68.1 91.9 68.3 95 68 96.9 69 96.1 72.6 97.8 75 98.6 75.2 101 74.4 103.2 75.4 104.3 74.6 104.5 73.4 105.1 72.9 106.6 72.8 108.2 71.6 108.9 71.9 108.6 72.5 108.1 72.6 108.4 73.6 107.9 74.1 108.3 74.9 108.7 74.9 109 74.1 108.6 73.8 108.6 73 109.8 72.6 109.7 72.2 110.1 71.8 110.4 72.5 111.1 72.6 111.8 73.4 113.8 73.4 115.1 73.9 115.7 73.4 118.1 73.3 117.3 73.6 117.6 74.1 118.4 74.1 119.2 74.6 119.3 75.4 120.9 76 121.5 76.7 121.5 77.2 122.9 78 126 78.2 128.7 79.8 129.5 82.1 130 82.3 130.1 83 129.3 83.8 129.6 84.1 131.4 84.2 131.4 85.2 132.2 84.6 135.1 85.6 135.6 86.1 135.4 86.7 136.6 86.4 140 86.9 142.8 88.8 144.4 89.1 145.3 91.3 144.9 93 141 97.8 141.1 99.7 140.7 101.9 140.2 103.6 139.2 104.9 139.1 105.9 138.2 106.4 138 107 135.4 107.4 133.5 108.1 132.4 108.9 131.5 109.9 131.1 112.7 130.4 113.2 129.3 115 127.7 116.2 127.3 117.2 126.2 118.4 125.1 119 123.8 118.9 122.9 118.4 122.2 118.5 121.6 117.9 121.5 118.4 122.8 119.3 122.6 120 123.3 120.4 123.2 120.9 122.3 122.2 120.8 122.7 117.7 122.8 117.9 124.7 116.2 125.2 115.3 124.8 114.9 125.1 115 126.1 115.7 126.4 116.2 126 116.5 126.6 114.8 127.5 114.4 129 113.5 129 112.7 129.6 112.4 130.3 113.4 131 114.4 131.2 114 132.1 112.8 132.7 112.2 133.9 110.9 134.7 111.2 135.8 111.8 136.3 110.5 136.3 109.2 136.9 109 137.8 108.6 137.9 105.1 136.3 104.7 135.6 105 135 104.5 134.4 104.4 132.7 104.8 131.7 105.9 130.9 104.4 130.6 105.3 129.8 105.6 128.1 106.8 128.5 107.3 126.4 106.6 126.1 106.3 127.4 105.7 127.2 106.3 123.9 106.8 123.3 106.4 121.2 106.8 121.1 108.6 116.4 108.3 114.9 108.5 112.9 109.1 111.6 109.9 105.4 109.6 102.3 104 98.6 101 92.4 100.2 91.2 98.8 90.1 99.1 89.7 98.6 88.7 100.2 86.7 100 86.2 99.6 86.7 99 86.2 99.1 85.1 100 83.6 99.9 83.2 101.1 82.6 101.3 81.7 102.1 81.3 102.9 80.2 102.5 79.9 102.7 78.2 102.5 77.3 101.8 76.5 101.8 75.7 100.9 75 100.4 75.1 99.5 75.9 100 76.5 99.1 76.8 98.9 76.2 98.5 76.3 98.3 75.9 96.5 75.6 96.4 74.9 95 73.9 94.9 74.4 94.3 74.1 94.3 72.9 92.3 71.1 92.7 71 92.5 70.7 91.5 70.8 88.3 69.9 86.6 68.4 85.3 67.8 83.4 68.3 76.5 65.7 74.5 64.1 74.3 63.6 74.6 63.5 74.7 62.6 74 61.2 71.6 58.8 70.7 58.4 70.7 57.6 69.6 56.8 69.4 56.1 68.8 56.1 68.2 55.5 66.8 53.2 66.9 52.8 66.1 52.4 65.2 52.2 65.3 53.8 68.4 57.3 69.3 59.7 69.8 59.7 70.6 60.6 70 61.2 69.1 60 67.8 59.3 67.7 58 64.9 56.3 65.4 56.3 65.8 55.4 64.5 54.4 62.7 51 61.5 50 59.4 49.4 59.3 48.8 58.3 47.8 55.6 43.7 55.8 42 55.5 41.2 56.1 38.5 55.3 35.8 56.9 36 57.4 36.9 57.7 36.6 57.2 35 54.4 33.6 52.6 33.2 52 32.3 52.1 31.7 50.9 31.2 50.7 30.4 49.5 29.7 49.5 29.2 48 28.5 47.8 27.6 46.5 26.8 45.9 25.9 43.4 25.8 40.1 24.5 37.4 23.9 36 24 32.9 23.1 31.8 23.3 32 24 28.3 24.8 28.1 24.3 28.6 23.3 29.7 23 29.4 22.7 26 24.6 26.7 25.1 25.8 25.9 23.7 26.6 23.4 27 21.9 27.5 21.6 28 15.2 29.6 15.1 29.4 18.2 28.1 19.4 28 21.3 27 22.3 26.4 22.4 25.7 23 25.1 21.5 25.2 20.9 25.6 20.3 25.1 20 25.4 19.6 24.9 18 25.3 18.1 24.4 17.5 24 16.2 24.2 14.7 23.5 14.6 22.9 13.9 22.5 15.4 20.9 16.9 20.9 19.2 20.2 18.5 19.6 19.2 19.2 17.2 19.7 16.5 19.4 15 19.6 13.6 19.3 11.9 18.3 15.5 17.4 16.3 17.4 16.2 17.9 18.3 17.9 15.6 16.4 13.2 15.6 13.8 15.1 15.6 15.1 18.1 13.7 21.9 13.2 23.4 12.6 25.7 13.3 27.8 13.2 29.3 13.6 35.1 14 36.4 13.8 43.5 15.1 45.6 14.4 47.1 14.5 50.2 13.8 50.9 14.2 51.6 14 51.9 13.5 54.2 14.5 55.6 13.8 55.7 14.6 57.3 14.1 58.5 14.2 62.4 15 64.8 15.1 66.1 15.6 64.7 16.1 66.5 16.3 70.1 16 71.1 16.6 72.2 16.1 71.2 15.7 71.8 15.3 73.8 15.2 75.7 16 76.8 15.9 78.5 16.4 81.6 16.2 81.4 15.6 82.3 15.4 83.9 15.8 83.9 16.7 84.5 15.9 85.3 15.9 85.8 14.9 83.5 13.9 83.6 12.8 84.8 12.1 86.1 12.2 87.1 12.7 88.5 13.8 87.6 14.3 89.5 14.5ZM65.8 10.9 65.3 11.3 67.6 11 68.9 11.5 70.1 11 71 11.4 71.8 12.3 72.3 11.9 71.6 10.9 73.5 10.9 74.6 11.3 75.5 13 79 14 78.9 14.4 77.3 14.5 77.9 14.9 77.6 15.2 72.9 14.9 66.7 15.5 66.1 15 63.9 14.8 62.7 14 67.6 13.6 62.1 13.5 61.6 13.1 63.9 12.7 60.6 12.4 62.1 11.3 64.8 10.7 65.8 10.9ZM75.5 10.6 74.6 11.2 73.1 10.5 73.4 10.4 75.5 10.6ZM103.7 10.9 103.7 11.2 100.2 11.2 99.1 10.7 99.6 10.2 101.9 10.3 103.7 10.9ZM93.4 10.8 94.2 11.5 95.1 10.7 97.7 10.2 99.4 11.3 99.3 11.9 102.2 11.3 105.8 12.2 105.9 12.7 107.8 12.4 108.8 13.1 112.1 13.9 113 14.8 111.2 15.3 115.1 16.2 116.6 17.1 118.1 17.1 117.8 17.8 116.1 19 113.3 17.6 112 17.7 111.9 18.3 114.7 19.6 115.3 20.6 115 21.3 111.2 20.3 113.7 21.7 113.8 22.1 109 21.1 107.8 20.6 108.1 20.3 105.2 19.3 105.2 19.6 102.3 19.8 101.4 19.4 102.1 18.7 106 18.5 105.7 18.2 107.3 16.7 107.1 16.3 105.2 15.4 103.1 15.1 103.8 14.9 102.7 14.2 101 13.8 98.7 14.3 91.3 13.6 90.5 13.2 91.5 12.8 90.1 12.8 89.8 11.8 90.6 10.9 91.6 10.5 94.2 10.2 93.4 10.8ZM79.6 10.2 82.6 10.2 82.9 10.5 81.9 11 83.5 11.4 83.3 12.3 81.6 12.7 77.5 11.5 77.5 11.2 79.6 11.3 78.5 10.6 79.6 10.2ZM323.6 10.8 320 10.7 320.8 10.2 322.1 10.1 323.5 10.5 323.6 10.8ZM86.8 11.2 85.7 12 84.6 11.9 84 11.1 84 10.6 84.5 10.1 89.5 10.1 88 11 86.8 11.2ZM59.5 12.6 56.9 13.1 54.1 12.1 56.1 10.3 55.1 9.7 58.5 9.6 62.4 9.8 64.5 10.5 60.8 11.5 59.5 12.2 59.5 12.6ZM330.7 8.9 329.6 9.3 326.1 8.8 326.4 8.5 330.7 8.9ZM86.4 9 85.8 9.4 84.4 9.3 83.2 9.1 83.7 8.6 85.1 8.4 86.4 9ZM325.1 8.4 324.3 9.2 319 9.4 317 8.7 317.5 8.1 318.8 7.9 325.1 8.4ZM81.5 7.3 82.3 7.7 81.8 9 79.1 8.9 79.1 8.4 77.5 8.4 77.4 7.7 81.5 7.3ZM71.8 7.8 72.2 8.2 74.1 8 74.3 8.5 73.7 9 67.8 9.6 66.3 9.6 66.1 9.3 68.2 8.8 63.7 9 62.3 8.8 64.6 7.5 69.2 8.5 70.9 8.5 69.5 7.6 70.4 7.2 71.5 7.3 71.8 7.8ZM237.5 13.3 233.7 13.2 233.4 12.8 231.6 12.5 231.5 12 232.5 11.8 232.4 11.2 234.4 10.4 233.5 10.3 235.9 9.4 235.6 8.9 241.2 7.7 248.2 7.1 248.9 7.5 241.6 8.7 238.5 9.7 235.4 11.6 235.6 12.5 237.5 13.3ZM85.3 6.9 88.4 7.2 89.3 7.6 89 7.9 90.8 8.4 98.9 8.3 100.2 9.1 99.5 9.3 98.1 9.6 91.8 9.6 87.6 9.2 87.1 8.1 82.9 7.2 83.3 6.8 85.3 6.9ZM63.8 6.4 63.7 7.1 62.9 7.5 58.5 8.1 57.1 7.9 60.9 6.5 63.8 6.4ZM287 7 287.2 7.5 291.1 7.3 294.1 8.2 293.9 8.7 289.4 9.8 292.1 10.2 293 10 293.5 10.7 295.6 10.2 298.8 10.4 299 10.9 303.2 11 303.3 10.3 307 10.4 308.6 11 309.1 11.6 308.5 12 309.7 12.8 311.3 13.2 312.3 12.2 313.9 12.6 315.6 12.3 317.5 12.7 318.2 12.4 319.9 12.5 319.1 11.6 320.5 11.2 329.5 11.8 330.4 12.4 333 13.2 339 13.1 339.8 13.5 339.7 14.3 340.9 14.6 347.8 14.4 349.6 15.3 350.8 15 350 14.3 350.5 13.9 355.7 14.1 358.6 14.6 360 15 360 19 358.7 19.5 357.4 19.4 358.3 19.9 359.5 21.4 359.2 21.7 357.4 21.5 353.7 22.3 350.3 24.1 348.9 23.4 346.3 24.2 345.8 23.8 344.9 24.3 343.5 24.1 343.2 24.8 342 25.8 342.1 26.2 343.2 26.4 343.1 27.8 342.1 27.9 341.7 28.7 342.1 29.1 340.4 29.7 340 30.8 338.5 31 338.2 32.1 336.8 33 335.4 28.6 335.9 27.2 336.8 26.6 336.8 26.2 338.4 25.9 343.7 22.9 344.5 21.4 343.3 21.5 342.7 22.4 340.1 23.5 339.3 22.2 336.7 22.6 334.2 24.2 335 24.9 331.3 25.2 331.3 24.5 329.8 24.3 328.5 24.8 322.2 25 315.1 29.3 316.7 29.4 317.2 30 318.2 30.2 318.8 29.7 319.9 29.8 321.3 30.9 321.4 31.8 320.6 32.8 320.1 35.6 316.9 38.9 314.9 40.6 313.5 41.2 312.9 41.2 312.3 40.7 310.9 41.4 310.8 41.8 310.4 41.7 309.7 42.4 309.7 43.1 307.5 44.2 307.4 44.8 308.3 45.4 309.5 47.2 309.5 48.4 309.1 48.9 306.5 49.6 306.6 48.3 306.1 47.3 306.9 47.1 306.2 46.3 305.3 46.3 304.7 45.9 305.2 45.3 305.3 44.4 304.3 44.1 301.1 45.1 301.6 44.6 301.4 44.2 302.2 43.6 301.6 43.1 299 44.7 298 44.8 297.5 45.3 298.1 45.9 298.9 46.1 298.9 46.6 299.7 46.8 300.8 46.1 302.4 46.5 302.5 47.1 301.1 47.3 299.2 49.1 300.2 49.6 301.9 52.3 301.9 53.1 301.3 53.3 301.5 53.9 302.1 54.2 301.7 55.8 301.1 55.9 298.7 59.5 295.9 61.2 294.8 61.3 294.2 61.8 293.8 61.5 290.8 62.6 290.4 63.7 289.9 63.7 289.6 63 289.9 62.6 288.1 62.4 285.9 64.2 285.7 64.9 286.4 66 288.9 68.7 289.3 70.6 289.2 72.3 285.2 75.4 284.8 74.8 285.1 74.1 284.3 73.5 283.5 73.4 282.6 71.8 280.8 71.4 281 70.6 280.1 70.6 279.2 74.8 279.9 74.8 280.5 76.6 282.4 77.9 283.4 79.1 283.3 80.3 284.2 82.7 283.5 82.8 281.4 81.2 280.2 78.7 280.1 77.5 278.5 75.6 278.3 76.2 278.8 72.6 277.2 67.1 275.4 68.3 274.2 68 274.5 66.7 273.5 64.6 273.7 64.3 272.4 63.3 271.4 61.2 270.5 61.2 270.3 62.2 269 61.9 268.9 62.3 267 62.5 267 63.3 265.1 64.5 262.2 67 262.2 67.4 260.3 68.1 260 68.9 260.3 71 259.9 71.9 259.9 73.6 259.3 73.7 258.9 74.5 259.2 74.8 258.3 75.1 257.5 76 256.6 75.1 254.4 69.4 253.5 68 252.6 62.6 251.2 63.2 250.5 63.1 249.2 61.9 249.6 61.5 248.2 60.3 247.4 60.1 246.4 58.6 241.5 58.9 237.4 58.3 237 57 235.7 57 234.7 57.5 233.5 57.2 231.5 56.1 230.1 53.9 228.9 53.7 228.6 54.1 228 54 228.8 56.3 230.2 57.3 230.1 58.1 230.8 59.2 231 58 231.6 58.2 231.4 59.4 231.8 60 234 59.9 236.4 57.6 236.4 59.1 236.8 59.8 238.7 60.4 239.8 61.7 238.5 63.6 238 63.5 237.8 63.8 237.7 65.1 236.6 65.4 236.3 66.1 235.3 66.4 235.3 66.8 232.4 67.6 232.2 68.4 229.6 69.3 228.7 70 225.6 70.7 225 71.3 223.5 71.4 222.6 68.8 222.8 67.7 222.3 66.5 219.1 62.7 219.1 61.4 218.5 60.3 217.5 59.7 215.1 55.9 214.6 55.9 215 54.6 213.9 56.4 213.1 55.6 212.4 54.1 214.1 57.9 215.7 60.1 215.5 60.9 216.9 62 217.5 65.4 218.4 66 219.3 68.1 223.1 71.3 223.3 72 222.7 72.3 223.5 72.7 224.1 73.6 224.6 73.6 231.1 72 230.6 74.8 228.6 78.7 226.6 81.1 223.1 83.7 221.6 85.7 220.3 86.6 218.7 89.9 218.8 90.5 219.5 91.1 219.2 92.5 220.5 94.8 220.8 98.7 219.5 100.7 217.4 101.6 214.8 103.8 214.7 104.5 215.6 106.1 215.5 108.1 212.6 109.7 212.9 110.2 212.2 112.8 208.2 116.8 205.8 117.9 202.6 117.9 200.1 118.8 198.4 118.1 197.9 116.6 198.2 116.4 198.2 115.7 195.2 111.1 194.4 107.9 194.3 106.1 193.9 105.7 192.6 103 191.8 102.1 191.6 100.7 192.5 97.5 193.6 96 193.7 94.7 192.9 93.2 193.2 92.6 191.9 89 188.8 85.1 189.8 80.9 189.4 80.3 188.9 80.1 188.5 79.2 186.7 79.8 185.9 79.7 184.3 77.7 181.1 78.1 178 79.3 175.4 78.8 172.5 79.7 171 79.2 167.6 76.7 167.1 76.2 166.8 75.1 165.4 73.8 165.2 73.1 163.9 72.5 163.3 71.6 163.3 70.4 162.4 69.3 163.3 68.4 163.9 65.9 163.7 63.9 162.9 63 163 62.1 163.7 61.3 164 60.3 164.9 59.5 165.6 57.7 167.4 56 168.3 55.9 170.4 54.1 170.2 52.8 170.7 51.4 173.1 49.9 174.1 48.2 174.8 48.2 175.4 48.7 177.8 48.8 181.5 47.4 185.3 47.3 186.3 46.9 188.4 47.1 189.5 46.6 190.2 46.8 190.2 47.3 191.1 47.1 190.6 47.6 190.8 49.2 190.1 49.7 190.3 50.2 190.9 50.2 191.5 50.9 195.2 51.7 195.7 52.6 199.1 53.7 200.1 53 199.8 52.2 200.1 51.8 201.5 51.2 202.9 51.4 203.2 51.8 205.2 52.4 206.5 52.4 208.9 53.1 211 52.4 211.7 52.6 212 53.1 212.2 52.7 213.8 53 214.6 52.5 216 49.4 216.1 48.2 215.8 47.7 216.2 47.3 214.7 47.2 214 47.8 212.5 47.9 211.7 47.4 210.6 47.3 210.4 47.7 209.7 47.9 208.7 47.3 207.6 47.3 206.3 45.8 206.8 45 206.2 44.5 207.3 43.6 208.8 43.5 209.2 42.8 211.1 42.9 213.5 42 215.2 42 218.3 43.1 220.4 43 221.6 42.5 221.7 42 220.9 41 216.7 38.8 217.4 38.6 218.2 37.8 217.7 37.4 219.1 37 219.1 36.7 215 37.7 215 38.3 215.5 38.6 216.5 38.5 216.3 38.9 213.9 39.6 213.3 39.4 213.5 39 212.5 38.7 213.6 38.1 211.7 37.7 211.7 37.3 210.7 37.4 209.6 39 208.8 39.1 208.6 40.3 207.7 41.4 208.1 42.4 209 42.7 208.8 42.9 207.6 43 206.4 43.8 206.1 43.2 205.4 43.1 203.7 43.3 204.4 43.9 203.3 44 202.8 43.5 202.6 43.7 203.4 44.8 203 45 204 45.8 204 46.3 203.1 46.1 203.4 46.6 202.8 46.7 203.2 47.6 202.5 47.6 201.7 47.2 201.1 45.7 199.4 43.7 199.4 42.1 196 40.5 195.2 39.8 195.4 39.7 194.9 38.9 194.3 38.8 194 39.2 193.7 38.9 193.9 38.4 193.1 38.3 192.3 38.6 192.6 39.9 195.1 42 195.9 42 196.2 42.3 195.9 42.5 198.5 43.8 198.3 44.2 197.7 43.7 196.9 43.6 196.4 44.2 197.2 44.6 197.1 45.1 196.6 45.2 196.1 46 195.7 46.1 196.1 45 195.4 44 193.6 42.8 192.1 42.3 190.5 41.1 190.2 40.1 188.9 39.6 186.5 40.9 184.6 40.6 183.1 40.9 183 42.1 182.1 42.8 180.8 43 179.7 44.7 180.1 45.3 179.5 45.7 179.3 46.4 177.9 47.3 175.6 47.3 174.6 48.1 174.1 48 173.5 47.1 171.1 47.1 171.2 45.7 170.5 45.3 171.2 43.2 171 41.4 170.6 41 172 40.3 178.1 40.6 178.6 40 178.8 38 177 36.4 175.5 36 175.4 35.3 176.7 35.1 178.4 35.4 178.1 34.2 179 34.7 181.3 33.9 181.6 33.1 183.8 32.4 184.7 30.9 187.1 30.3 188.1 30.5 188.8 30 188.1 28.5 188.1 27.5 188.5 26.9 190.6 26.3 190.3 27.1 190.9 27.5 189.7 28.5 189.9 29.4 191 29.6 190.9 30 192.5 29.5 194.1 30.2 197.6 29.1 198.6 29.3 198.7 29.6 199.7 29.6 199.9 29.1 201.3 28.8 201.1 27.2 201.6 26.6 202.5 26.2 203.3 27 204.1 27 204.4 25.6 203.4 25.4 203.3 24.8 205.9 24.4 208 24.5 209.1 24 208.1 23.5 202.9 24.2 202.3 23.6 201.3 23.3 201.5 22.3 201.1 21.4 201.5 20.8 205.4 18.9 205.3 18.5 203.9 18 202.2 18.3 201.2 19 201.4 19.6 197.8 21.3 197.1 22.7 198.8 23.9 197.9 25 196.8 25.3 195.9 27.9 194.7 27.8 194.1 28.6 192.9 28.6 190.4 24.5 188.4 25.7 187 25.9 185.7 25.4 185 22 190.5 19.5 194.8 16.2 196.4 15.4 199.2 14.2 201.4 13.7 203 13.8 204.5 13 208.2 12.8 211.3 13.5 210 13.8 211.1 14.4 212.1 14.1 213.8 14.7 216.5 14.9 221.1 16.5 221.1 17.2 218.4 18 213.9 17.2 213.2 17.4 214.8 18.1 214.9 19.6 217 20.2 217.1 19.7 216.5 19.2 217.2 18.9 219.6 19.5 220.4 19.2 219.8 18.5 222.1 17.5 223.9 17.9 224.5 17.2 223.7 16.6 224.2 16 223.5 15.4 226.3 15.7 226.8 16.3 225.6 16.4 225.6 17 226.3 17.3 227.9 17.1 228.1 16.5 233.7 15.1 234.5 15.2 233.5 15.8 234.7 15.9 238.8 15.1 239.9 15.7 241.1 15.1 240 14.5 240.6 14.1 244.9 14.8 248.5 15.9 249.2 15.4 248.1 14.6 246.9 14.5 247.3 14.1 246.7 13 248.5 12.1 249.2 11.2 252.6 11.2 252.8 11.8 251.8 12.6 252.5 12.9 252.8 13.6 252.6 15 253.7 15.6 251.3 17.7 252.4 17.8 253.9 17.2 255.1 16.2 254.5 15.7 254.9 15 253.8 14.9 253.6 14.4 254.4 13.4 253.1 12.6 254.9 11.9 254.7 11.2 255.2 11.1 255.7 11.7 255.3 12.7 256.4 12.8 255.9 12.1 257.6 11.7 259.7 11.7 261.5 12.2 260.6 11.4 260.5 10.4 266.8 10.1 266 9.5 267.2 8.9 273.2 8 276.7 8.1 278.9 7.6 280.8 7.6 281 7.1 282 6.7 284.4 6.3 286.1 6.6 284.7 6.9 287 7ZM229.1 42.7 229.6 43.4 230.4 43.7 229.6 43.8 228.9 45.2 229.2 46.4 230.8 47.1 232.3 47.3 233.9 46.8 233.9 45 233.1 44.7 233.4 44 232.7 44 232.9 43.1 233.9 43.4 234.7 43 233.7 41.9 232.9 42.1 232.8 42.9 232.4 42 232.7 41.6 232.5 41.2 231.3 40.9 230.3 39.4 231.3 39.5 231.3 38.8 233 38.7 233.2 37.8 233 37.1 231.2 37 229.1 37.6 226.7 39.4 227.6 40.3 227.5 41 229.1 42.7ZM86.2 6.5 83.6 6.2 85.6 6.2 86.2 6.5ZM69.8 6.3 67.9 6.6 66.5 6.3 67.3 5.9 70.1 6 69.8 6.3ZM204.7 6.1 202.5 6.6 200.7 6.3 201.4 6.1 200.8 5.7 202.9 5.5 203.3 5.9 204.7 6.1ZM84.2 5.9 81.9 5.9 81.4 5.1 83.2 5.2 84.4 5.6 84.2 5.9ZM79.9 5.7 80.3 6.1 78.7 6 74.8 5.6 75.8 5.3 74.6 5.1 74.5 4.7 76.5 4.8 79.2 5.2 79.9 5.7ZM285.1 5.7 279.4 6.1 281.3 4.8 282.1 4.7 285.4 5.3 285.1 5.7ZM198.3 4.3 201.5 5 199 5.4 198.5 6.2 197.6 6.4 197.1 7.2 193.8 6.6 194.7 6.3 193.2 6 191.2 5.1 190.4 4.3 193.2 4 195.1 4.3 197 3.9 198.3 4.3ZM205.4 3.6 207.4 3.9 205.9 4.5 203 4.6 198.5 4.1 197.4 3.7 200.5 3.4 205.4 3.6ZM231.1 3.5 227.6 4 226.5 3.8 227.1 3.4 224.8 3.4 228.3 3.2 228.5 3.5 230 3.1 231.5 3.3 231.1 3.5ZM279.9 5.1 275 5 273.3 4.6 272.5 3.9 271.2 3.7 275.9 2.7 280.2 4.2 279.9 5.1ZM93 4.3 94.2 4.7 91 5.7 89.2 5.8 87.1 5.7 86 5.2 86.9 4.6 83.9 4.3 83.3 3.8 84.7 3.1 85.7 3 85.3 2.8 87.6 2.7 88.9 3.3 92.2 3.7 93 4.3ZM111.5 0.9 116.3 1.1 118.1 1.6 112.3 2.5 114.5 2.5 110.5 3.4 108.8 4.2 103.1 4.7 104.5 4.8 103.8 5 104.6 5.5 100.2 6.8 102.1 7.2 99.4 7.8 90.5 7.5 90.4 7 92.2 6.8 91.7 6.1 95 6.5 93.7 5.8 92 5.6 94.9 4.7 93.5 4.3 93.1 3.7 96.6 3.9 98.2 3.5 92.4 3.5 88.4 2.1 94.5 1.3 96.8 1.7 97.6 1.1 100.7 0.9 111.5 0.9ZM152.9 0.5 159.2 1.3 157.3 1.7 148.6 2 155.2 2.2 157.1 1.9 157.9 2.3 156.8 2.8 164.2 2.1 167.2 2.3 167.8 2.7 163.2 3.7 160 3.8 162.3 3.9 160.3 5.2 160.3 6.4 161.5 7 158.3 7.4 160.2 7.9 160.4 8.8 159.3 8.8 160.6 9.7 158.4 9.8 159.6 10.2 159.2 10.5 156.4 10.7 157.7 11.4 157.7 11.8 155.7 11.4 155.2 11.7 157.9 12.5 158.2 13.3 156.5 13.5 154.5 12.6 154.8 13.2 153.6 13.8 157.7 13.9 152.3 15.5 148.2 15.9 145.8 17.3 143.6 18 140.2 18.5 139.3 19.2 139.3 19.9 138.8 20.5 137.2 21.3 137.6 22.1 136.6 23.9 135.2 24 133.7 23.1 131.7 23.1 130.8 22.6 130.1 21.6 128.4 20.4 127.7 18.8 126.3 17.9 126.7 17.2 126 16.8 127 15.6 128.5 15.3 129.1 14.1 126.5 14.7 125.3 14.4 125.2 13.7 125.6 13.2 128.6 13.4 126 12.5 124.2 12.3 125.3 11.4 122.7 9.3 121.4 8.9 121.4 8.5 118.7 7.9 111.5 7.9 108.6 7 113.2 6.6 109 6.4 106.7 6 106.8 5.6 114.3 4.6 114.7 4.2 112 3.9 112.8 3.5 117.8 2.7 117.3 2.2 122.8 1.8 125.9 1.8 127 2.1 129.6 1.6 135.5 2.3 133.1 1.8 133.2 1.4 136.6 0.8 144.9 0.4 152.9 0.5Z", CG_PH = {"stanford": {"img": "/d/student-mobile/media/c2a156767654b3ff.webp", "credit": "Frank Schulenburg, Wikimedia Commons, CC BY-SA 4.0"}, "oxford": {"img": "/d/student-mobile/media/33a90f8db0ebd4ca.webp", "credit": "Julian Herzog (Website), Wikimedia Commons, CC BY 4.0"}, "eth": {"img": "/d/student-mobile/media/9ab191629e26da4b.webp", "credit": "sidonius 07:42, 20 June 2006 (UTC), Wikimedia Commons, CC BY-SA 2.5"}, "nus": {"img": "/d/student-mobile/media/2c596fe8c5a490e8.webp", "credit": "RFNirmala, Wikimedia Commons, CC BY 4.0"}, "tokyo": {"img": "/d/student-mobile/media/5e35762c14164b97.webp", "credit": "Kakidai, Wikimedia Commons, CC BY-SA 4.0"}, "toronto": {"img": "/d/student-mobile/media/60f478ccda43bd35.webp", "credit": "GoginkLobabi, Wikimedia Commons, CC BY-SA 4.0"}, "sydney": {"img": "/d/student-mobile/media/1f1ca0035c58c886.webp", "credit": "Jason Tong, Wikimedia Commons, CC BY-SA 3.0"}, "purdue": {"img": "/d/student-mobile/media/86bf62c1750e21c8.webp", "credit": "Julian Herzog (Website), Wikimedia Commons, CC BY 4.0"}};   // map: Natural Earth land (public domain), x = lon + 180, y = 84 − lat
  const CG_U = [
    { id: "mit", name: "MIT", city: "Cambridge, Massachusetts, USA", lat: 42.3601, lon: -71.0942, fact: "In 1994 students put a replica campus police car on top of the Great Dome. It's still MIT's most famous hack." },
    { id: "harvard", name: "Harvard University", city: "Cambridge, Massachusetts, USA", lat: 42.3744, lon: -71.1169, fact: "Founded in 1636, it's the oldest university in the United States." },
    { id: "purdue", name: "Purdue University", city: "West Lafayette, Indiana, USA", lat: 40.4237, lon: -86.9212, fact: "They call it the Cradle of Astronauts: Neil Armstrong and Gene Cernan, the first and last people to walk on the Moon, both studied here." },
    { id: "stanford", name: "Stanford University", city: "Stanford, California, USA", lat: 37.4275, lon: -122.1697, fact: "Students call it the Farm, because the campus was built on Leland Stanford's horse farm." },
    { id: "toronto", name: "University of Toronto", city: "Toronto, Canada", lat: 43.6629, lon: -79.3957, fact: "Insulin was discovered here in 1921–22 by Banting, Best, Macleod and Collip." },
    { id: "oxford", name: "University of Oxford", city: "Oxford, UK", lat: 51.7534, lon: -1.254, fact: "There was teaching here by 1096, which makes Oxford the oldest university in the English-speaking world." },
    { id: "cambridge", name: "University of Cambridge", city: "Cambridge, UK", lat: 52.2043, lon: 0.1165, fact: "King's College Chapel took almost 70 years to build and has the largest fan-vaulted ceiling in the world." },
    { id: "eth", name: "ETH Zurich", city: "Zurich, Switzerland", lat: 47.3763, lon: 8.548, fact: "Albert Einstein studied here and came back as a professor in 1912." },
    { id: "tum", name: "Technical University of Munich", city: "Munich, Germany", lat: 48.1497, lon: 11.5679, fact: "Its maths and informatics building in Garching has two giant slides that students ride between floors." },
    { id: "bogazici", name: "Boğaziçi University", city: "Istanbul, Türkiye", lat: 41.0839, lon: 29.0506, fact: "It grew out of Robert College, founded in 1863, the oldest American school still running outside the United States." },
    { id: "nuuz", name: "National University of Uzbekistan", city: "Tashkent, Uzbekistan", lat: 41.3504, lon: 69.202, fact: "It opened in 1918 as the Turkestan People's University, one of the first universities in Central Asia." },
    { id: "kaist", name: "KAIST", city: "Daejeon, South Korea", lat: 36.3721, lon: 127.3604, fact: "Founded in 1971, it was South Korea's first research-focused university for science and engineering." },
    { id: "tokyo", name: "University of Tokyo", city: "Tokyo, Japan", lat: 35.7126, lon: 139.7619, fact: "The red Akamon gate on its Hongo campus dates from 1827 and is one of Japan's Important Cultural Properties." },
    { id: "nus", name: "National University of Singapore", city: "Singapore", lat: 1.2966, lon: 103.7764, fact: "It traces its roots to a medical school that opened in Singapore in 1905." },
    { id: "sydney", name: "University of Sydney", city: "Sydney, Australia", lat: -33.8886, lon: 151.1873, fact: "Founded in 1850, it's Australia's oldest university." }];
  const CG_MODE = { daily: "Daily challenge", solo: "Solo", duel: "1v1", squad: "Squad" };
  const cgState = () => (S.cg = S.cg || { games: 0, best: 0, daily: {} });
  const cgDailyIds = (d = ymd(new Date())) => { const ids = []; for (let i = 0; ids.length < 5 && i < 99; i++) { const id = CG_U[hash(`cg${d}#${i}`, CG_U.length)].id; if (!ids.includes(id)) ids.push(id); } return ids; };
  const cgKm = (a, b) => { const r = Math.PI / 180, x = Math.sin((b.lat - a.lat) * r / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin((b.lon - a.lon) * r / 2) ** 2; return Math.round(12742 * Math.asin(Math.min(1, Math.sqrt(x)))); };
  const cgPts = km => Math.round(5000 * Math.exp(-km / 2000));
  const cgXY = p => [p.lon + 180, 84 - p.lat];
  const cgOppId = () => { if ((window.JG_CUTS || {}).rival) return "timur"; const r = JG_API.rival(); return r.on ? r.rival.user_id : "timur"; };
  const cgImg = u => { const src = CG_PH[u.id] || (u.id === "cambridge" ? SY_BG.bg_kings : u.id === "mit" ? { img: DOME.color, credit: DOME.credit } : PP_PHOTOS[u.id]); return src ? { img: src.img, credit: String(src.credit || "").replace(/^Photo:\s*/, "") } : null; };
  const cgNear = (u, km) => { const b = Math.random() * 2 * Math.PI, lat = Math.max(-55, Math.min(80, u.lat + km / 111 * Math.cos(b))), lon = ((u.lon + km / (111 * Math.max(.25, Math.cos(u.lat * Math.PI / 180))) * Math.sin(b) + 540) % 360) - 180; return { lat, lon }; };
  JG_API.campusGuessr = () => { const st = cgState(), d = ymd(new Date()); return { campuses: CG_U.map(({ id, name, city, lat, lon, fact }) => ({ id, name, city, lat, lon, fact })), rounds: 5, scoring: "5000 × e^(−km / 2000) points per round",
    daily: { date: d, campus_ids: cgDailyIds(d), played: st.daily[d] != null, score: st.daily[d] == null ? null : st.daily[d] }, stats: { games: st.games, best: st.best } }; };
  let CG = null;
  JG_API.cgStart = mode => { const ids = mode === "daily" ? cgDailyIds() : CG_U.map(u => u.id).sort(() => Math.random() - .5).slice(0, 5);
    CG = { id: `cg_${Date.now()}`, mode, ids, i: 0, rounds: [], opp: mode === "duel" ? { user_id: cgOppId() } : null, pin: null, ans: null, oppPin: null, vb: [0, -26, 360, 196] };
    return { game_id: CG.id, mode, rounds: ids, opponent: CG.opp }; };
  JG_API.cgGuess = (gameId, round, lat, lon) => { const u = CG_U.find(x => x.id === CG.ids[round]), km = cgKm({ lat, lon }, u); return { distance_km: km, points: cgPts(km), answer: { id: u.id, name: u.name, city: u.city, lat: u.lat, lon: u.lon, fact: u.fact } }; };
  JG_API.cgLeaderboard = (scope = "daily") => { const d = ymd(new Date()), st = cgState(), P = PPL2(), me = JG_API.squad().members.find(m => m.user_id === "me") || {};
    const ids = scope === "squad" ? JG_API.squad().members.filter(m => m.user_id !== "me").map(m => m.user_id) : ["madina", "sardor", "dilnoza", "timur", "asadbek", "nilufar", "lg0", "lg1", "lg2"].filter(w => P.PEOPLE[w]);
    const rows = ids.map(w => ({ user_id: w, first_name: firstN(w), avatar: P.AV[w] || "", score: 8000 + hash(`${scope}${d}${w}${scope === "squad" && CG ? CG.id : ""}`, 13000) }));
    const mine = scope === "daily" ? st.daily[d] : CG && CG.mode === "squad" ? CG.rounds.reduce((a, r) => a + r.points, 0) : null;
    if (mine != null) rows.push({ user_id: "me", first_name: "You", avatar: me.avatar || "", score: mine }); return rows.sort((a, b) => b.score - a.score); };
  function cgOpen() {
    const el = layer("cg-view", "zq-view cg-view"), st = JG_API.campusGuessr(); el.setAttribute("aria-label", "CampusGuessr");
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-cg="close" aria-label="Close">‹</button><p class="dg-tt">CampusGuessr</p><span class="dg-timer">📍</span></div><div class="zq-body">
      <div class="cg-hero"><b>Where in the world is this campus?</b><small>A real campus photo. Drop a pin on the map: the closer you are, the more points. 5 rounds, up to 25,000 points.</small></div>
      ${[["daily", "📅", "Daily challenge", st.daily.played ? `Played today · ${st.daily.score.toLocaleString("en-US")} pts` : "Same 5 campuses for everyone today"], ["solo", "🎯", "Solo", "5 random campuses"], ["duel", "⚔️", "1v1", `Against ${firstN(cgOppId())}`], ["squad", "👥", "With your squad", "Same 5 campuses, one leaderboard"]]
        .map(([m, ic, t, sub]) => `<button type="button" class="jc-row cg-mode" data-cg="start" data-m="${m}"><span class="jc-ic">${ic}</span><span><b>${t}</b><small>${esc(sub)}</small></span><em class="jc-in">${m === "daily" && st.daily.played ? "Results" : "Play"}</em></button>`).join("")}
      <p class="zq-note">Best game: ${st.stats.best.toLocaleString("en-US")} pts · ${st.stats.games} game${st.stats.games === 1 ? "" : "s"} played</p></div>`;
    el.onclick = cgClick;
  }
  function cgRound() {
    const el = $("cg-view"), u = CG_U.find(x => x.id === CG.ids[CG.i]), ph = cgImg(u), total = CG.rounds.reduce((a, r) => a + r.points, 0); CG.pin = null; CG.ans = null; CG.oppPin = null;
    el.querySelector(".zq-body").innerHTML = `<div class="cg-top"><b>Round ${CG.i + 1} / 5</b><span>${total.toLocaleString("en-US")} pts</span></div>
      <div class="cg-ph">${ph ? `<img src="${ph.img}" alt="A university campus somewhere in the world">` : ""}<small class="cg-chip">${CG_MODE[CG.mode]}</small></div>
      <div class="cg-mapbox"><svg class="cg-map" id="cg-map" viewBox="0 -26 360 196" preserveAspectRatio="xMidYMid meet" role="img" aria-label="World map. Tap to drop your pin."><rect class="cg-sea" x="-20" y="-60" width="400" height="300"/><path class="cg-land" d="${CG_MAP}"/><g id="cg-marks"></g></svg>
        <div class="cg-zoom"><button type="button" data-cg="zin" aria-label="Zoom in">+</button><button type="button" data-cg="zout" aria-label="Zoom out">−</button></div></div>
      <button type="button" class="dg-go" data-cg="guess" id="cg-guess" disabled>Tap the map to drop your pin</button><div class="cg-after" id="cg-res"></div>`;
    cgSetView(180, 72, 360); $("cg-map").addEventListener("click", cgTap);
  }
  function cgSetView(cx, cy, w) { const h = w * 196 / 360, x = Math.max(0, Math.min(360 - w, cx - w / 2)), y = Math.max(-26, Math.min(170 - h, cy - h / 2)); CG.vb = [x, y, w, h]; const m = $("cg-map"); if (m) m.setAttribute("viewBox", CG.vb.map(v => +v.toFixed(2)).join(" ")); cgDraw(); }
  function cgDraw() {
    const g = $("cg-marks"); if (!g) return; const r = CG.vb[2] / 360 * 4.4, dot = (p, c) => { const [x, y] = cgXY(p); return `<circle class="${c}" cx="${x}" cy="${y}" r="${r}"/>`; }, line = (a, b, c) => { const [x1, y1] = cgXY(a), [x2, y2] = cgXY(b); return `<line class="cg-line${c}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`; };
    g.innerHTML = (CG.ans && CG.oppPin ? line(CG.oppPin, CG.ans, " opp") + dot(CG.oppPin, "cg-opp") : "") + (CG.ans && CG.pin ? line(CG.pin, CG.ans, "") : "") + (CG.pin ? dot(CG.pin, "cg-pin") : "") + (CG.ans ? dot(CG.ans, "cg-ans") : "");
  }
  function cgTap(e) {
    if (!CG || CG.ans) return; const m = $("cg-map"), pt = m.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const p = pt.matrixTransform(m.getScreenCTM().inverse());
    if (p.y < 0 || p.y > 142) return; CG.pin = { lat: +(84 - p.y).toFixed(3), lon: +(p.x - 180).toFixed(3) }; cgDraw(); const b = $("cg-guess"); if (b) { b.disabled = false; b.textContent = "Guess"; }
  }
  const cgZoom = f => { const w = Math.max(22.5, Math.min(360, CG.vb[2] * f)), c = CG.pin && f < 1 ? cgXY(CG.pin) : [CG.vb[0] + CG.vb[2] / 2, CG.vb[1] + CG.vb[3] / 2]; cgSetView(c[0], c[1], w); };
  function cgGuessNow() {
    const u = CG_U.find(x => x.id === CG.ids[CG.i]), r = JG_API.cgGuess(CG.id, CG.i, CG.pin.lat, CG.pin.lon); CG.ans = { lat: u.lat, lon: u.lon }; let opp = null;
    if (CG.mode === "duel") { CG.oppPin = cgNear(u, Math.round(-850 * Math.log(1 - Math.random() * .96))); const km = cgKm(CG.oppPin, u); opp = { km, points: cgPts(km) }; }
    CG.rounds.push({ id: u.id, km: r.distance_km, points: r.points, opp });
    const P = [CG.pin, CG.ans].concat(CG.oppPin ? [CG.oppPin] : []).map(cgXY), xs = P.map(p => p[0]), ys = P.map(p => p[1]);
    cgSetView((Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2, Math.min(360, Math.max(36, (Math.max(...xs) - Math.min(...xs)) * 1.5, (Math.max(...ys) - Math.min(...ys)) * 1.6 * 360 / 196)));
    const ph = cgImg(u), jam = window.JG_jamolAv, mood = r.points >= 4000 ? "yay" : r.points >= 1500 ? "ok" : "meh"; $("cg-guess").remove();
    document.querySelector("#cg-view .cg-top span").textContent = `${CG.rounds.reduce((a, x) => a + x.points, 0).toLocaleString("en-US")} pts`;
    $("cg-res").innerHTML = `<div class="cg-res"><span class="cg-score" style="--p:${r.points / 50}"><b>${r.points.toLocaleString("en-US")}</b><small>pts</small></span><span class="cg-rt"><b>${r.distance_km.toLocaleString("en-US")} km away</b><small>${esc(u.name)} · ${esc(u.city)}</small>${opp ? `<small class="cg-oppl">${esc(firstN(CG.opp.user_id))}: ${opp.km.toLocaleString("en-US")} km · ${opp.points.toLocaleString("en-US")} pts</small>` : ""}</span>${jam ? `<img class="cg-jam ${mood}" src="${jam}" alt="">` : ""}</div>
      <p class="cg-fact">💡 ${esc(u.fact)}</p><div class="cg-acts"><button type="button" class="dg-go" data-cg="next">${CG.i < 4 ? "Next round" : "See your results"}</button>${CG_EX.includes(u.id) ? `<button type="button" class="dg-link" data-cg="explore" data-id="${u.id}">See ${esc(u.name)} in Explore</button>` : ""}</div>${ph ? `<p class="cg-cr">Photo: ${esc(ph.credit)}</p>` : ""}`;
  }
  function cgBoardHTML(scope) { const rows = JG_API.cgLeaderboard(scope), k = rows.findIndex(r => r.user_id === "me");
    return `<div class="cg-board"><b class="jr-next-h">${scope === "daily" ? "Today's daily · people you know" : "Your squad · same 5 campuses"}</b>${rows.slice(0, 7).map((r, i) => `<div class="cg-brow${r.user_id === "me" ? " me" : ""}"><span>${i + 1}</span>${r.avatar ? `<img src="${r.avatar}" alt="">` : ""}<b>${esc(r.first_name)}</b><em>${r.score.toLocaleString("en-US")}</em></div>`).join("")}
      ${k >= 7 ? `<p class="zq-note">You're #${k + 1}.</p>` : ""}${scope === "daily" ? `<p class="zq-note">${(1180 + hash(ymd(new Date()), 400)).toLocaleString("en-US")} students played today's daily.</p>` : ""}</div>`; }
  function cgEnd() {
    const st = cgState(), total = CG.rounds.reduce((a, r) => a + r.points, 0), jam = window.JG_jamolAv; st.games++; st.best = Math.max(st.best, total); if (CG.mode === "daily") st.daily[ymd(new Date())] = total; save(); gnPaint();
    let extra = ""; if (CG.mode === "duel") { const ot = CG.rounds.reduce((a, r) => a + r.opp.points, 0), n = esc(firstN(CG.opp.user_id)); extra = `<div class="cg-duel${total > ot ? " won" : ""}"><b>${total > ot ? "You win!" : total === ot ? "It's a draw!" : `${n} wins this one`}</b><span>You ${total.toLocaleString("en-US")} · ${n} ${ot.toLocaleString("en-US")}</span></div>`; }
    if (CG.mode === "squad" || CG.mode === "daily") extra = cgBoardHTML(CG.mode);
    $("cg-view").querySelector(".zq-body").innerHTML = `<div class="cg-final"><small class="dz-kicker">${CG_MODE[CG.mode]} · final score</small><b>${total.toLocaleString("en-US")}</b><small>out of 25,000 points</small>${jam ? `<img class="cg-jam ${total >= 15000 ? "yay" : total >= 8000 ? "ok" : "meh"}" src="${jam}" alt="">` : ""}</div>${extra}
      <ol class="cg-rounds">${CG.rounds.map(r => { const u = CG_U.find(x => x.id === r.id); return `<li><b>${esc(u.name)}</b><span>${r.km.toLocaleString("en-US")} km · ${r.points.toLocaleString("en-US")} pts</span></li>`; }).join("")}</ol>
      ${CG.mode === "daily" ? `<p class="zq-note">Everyone got the same 5 campuses today. New ones tomorrow.</p>` : ""}
      <button type="button" class="dg-go" data-cg="start" data-m="${CG.mode === "daily" ? "solo" : CG.mode}">${CG.mode === "daily" ? "Play a solo game" : "Play again"}</button><button type="button" class="dg-link" data-cg="modes">All modes</button>`;
  }
  function cgDailyDone() { const sc = cgState().daily[ymd(new Date())];
    $("cg-view").querySelector(".zq-body").innerHTML = `<div class="cg-final"><small class="dz-kicker">Today's daily · done</small><b>${sc.toLocaleString("en-US")}</b><small>New campuses tomorrow</small></div>${cgBoardHTML("daily")}<button type="button" class="dg-go" data-cg="start" data-m="solo">Play a solo game</button><button type="button" class="dg-link" data-cg="modes">All modes</button>`; }
  function cgExplore(id) { $("cg-view").hidden = true; const t = document.querySelector('#tb-track button[data-i="1"]'); if (t) t.click(); setTimeout(() => { const c = document.querySelector('.ex-cat[data-cat="uni"]'); if (c && c.getAttribute("aria-pressed") !== "true") c.click(); }, 300); }
  function cgClick(e) {
    const b = e.target.closest("[data-cg]"); if (!b) return; const a = b.dataset.cg;
    if (a === "close") $("cg-view").hidden = true; else if (a === "modes") cgOpen();
    else if (a === "start") { if (b.dataset.m === "daily" && cgState().daily[ymd(new Date())] != null) return cgDailyDone(); JG_API.cgStart(b.dataset.m); cgRound(); }
    else if (a === "zin") cgZoom(.5); else if (a === "zout") cgZoom(2); else if (a === "guess") { if (CG.pin && !CG.ans) cgGuessNow(); }
    else if (a === "next") { CG.i++; if (CG.i >= 5) cgEnd(); else cgRound(); } else if (a === "explore") cgExplore(b.dataset.id);
  }
  GN_TILES.push({ id: "campus", icon: "📍", name: "CampusGuessr", sub: () => { const d = JG_API.campusGuessr().daily; return d.played ? `Today: ${d.score.toLocaleString("en-US")} pts` : "Today's daily is live"; }, open: cgOpen });

  /* ================= JG LIVE: the Friday 20:00 quiz show, plus 1v1 trivia battles ================= */
  const JL_Q = [
    ["football", "Which country won the 2022 FIFA World Cup?", ["France", "Argentina", "Brazil", "Croatia"], 1],
    ["geography", "What is the capital of Australia?", ["Sydney", "Melbourne", "Canberra", "Perth"], 2],
    ["music", "How many keys does a standard piano have?", ["72", "88", "96", "104"], 1],
    ["movies", "In The Lion King, what is the name of Simba's father?", ["Scar", "Rafiki", "Mufasa", "Zazu"], 2],
    ["sat", "If 3x + 5 = 20, what is x?", ["3", "5", "15", "25/3"], 1],
    ["football", "Which club has won the most UEFA Champions League titles?", ["AC Milan", "Bayern Munich", "Liverpool", "Real Madrid"], 3],
    ["geography", "Which is the longest river in Africa?", ["Congo", "Niger", "Nile", "Zambezi"], 2],
    ["movies", "Who directed Inception and Interstellar?", ["Christopher Nolan", "Steven Spielberg", "James Cameron", "Denis Villeneuve"], 0],
    ["music", "Which K-pop group released the song Dynamite in 2020?", ["BLACKPINK", "EXO", "BTS", "TWICE"], 2],
    ["sat", "Which word is closest in meaning to “ubiquitous”?", ["Rare", "Found everywhere", "Ancient", "Hidden"], 1],
    ["football", "Which country hosted the 2018 FIFA World Cup?", ["Qatar", "Brazil", "Germany", "Russia"], 3],
    ["geography", "Uzbekistan is doubly landlocked. Which is the only other doubly landlocked country?", ["Switzerland", "Liechtenstein", "Andorra", "Mongolia"], 1],
    ["movies", "Which was the first film not in English to win the Oscar for Best Picture?", ["Roma", "Parasite", "Amélie", "Life Is Beautiful"], 1],
    ["music", "Who composed the Moonlight Sonata?", ["Mozart", "Bach", "Beethoven", "Chopin"], 2],
    ["sat", "What is 15% of 80?", ["8", "12", "15", "20"], 1],
    ["sat", "A circle has a radius of 3. What is its area?", ["6π", "9π", "3π", "12π"], 1],
    ["football", "How many players does each team have on the pitch?", ["9", "10", "11", "12"], 2],
    ["geography", "Which is the largest ocean?", ["Atlantic", "Indian", "Arctic", "Pacific"], 3]];
  const JL_TOPIC = { football: "⚽ Football", movies: "🎬 Movies", music: "🎵 Music", geography: "🌍 Geography", sat: "📝 SAT" }, JL_POT = 20000;
  const JL_SAY = { football: "Football fans, this one's yours.", movies: "Movie time. Think fast.", music: "Let's talk music.", geography: "Grab your mental map.", sat: "A little SAT warm-up. You've got this." };
  const JL_NAMES = ["Aziz", "Malika", "Rustam", "Zarina", "Bobur", "Shahzoda", "Otabek", "Kamola", "Javohir", "Sevara"];
  const JL_CHAT = ["Let's goooo 🔥", "Good luck everyone!", "Easy one 😎", "Nooo I'm out 😭", "The pot is huge today", "Who's still in?", "GG 👏", "Knew it!!", "That was tricky 😅", "Hi from Samarkand 👋", "Hi from Namangan!", "Aziza ustoz 🙌"];
  const jlMs = ms => ms * (window.JG_FAST || 1);
  const jlNext = (now = new Date()) => { const d = new Date(now); d.setHours(20, 0, 0, 0); d.setDate(d.getDate() + (5 - d.getDay() + 7) % 7); if (now - d > 15 * 6e4) d.setDate(d.getDate() + 7); return d; };
  const jlHost = () => ({ name: "Aziza Karimova", title: "Your host · JIA SAT teacher", avatar: PPL2().AV.aziza || "" });
  const jlReady = at => 1180 + hash(ymd(at), 240) + Math.round(380 * Math.max(0, 1 - Math.max(0, at - new Date()) / 864e5));
  let JL = null, JB = null, JL_T = [], jlTimer = null;
  JG_API.jgLive = () => { const at = S.jlDemo && S.jlDemo > Date.now() - 6e5 ? new Date(S.jlDemo) : jlNext();
    return { next_show: { starts_at: at.toISOString(), weekly: "Friday 20:00", host: jlHost(), pot_coins: JL_POT, questions: 12, seconds_per_question: 10, topics: Object.keys(JL_TOPIC), rule: "One wrong answer and you're out. You can keep watching and chatting." }, live_now: Date.now() >= at.getTime(), players_ready: jlReady(at) }; };
  JG_API.liveAnswer = (i, choice) => { const q = JL_Q[i]; if (!q || i > 11) return null; const correct = choice === q[3]; return { correct, eliminated: !correct, remaining: JL ? JL.left : null }; };
  JG_API.liveResult = () => (JL && JL.done ? { winners: JL.winners, pot_coins: JL_POT, share: JL.share, you_won: JL.alive, reached_question: JL.reached } : null);
  JG_API.triviaBattle = (opp = cgOppId()) => { const qs = JL_Q.map((q, i) => i).sort(() => Math.random() - .5).slice(0, 5); JB = { id: `tb_${Date.now()}`, opp, qs, i: 0, me: 0, them: 0 };
    return { battle_id: JB.id, opponent: { user_id: opp, first_name: firstN(opp) }, questions: qs.map(i => ({ topic: JL_Q[i][0], question: JL_Q[i][1], options: JL_Q[i][2] })), seconds_per_question: 10 }; };
  JG_API.battleAnswer = (battleId, i, choice, ms) => { const q = JL_Q[JB.qs[i]], correct = choice === q[3]; return { correct, points: correct ? 100 + Math.max(0, Math.round((10000 - ms) / 100)) : 0 }; };
  const jlClear = () => { JL_T.forEach(clearTimeout); JL_T = []; clearInterval(jlTimer); jlTimer = null; };
  const jlLater = (fn, ms) => JL_T.push(setTimeout(() => { if ($("jl-view") && !$("jl-view").hidden) fn(); else jlClear(); }, jlMs(ms)));
  const jlAv = (src, ini) => (src ? `<img src="${src}" alt="">` : `<span class="jl-ini">${esc(ini)}</span>`);
  const jlPost = (who, text, me) => { const c = $("jl-chat"); if (!c) return; c.insertAdjacentHTML("beforeend", `<p${me ? ' class="me"' : ""}><b>${esc(who)}</b> ${esc(text)}</p>`); while (c.children.length > 40) c.firstChild.remove(); c.scrollTop = c.scrollHeight; };
  function jlOpen() {
    jlClear(); const el = layer("jl-view", "zq-view jl-view"), L = JG_API.jgLive(), H = L.next_show.host; el.setAttribute("aria-label", "JG Live");
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-jl="close" aria-label="Close">‹</button><p class="dg-tt">JG Live</p><span class="dg-timer">🎤</span></div><div class="zq-body">
      <div class="jl-lobby"><small class="dz-kicker">Every Friday · 20:00</small><b class="jl-logo">JG <em>LIVE</em></b><b class="jl-count" id="jl-count">–</b><small id="jl-ready">${L.players_ready.toLocaleString("en-US")} players ready</small>
        <div class="jl-host">${jlAv(H.avatar, "AK")}<span><b>${esc(H.name)}</b><small>${esc(H.title)}</small></span></div><span class="jl-pot">🪙 ${JL_POT.toLocaleString("en-US")} coin pot · 12 questions · 10 seconds each</span>
        <p class="jl-rule">${esc(L.next_show.rule)} Everyone still standing at the end splits the pot.</p><p class="jl-topics">${Object.values(JL_TOPIC).join(" · ")}</p>
        <button type="button" class="dg-go" data-jl="remind">${S.jlRemind ? "Reminder set ✓" : "Remind me at 19:55"}</button></div>
      <div class="jl-battle"><b>⚔️ 1v1 trivia battle</b><small>Same topics, anytime. 5 questions, 10 seconds each. Fast right answers score more.</small><button type="button" class="dg-go" data-jl="battle">Battle ${esc(firstN(cgOppId()))}</button></div></div>`;
    el.onclick = jlClick;
    const tick = () => { const c = $("jl-count"); if (!c || el.hidden) return jlClear(); const L2 = JG_API.jgLive(), left = new Date(L2.next_show.starts_at) - Date.now(); if (left <= 0) { jlClear(); return jlShow(); }
      const h = Math.floor(left / 36e5), m = Math.floor(left % 36e5 / 6e4), s = Math.floor(left % 6e4 / 1e3); c.textContent = h ? `Starts in ${h}h ${String(m).padStart(2, "0")}m` : `Starts in ${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      const r = $("jl-ready"); if (r) r.textContent = `${L2.players_ready.toLocaleString("en-US")} players ready`; };
    tick(); if (!JL || !JL.running) jlTimer = setInterval(tick, 1000);
  }
  function jlShow() {
    const el = $("jl-view"), H = jlHost(); JL = { i: 0, alive: true, left: JG_API.jgLive().players_ready, reached: 0, mine: null, done: false, running: true };
    el.querySelector(".zq-body").innerHTML = `<div class="jl-show"><div class="jl-bar"><span class="jl-live">● LIVE</span><b id="jl-left">${JL.left.toLocaleString("en-US")} playing</b><span class="jl-pot-s">🪙 ${JL_POT.toLocaleString("en-US")}</span></div>
      <div class="jl-hostline">${jlAv(H.avatar, "AK")}<p id="jl-say">Good evening, everyone! Twelve questions, ten seconds each. One wrong answer and you're out. Ready?</p></div>
      <div class="jl-q" id="jl-q"></div><div id="jl-status"></div><div class="jl-chat" id="jl-chat"></div>
      <div class="mf-comp jl-comp"><input class="dg-field" id="jl-in" maxlength="120" placeholder="Chat with everyone"><button type="button" class="dg-go" data-jl="say">Send</button></div></div>`;
    const chat = () => { jlPost(mfPick(JL_NAMES), mfPick(JL_CHAT)); if (!JL.done) jlLater(chat, 1300 + Math.random() * 1200); }; jlLater(chat, 600); jlLater(jlQuestion, 3200);
  }
  function jlQuestion() {
    const q = JL_Q[JL.i]; JL.mine = null; let t = 10; $("jl-say").textContent = JL.i === 11 ? "Final question. Everything comes down to this." : JL_SAY[q[0]];
    $("jl-q").innerHTML = `<div class="jl-qh"><small>Question ${JL.i + 1} of 12 · ${JL_TOPIC[q[0]]}</small><span class="jl-ring" id="jl-ring" style="--p:100">10</span></div><b class="jl-qt">${esc(q[1])}</b>
      <div class="jl-opts">${q[2].map((o, k) => `<button type="button" data-jla="${k}"${JL.alive ? "" : " disabled"}><span>${"ABCD"[k]}</span>${esc(o)}<em></em></button>`).join("")}</div>`;
    $("jl-status").innerHTML = JL.alive ? "" : `<p class="jl-watch">👀 Watching · you can still chat</p>`;
    const tick = () => { t--; const r = $("jl-ring"); if (!r) return; r.textContent = Math.max(0, t); r.style.setProperty("--p", t * 10); if (t > 0) jlLater(tick, 1000); else jlReveal(); }; jlLater(tick, 1000);
  }
  function jlReveal() {
    const q = JL_Q[JL.i], c = .6 + hash(q[1], 30) / 100, w = [0, 1, 2, 3].map(k => (k === q[3] ? 0 : 1 + hash(q[1] + k, 5))), ws = w.reduce((a, b) => a + b, 0), pct = w.map((x, k) => (k === q[3] ? Math.round(c * 100) : Math.round((1 - c) * 100 * x / ws)));
    document.querySelectorAll("#jl-q [data-jla]").forEach(b => { const k = +b.dataset.jla; b.disabled = true; b.classList.toggle("right", k === q[3]); b.classList.toggle("wrong", k === JL.mine && k !== q[3]); b.querySelector("em").textContent = `${pct[k]}%`; });
    if (JL.alive) { const r = JG_API.liveAnswer(JL.i, JL.mine); if (r.correct) { JL.reached = JL.i + 1; $("jl-status").innerHTML = `<p class="jl-ok">✓ Correct! You're still in.</p>`; } else { JL.alive = false; $("jl-status").innerHTML = `<p class="jl-outbar">${JL.mine === null ? "Time's up" : "Not this time"}. You're out, but stay: watch the rest and chat with everyone.</p>`; } }
    JL.left = Math.max(JL.alive ? 1 : 0, Math.round(JL.left * c)); $("jl-left").textContent = `${JL.left.toLocaleString("en-US")} still in`; JL.i++; jlLater(JL.i < 12 ? jlQuestion : jlEnd, 3500);
  }
  function jlEnd() {
    JL.done = true; JL.running = false; JL.winners = Math.max(1, JL.left); JL.share = Math.floor(JL_POT / JL.winners); const jam = window.JG_jamolAv; if (JL.alive && window.JIA_coins) window.JIA_coins.add(JL.share);
    $("jl-left").textContent = `${JL.winners.toLocaleString("en-US")} winners`; $("jl-say").textContent = "Thank you for playing, everyone! Same time next Friday."; $("jl-status").innerHTML = "";
    $("jl-q").innerHTML = `<div class="jl-end"><small class="dz-kicker">That's the show!</small><b>${JL.winners.toLocaleString("en-US")} winner${JL.winners === 1 ? "" : "s"} split 🪙 ${JL_POT.toLocaleString("en-US")}</b><span>${JL.share.toLocaleString("en-US")} coins each</span>${jam ? `<img class="cg-jam ${JL.alive ? "yay" : "meh"}" src="${jam}" alt="">` : ""}
      <p>${JL.alive ? `You're one of them! 🪙 ${JL.share.toLocaleString("en-US")} coins are in your wallet.` : `You made it through ${JL.reached} of 12 questions. See you next Friday at 20:00.`}</p><button type="button" class="dg-go" data-jl="battle">1v1 trivia battle</button><button type="button" class="dg-link" data-jl="lobby">Back to the lobby</button></div>`;
    if (JL.alive && window.JIA_celebrate) setTimeout(() => window.JIA_celebrate({ id: `jglive_${ymd(new Date())}`, name: "JG Live winner", rare: "Epic", desc: `${JL.share.toLocaleString("en-US")} coins from the Friday show`, img: img3d("trophy") }), 900);
    S.jlDemo = null; save(); gnPaint();
  }
  function jlBattle() {
    jlClear(); const R = JG_API.triviaBattle(), P = PPL2(), el = $("jl-view"), me = JG_API.squad().members.find(m => m.user_id === "me") || {};
    el.querySelector(".zq-body").innerHTML = `<div class="jl-show"><div class="jl-vs"><span>${jlAv(me.avatar, "Me")}<b id="jb-me">0</b><small>You</small></span><em>VS</em><span>${jlAv(P.AV[R.opponent.user_id], R.opponent.first_name[0])}<b id="jb-them">0</b><small>${esc(R.opponent.first_name)}</small></span></div><div class="jl-q" id="jl-q"></div><div id="jl-status"></div></div>`;
    jbQuestion();
  }
  function jbQuestion() {
    const q = JL_Q[JB.qs[JB.i]]; let t = 10; JB.t0 = Date.now(); JB.mine = null; JB.oppAt = 2 + Math.random() * 6; JB.oppRight = Math.random() < .65;
    $("jl-q").innerHTML = `<div class="jl-qh"><small>Question ${JB.i + 1} of 5 · ${JL_TOPIC[q[0]]}</small><span class="jl-ring" id="jl-ring" style="--p:100">10</span></div><b class="jl-qt">${esc(q[1])}</b><div class="jl-opts">${q[2].map((o, k) => `<button type="button" data-jba="${k}"><span>${"ABCD"[k]}</span>${esc(o)}<em></em></button>`).join("")}</div><small class="jb-opp" id="jb-opp"></small>`;
    $("jl-status").innerHTML = "";
    const tick = () => { if (JB.mine !== null) return; t--; const r = $("jl-ring"); if (!r) return; r.textContent = Math.max(0, t); r.style.setProperty("--p", t * 10); if (10 - t >= JB.oppAt && $("jb-opp")) $("jb-opp").textContent = `${firstN(JB.opp)} answered`;
      if (t > 0) jlLater(tick, 1000); else { JB.mine = -1; jbReveal(null); } }; jlLater(tick, 1000);
  }
  function jbReveal(k, ms = 10000) {
    const q = JL_Q[JB.qs[JB.i]], r = k === null ? { correct: false, points: 0 } : JG_API.battleAnswer(JB.id, JB.i, k, ms), op = JB.oppRight ? 100 + Math.round((10 - JB.oppAt) * 10) : 0;
    JB.me += r.points; JB.them += op; $("jb-me").textContent = JB.me; $("jb-them").textContent = JB.them;
    document.querySelectorAll("#jl-q [data-jba]").forEach(b => { const i = +b.dataset.jba; b.disabled = true; b.classList.toggle("right", i === q[3]); b.classList.toggle("wrong", i === k && i !== q[3]); });
    $("jl-status").innerHTML = `<p class="${r.correct ? "jl-ok" : "jl-outbar"}">${r.correct ? `+${r.points} for you` : "No points this time"} · ${esc(firstN(JB.opp))} ${op ? `+${op}` : "missed it"}</p>`; JB.i++; jlLater(JB.i < 5 ? jbQuestion : jbEnd, 2600);
  }
  function jbEnd() {
    const won = JB.me > JB.them, jam = window.JG_jamolAv; S.jb = S.jb || { played: 0, won: 0 }; S.jb.played++; if (won) S.jb.won++; save(); $("jl-status").innerHTML = "";
    $("jl-q").innerHTML = `<div class="jl-end"><small class="dz-kicker">1v1 trivia battle</small><b>${won ? "You win!" : JB.me === JB.them ? "It's a draw!" : `${esc(firstN(JB.opp))} wins this one`}</b><span>${JB.me} – ${JB.them}</span>${jam ? `<img class="cg-jam ${won ? "yay" : "meh"}" src="${jam}" alt="">` : ""}<button type="button" class="dg-go" data-jl="battle">Rematch</button><button type="button" class="dg-link" data-jl="lobby">Back to JG Live</button></div>`;
  }
  function jlClick(e) {
    const b = e.target.closest("[data-jl], [data-jla], [data-jba]"); if (!b) return;
    if (b.dataset.jla !== undefined) { if (!JL || !JL.alive || JL.mine !== null || b.disabled) return; JL.mine = +b.dataset.jla; b.classList.add("mine"); document.querySelectorAll("#jl-q [data-jla]").forEach(x => { x.disabled = true; }); return; }
    if (b.dataset.jba !== undefined) { if (!JB || JB.mine !== null) return; JB.mine = +b.dataset.jba; b.classList.add("mine"); return jbReveal(JB.mine, Math.min(10000, (Date.now() - JB.t0) / (window.JG_FAST || 1))); }
    const a = b.dataset.jl;
    if (a === "close") { jlClear(); if (JL) JL.running = false; $("jl-view").hidden = true; } else if (a === "lobby") { if (JL) JL.running = false; jlOpen(); } else if (a === "battle") jlBattle();
    else if (a === "remind") { S.jlRemind = true; save(); b.textContent = "Reminder set ✓"; if (window.JIA_notify) window.JIA_notify({ text: "<b>JG Live.</b> We'll remind you at 19:55 on Friday." }); }
    else if (a === "say") { const i = $("jl-in"), t = (i.value || "").trim(); if (!t) return; jlPost("You", /\b(idiot|stupid|kys|dumb)\b/i.test(t) ? "••• (filtered: keep it friendly)" : t, true); i.value = ""; }
  }
  GN_TILES.push({ id: "live", icon: "🎤", name: "JG Live", sub: () => (JG_API.jgLive().live_now ? "Live now · join the show" : `Fri 20:00 · 🪙 ${JL_POT.toLocaleString("en-US")} pot`), open: jlOpen });

  /* ================= MOVIE NIGHT IN ENGLISH: watch together, react, then 5 words ================= */
  const MN = [
    { id: "deep", kind: "Documentary", title: "The Deep Blue Classroom", mins: 48, g: ["#062a44", "#1f8fb3"], icon: "🐋", about: "A marine biologist takes a class of students a kilometre down, where fish make their own light.",
      subs: ["Below a thousand metres, sunlight never arrives.", "Down here, animals make their own light. We call them bioluminescent.", "The pressure would crush a submarine that wasn't built for it.", "Some whales migrate further than any other mammal on Earth.", "This world is fragile. One warm year can change everything."],
      chat: ["Wait, 1,000 metres?! 😮", "bioluminescent = makes its own light, right?", "That submarine looks tiny", "Whales are so underrated 🐋", "Okay, I want to study marine biology now"],
      words: [["abyss", "noun", "a very deep, dark place, like the deepest part of the ocean", "The camera sank slowly into the abyss."], ["bioluminescent", "adjective", "able to make its own light", "Down here, animals make their own light. We call them bioluminescent."], ["pressure", "noun", "the force that presses on something", "The pressure would crush a submarine that wasn't built for it."], ["migrate", "verb", "to travel a long way to another place at a certain time of year", "Some whales migrate further than any other mammal on Earth."], ["fragile", "adjective", "easily damaged or broken", "This world is fragile."]] },
    { id: "uk", kind: "University vlog", title: "A Week at a UK University", mins: 26, g: ["#2b1a4a", "#7a4fc2"], icon: "🎓", about: "A first-year student films seminars, the society fair and one very late essay night.",
      subs: ["Welcome to freshers' week. I've joined six societies already.", "Seminars are small. You can't hide. You have to speak.", "My first essay deadline is Friday, and I haven't started.", "Okay, I procrastinated. Lesson learned. Library at 8 a.m.", "The best part? Everyone here is curious about something."],
      chat: ["Six societies in one week 😂", "Seminars sound scary ngl", "Same, my deadline is Friday too 😭", "Library at 8am? Brave.", "I want this life 🎓"],
      words: [["freshers' week", "noun", "the first week at university, full of events for new students", "Welcome to freshers' week."], ["seminar", "noun", "a small class where students discuss a topic with a teacher", "Seminars are small. You have to speak."], ["deadline", "noun", "the time by which something must be finished", "My first essay deadline is Friday."], ["procrastinate", "verb", "to keep delaying something you should do", "Okay, I procrastinated. Lesson learned."], ["society", "noun", "a student club for people who share an interest", "I've joined six societies already."]] },
    { id: "robots", kind: "Film · English subtitles", title: "The Robot Olympiad", mins: 94, g: ["#3a1400", "#c2571a"], icon: "🤖", about: "A small-town team builds a robot from scrap and takes on the national champions.",
      subs: ["We're the underdogs. Nobody expects us to finish, let alone win.", "It's only a prototype. It's supposed to break.", "Every setback teaches us something. We fix it and go again.", "We persevere. That's the only plan we have.", "Whatever happens tomorrow, building this was a triumph."],
      chat: ["Underdogs always win in films 😄", "It broke already 😂", "Every setback = a lesson. Noted.", "Persevere is my word of the day", "Okay I'm emotional now ❤️"],
      words: [["underdog", "noun", "the person or team that people expect to lose", "We're the underdogs."], ["prototype", "noun", "the first version of something, made to test an idea", "It's only a prototype. It's supposed to break."], ["setback", "noun", "a problem that slows down your progress", "Every setback teaches us something."], ["persevere", "verb", "to keep trying even when it is difficult", "We persevere. That's the only plan we have."], ["triumph", "noun", "a great success or victory", "Building this was a triumph."]] }];
  const mnWhen = k => { const d = new Date(); d.setHours(19, 0, 0, 0); d.setDate(d.getDate() + (6 - d.getDay() + 7) % 7 + 7 * k); return d; };
  JG_API.movieNight = () => ({ weekly: "Saturday 19:00", schedule: MN.map((m, k) => ({ id: m.id, kind: m.kind, title: m.title, about: m.about, starts_at: mnWhen(k).toISOString(), duration_min: m.mins, subtitles: "English", watching: 160 + hash(m.id, 140) })), note: "Prototype lineup. Real screenings need licensed films." });
  JG_API.joinMovie = id => ({ room_id: `movie_${id}`, watching: 160 + hash(id, 140), reactions: ["😂", "😮", "❤️", "👏", "🔥"] });
  JG_API.movieReact = (id, emoji) => ({ ok: true, room_id: `movie_${id}`, emoji });
  JG_API.movieWords = id => (MN.find(m => m.id === id) || { words: [] }).words.map(([word, part_of_speech, meaning, example]) => ({ word, part_of_speech, meaning, example }));
  JG_API.saveMovieWords = id => { const w = JG_API.movieWords(id).map(x => x.word); S.mnWords = Array.from(new Set((S.mnWords || []).concat(w))); save(); return { saved: w.length, total: S.mnWords.length }; };
  let MNP = null, MN_T = [];
  const mnClear = () => { MN_T.forEach(clearTimeout); MN_T = []; }, mnLater = (fn, ms) => MN_T.push(setTimeout(() => { if ($("mn-view") && !$("mn-view").hidden) fn(); else mnClear(); }, ms * (window.JG_FAST || 1)));
  const mnPoster = (m, big) => `<div class="mn-poster${big ? " big" : ""}" style="--g1:${m.g[0]};--g2:${m.g[1]}"><span class="mn-motif" aria-hidden="true">${m.icon}</span><small>JG MOVIE NIGHT</small><b>${esc(m.title)}</b><em>${esc(m.kind)}</em></div>`;
  const mnDate = iso => `${new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · 19:00`;
  const mnPost = (who, text, me) => { const c = $("mn-chat"); if (!c) return; c.insertAdjacentHTML("beforeend", `<p${me ? ' class="me"' : ""}><b>${esc(who)}</b> ${esc(text)}</p>`); c.scrollTop = c.scrollHeight; };
  const mnFloat = (e, them) => { const fx = $("mn-fx"); if (!fx) return; const s = document.createElement("span"); s.textContent = e; if (them) s.className = "them"; s.style.left = `${8 + Math.random() * 80}%`; fx.appendChild(s); setTimeout(() => s.remove(), 2300); };
  function mnOpen() {
    mnClear(); const el = layer("mn-view", "zq-view mn-view"), M = JG_API.movieNight(); el.setAttribute("aria-label", "Movie night");
    el.innerHTML = `<div class="dg-top"><button class="dg-back" type="button" data-mn="close" aria-label="Close">‹</button><p class="dg-tt">Movie night</p><span class="dg-timer">🍿</span></div><div class="zq-body">
      <div class="mn-hero"><b>Movie night in English</b><small>Every Saturday at 19:00. Watch together, react live, then take 5 new words home.</small></div>
      ${M.schedule.map((m, k) => `<div class="mn-card">${mnPoster(MN[k])}<span><small class="dz-kicker">${k ? mnDate(m.starts_at) : `Next up · ${mnDate(m.starts_at)}`}</small><b>${esc(m.title)}</b><small>${esc(m.kind)} · ${m.duration_min} min · English subtitles</small><small class="mn-about">${esc(m.about)}</small><button type="button" class="dg-go" data-mn="watch" data-id="${m.id}">Join the watch party</button></span></div>`).join("")}
      <p class="zq-note">Prototype: the lineup, posters and player are placeholders. Real screenings need licensed films.</p></div>`;
    el.onclick = mnClick;
  }
  function mnPlay(id) {
    mnClear(); const m = MN.find(x => x.id === id), J = JG_API.joinMovie(id), el = $("mn-view"); MNP = { m, t: 0, on: true, cc: true, k: -1 };
    el.querySelector(".zq-body").innerHTML = `<div class="mn-screen">${mnPoster(m, true)}<span class="mn-live">● LIVE · <b>${J.watching}</b> watching</span><p class="mn-sub" id="mn-sub"></p><div class="mn-fx" id="mn-fx"></div></div>
      <div class="mn-ctrl"><button type="button" data-mn="pp" aria-label="Pause">❚❚</button><i class="mn-prog"><em id="mn-bar"></em></i><small id="mn-time">0:00 / ${m.mins}:00</small><button type="button" data-mn="cc" aria-pressed="true">CC</button></div>
      <div class="mn-rx">${J.reactions.map(e => `<button type="button" data-mnr="${e}" aria-label="React ${e}">${e}</button>`).join("")}</div>
      <div class="mn-chat" id="mn-chat"></div><div class="mf-comp"><input class="dg-field" id="mn-in" maxlength="120" placeholder="Say something about the film"><button type="button" class="dg-go" data-mn="say">Send</button></div>
      <button type="button" class="dg-link" data-mn="end">End the screening and see tonight's 5 words</button>`;
    const step = m.mins / 45;                                                  // the demo plays the whole film in about 45 seconds
    const tick = () => { if (MNP.on) { MNP.t = Math.min(m.mins, MNP.t + step); const pc = MNP.t / m.mins * 100, k = Math.min(m.subs.length - 1, Math.floor(pc / (100 / m.subs.length)));
        $("mn-bar").style.width = `${pc}%`; $("mn-time").textContent = `${Math.floor(MNP.t)}:${String(Math.floor(MNP.t % 1 * 60)).padStart(2, "0")} / ${m.mins}:00`; $("mn-sub").textContent = MNP.cc ? m.subs[k] : "";
        if (k !== MNP.k) { MNP.k = k; mnLater(() => mnPost(mfPick(JL_NAMES), m.chat[k]), 1400); } if (Math.random() < .55) mnFloat(mfPick(J.reactions), true); if (MNP.t >= m.mins) return mnWords(m); }
      mnLater(tick, 1000); };
    mnLater(tick, 600); mnPost(mfPick(JL_NAMES), "Hi everyone! 🍿");
  }
  function mnWords(m) {
    mnClear(); if (MNP) MNP.on = false; const jam = window.JG_jamolAv;
    $("mn-view").querySelector(".zq-body").innerHTML = `<div class="mn-done">${mnPoster(m)}<span><small class="dz-kicker">That's a wrap</small><b>5 words from tonight</b><small>From ${esc(m.title)}. Tap a word to see how it was used.</small></span>${jam ? `<img class="cg-jam ok" src="${jam}" alt="">` : ""}</div>
      ${JG_API.movieWords(m.id).map(w => `<details class="mn-word"><summary><b>${esc(w.word)}</b><em>${esc(w.part_of_speech)}</em><span>${esc(w.meaning)}</span></summary><p>“${esc(w.example)}”</p></details>`).join("")}
      <button type="button" class="dg-go" data-mn="save" data-id="${m.id}">Save all 5 to my English words</button><button type="button" class="dg-link" data-mn="list">Back to the schedule</button>`;
  }
  function mnClick(e) {
    const r = e.target.closest("[data-mnr]"); if (r) { JG_API.movieReact(MNP && MNP.m.id, r.dataset.mnr); mnFloat(r.dataset.mnr); return; }
    const b = e.target.closest("[data-mn]"); if (!b) return; const a = b.dataset.mn;
    if (a === "close") { mnClear(); $("mn-view").hidden = true; } else if (a === "list") mnOpen(); else if (a === "watch") mnPlay(b.dataset.id); else if (a === "end") mnWords(MNP.m);
    else if (a === "pp") { MNP.on = !MNP.on; b.textContent = MNP.on ? "❚❚" : "▶"; b.setAttribute("aria-label", MNP.on ? "Pause" : "Play"); }
    else if (a === "cc") { MNP.cc = !MNP.cc; b.setAttribute("aria-pressed", String(MNP.cc)); if (!MNP.cc) $("mn-sub").textContent = ""; }
    else if (a === "say") { const i = $("mn-in"), t = (i.value || "").trim(); if (!t) return; mnPost("You", /\b(idiot|stupid|kys|dumb)\b/i.test(t) ? "••• (filtered: keep it friendly)" : t, true); i.value = ""; }
    else if (a === "save") { const res = JG_API.saveMovieWords(b.dataset.id); b.textContent = `Saved ✓ · ${res.total} words in your list`; b.disabled = true; if (window.JIA_notify) window.JIA_notify({ text: "<b>Movie night.</b> 5 new words saved to your English words." }); }
  }
  GN_TILES.push({ id: "movie", icon: "🍿", name: "Movie night", sub: () => `Sat 19:00 · ${MN[0].title}`, open: mnOpen });
  if (pvq("jl-start")) pvq("jl-start").addEventListener("click", () => { S.jlDemo = Date.now() + 6000; save(); jlOpen(); });
  gnPaint();
  (() => { const d = document.querySelector(".rm-credits"); if (d && !d.querySelector(".cg-credits")) d.insertAdjacentHTML("beforeend", `<p class="sy-credits cg-credits"><b>CampusGuessr photos</b><br>Stanford: Frank Schulenburg, Wikimedia Commons, CC BY-SA 4.0<br>Oxford: Julian Herzog (Website), Wikimedia Commons, CC BY 4.0<br>ETH Zurich: sidonius 07:42, 20 June 2006 (UTC), Wikimedia Commons, CC BY-SA 2.5<br>NUS: RFNirmala, Wikimedia Commons, CC BY 4.0<br>University of Tokyo: Kakidai, Wikimedia Commons, CC BY-SA 4.0<br>University of Toronto: GoginkLobabi, Wikimedia Commons, CC BY-SA 4.0<br>University of Sydney: Jason Tong, Wikimedia Commons, CC BY-SA 3.0<br>Purdue: Julian Herzog (Website), Wikimedia Commons, CC BY 4.0<br>World map: Natural Earth, public domain</p>`); })();
  /* ================= PRODUCT CUTS (26 Sep): see window.JG_CUTS at the top of this script ================= */
  const CG_EX = ["mit", "harvard", "purdue"];   // universities that have a card in Explore
  GN_TILES.forEach(t => { if (t.id === "mafia" || t.id === "campus") t.where = "hub"; if (t.id === "live" && window.JG_CUTS.jgLive) t.where = "off"; });
  window.JG_HUB = SECTIONS => {                                   // JG games join the Mini games hub shelves
    const d = JG_API.daily(), st = dailyState(), cg = JG_API.campusGuessr().daily, mf = GN_TILES.find(t => t.id === "mafia"), art = e => `<span class="obj jg-emo" aria-hidden="true">${e}</span>`, foot = t => `<span class="gh-r">${esc(t)}</span>`;
    const brain = [{ k: "jgdaily", t: "JG Daily", s: `#${d.number} · ${d.subject}`, art: art("📰"), foot: foot(st ? `${st.correct ? "✅" : "❌"} ${st.time} · discussion open` : "One tough question a day") },
      { k: "campus", t: "CampusGuessr", s: "Guess the campus from a photo", art: art("📍"), foot: foot(cg.played ? `Today: ${cg.score.toLocaleString("en-US")} pts` : "Today's daily is live") }];
    const pi = SECTIONS.findIndex(x => /party/i.test(x[0])); SECTIONS.splice(pi < 0 ? SECTIONS.length : pi, 0, ["Brain games", brain]);
    const party = SECTIONS.find(x => /party/i.test(x[0])); if (party && mf) party[1].unshift({ k: "mafia", t: "Mafia", s: "Classic or Exam Hall", art: art("🕶️"), foot: foot(mf.sub()) });
  };
  window.JG_HUB_GO = g => {
    const go = { jgdaily: [openDaily, "jd-view"], campus: [cgOpen, "cg-view"], mafia: [() => GN_TILES.find(t => t.id === "mafia").open(), "mf-view"] }[g]; if (!go) return false; go[0]();
    const L = $(go[1]), H = $("gh-view"); if (L && H && +L.style.zIndex <= +H.style.zIndex) L.style.zIndex = String(+H.style.zIndex + 1); return true;
  };
  if (JG_API.velvetBadges) { const _vb = JG_API.velvetBadges; JG_API.velvetBadges = who => _vb(who).filter(b => !(window.JG_CUTS.creatorStudio && b.club_id === "creators") && !(window.JG_CUTS.playerCard && b.club_id === "gold")); }
  if (window.JG_CUTS.rival) { try { rvCard = function () {}; } catch (e) {} try { delete NP_LABEL.rival_passed; } catch (e) {} try { delete NP_TYPES.rival_passed; } catch (e) {}
    const _npl = JG_API.notificationPlan; JG_API.notificationPlan = (...a) => { const r = _npl(...a); if (r && r.types) r.types = r.types.filter(t => t.type !== "rival_passed"); return r; }; }
  if (window.JG_CUTS.englishCoach) { window.JG_coachOn = () => false; try { jxCoach = async function () {}; } catch (e) {} if (S.coach) { S.coach = false; save(); } }   // no coach chip, no tips, nothing sent to the AI   // no rival card, no "rival passed you" pings
  gnPaint();
  /* ================= CLUBS in the Community header (26 Sep): an icon next to search, opens the Clubs screen ================= */
  const clDot = () => { const d = $("cm-cl-dot"); if (!d) return; const n = JG_API.clubs().filter(c => c.joined).reduce((a, c) => a + (((CH() || {}).CHATS || {})[`g:club_${c.id}_ann`] || { unread: 0 }).unread, 0); d.textContent = n; d.style.display = n ? "" : "none"; $("cm-clubs-btn").setAttribute("aria-label", n ? `Clubs, ${n} new` : "Clubs"); };
  if ($("cm-clubs-btn")) {
    $("cm-clubs-btn").addEventListener("click", () => openClubs());
    const _pcs = paintClubStrip; paintClubStrip = function () { _pcs(); clDot(); };
    document.documentElement.classList.add("cm-clubs-icon"); clDot();
  }
  paintHome();

})();
