--
-- PostgreSQL database dump
--



-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA drizzle;


--
-- Name: role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.role AS ENUM (
    'student',
    'parent'
);


--
-- Name: admission_prediction_immutable(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admission_prediction_immutable() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- P5d (spec §3.10.3): a prediction is never changed after it is logged; only frozen_at may be set, once (the application submitted)
  IF (to_jsonb(NEW) - 'frozen_at') IS DISTINCT FROM (to_jsonb(OLD) - 'frozen_at') OR (OLD.frozen_at IS NOT NULL AND NEW.frozen_at IS DISTINCT FROM OLD.frozen_at) THEN
    RAISE EXCEPTION 'admission_prediction is immutable: only frozen_at may be set, once';
  END IF;
  RETURN NEW;
END $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: -
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: -
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: -
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account (
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


--
-- Name: account_suspension; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account_suspension (
    id text NOT NULL,
    user_id text NOT NULL,
    by text NOT NULL,
    reason text NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL,
    until timestamp with time zone,
    lifted_at timestamp with time zone,
    lifted_by text
);


--
-- Name: achievement_award; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achievement_award (
    student_id text NOT NULL,
    achievement text NOT NULL,
    earned_at timestamp with time zone NOT NULL,
    local_date date NOT NULL,
    serial integer NOT NULL,
    ref text,
    ceremony_at timestamp with time zone
);


--
-- Name: activity_day; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_day (
    student_id text NOT NULL,
    date date NOT NULL,
    scheduled boolean DEFAULT false NOT NULL,
    rest boolean DEFAULT false NOT NULL,
    tasks_done integer DEFAULT 0 NOT NULL,
    tasks_of integer DEFAULT 0 NOT NULL,
    minutes integer DEFAULT 0 NOT NULL,
    bricks integer DEFAULT 0 NOT NULL,
    sessions integer DEFAULT 0 NOT NULL,
    xp integer DEFAULT 0 NOT NULL,
    qualified boolean DEFAULT false NOT NULL,
    freeze_used boolean DEFAULT false NOT NULL,
    streak_after integer,
    closed boolean DEFAULT false NOT NULL
);


--
-- Name: admission_outcome; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admission_outcome (
    id text NOT NULL,
    student_id text NOT NULL,
    cycle integer NOT NULL,
    target text NOT NULL,
    university_name text,
    round text,
    decision text NOT NULL,
    final boolean NOT NULL,
    aid_offered text,
    placement text,
    agency_score double precision,
    agency_blocks jsonb,
    proof_id text,
    verified boolean DEFAULT false NOT NULL,
    verified_by text,
    verified_at timestamp with time zone,
    prediction_id text,
    source text NOT NULL,
    reported_by text,
    "window" text,
    history jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT admission_outcome_aid CHECK (((aid_offered IS NULL) OR (aid_offered = ANY (ARRAY['none'::text, 'partial'::text, 'full'::text, 'unknown'::text])))),
    CONSTRAINT admission_outcome_decision CHECK ((decision = ANY (ARRAY['admitted'::text, 'rejected'::text, 'waitlisted'::text, 'deferred'::text, 'withdrawn'::text, 'pending'::text, 'not_applied'::text]))),
    CONSTRAINT admission_outcome_placement CHECK (((placement IS NULL) OR (placement = ANY (ARRAY['grant'::text, 'contract'::text, 'none'::text])))),
    CONSTRAINT admission_outcome_round CHECK (((round IS NULL) OR (round = ANY (ARRAY['ed'::text, 'ed2'::text, 'ea'::text, 'rea'::text, 'rd'::text, 'rolling'::text, 'uz_state'::text, 'other'::text])))),
    CONSTRAINT admission_outcome_source CHECK ((source = ANY (ARRAY['student'::text, 'parent'::text, 'staff'::text])))
);


--
-- Name: admission_prediction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admission_prediction (
    id text NOT NULL,
    student_id text NOT NULL,
    university text NOT NULL,
    programme text,
    cycle integer NOT NULL,
    profile_version integer NOT NULL,
    model_version text NOT NULL,
    spec_version integer NOT NULL,
    readiness_version integer NOT NULL,
    shape text NOT NULL,
    state text NOT NULL,
    inputs jsonb NOT NULL,
    gates jsonb NOT NULL,
    p_mid double precision,
    p_lo double precision,
    p_hi double precision,
    displayed text NOT NULL,
    displayed_value integer,
    displayed_text text,
    other_value integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    frozen_at timestamp with time zone,
    target text,
    spec_cycle integer,
    system text,
    tier text,
    international boolean,
    form text,
    grant_mid double precision,
    CONSTRAINT admission_prediction_displayed CHECK ((displayed = ANY (ARRAY['chance'::text, 'scale'::text]))),
    CONSTRAINT admission_prediction_form CHECK (((form IS NULL) OR (form = ANY (ARRAY['grant'::text, 'contract'::text]))))
);


--
-- Name: ai_consent; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_consent (
    user_id text NOT NULL,
    notice_version text NOT NULL,
    accepted_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_interpretation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_interpretation (
    student_id text NOT NULL,
    question_id text NOT NULL,
    answer_hash text NOT NULL,
    prompt_version text NOT NULL,
    score_1_5 integer,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    rationale_2_lines text NOT NULL,
    language_detected text NOT NULL,
    theme text,
    run_id text NOT NULL,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: ai_job; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_job (
    id text NOT NULL,
    student_id text NOT NULL,
    kind text NOT NULL,
    ref text NOT NULL,
    priority integer NOT NULL,
    status text DEFAULT 'queued'::text NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    not_before timestamp with time zone NOT NULL,
    claim integer DEFAULT 0 NOT NULL,
    lease_until timestamp with time zone,
    rerun boolean DEFAULT false NOT NULL,
    run_id text,
    payload jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: ai_run; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_run (
    id text NOT NULL,
    student_id text NOT NULL,
    kind text NOT NULL,
    ref text NOT NULL,
    input_hash text NOT NULL,
    input jsonb,
    prompt_version text NOT NULL,
    guard_version integer,
    language text NOT NULL,
    model text NOT NULL,
    effort text NOT NULL,
    status text NOT NULL,
    output jsonb,
    violations jsonb DEFAULT '[]'::jsonb NOT NULL,
    stop_reason text,
    stop_category text,
    fallback_served boolean DEFAULT false NOT NULL,
    usage jsonb,
    cost_usd double precision DEFAULT 0 NOT NULL,
    latency_ms integer,
    created_at timestamp with time zone NOT NULL,
    finished_at timestamp with time zone,
    revoked_at timestamp with time zone
);


--
-- Name: ai_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_settings (
    id integer DEFAULT 1 NOT NULL,
    layer_on boolean DEFAULT false NOT NULL,
    steps text[] DEFAULT '{interpret,result,change,tasks,react}'::text[] NOT NULL,
    languages text[] DEFAULT '{en,uz,ru}'::text[] NOT NULL,
    min_guard_version integer DEFAULT 1 NOT NULL,
    notice_version text,
    allowances jsonb DEFAULT '{"react": 12, "tasks": 4, "change": 6, "result": 6, "interpret": 10}'::jsonb NOT NULL,
    daily_usd double precision DEFAULT 40 NOT NULL,
    new_account_daily_usd double precision DEFAULT 5 NOT NULL,
    draft_wait_after_ms integer DEFAULT 20000 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by text DEFAULT 'migration'::text NOT NULL,
    CONSTRAINT ai_settings_one_row CHECK ((id = 1))
);


--
-- Name: ai_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_usage (
    user_id text NOT NULL,
    day date NOT NULL,
    count integer DEFAULT 0 NOT NULL,
    lesson integer DEFAULT 0 NOT NULL,
    chat integer DEFAULT 0 NOT NULL,
    input_tokens integer DEFAULT 0 NOT NULL,
    output_tokens integer DEFAULT 0 NOT NULL,
    cost_usd double precision DEFAULT 0 NOT NULL,
    errors integer DEFAULT 0 NOT NULL
);


--
-- Name: brick_entry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brick_entry (
    id text NOT NULL,
    student_id text NOT NULL,
    amount integer NOT NULL,
    reason text NOT NULL,
    ref text NOT NULL,
    local_date date NOT NULL,
    at timestamp with time zone NOT NULL
);


--
-- Name: chat; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat (
    id text NOT NULL,
    kind text NOT NULL,
    name text,
    about text,
    ref text,
    parent_id text,
    status text DEFAULT 'active'::text NOT NULL,
    created_by text,
    dm_key text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_message_id bigint,
    last_message_at timestamp with time zone,
    CONSTRAINT chat_kind CHECK ((kind = ANY (ARRAY['dm'::text, 'group'::text, 'club_channel'::text, 'club_topic'::text, 'league'::text, 'global'::text]))),
    CONSTRAINT chat_status CHECK ((status = ANY (ARRAY['active'::text, 'request'::text, 'declined'::text, 'pending'::text, 'rejected'::text, 'closed'::text])))
);


--
-- Name: chat_member; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_member (
    chat_id text NOT NULL,
    user_id text NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    muted boolean DEFAULT false NOT NULL,
    last_read bigint DEFAULT 0 NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chat_member_role CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text])))
);


--
-- Name: chat_message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_message (
    id bigint NOT NULL,
    chat_id text NOT NULL,
    sender_id text,
    kind text DEFAULT 'text'::text NOT NULL,
    text text DEFAULT ''::text NOT NULL,
    reply_to bigint,
    status text DEFAULT 'sent'::text NOT NULL,
    client_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    edited_at timestamp with time zone,
    deleted_at timestamp with time zone,
    CONSTRAINT chat_message_kind CHECK ((kind = ANY (ARRAY['text'::text, 'poll'::text, 'system'::text, 'jamol'::text]))),
    CONSTRAINT chat_message_len CHECK ((char_length(text) <= 4000)),
    CONSTRAINT chat_message_status CHECK ((status = ANY (ARRAY['sent'::text, 'held'::text])))
);


--
-- Name: chat_message_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_message_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_message_id_seq OWNED BY public.chat_message.id;


--
-- Name: chat_pin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_pin (
    chat_id text NOT NULL,
    message_id bigint NOT NULL,
    pinned_by text,
    pinned_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: chat_poll; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_poll (
    message_id bigint NOT NULL,
    question text NOT NULL,
    options jsonb NOT NULL,
    anonymous boolean DEFAULT true NOT NULL,
    closed_at timestamp with time zone
);


--
-- Name: chat_poll_vote; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_poll_vote (
    message_id bigint NOT NULL,
    user_id text NOT NULL,
    option integer NOT NULL,
    voted_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: chat_reaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_reaction (
    message_id bigint NOT NULL,
    user_id text NOT NULL,
    emoji text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: check_run; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.check_run (
    id text NOT NULL,
    student_id text NOT NULL,
    kind text NOT NULL,
    ref text DEFAULT ''::text NOT NULL,
    attempt integer DEFAULT 1 NOT NULL,
    status text NOT NULL,
    data jsonb NOT NULL,
    result jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_run_kind CHECK ((kind = ANY (ARRAY['english'::text, 'math'::text, 'reading'::text, 'quiz'::text]))),
    CONSTRAINT check_run_status CHECK ((status = ANY (ARRAY['active'::text, 'done'::text])))
);


--
-- Name: coin_entry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coin_entry (
    id text NOT NULL,
    student_id text NOT NULL,
    amount integer NOT NULL,
    reason text NOT NULL,
    ref text NOT NULL,
    idem text NOT NULL,
    client_id text,
    local_date date NOT NULL,
    payload jsonb,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: community_comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_comment (
    id text NOT NULL,
    post_id text NOT NULL,
    author_id text NOT NULL,
    parent_id text,
    text text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    review_id text,
    reject_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    decided_at timestamp with time zone,
    CONSTRAINT community_comment_len CHECK (((char_length(text) >= 1) AND (char_length(text) <= 500))),
    CONSTRAINT community_comment_status CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);


--
-- Name: community_follow; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_follow (
    follower_id text NOT NULL,
    followee_id text NOT NULL,
    state text NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT community_follow_self CHECK ((follower_id <> followee_id)),
    CONSTRAINT community_follow_state CHECK ((state = ANY (ARRAY['following'::text, 'requested'::text])))
);


--
-- Name: community_like; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_like (
    post_id text NOT NULL,
    user_id text NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: community_media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_media (
    id text NOT NULL,
    owner_id text NOT NULL,
    kind text NOT NULL,
    status text NOT NULL,
    error text,
    file_key text,
    poster_key text,
    src_key text,
    mime text,
    bytes double precision DEFAULT 0 NOT NULL,
    width integer,
    height integer,
    duration_s double precision,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    used_at timestamp with time zone,
    CONSTRAINT community_media_kind CHECK ((kind = ANY (ARRAY['photo'::text, 'video'::text]))),
    CONSTRAINT community_media_status CHECK ((status = ANY (ARRAY['processing'::text, 'ready'::text, 'failed'::text])))
);


--
-- Name: community_note; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_note (
    id text NOT NULL,
    user_id text NOT NULL,
    actor_id text,
    kind text NOT NULL,
    target_kind text,
    target_id text,
    text text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    read_at timestamp with time zone,
    CONSTRAINT community_note_kind CHECK ((kind = ANY (ARRAY['like'::text, 'comment'::text, 'reply'::text, 'follow'::text, 'follow_request'::text, 'follow_accepted'::text, 'approved'::text, 'rejected'::text])))
);


--
-- Name: community_poll_vote; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_poll_vote (
    post_id text NOT NULL,
    user_id text NOT NULL,
    option integer NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT community_poll_vote_option CHECK (((option >= 0) AND (option <= 3)))
);


--
-- Name: community_post; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_post (
    id text NOT NULL,
    author_id text NOT NULL,
    kind text NOT NULL,
    text text DEFAULT ''::text NOT NULL,
    media_id text,
    poll text[],
    style jsonb,
    status text DEFAULT 'pending'::text NOT NULL,
    review_id text,
    reject_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    decided_at timestamp with time zone,
    approved_at timestamp with time zone,
    CONSTRAINT community_post_kind CHECK ((kind = ANY (ARRAY['post'::text, 'reel'::text]))),
    CONSTRAINT community_post_poll CHECK (((poll IS NULL) OR ((array_length(poll, 1) >= 2) AND (array_length(poll, 1) <= 4)))),
    CONSTRAINT community_post_status CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);


--
-- Name: community_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_profile (
    user_id text NOT NULL,
    handle text NOT NULL,
    bio text DEFAULT ''::text NOT NULL,
    show_photo boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT community_profile_bio CHECK ((char_length(bio) <= 150)),
    CONSTRAINT community_profile_handle_ok CHECK ((handle ~ '^[a-z0-9_.]{3,20}$'::text))
);


--
-- Name: community_save; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_save (
    post_id text NOT NULL,
    user_id text NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: community_story; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_story (
    id text NOT NULL,
    author_id text NOT NULL,
    text text DEFAULT ''::text NOT NULL,
    media_id text,
    style jsonb,
    status text DEFAULT 'pending'::text NOT NULL,
    review_id text,
    reject_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    decided_at timestamp with time zone,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT community_story_status CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);


--
-- Name: community_story_view; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_story_view (
    story_id text NOT NULL,
    viewer_id text NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: community_view; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_view (
    post_id text NOT NULL,
    user_id text NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: core_deletion_request; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.core_deletion_request (
    id text NOT NULL,
    student_id text NOT NULL,
    asked_by text NOT NULL,
    role text NOT NULL,
    state text DEFAULT 'open'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    done_at timestamp with time zone,
    CONSTRAINT core_deletion_request_role CHECK ((role = ANY (ARRAY['parent'::text, 'student'::text]))),
    CONSTRAINT core_deletion_request_state CHECK ((state = ANY (ARRAY['open'::text, 'done'::text, 'withdrawn'::text])))
);


--
-- Name: daily_task; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_task (
    student_id text NOT NULL,
    id text NOT NULL,
    batch_id text NOT NULL,
    date date NOT NULL,
    slot integer NOT NULL,
    milestone_id text,
    weekly_goal_id text,
    type text NOT NULL,
    subject text NOT NULL,
    short text NOT NULL,
    title text NOT NULL,
    instructions text NOT NULL,
    est_minutes integer NOT NULL,
    verification text NOT NULL,
    coins integer NOT NULL,
    quiz text,
    deep text,
    optional boolean DEFAULT false NOT NULL,
    template text NOT NULL,
    seq integer DEFAULT 1 NOT NULL,
    language text DEFAULT 'en'::text NOT NULL,
    generated_by text DEFAULT 'code'::text NOT NULL,
    constraints_hash text NOT NULL,
    status text DEFAULT 'scheduled'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    title_ai text,
    instructions_ai text,
    ai_input_hash text,
    ai_language text,
    ai_run_id text,
    meta jsonb
);


--
-- Name: diagnostic_answer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.diagnostic_answer (
    student_id text NOT NULL,
    question_id text NOT NULL,
    source text NOT NULL,
    value jsonb NOT NULL,
    status text DEFAULT 'answered'::text NOT NULL,
    answered_at timestamp with time zone DEFAULT now() NOT NULL,
    profile_version integer DEFAULT 0 NOT NULL
);


--
-- Name: dream_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dream_build (
    student_id text NOT NULL,
    university text DEFAULT 'MIT'::text NOT NULL,
    target integer DEFAULT 600 NOT NULL,
    bricks integer DEFAULT 0 NOT NULL,
    cracked text[] DEFAULT '{}'::text[] NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: dtm_sitting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dtm_sitting (
    student_id text NOT NULL,
    mock_date date NOT NULL,
    mock_id text NOT NULL,
    started_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone NOT NULL,
    finished_at timestamp with time zone,
    data jsonb NOT NULL,
    answers jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: engine_event; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.engine_event (
    id text NOT NULL,
    student_id text NOT NULL,
    type text NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    at timestamp with time zone NOT NULL,
    local_date date NOT NULL,
    profile_version_after integer,
    client_id text
);


--
-- Name: engine_result; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.engine_result (
    student_id text NOT NULL,
    profile_version integer NOT NULL,
    answers jsonb NOT NULL,
    derived jsonb NOT NULL,
    scorecard jsonb NOT NULL,
    flags jsonb NOT NULL,
    feasibility jsonb NOT NULL,
    archetype text NOT NULL,
    first_tasks jsonb NOT NULL,
    player_card jsonb NOT NULL,
    engine_version text NOT NULL,
    rules_version text NOT NULL,
    computed_at timestamp with time zone NOT NULL,
    ai jsonb
);


--
-- Name: engine_state; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.engine_state (
    student_id text NOT NULL,
    profile_version integer DEFAULT 0 NOT NULL,
    diagnostic text DEFAULT 'not_started'::text NOT NULL,
    diagnostic_done_at timestamp with time zone,
    first_done_on date,
    unlocked_at timestamp with time zone,
    unlocked_on date,
    parallel text[] DEFAULT '{}'::text[] NOT NULL,
    stage text,
    archetype text,
    lessons integer DEFAULT 0 NOT NULL,
    deep_done text[] DEFAULT '{}'::text[] NOT NULL,
    parent_consent_at timestamp with time zone,
    parent_flow_done_at timestamp with time zone,
    parent_sent_at timestamp with time zone,
    parent_lang text,
    engine_version text,
    rules_version text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    phase_d_from date,
    profile_complete_at timestamp with time zone,
    profile_complete_by text,
    unknowns text[] DEFAULT '{}'::text[] NOT NULL,
    replanned_on date,
    replan_pending boolean DEFAULT false NOT NULL
);


--
-- Name: entitlement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entitlement (
    student_id text NOT NULL,
    what text NOT NULL,
    granted_by text NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    revoked_by text,
    CONSTRAINT entitlement_what CHECK ((what = 'online_premium'::text))
);


--
-- Name: family_code; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.family_code (
    code text NOT NULL,
    student_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL
);


--
-- Name: family_link; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.family_link (
    parent_id text NOT NULL,
    student_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: freeze_entry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.freeze_entry (
    id text NOT NULL,
    student_id text NOT NULL,
    kind text NOT NULL,
    date date NOT NULL,
    ref text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: game_campus_round; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_campus_round (
    student_id text NOT NULL,
    date date NOT NULL,
    round integer NOT NULL,
    campus_id text NOT NULL,
    lat double precision NOT NULL,
    lon double precision NOT NULL,
    km integer NOT NULL,
    points integer NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: game_daily_answer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_daily_answer (
    student_id text NOT NULL,
    date date NOT NULL,
    qid text NOT NULL,
    choice integer NOT NULL,
    correct boolean NOT NULL,
    seconds integer NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: game_rating; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_rating (
    student_id text NOT NULL,
    kind text NOT NULL,
    rating integer NOT NULL,
    games integer DEFAULT 0 NOT NULL,
    wins integer DEFAULT 0 NOT NULL,
    draws integer DEFAULT 0 NOT NULL,
    losses integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: game_result; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_result (
    id text NOT NULL,
    student_id text NOT NULL,
    kind text NOT NULL,
    result text NOT NULL,
    why text,
    verified boolean NOT NULL,
    moves jsonb NOT NULL,
    rating_before integer,
    rating_after integer,
    coins integer DEFAULT 0 NOT NULL,
    client_id text NOT NULL,
    local_date date NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: homework; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.homework (
    id text NOT NULL,
    source text DEFAULT 'course'::text NOT NULL,
    student_id text NOT NULL,
    lesson_ids text[] NOT NULL,
    courses text[] NOT NULL,
    spec jsonb DEFAULT '{}'::jsonb NOT NULL,
    minutes integer NOT NULL,
    for_day date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT homework_source CHECK ((source = 'course'::text))
);


--
-- Name: homework_turn; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.homework_turn (
    homework_id text NOT NULL,
    student_id text NOT NULL,
    status text DEFAULT 'assigned'::text NOT NULL,
    first_right integer DEFAULT 0 NOT NULL,
    first_of integer DEFAULT 0 NOT NULL,
    items jsonb DEFAULT '[]'::jsonb NOT NULL,
    task_id text,
    shown_at timestamp with time zone,
    handed_in_at timestamp with time zone,
    completed_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT homework_turn_status CHECK ((status = ANY (ARRAY['assigned'::text, 'handed_in'::text, 'complete'::text, 'missing'::text])))
);


--
-- Name: jia_lead; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jia_lead (
    id text NOT NULL,
    user_id text,
    number integer NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    city text NOT NULL,
    course text NOT NULL,
    lang text NOT NULL,
    tg_status text DEFAULT 'pending'::text NOT NULL,
    tg_message_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT jia_lead_city CHECK ((city = ANY (ARRAY['tashkent'::text, 'andijan'::text, 'online'::text]))),
    CONSTRAINT jia_lead_course CHECK ((course = ANY (ARRAY['sat'::text, 'ielts'::text]))),
    CONSTRAINT jia_lead_tg CHECK ((tg_status = ANY (ARRAY['pending'::text, 'sent'::text, 'off'::text, 'failed'::text])))
);


--
-- Name: jia_lead_number_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.jia_lead ALTER COLUMN number ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.jia_lead_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: league_cohort; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.league_cohort (
    id text NOT NULL,
    week date NOT NULL,
    tier integer NOT NULL,
    stage text NOT NULL,
    chat_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: league_member; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.league_member (
    week date NOT NULL,
    student_id text NOT NULL,
    cohort_id text NOT NULL,
    tier integer NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    final_xp integer,
    final_rank integer,
    outcome text
);


--
-- Name: league_player; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.league_player (
    student_id text NOT NULL,
    tier integer DEFAULT 0 NOT NULL,
    best_tier integer DEFAULT 0 NOT NULL,
    weeks integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: league_week; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.league_week (
    week date NOT NULL,
    state text DEFAULT 'open'::text NOT NULL,
    opened_at timestamp with time zone DEFAULT now() NOT NULL,
    closed_at timestamp with time zone,
    dbh jsonb NOT NULL,
    recap jsonb
);


--
-- Name: learner_skill; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.learner_skill (
    student_id text NOT NULL,
    skill text NOT NULL,
    theta double precision NOT NULL,
    answers integer DEFAULT 0 NOT NULL,
    mastery text,
    seed double precision NOT NULL,
    seeded_from text NOT NULL,
    proficient_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT learner_skill_mastery CHECK (((mastery IS NULL) OR (mastery = ANY (ARRAY['attempted'::text, 'familiar'::text, 'proficient'::text, 'mastered'::text])))),
    CONSTRAINT learner_skill_seeded CHECK ((seeded_from = ANY (ARRAY['cat'::text, 'track'::text, 'default'::text])))
);


--
-- Name: lesson_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_progress (
    student_id text NOT NULL,
    lesson_id text NOT NULL,
    course text NOT NULL,
    opened_at timestamp with time zone DEFAULT now() NOT NULL,
    pieces jsonb DEFAULT '[]'::jsonb NOT NULL,
    test_out jsonb,
    test_task_id text,
    passed_at timestamp with time zone,
    minutes_spent integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: lesson_skill; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_skill (
    student_id text NOT NULL,
    skill text NOT NULL,
    level text DEFAULT 'started'::text NOT NULL,
    passes jsonb DEFAULT '[]'::jsonb NOT NULL,
    miss_run integer DEFAULT 0 NOT NULL,
    proficient_at timestamp with time zone,
    mastered_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    rises jsonb,
    CONSTRAINT lesson_skill_level CHECK ((level = ANY (ARRAY['started'::text, 'familiar'::text, 'proficient'::text, 'mastered'::text])))
);


--
-- Name: milestone_report; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.milestone_report (
    id text NOT NULL,
    student_id text NOT NULL,
    milestone_id text NOT NULL,
    source_rule_id text,
    rule_version integer,
    reported_at timestamp with time zone NOT NULL,
    state text DEFAULT 'open'::text NOT NULL,
    resolved_at timestamp with time zone,
    resolved_by text,
    note text
);


--
-- Name: mock_result; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mock_result (
    student_id text NOT NULL,
    mock_date date NOT NULL,
    kind text NOT NULL,
    scores jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT mock_result_kind CHECK ((kind = ANY (ARRAY['sat'::text, 'dtm'::text])))
);


--
-- Name: moderation_audit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.moderation_audit (
    id text NOT NULL,
    item_id text,
    action text NOT NULL,
    actor_id text NOT NULL,
    target_user_id text,
    reason text,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: moderation_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.moderation_item (
    id text NOT NULL,
    kind text NOT NULL,
    ref_id text NOT NULL,
    author_id text NOT NULL,
    subject_id text,
    text text,
    media_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    urgent boolean DEFAULT false NOT NULL,
    ai jsonb,
    one_tap boolean DEFAULT false NOT NULL,
    screen jsonb DEFAULT '[]'::jsonb NOT NULL,
    decided_by text,
    decided_at timestamp with time zone,
    reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT moderation_item_kind CHECK ((kind = ANY (ARRAY['post'::text, 'story'::text, 'reel'::text, 'comment'::text, 'club'::text, 'chat_report'::text, 'user_report'::text, 'milestone_report'::text, 'score_report'::text]))),
    CONSTRAINT moderation_item_status CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'taken_down'::text])))
);


--
-- Name: outcome_prompt; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.outcome_prompt (
    user_id text NOT NULL,
    "window" text NOT NULL,
    student_id text NOT NULL,
    state text NOT NULL,
    shown_at timestamp with time zone DEFAULT now() NOT NULL,
    closed_at timestamp with time zone,
    CONSTRAINT outcome_prompt_state CHECK ((state = ANY (ARRAY['shown'::text, 'answered'::text, 'skipped'::text])))
);


--
-- Name: parent_alert; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parent_alert (
    parent_id text NOT NULL,
    student_id text NOT NULL,
    missed_homework boolean DEFAULT true NOT NULL,
    level_drop boolean DEFAULT true NOT NULL,
    inactivity boolean DEFAULT true NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: parent_note; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parent_note (
    id text NOT NULL,
    student_id text NOT NULL,
    parent_id text NOT NULL,
    kind text DEFAULT 'congrats'::text NOT NULL,
    event text NOT NULL,
    words jsonb NOT NULL,
    seen_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT parent_note_kind CHECK ((kind = 'congrats'::text))
);


--
-- Name: password; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password (
    user_id text NOT NULL,
    hash text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pay_coupon; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pay_coupon (
    id text NOT NULL,
    student_id text NOT NULL,
    kind text NOT NULL,
    source text NOT NULL,
    source_ref text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    used_order_id text,
    CONSTRAINT pay_coupon_kind CHECK ((kind = ANY (ARRAY['premium_30'::text, 'pro_month'::text])))
);


--
-- Name: pay_event; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pay_event (
    id text NOT NULL,
    txn_id text,
    order_id text,
    action text NOT NULL,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    by text,
    at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pay_gift; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pay_gift (
    id text NOT NULL,
    code_hash text NOT NULL,
    order_id text NOT NULL,
    tier text NOT NULL,
    months integer NOT NULL,
    from_id text NOT NULL,
    note text DEFAULT ''::text NOT NULL,
    for_name text DEFAULT ''::text NOT NULL,
    claimed_by text,
    claimed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pay_order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pay_order (
    id text NOT NULL,
    number bigint NOT NULL,
    kind text NOT NULL,
    student_id text,
    payer_id text NOT NULL,
    payer_role text NOT NULL,
    tier text NOT NULL,
    period text NOT NULL,
    months integer NOT NULL,
    list_usd_cents integer NOT NULL,
    price_usd_cents integer NOT NULL,
    coupon_id text,
    amount_uzs bigint NOT NULL,
    fx_uzs_per_usd integer NOT NULL,
    fx_source text NOT NULL,
    sandbox boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pay_order_amount CHECK (((amount_uzs > 0) AND (price_usd_cents > 0) AND ((months >= 1) AND (months <= 12)))),
    CONSTRAINT pay_order_kind CHECK ((kind = ANY (ARRAY['plan'::text, 'gift'::text]))),
    CONSTRAINT pay_order_payer_role CHECK ((payer_role = ANY (ARRAY['student'::text, 'parent'::text]))),
    CONSTRAINT pay_order_period CHECK ((period = ANY (ARRAY['monthly'::text, 'annual'::text, 'months'::text]))),
    CONSTRAINT pay_order_plan_student CHECK (((kind = 'plan'::text) = (student_id IS NOT NULL))),
    CONSTRAINT pay_order_tier CHECK ((tier = ANY (ARRAY['pro'::text, 'premium'::text, 'vip'::text])))
);


--
-- Name: pay_order_number_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.pay_order ALTER COLUMN number ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.pay_order_number_seq
    START WITH 100001
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: pay_txn; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pay_txn (
    id text NOT NULL,
    seq bigint NOT NULL,
    provider text NOT NULL,
    provider_ref text NOT NULL,
    order_id text NOT NULL,
    amount_uzs bigint NOT NULL,
    provider_time timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    paid_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    cancel_reason integer,
    refunded_at timestamp with time zone,
    refunded_by text,
    CONSTRAINT pay_txn_provider CHECK ((provider = ANY (ARRAY['payme'::text, 'click'::text])))
);


--
-- Name: pay_txn_seq_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.pay_txn ALTER COLUMN seq ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.pay_txn_seq_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: plan_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plan_usage (
    user_id text NOT NULL,
    day date NOT NULL,
    kind text NOT NULL,
    n integer DEFAULT 0 NOT NULL
);


--
-- Name: pledge; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pledge (
    id text NOT NULL,
    student_id text NOT NULL,
    parent_id text NOT NULL,
    goal text NOT NULL,
    target integer NOT NULL,
    base integer DEFAULT 0 NOT NULL,
    reward text NOT NULL,
    due date NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    reached_at timestamp with time zone,
    given_at timestamp with time zone,
    seen_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pledge_goal CHECK ((goal = ANY (ARRAY['bricks'::text, 'tasks'::text, 'streak'::text]))),
    CONSTRAINT pledge_reward CHECK (((char_length(reward) >= 1) AND (char_length(reward) <= 80))),
    CONSTRAINT pledge_status CHECK ((status = ANY (ARRAY['active'::text, 'reached'::text, 'given'::text, 'ended'::text]))),
    CONSTRAINT pledge_target CHECK (((target >= 1) AND (target <= 10000)))
);


--
-- Name: practice_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.practice_item (
    item_id text NOT NULL,
    b double precision NOT NULL,
    answers integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile (
    user_id text NOT NULL,
    role public.role NOT NULL,
    full_name text NOT NULL,
    first_name text NOT NULL,
    last_name text DEFAULT ''::text NOT NULL,
    photo_url text,
    locale text DEFAULT 'en'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    timezone text DEFAULT 'Asia/Tashkent'::text NOT NULL,
    demo boolean DEFAULT false NOT NULL,
    roadmap_lang text
);


--
-- Name: profile_photo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile_photo (
    user_id text NOT NULL,
    mime text NOT NULL,
    bytes bytea NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL,
    version text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT profile_photo_mime CHECK ((mime = ANY (ARRAY['image/jpeg'::text, 'image/png'::text, 'image/webp'::text]))),
    CONSTRAINT profile_photo_size CHECK (((octet_length(bytes) >= 1) AND (octet_length(bytes) <= 102400)))
);


--
-- Name: proof_file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proof_file (
    id text NOT NULL,
    student_id text NOT NULL,
    uploaded_by text NOT NULL,
    kind text NOT NULL,
    mime text NOT NULL,
    bytes bytea NOT NULL,
    sha256 text NOT NULL,
    size integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT proof_file_kind CHECK ((kind = ANY (ARRAY['score_report'::text, 'decision'::text, 'bluebook'::text, 'task'::text]))),
    CONSTRAINT proof_file_mime CHECK ((mime = ANY (ARRAY['application/pdf'::text, 'image/jpeg'::text, 'image/png'::text, 'image/webp'::text]))),
    CONSTRAINT proof_file_size CHECK (((octet_length(bytes) >= 1) AND (octet_length(bytes) <= 4194304)))
);


--
-- Name: readiness_snapshot; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.readiness_snapshot (
    student_id text NOT NULL,
    taken_at timestamp with time zone NOT NULL,
    kind text NOT NULL,
    local_date date NOT NULL,
    overall integer NOT NULL,
    tier text NOT NULL,
    card jsonb NOT NULL
);


--
-- Name: report; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report (
    id text NOT NULL,
    reporter_id text NOT NULL,
    target text NOT NULL,
    target_user_id text,
    target_ref text,
    label text,
    reason text NOT NULL,
    note text,
    urgent boolean DEFAULT false NOT NULL,
    surface text,
    status text DEFAULT 'open'::text NOT NULL,
    item_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT report_reason CHECK ((reason = ANY (ARRAY['spam'::text, 'bullying'::text, 'inappropriate'::text, 'not_educational'::text, 'danger'::text, 'other'::text]))),
    CONSTRAINT report_status CHECK ((status = ANY (ARRAY['open'::text, 'resolved'::text, 'dismissed'::text]))),
    CONSTRAINT report_target CHECK ((target = ANY (ARRAY['message'::text, 'profile'::text, 'post'::text, 'story'::text, 'reel'::text, 'comment'::text, 'club'::text, 'member'::text, 'other'::text])))
);


--
-- Name: roadmap; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roadmap (
    id text NOT NULL,
    student_id text NOT NULL,
    profile_version integer NOT NULL,
    archetype text,
    phases jsonb NOT NULL,
    weekly_goals jsonb NOT NULL,
    narration jsonb NOT NULL,
    narration_by text DEFAULT 'code'::text NOT NULL,
    created_on date NOT NULL,
    engine_version text NOT NULL,
    rules_version text NOT NULL,
    generated_at timestamp with time zone NOT NULL,
    is_current boolean DEFAULT true NOT NULL,
    lang text,
    planned_by text DEFAULT 'code'::text NOT NULL,
    ai_run_id text,
    strategy jsonb
);


--
-- Name: roadmap_change; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roadmap_change (
    id text NOT NULL,
    student_id text NOT NULL,
    roadmap_id text NOT NULL,
    at date NOT NULL,
    what_changed text NOT NULL,
    cause_event_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    what_changed_ai text,
    ai_language text,
    ai_run_id text
);


--
-- Name: roadmap_milestone; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roadmap_milestone (
    roadmap_id text NOT NULL,
    id text NOT NULL,
    student_id text NOT NULL,
    "position" integer NOT NULL,
    phase_id text NOT NULL,
    kind text NOT NULL,
    route text NOT NULL,
    title text NOT NULL,
    why text,
    due date,
    hard_deadline boolean NOT NULL,
    source_rule_id text,
    rule_version integer,
    needs_verification boolean NOT NULL,
    human_checkpoint boolean NOT NULL,
    depends_on text[] DEFAULT '{}'::text[] NOT NULL,
    status text NOT NULL,
    locked boolean DEFAULT false NOT NULL,
    verified_at text,
    source_url text,
    title_en text
);


--
-- Name: rule_record; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rule_record (
    id text NOT NULL,
    version integer NOT NULL,
    kind text NOT NULL,
    status text NOT NULL,
    body jsonb NOT NULL,
    needs_verification boolean DEFAULT true NOT NULL,
    verified_at text,
    source_url text,
    effective_cycle text,
    is_current boolean DEFAULT true NOT NULL,
    created_by text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sat_sitting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sat_sitting (
    student_id text NOT NULL,
    form_id text NOT NULL,
    mock_date date NOT NULL,
    started_at timestamp with time zone NOT NULL,
    finished_at timestamp with time zone,
    ended jsonb DEFAULT '{}'::jsonb NOT NULL,
    data jsonb NOT NULL,
    answers jsonb DEFAULT '{}'::jsonb NOT NULL,
    marks jsonb DEFAULT '{}'::jsonb NOT NULL,
    result jsonb,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schedule_state; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_state (
    student_id text NOT NULL,
    state jsonb NOT NULL,
    repair jsonb,
    synced_on date,
    reminder_on date,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: score_report; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.score_report (
    id text NOT NULL,
    student_id text NOT NULL,
    test text NOT NULL,
    subject text,
    scores jsonb NOT NULL,
    test_date date,
    proof_id text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    reviewed_by text,
    reviewed_at timestamp with time zone,
    review_note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT score_report_status CHECK ((status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text]))),
    CONSTRAINT score_report_test CHECK ((test = ANY (ARRAY['sat'::text, 'psat'::text, 'act'::text, 'ielts'::text, 'toefl'::text, 'det'::text, 'pte'::text, 'cambridge'::text, 'ap'::text, 'ib'::text, 'alevel'::text, 'cefr'::text, 'milliy'::text, 'agency'::text])))
);


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp without time zone NOT NULL
);


--
-- Name: speaking_practice; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.speaking_practice (
    student_id text NOT NULL,
    lesson_id text NOT NULL,
    opened_at timestamp with time zone NOT NULL,
    plan_at timestamp with time zone,
    talk_at timestamp with time zone,
    plan_s integer,
    talk_s integer,
    ticks jsonb,
    checked_at timestamp with time zone,
    attempts integer DEFAULT 0 NOT NULL,
    done_at timestamp with time zone,
    coins integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: srs_card; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.srs_card (
    student_id text NOT NULL,
    item_id text NOT NULL,
    skill text NOT NULL,
    due timestamp with time zone,
    fsrs jsonb,
    reviews integer DEFAULT 0 NOT NULL,
    served integer DEFAULT 0 NOT NULL,
    last_served_at timestamp with time zone,
    seen jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: staff_checkpoint; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_checkpoint (
    id text NOT NULL,
    student_id text NOT NULL,
    kind text NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    task_id text,
    proof_id text,
    completes boolean DEFAULT false NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    decided_by text,
    decided_at timestamp with time zone,
    reason text,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT staff_checkpoint_kind CHECK ((kind = ANY (ARRAY['link'::text, 'upload'::text, 'artifact'::text, 'final_list'::text, 'essay_final'::text, 'ed_choice'::text, 'other'::text]))),
    CONSTRAINT staff_checkpoint_status CHECK ((status = ANY (ARRAY['open'::text, 'approved'::text, 'returned'::text])))
);


--
-- Name: staff_member; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_member (
    user_id text NOT NULL,
    role text NOT NULL,
    on_duty boolean DEFAULT false NOT NULL,
    added_by text NOT NULL,
    added_at timestamp with time zone DEFAULT now() NOT NULL,
    removed_at timestamp with time zone,
    removed_by text,
    CONSTRAINT staff_member_role CHECK ((role = ANY (ARRAY['admin'::text, 'moderator'::text, 'counselor'::text, 'teacher'::text, 'coordinator'::text])))
);


--
-- Name: streak_state; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.streak_state (
    student_id text NOT NULL,
    current integer DEFAULT 0 NOT NULL,
    best integer DEFAULT 0 NOT NULL,
    best_end date,
    freezes integer DEFAULT 0 NOT NULL,
    closed_through date,
    last_grant_week date,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: student_motivation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_motivation (
    student_id text NOT NULL,
    why text,
    why_at timestamp with time zone,
    letter_text text,
    letter_sealed_at timestamp with time zone,
    letter_ps jsonb DEFAULT '[]'::jsonb NOT NULL,
    letter_opened_at timestamp with time zone,
    comeback jsonb,
    comebacks jsonb DEFAULT '[]'::jsonb NOT NULL,
    style_active jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: study_consent; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.study_consent (
    study text DEFAULT 'bluebook_math'::text NOT NULL,
    student_id text NOT NULL,
    invite_id text NOT NULL,
    asked_at timestamp with time zone NOT NULL,
    parent_id text,
    answer text,
    answered_at timestamp with time zone,
    version text,
    CONSTRAINT study_consent_answer CHECK ((((answer IS NULL) AND (answered_at IS NULL)) OR ((answer = ANY (ARRAY['yes'::text, 'no'::text])) AND (answered_at IS NOT NULL)))),
    CONSTRAINT study_consent_study CHECK ((study = 'bluebook_math'::text))
);


--
-- Name: study_invite; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.study_invite (
    id text NOT NULL,
    study text DEFAULT 'bluebook_math'::text NOT NULL,
    code_hash text NOT NULL,
    label text NOT NULL,
    created_by text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    max_uses integer NOT NULL,
    uses integer DEFAULT 0 NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT study_invite_study CHECK ((study = 'bluebook_math'::text))
);


--
-- Name: study_pair; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.study_pair (
    id text NOT NULL,
    study text DEFAULT 'bluebook_math'::text NOT NULL,
    invite_id text NOT NULL,
    student_id text NOT NULL,
    consent_version text NOT NULL,
    consent_at timestamp with time zone NOT NULL,
    bluebook_kind text NOT NULL,
    bluebook_date date NOT NULL,
    bluebook_math integer NOT NULL,
    bluebook_total integer,
    proof_id text,
    withdrawn_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT study_pair_kind CHECK ((bluebook_kind = ANY (ARRAY['practice'::text, 'official'::text]))),
    CONSTRAINT study_pair_math CHECK ((((bluebook_math >= 200) AND (bluebook_math <= 800)) AND ((bluebook_math % 10) = 0))),
    CONSTRAINT study_pair_total CHECK (((bluebook_total IS NULL) OR (((bluebook_total >= 400) AND (bluebook_total <= 1600)) AND ((bluebook_total % 10) = 0))))
);


--
-- Name: study_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.study_session (
    id text NOT NULL,
    student_id text NOT NULL,
    client_id text NOT NULL,
    subject text NOT NULL,
    task_id text,
    minutes_planned integer NOT NULL,
    started_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone NOT NULL,
    ended_at timestamp with time zone,
    status text NOT NULL,
    break_reason text,
    minutes_studied integer DEFAULT 0 NOT NULL,
    bricks_awarded integer DEFAULT 0 NOT NULL,
    xp_awarded integer DEFAULT 0 NOT NULL,
    dbh_bonus integer DEFAULT 0 NOT NULL,
    local_date date NOT NULL
);


--
-- Name: subscription; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscription (
    id text NOT NULL,
    student_id text NOT NULL,
    tier text NOT NULL,
    starts_on date NOT NULL,
    ends_on date NOT NULL,
    source text NOT NULL,
    order_id text,
    gift_id text,
    coupon_id text,
    payer_id text,
    gifted_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone,
    ended_reason text,
    CONSTRAINT subscription_days CHECK ((ends_on > starts_on)),
    CONSTRAINT subscription_source CHECK ((source = ANY (ARRAY['payment'::text, 'gift'::text, 'coupon'::text, 'staff'::text]))),
    CONSTRAINT subscription_tier CHECK ((tier = ANY (ARRAY['pro'::text, 'premium'::text, 'vip'::text])))
);


--
-- Name: task_batch; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_batch (
    id text NOT NULL,
    student_id text NOT NULL,
    week_start date NOT NULL,
    roadmap_id text,
    cadence jsonb NOT NULL,
    generated_by text DEFAULT 'code'::text NOT NULL,
    engine_version text NOT NULL,
    rules_version text NOT NULL,
    generated_at timestamp with time zone NOT NULL
);


--
-- Name: task_completion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_completion (
    student_id text NOT NULL,
    task_id text NOT NULL,
    date date NOT NULL,
    completed_at timestamp with time zone NOT NULL,
    proof_kind text NOT NULL,
    proof text NOT NULL,
    result jsonb,
    review text DEFAULT 'auto'::text NOT NULL,
    coins_awarded integer NOT NULL,
    client_id text
);


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id text NOT NULL,
    name text,
    email text,
    "emailVerified" timestamp without time zone,
    image text
);


--
-- Name: user_block; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_block (
    blocker_id text NOT NULL,
    blocked_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_block_self CHECK ((blocker_id <> blocked_id))
);


--
-- Name: user_state; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_state (
    user_id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: verificationToken; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."verificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp without time zone NOT NULL
);


--
-- Name: video_clip; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_clip (
    id text NOT NULL,
    source_id text NOT NULL,
    lesson_id text NOT NULL,
    course text NOT NULL,
    kind text NOT NULL,
    piece_n integer,
    start_s double precision NOT NULL,
    end_s double precision NOT NULL,
    duration_s double precision DEFAULT 0 NOT NULL,
    file_key text,
    poster_key text,
    bytes double precision DEFAULT 0 NOT NULL,
    status text NOT NULL,
    error text,
    captions jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_by text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT video_clip_kind CHECK ((kind = ANY (ARRAY['clip'::text, 'whole'::text]))),
    CONSTRAINT video_clip_piece_n CHECK (((kind = 'clip'::text) = (piece_n IS NOT NULL))),
    CONSTRAINT video_clip_span CHECK (((end_s > start_s) AND (start_s >= (0)::double precision))),
    CONSTRAINT video_clip_status CHECK ((status = ANY (ARRAY['processing'::text, 'ready'::text, 'failed'::text])))
);


--
-- Name: video_source; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_source (
    id text NOT NULL,
    file_key text NOT NULL,
    name text NOT NULL,
    origin text NOT NULL,
    bytes double precision DEFAULT 0 NOT NULL,
    duration_s double precision DEFAULT 0 NOT NULL,
    teacher_name text,
    teacher_consent boolean DEFAULT false NOT NULL,
    captions jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_by text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    file_removed_at timestamp with time zone,
    CONSTRAINT video_source_origin CHECK ((origin = ANY (ARRAY['upload'::text, 'register'::text]))),
    CONSTRAINT video_source_teacher CHECK (((teacher_name IS NULL) OR teacher_consent))
);


--
-- Name: video_watch; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_watch (
    student_id text NOT NULL,
    clip_id text NOT NULL,
    seen text DEFAULT ''::text NOT NULL,
    seen_s integer DEFAULT 0 NOT NULL,
    of_s integer DEFAULT 0 NOT NULL,
    first_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: wallet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallet (
    student_id text NOT NULL,
    balance integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT wallet_balance_nonneg CHECK ((balance >= 0))
);


--
-- Name: wallet_backfill; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallet_backfill (
    coin_entry_id text NOT NULL,
    student_id text NOT NULL,
    amount integer NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: writing_piece; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.writing_piece (
    student_id text NOT NULL,
    lesson_id text NOT NULL,
    opened_at timestamp with time zone NOT NULL,
    draft text,
    draft_words integer,
    draft_at timestamp with time zone,
    feedback jsonb,
    feedback_by text,
    ai_run_id text,
    revision text,
    revision_words integer,
    revision_at timestamp with time zone,
    revisions integer DEFAULT 0 NOT NULL,
    done_at timestamp with time zone,
    coins integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT writing_piece_by CHECK (((feedback_by IS NULL) OR (feedback_by = ANY (ARRAY['ai'::text, 'self'::text]))))
);


--
-- Name: xp_entry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.xp_entry (
    id text NOT NULL,
    student_id text NOT NULL,
    amount integer NOT NULL,
    reason text NOT NULL,
    ref text NOT NULL,
    local_date date NOT NULL,
    at timestamp with time zone NOT NULL
);


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: chat_message id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message ALTER COLUMN id SET DEFAULT nextval('public.chat_message_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: -
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	73375854d6861a43259730218290f14fea199e7b6a6d0ee36b4edff828b543cb	1790443581496
2	0168b0f9cecd80833de2b82e366f10a1d20fe106b69bdd2947cc7ae60deb8479	1790581457533
3	754cf308e250699246475f839033982a7d25b4aeae3b0ea72ea00119dc05661f	1790581465833
4	2f60885246b9d2bc772e4ffe8ed6d826fea1c98385d845085828cc005849acfc	1790930035993
5	ffdd5543ce8229325ef9a264e3f8e2c7b8077a121e094bac61ffd0cd421f2b23	1790930053056
6	0475291b4f0bf8128f1a80bc5de7a881d69b8599841139fc83822e93be930cde	1790987562721
7	674a12608e34c9dd0ae81a7241176146d4d5ca33e4a7f79c21f30858590576b3	1790994426769
8	9e5142692dfd32fee79eac50fcb66a1ac2a25c2db3a9c9cd2628e6a42ec095d4	1791022574262
9	221744c6dce2c9953d4b96d37cb0290888cbbc79c3fa6c3d46c7373a9ee6929c	1791040793511
10	6907fe717a2b985cadb94312bae0fe03b4cb30632577f04c5ea3229027132a63	1791051622125
11	caef912394cd8b0c84bdb1eb14d5130aa115d67934a2e5467be954c0e2d37e1d	1791057630414
12	9e14424ddf7601a0ceb14d9a1475f5070d316008fd39cc1fafbaaee3014ead03	1791117343603
13	91d330b173b328b2243518f9d4d6496d3b94617252da4e7e8839de3b82b941d7	1791337222511
14	df0dd3a6a6cba041e03e063c6ce219621a1c387a4ab2ff086eddb31f6b34d9d3	1791349352121
15	ce9e410b1f41bc7dca95bbef1006478192ba26b8fed25caf85a375544a591405	1791357536011
16	3b9f9227adf83f9c1201cacea46b09b4c30b26534d52c4ff705e1f60021dd4d4	1791367511754
17	76475187668051a2091ebadf6aa6dca832ba68ef2bc5fbde754f4c5f3639d173	1791376314251
18	9cd89714e32c23f3f374f87d91f7d833c7bbc069e8f0334c2f0abd998eb83a8e	1791570347059
19	4f9136214a10c61c725f5369785ff59db6d8d323145ad41b506a2198ddd85e36	1791572962925
20	9c7c2ab18a158ea06f390e3b5d30e10d43c96d43b696f43d378bb67a863f059e	1791573471175
21	2520e507aed1b82f9296031f3d606d73b52430503b3b4d828c2037ee988df329	1791601271589
22	9b02f4f0e20d9e4d3dee4f05484d0cbac1ddc30f1287c016e1b09058e0e46d77	1791622012781
23	d1bf1e643d44c89d5a1993bdc97d6f3d1f12e6aa3f6298fd152f0378a49f0631	1791626586179
24	8ceea864044a64ce2ffbb775aa3fc9039c3e201d41181ff572283ebd28f2b796	1791626586180
25	e1adfab0096dc1073714f7d9f6f4f79e9cf86f793e1986e2e0c443be1c92cf13	1791649453464
26	e77580c135f560a8756d87827b246cb994638d8b5f4af7f7eb51641ed79223a4	1791649453465
27	32f8003f0035df1014db1e042b40a54d105769522b04053d882530047bf37f93	1791688540197
28	99e23d203c0de88055760233fda8bfb801832a5813d6944286d08c33be4d0a19	1791688540198
29	a732448150e2a7372fd758573007b44816107bc6b6a01cc40f97a9dda34287da	1791816039232
30	21a0f6d3bb2e486b2ccda0e8927f6f44babf8c846fc486d401be7bba2b7283d2	1791830166596
31	f25a00bd59f549f444ef633de003dd5e777a1b6009ffd0970ee42163173a26ca	1791885709647
32	1488ab4496b4315dc9d5db916ab441214ae74725efc0303fc003085986da98cd	1791885710647
33	2dda2b4a977a4cf9efbe139c2b341ebfcd6e8683ef4ea032216255420508495a	1791885711647
34	92e6c3a0213873861d044cb2d865283009d6b088fbd6a17fb2e9c2ac0dbfec33	1791935416047
35	4a2d655c1edfc23c311df287f2b55f69c44203ca32439475696fe039b9164071	1791939416235
36	afc8245cd8b785a1f6c3f6ac72d0838488c42faafad8bfc369248664d231981a	1791939507644
37	22eb2803d4fd93f08e0f91c8f8be0ca8eef67fd0336d7c8cc00510df17da7acc	1791961250116
38	7bb61362385edee6643cf8cd1d2718db8f79896fee54c1a81bb68ff3d2c3a44f	1792327965130
39	29c5de803c3421b2cb84389c0ee695232b8b0f2eb22f2ab4b4b5afd62c24bda5	1792328320172
40	cdc3262e8cfe276d8bd8821a8ee311b7f3c63b7cd477b6267241e86262f34637	1792474083423
41	f0e0888a4a1df3cf2a6333b63a9b714f1536ff8480598367e9b38995a6908682	1792474143423
42	35c941b1cf49dfc6820b9f7d597ddcb302ac1534e3d611ebe7a235ac20a75db6	1792474203423
43	59072659825bf8175dccdcb772f8dfa773ec6de291ccc8c6286e0293f6e38d45	1792474263423
44	b5b4fd33d44afcca796c122be07b2762be30f6f5ae24ffca9eac73bd48412cd0	1792474323423
45	765574db0e55563b6c55838627a8a7df5d061f40bf40bf0fea925661d3cfae66	1792474383423
46	75f1417e9b27823118dab0f90f37ec3bbca9e1abfd2a92c94741976b48e3ff04	1792474443423
47	f23388df9dac7915150dbebbe36d6039a2875c527fa25d81fa0956023cccc8a0	1792474503423
48	aace71c2dea34dd6583f894c8bb92c4b44d5dbda90ec6b1e41c9ad97ae57c847	1792474563423
49	7d3a8e4c4d57ac9725705a4fcfdc4bd04ca9f3e0b2392b1aca3184fbdcd5d30f	1792474623423
50	d3a37113f14b1e873d34d83fc5f6b2a106e8760e609b341a67b8d40c21dee9e6	1792474683423
51	6467229d268420180b2bca4d4997c42c7d51c9fbf7350c58d425bab7d3815489	1792474743423
\.


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.account ("userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: account_suspension; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.account_suspension (id, user_id, by, reason, at, until, lifted_at, lifted_by) FROM stdin;
\.


--
-- Data for Name: achievement_award; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.achievement_award (student_id, achievement, earned_at, local_date, serial, ref, ceremony_at) FROM stdin;
\.


--
-- Data for Name: activity_day; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_day (student_id, date, scheduled, rest, tasks_done, tasks_of, minutes, bricks, sessions, xp, qualified, freeze_used, streak_after, closed) FROM stdin;
\.


--
-- Data for Name: admission_outcome; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admission_outcome (id, student_id, cycle, target, university_name, round, decision, final, aid_offered, placement, agency_score, agency_blocks, proof_id, verified, verified_by, verified_at, prediction_id, source, reported_by, "window", history, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: admission_prediction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admission_prediction (id, student_id, university, programme, cycle, profile_version, model_version, spec_version, readiness_version, shape, state, inputs, gates, p_mid, p_lo, p_hi, displayed, displayed_value, displayed_text, other_value, created_at, frozen_at, target, spec_cycle, system, tier, international, form, grant_mid) FROM stdin;
\.


--
-- Data for Name: ai_consent; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_consent (user_id, notice_version, accepted_at) FROM stdin;
\.


--
-- Data for Name: ai_interpretation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_interpretation (student_id, question_id, answer_hash, prompt_version, score_1_5, tags, rationale_2_lines, language_detected, theme, run_id, created_at) FROM stdin;
\.


--
-- Data for Name: ai_job; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_job (id, student_id, kind, ref, priority, status, attempts, not_before, claim, lease_until, rerun, run_id, payload, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ai_run; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_run (id, student_id, kind, ref, input_hash, input, prompt_version, guard_version, language, model, effort, status, output, violations, stop_reason, stop_category, fallback_served, usage, cost_usd, latency_ms, created_at, finished_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: ai_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_settings (id, layer_on, steps, languages, min_guard_version, notice_version, allowances, daily_usd, new_account_daily_usd, draft_wait_after_ms, updated_at, updated_by) FROM stdin;
1	f	{interpret,result,change,tasks,react}	{en,uz,ru}	1	\N	{"react": 12, "tasks": 4, "change": 6, "result": 6, "interpret": 10}	40	5	20000	2026-10-21 10:42:12.038473+05	migration
\.


--
-- Data for Name: ai_usage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_usage (user_id, day, count, lesson, chat, input_tokens, output_tokens, cost_usd, errors) FROM stdin;
\.


--
-- Data for Name: brick_entry; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.brick_entry (id, student_id, amount, reason, ref, local_date, at) FROM stdin;
\.


--
-- Data for Name: chat; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat (id, kind, name, about, ref, parent_id, status, created_by, dm_key, created_at, last_message_id, last_message_at) FROM stdin;
global	global	Messages	\N	\N	\N	active	\N	\N	2026-10-21 10:42:12.038473+05	\N	\N
club:mit	club_channel	MIT applicants	For everyone aiming at MIT: essays, activities, SAT 1500+.	\N	\N	active	\N	\N	2026-10-21 10:42:12.038473+05	\N	\N
club:olymp	club_channel	Olympiad math	Problems, camps and regional dates.	\N	\N	active	\N	\N	2026-10-21 10:42:12.038473+05	\N	\N
club:ielts7	club_channel	IELTS 7+	Speaking partners, writing feedback, test dates.	\N	\N	active	\N	\N	2026-10-21 10:42:12.038473+05	\N	\N
club:premed	club_channel	Pre-med	Biology, chemistry and research for future doctors.	\N	\N	active	\N	\N	2026-10-21 10:42:12.038473+05	\N	\N
club:germany	club_channel	Germany route	Studienkolleg, TUM, German language.	\N	\N	active	\N	\N	2026-10-21 10:42:12.038473+05	\N	\N
club:coding	club_channel	Coding	Projects, olympiad informatics, first internships.	\N	\N	active	\N	\N	2026-10-21 10:42:12.038473+05	\N	\N
club:mit:intro	club_topic	Introduce yourself	\N	\N	club:mit	active	\N	\N	2026-10-21 10:42:12.038473+05	\N	\N
club:mit:essays	club_topic	Essays and activities	\N	\N	club:mit	active	\N	\N	2026-10-21 10:42:12.038473+05	\N	\N
club:mit:sat	club_topic	SAT 1500+	\N	\N	club:mit	active	\N	\N	2026-10-21 10:42:12.038473+05	\N	\N
club:olymp:pod	club_topic	Problem of the day	\N	\N	club:olymp	active	\N	\N	2026-10-21 10:42:12.038473+05	\N	\N
club:olymp:camps	club_topic	Camps and dates	\N	\N	club:olymp	active	\N	\N	2026-10-21 10:42:12.038473+05	\N	\N
club:ielts7:speak	club_topic	Speaking partners	\N	\N	club:ielts7	active	\N	\N	2026-10-21 10:42:12.038473+05	\N	\N
club:ielts7:writing	club_topic	Writing Task 2	\N	\N	club:ielts7	active	\N	\N	2026-10-21 10:42:12.038473+05	\N	\N
club:premed:bio	club_topic	Biology olympiad	\N	\N	club:premed	active	\N	\N	2026-10-21 10:42:12.038473+05	\N	\N
club:premed:research	club_topic	Research ideas	\N	\N	club:premed	active	\N	\N	2026-10-21 10:42:12.038473+05	\N	\N
club:germany:kolleg	club_topic	Studienkolleg	\N	\N	club:germany	active	\N	\N	2026-10-21 10:42:12.038473+05	\N	\N
club:germany:german	club_topic	German A1 → B1	\N	\N	club:germany	active	\N	\N	2026-10-21 10:42:12.038473+05	\N	\N
club:coding:projects	club_topic	Show your project	\N	\N	club:coding	active	\N	\N	2026-10-21 10:42:12.038473+05	\N	\N
club:coding:informatics	club_topic	Informatics olympiad	\N	\N	club:coding	active	\N	\N	2026-10-21 10:42:12.038473+05	\N	\N
\.


--
-- Data for Name: chat_member; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_member (chat_id, user_id, role, muted, last_read, joined_at) FROM stdin;
\.


--
-- Data for Name: chat_message; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_message (id, chat_id, sender_id, kind, text, reply_to, status, client_id, created_at, edited_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: chat_pin; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_pin (chat_id, message_id, pinned_by, pinned_at) FROM stdin;
\.


--
-- Data for Name: chat_poll; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_poll (message_id, question, options, anonymous, closed_at) FROM stdin;
\.


--
-- Data for Name: chat_poll_vote; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_poll_vote (message_id, user_id, option, voted_at) FROM stdin;
\.


--
-- Data for Name: chat_reaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_reaction (message_id, user_id, emoji, created_at) FROM stdin;
\.


--
-- Data for Name: check_run; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.check_run (id, student_id, kind, ref, attempt, status, data, result, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: coin_entry; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coin_entry (id, student_id, amount, reason, ref, idem, client_id, local_date, payload, created_at) FROM stdin;
a0126ea2-d375-4a14-866b-ef4f1e4a1870	20f8ca74-7736-4f9b-8140-b5ae819ccdea	120	seed_fixture	demo	seed_fixture	\N	2026-10-21	\N	2026-10-21 10:42:15.946+05
\.


--
-- Data for Name: community_comment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.community_comment (id, post_id, author_id, parent_id, text, status, review_id, reject_reason, created_at, decided_at) FROM stdin;
\.


--
-- Data for Name: community_follow; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.community_follow (follower_id, followee_id, state, at) FROM stdin;
\.


--
-- Data for Name: community_like; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.community_like (post_id, user_id, at) FROM stdin;
\.


--
-- Data for Name: community_media; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.community_media (id, owner_id, kind, status, error, file_key, poster_key, src_key, mime, bytes, width, height, duration_s, created_at, updated_at, used_at) FROM stdin;
\.


--
-- Data for Name: community_note; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.community_note (id, user_id, actor_id, kind, target_kind, target_id, text, created_at, read_at) FROM stdin;
\.


--
-- Data for Name: community_poll_vote; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.community_poll_vote (post_id, user_id, option, at) FROM stdin;
\.


--
-- Data for Name: community_post; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.community_post (id, author_id, kind, text, media_id, poll, style, status, review_id, reject_reason, created_at, updated_at, decided_at, approved_at) FROM stdin;
\.


--
-- Data for Name: community_profile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.community_profile (user_id, handle, bio, show_photo, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: community_save; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.community_save (post_id, user_id, at) FROM stdin;
\.


--
-- Data for Name: community_story; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.community_story (id, author_id, text, media_id, style, status, review_id, reject_reason, created_at, decided_at, expires_at) FROM stdin;
\.


--
-- Data for Name: community_story_view; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.community_story_view (story_id, viewer_id, at) FROM stdin;
\.


--
-- Data for Name: community_view; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.community_view (post_id, user_id, at) FROM stdin;
\.


--
-- Data for Name: core_deletion_request; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.core_deletion_request (id, student_id, asked_by, role, state, created_at, done_at) FROM stdin;
\.


--
-- Data for Name: daily_task; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.daily_task (student_id, id, batch_id, date, slot, milestone_id, weekly_goal_id, type, subject, short, title, instructions, est_minutes, verification, coins, quiz, deep, optional, template, seq, language, generated_by, constraints_hash, status, created_at, title_ai, instructions_ai, ai_input_hash, ai_language, ai_run_id, meta) FROM stdin;
\.


--
-- Data for Name: diagnostic_answer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.diagnostic_answer (student_id, question_id, source, value, status, answered_at, profile_version) FROM stdin;
\.


--
-- Data for Name: dream_build; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dream_build (student_id, university, target, bricks, cracked, updated_at) FROM stdin;
20f8ca74-7736-4f9b-8140-b5ae819ccdea	MIT	600	0	{}	2026-10-21 10:42:15.9389+05
\.


--
-- Data for Name: dtm_sitting; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dtm_sitting (student_id, mock_date, mock_id, started_at, ends_at, finished_at, data, answers, updated_at) FROM stdin;
\.


--
-- Data for Name: engine_event; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.engine_event (id, student_id, type, payload, at, local_date, profile_version_after, client_id) FROM stdin;
\.


--
-- Data for Name: engine_result; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.engine_result (student_id, profile_version, answers, derived, scorecard, flags, feasibility, archetype, first_tasks, player_card, engine_version, rules_version, computed_at, ai) FROM stdin;
\.


--
-- Data for Name: engine_state; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.engine_state (student_id, profile_version, diagnostic, diagnostic_done_at, first_done_on, unlocked_at, unlocked_on, parallel, stage, archetype, lessons, deep_done, parent_consent_at, parent_flow_done_at, parent_sent_at, parent_lang, engine_version, rules_version, updated_at, phase_d_from, profile_complete_at, profile_complete_by, unknowns, replanned_on, replan_pending) FROM stdin;
20f8ca74-7736-4f9b-8140-b5ae819ccdea	0	not_started	\N	\N	\N	\N	{}	\N	\N	0	{}	\N	\N	\N	\N	\N	\N	2026-10-21 10:42:15.9389+05	\N	\N	\N	{}	\N	f
\.


--
-- Data for Name: entitlement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.entitlement (student_id, what, granted_by, at, revoked_at, revoked_by) FROM stdin;
\.


--
-- Data for Name: family_code; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.family_code (code, student_id, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: family_link; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.family_link (parent_id, student_id, created_at) FROM stdin;
4df9f11a-8063-4e44-b0ec-264d6f21c930	20f8ca74-7736-4f9b-8140-b5ae819ccdea	2026-10-21 10:42:15.931829+05
\.


--
-- Data for Name: freeze_entry; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.freeze_entry (id, student_id, kind, date, ref, created_at) FROM stdin;
\.


--
-- Data for Name: game_campus_round; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.game_campus_round (student_id, date, round, campus_id, lat, lon, km, points, at) FROM stdin;
\.


--
-- Data for Name: game_daily_answer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.game_daily_answer (student_id, date, qid, choice, correct, seconds, at) FROM stdin;
\.


--
-- Data for Name: game_rating; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.game_rating (student_id, kind, rating, games, wins, draws, losses, updated_at) FROM stdin;
\.


--
-- Data for Name: game_result; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.game_result (id, student_id, kind, result, why, verified, moves, rating_before, rating_after, coins, client_id, local_date, at) FROM stdin;
\.


--
-- Data for Name: homework; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.homework (id, source, student_id, lesson_ids, courses, spec, minutes, for_day, created_at) FROM stdin;
\.


--
-- Data for Name: homework_turn; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.homework_turn (homework_id, student_id, status, first_right, first_of, items, task_id, shown_at, handed_in_at, completed_at, updated_at) FROM stdin;
\.


--
-- Data for Name: jia_lead; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.jia_lead (id, user_id, number, name, phone, city, course, lang, tg_status, tg_message_id, created_at) FROM stdin;
\.


--
-- Data for Name: league_cohort; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.league_cohort (id, week, tier, stage, chat_id, created_at) FROM stdin;
\.


--
-- Data for Name: league_member; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.league_member (week, student_id, cohort_id, tier, joined_at, final_xp, final_rank, outcome) FROM stdin;
\.


--
-- Data for Name: league_player; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.league_player (student_id, tier, best_tier, weeks, updated_at) FROM stdin;
\.


--
-- Data for Name: league_week; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.league_week (week, state, opened_at, closed_at, dbh, recap) FROM stdin;
\.


--
-- Data for Name: learner_skill; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.learner_skill (student_id, skill, theta, answers, mastery, seed, seeded_from, proficient_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: lesson_progress; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lesson_progress (student_id, lesson_id, course, opened_at, pieces, test_out, test_task_id, passed_at, minutes_spent, updated_at) FROM stdin;
\.


--
-- Data for Name: lesson_skill; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lesson_skill (student_id, skill, level, passes, miss_run, proficient_at, mastered_at, updated_at, rises) FROM stdin;
\.


--
-- Data for Name: milestone_report; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.milestone_report (id, student_id, milestone_id, source_rule_id, rule_version, reported_at, state, resolved_at, resolved_by, note) FROM stdin;
\.


--
-- Data for Name: mock_result; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mock_result (student_id, mock_date, kind, scores, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: moderation_audit; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.moderation_audit (id, item_id, action, actor_id, target_user_id, reason, meta, at) FROM stdin;
\.


--
-- Data for Name: moderation_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.moderation_item (id, kind, ref_id, author_id, subject_id, text, media_ids, meta, status, urgent, ai, one_tap, screen, decided_by, decided_at, reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: outcome_prompt; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.outcome_prompt (user_id, "window", student_id, state, shown_at, closed_at) FROM stdin;
\.


--
-- Data for Name: parent_alert; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.parent_alert (parent_id, student_id, missed_homework, level_drop, inactivity, updated_at) FROM stdin;
\.


--
-- Data for Name: parent_note; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.parent_note (id, student_id, parent_id, kind, event, words, seen_at, created_at) FROM stdin;
\.


--
-- Data for Name: password; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password (user_id, hash, updated_at) FROM stdin;
20f8ca74-7736-4f9b-8140-b5ae819ccdea	scrypt$32768$8$1$wi-3fuIG9JGE4O3QyJLpEw$dtjXL9FwxkeLdfVpzDCj-2LtzyAR7sp2DWYiumZvSCsk_Gid_qoVTh1OhepPpkU_QcG0qyhj65RsvrUQY4ZIkA	2026-10-21 10:42:15.832535+05
4df9f11a-8063-4e44-b0ec-264d6f21c930	scrypt$32768$8$1$CuVFZaEt2KnJygdQd5zsWA$lhrBeaZlTBtZ1e-e3VmBNuBKx9J28oqzCCgfui8JVbZoTy9ZPxRhlaWoiVsa19CkefjE81aDB1mxBBszccRMbA	2026-10-21 10:42:15.928045+05
04f57c03-e834-4993-a0bb-5e75cf13e3f6	scrypt$32768$8$1$yVYabjnKawzrxik_Sbui-Q$8jJO-viOWY9SYftU8C8SlfLpHrqC_psvklRlFIgp46xiJyKynZjH8-Y-jubUErEaUECyk0aT8B2J6hv2tQojkw	2026-10-21 10:42:18.450693+05
77033d93-1cd3-49d8-996b-e2c53e8a818f	scrypt$32768$8$1$BRVgUbUtHo3w8nu5t0XMCg$hlTuBbTL4ovWaMlcZXChSHnZeQjL7f4MuLAiLUxrkmyp2g8mokX132_C7uuk709saIZplBC1USx-tJhJGPVyKQ	2026-10-21 10:42:18.517103+05
b8fc13fe-a420-460a-9b10-78ead416039e	scrypt$32768$8$1$5YxyKJGLxEjXZCXtfwRVEw$occnbXEdofOm2W676c3IQhFRG0OVX_gulWxutqffRTSHezhQOWtHjEqs7onEv3LH4oOA0o80iCzs7v6-0fmk5w	2026-10-21 10:42:18.581422+05
7267cecf-9f09-4150-872e-e186d3cd728c	scrypt$32768$8$1$wEK5vK7qOxlYZBESqhBFRA$KY8QxtHuaBdw55mVsDyYVoGY6w1kk2i1evPMel8Wyp7lXkekpGOw28IJrQhZzIYJx-384KnxVk2VO0L_c4TyvQ	2026-10-21 10:42:18.643131+05
\.


--
-- Data for Name: pay_coupon; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pay_coupon (id, student_id, kind, source, source_ref, created_at, expires_at, used_at, used_order_id) FROM stdin;
\.


--
-- Data for Name: pay_event; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pay_event (id, txn_id, order_id, action, meta, by, at) FROM stdin;
\.


--
-- Data for Name: pay_gift; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pay_gift (id, code_hash, order_id, tier, months, from_id, note, for_name, claimed_by, claimed_at, created_at) FROM stdin;
\.


--
-- Data for Name: pay_order; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pay_order (id, number, kind, student_id, payer_id, payer_role, tier, period, months, list_usd_cents, price_usd_cents, coupon_id, amount_uzs, fx_uzs_per_usd, fx_source, sandbox, created_at) FROM stdin;
\.


--
-- Data for Name: pay_txn; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pay_txn (id, seq, provider, provider_ref, order_id, amount_uzs, provider_time, created_at, paid_at, cancelled_at, cancel_reason, refunded_at, refunded_by) FROM stdin;
\.


--
-- Data for Name: plan_usage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.plan_usage (user_id, day, kind, n) FROM stdin;
\.


--
-- Data for Name: pledge; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pledge (id, student_id, parent_id, goal, target, base, reward, due, status, reached_at, given_at, seen_at, created_at) FROM stdin;
\.


--
-- Data for Name: practice_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.practice_item (item_id, b, answers, updated_at) FROM stdin;
\.


--
-- Data for Name: profile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profile (user_id, role, full_name, first_name, last_name, photo_url, locale, created_at, timezone, demo, roadmap_lang) FROM stdin;
20f8ca74-7736-4f9b-8140-b5ae819ccdea	student	Oqil Odilov	Oqil	Odilov	/d/student-mobile/media/7f94c733caf352e0.jpg	en	2026-10-21 10:42:15.832535+05	Asia/Tashkent	t	\N
4df9f11a-8063-4e44-b0ec-264d6f21c930	parent	Rustam Odilov	Rustam	Odilov	\N	en	2026-10-21 10:42:15.928045+05	Asia/Tashkent	t	\N
04f57c03-e834-4993-a0bb-5e75cf13e3f6	student	Kamola Rahimova	Kamola	Rahimova	\N	en	2026-10-21 10:42:18.450693+05	Asia/Tashkent	f	\N
77033d93-1cd3-49d8-996b-e2c53e8a818f	student	Jasur Toshmatov	Jasur	Toshmatov	\N	en	2026-10-21 10:42:18.517103+05	Asia/Tashkent	f	\N
b8fc13fe-a420-460a-9b10-78ead416039e	parent	Nodira Rahimova	Nodira	Rahimova	\N	en	2026-10-21 10:42:18.581422+05	Asia/Tashkent	f	\N
7267cecf-9f09-4150-872e-e186d3cd728c	parent	Staff Contract	Staff	Contract	\N	en	2026-10-21 10:42:18.643131+05	Asia/Tashkent	f	\N
\.


--
-- Data for Name: profile_photo; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profile_photo (user_id, mime, bytes, width, height, version, updated_at) FROM stdin;
\.


--
-- Data for Name: proof_file; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proof_file (id, student_id, uploaded_by, kind, mime, bytes, sha256, size, created_at) FROM stdin;
\.


--
-- Data for Name: readiness_snapshot; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.readiness_snapshot (student_id, taken_at, kind, local_date, overall, tier, card) FROM stdin;
\.


--
-- Data for Name: report; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.report (id, reporter_id, target, target_user_id, target_ref, label, reason, note, urgent, surface, status, item_id, created_at) FROM stdin;
\.


--
-- Data for Name: roadmap; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roadmap (id, student_id, profile_version, archetype, phases, weekly_goals, narration, narration_by, created_on, engine_version, rules_version, generated_at, is_current, lang, planned_by, ai_run_id, strategy) FROM stdin;
\.


--
-- Data for Name: roadmap_change; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roadmap_change (id, student_id, roadmap_id, at, what_changed, cause_event_id, created_at, what_changed_ai, ai_language, ai_run_id) FROM stdin;
\.


--
-- Data for Name: roadmap_milestone; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roadmap_milestone (roadmap_id, id, student_id, "position", phase_id, kind, route, title, why, due, hard_deadline, source_rule_id, rule_version, needs_verification, human_checkpoint, depends_on, status, locked, verified_at, source_url, title_en) FROM stdin;
\.


--
-- Data for Name: rule_record; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rule_record (id, version, kind, status, body, needs_verification, verified_at, source_url, effective_cycle, is_current, created_by, created_at) FROM stdin;
CP_TEMPLATE	1	country_profile	proposed	{"label": "Copy this for each launch corridor country", "grades": [], "country": "TEMPLATE", "source_url": null, "final_grade": null, "fork_points": [], "verified_at": null, "verify_task": "Fill from official ministry sources", "conscription": {"age_range": null, "applies_to": "none", "deferment_for_study_abroad": "unknown"}, "school_types": [], "test_centers": [], "grading_scales": [], "national_exams": [], "needs_verification": true, "instruction_languages": [], "school_year_start_month": null, "scholarship_programs_home": []}	t	\N	\N	\N	t	seed	2026-10-21 10:42:12.038473+05
UZ_HOME	1	destination	proposed	{"aid": {"source_url": null, "verified_at": null, "verify_task": "Confirm", "meets_full_need": [], "needs_verification": true, "government_scholarships": [], "merit_full_ride_examples": ["state grant places by DTM score"], "need_blind_for_internationals": []}, "visa": {"docs": [], "type": "none", "source_url": "n/a", "intent_rule": "n/a", "verified_at": "2026-09-24", "needs_verification": false, "proof_of_funds_rule": "n/a", "post_study_work_note": "n/a", "restrictions_by_citizenship": []}, "costs": {"source_url": null, "verified_at": null, "verify_task": "Confirm", "living_band_usd": "low", "tuition_band_usd": "grant (free) or contract (varies)", "needs_verification": true, "visa_and_process_usd": "0", "application_fee_band_usd": "small"}, "cycles": [{"deadlines": [{"date": "2029-04-15", "hard": true, "name": "DTM registration", "applies_to": "all state universities", "source_url": null, "verified_at": null, "verify_task": "Confirm DTM registration window", "needs_verification": true}, {"date": "2029-06-20", "hard": true, "name": "DTM test window", "applies_to": "all", "source_url": null, "verified_at": null, "verify_task": "Confirm", "needs_verification": true}], "entry_term": "Sept 2029", "decision_window": "Aug"}], "portals": ["my.gov.uz / DTM portal"], "interview": false, "source_url": null, "destination": "UZ_HOME", "verified_at": null, "verify_task": "Verify all on dtm.uz", "requirements": {"tests": [{"test_id": "DTM", "source_url": null, "verified_at": null, "verify_task": "Confirm subject sets per program", "required_for": {"fields": ["all"]}, "needs_verification": true, "typical_score_band": "3 subjects; grant thresholds vary by program"}], "language": [{"waivers": "language certificates (IELTS, etc.) may add points - verify", "language": "uz_or_ru", "min_level": "native", "accepted_certificates": []}], "school_leaving": {"accepted_certificates": ["attestat (grade 11) / lyceum diploma"], "needs_foundation_or_studienkolleg_for": []}}, "universities": [], "admission_logic": "exam_driven", "needs_verification": true, "recommendation_letters": {"who": "n/a", "count": "0"}}	t	\N	\N	Sept 2029	t	seed	2026-10-21 10:42:12.038473+05
MEXT_UG	1	scholarship	proposed	{"id": "MEXT_UG", "name": "MEXT undergraduate", "covers": "tuition, stipend, airfare", "age_cap": "17-24 (verify)", "source_url": null, "destination": "JP", "verified_at": null, "verify_task": "Confirm on MEXT/embassy site", "citizenship_rules": "embassy recommendation by country", "needs_verification": true}	t	\N	\N	\N	t	seed	2026-10-21 10:42:12.038473+05
CSC	1	scholarship	proposed	{"id": "CSC", "name": "Chinese Government Scholarship", "covers": "tuition, dorm, stipend", "age_cap": "under 25 for bachelor (verify)", "source_url": null, "destination": "CN", "verified_at": null, "verify_task": "Confirm on campuschina.org", "citizenship_rules": "non-Chinese", "needs_verification": true}	t	\N	\N	\N	t	seed	2026-10-21 10:42:12.038473+05
STIPENDIUM_HUNGARICUM	1	scholarship	proposed	{"id": "STIPENDIUM_HUNGARICUM", "name": "Stipendium Hungaricum", "covers": "tuition, stipend, dorm", "age_cap": "unknown (verify)", "source_url": null, "destination": "HU", "verified_at": null, "verify_task": "Confirm", "citizenship_rules": "partner countries via national nominating authority", "needs_verification": true}	t	\N	\N	\N	t	seed	2026-10-21 10:42:12.038473+05
NYUAD	1	scholarship	proposed	{"id": "NYUAD", "name": "NYU Abu Dhabi need-based aid", "covers": "full demonstrated need for admitted students (verify)", "age_cap": "none", "source_url": null, "destination": "AE", "verified_at": null, "verify_task": "Confirm on nyuad.nyu.edu", "citizenship_rules": "all", "needs_verification": true}	t	\N	\N	\N	t	seed	2026-10-21 10:42:12.038473+05
language_gap_months_heuristic	1	heuristic	verified	{"note": "at 5-7 h/week; multiply by 1.3 for distant language families (e.g., English speaker -> Korean); heuristic only", "A0->A1": 3, "A1->A2": 4, "A2->B1": 6, "B1->B2": 8, "B2->C1": 10}	f	\N	\N	\N	t	seed	2026-10-21 10:42:12.038473+05
planner.habits	1	planner	verified	{"id": "planner.habits", "text": "S1 habit milestones: reading, math, English, making, a 6-month check-in"}	f	\N	\N	\N	t	seed	2026-10-21 10:42:12.038473+05
planner.language_ladder	1	planner	verified	{"id": "planner.language_ladder", "text": "one CEFR step at a time at 5-7 h/week, months from the language gap heuristic"}	f	\N	\N	\N	t	seed	2026-10-21 10:42:12.038473+05
planner.math_next_step	1	planner	verified	{"id": "planner.math_next_step", "text": "the next math rung within 8 months"}	f	\N	\N	\N	t	seed	2026-10-21 10:42:12.038473+05
planner.olympiad_calendar	1	planner	verified	{"id": "planner.olympiad_calendar", "text": "regional round in March two years before graduation, national the year after"}	f	\N	\N	\N	t	seed	2026-10-21 10:42:12.038473+05
UK	1	destination	proposed	{"aid": {"source_url": null, "verified_at": null, "verify_task": "Confirm scholarship landscape per university", "meets_full_need": [], "needs_verification": true, "government_scholarships": [], "merit_full_ride_examples": ["very rare at undergraduate level; partial scholarships common"], "need_blind_for_internationals": []}, "visa": {"docs": ["CAS from university", "proof of funds (28-day rule)", "passport", "English evidence", "TB test for some countries"], "type": "Student visa", "source_url": null, "intent_rule": "genuine student; credibility interviews possible", "verified_at": null, "verify_task": "Confirm on gov.uk", "needs_verification": true, "proof_of_funds_rule": "tuition for year 1 + living costs held for 28 days", "post_study_work_note": "Graduate Route exists; length under review (verify)", "restrictions_by_citizenship": []}, "costs": {"source_url": null, "verified_at": null, "verify_task": "Confirm current fees", "living_band_usd": "15k-22k (London higher)", "tuition_band_usd": "28k-50k", "needs_verification": true, "visa_and_process_usd": "visa fee + immigration health surcharge per year (verify)", "application_fee_band_usd": "UCAS fee ~35"}, "cycles": [{"deadlines": [{"date": "2028-10-15", "hard": true, "name": "UCAS early deadline (Oxford, Cambridge, medicine, dentistry, veterinary)", "applies_to": "those courses", "source_url": null, "verified_at": null, "verify_task": "Confirm UCAS date for that cycle", "needs_verification": true}, {"date": "2029-01-14", "hard": true, "name": "UCAS main deadline", "applies_to": "most courses (mid-January; exact date varies by year)", "source_url": null, "verified_at": null, "verify_task": "Confirm UCAS date for that cycle", "needs_verification": true}], "entry_term": "Sept 2029", "decision_window": "Nov-May"}], "portals": ["UCAS"], "interview": "some (Oxbridge, medicine)", "source_url": null, "destination": "UK", "verified_at": null, "verify_task": "Whole record: typical values, verify on ucas.com and university sites", "requirements": {"tests": [{"test_id": "UCAT", "source_url": null, "verified_at": null, "verify_task": "Confirm test dates/registration", "required_for": {"fields": ["medicine", "dentistry"]}, "needs_verification": true, "typical_score_band": "course-specific"}, {"test_id": "LNAT", "source_url": null, "verified_at": null, "verify_task": "Confirm list", "required_for": {"fields": ["law"], "universities": ["Oxford", "LSE", "UCL", "KCL", "Bristol", "Durham", "Glasgow", "Nottingham", "SOAS"]}, "needs_verification": true}, {"test_id": "MAT", "source_url": null, "verified_at": null, "verify_task": "Confirm", "required_for": {"fields": ["mathematics", "computer science"], "universities": ["Oxford", "Imperial"]}, "needs_verification": true}, {"test_id": "TMUA", "source_url": null, "verified_at": null, "verify_task": "Confirm per course", "required_for": {"fields": ["economics", "computer science", "mathematics"], "universities": ["Cambridge", "Imperial", "Durham", "LSE", "Warwick"]}, "needs_verification": true}, {"test_id": "ESAT", "source_url": null, "verified_at": null, "verify_task": "Confirm", "required_for": {"fields": ["engineering", "natural sciences"], "universities": ["Cambridge", "Imperial"]}, "needs_verification": true}, {"test_id": "STEP", "source_url": null, "verified_at": null, "verify_task": "Confirm", "required_for": {"fields": ["mathematics"], "universities": ["Cambridge (offer condition)", "Warwick"]}, "needs_verification": true}], "language": [{"waivers": "English-medium qualifications accepted by some", "language": "en", "min_level": "B2", "source_url": null, "verified_at": null, "verify_task": "Confirm per university and UKVI", "needs_verification": true, "accepted_certificates": ["IELTS for UKVI 6.0-7.0 by course", "TOEFL iBT (accepted by most universities; check visa rules)", "PTE Academic"]}], "school_leaving": {"accepted_certificates": ["A-levels", "IB", "national certificates with strong grades (varies; many non-EU certificates need a foundation year)"], "needs_foundation_or_studienkolleg_for": ["many national 11-year certificates -> International Foundation Year"]}, "personal_statement": "from 2026 entry UCAS uses three structured questions instead of one free statement (verify)"}, "universities": [], "admission_logic": "hybrid", "needs_verification": true, "recommendation_letters": {"who": "school", "count": "1 reference"}}	t	\N	\N	Sept 2029	f	seed	2026-10-21 10:42:12.038473+05
planner.own_project	1	planner	verified	{"id": "planner.own_project", "text": "one own project by June two years before graduation"}	f	\N	\N	\N	t	seed	2026-10-21 10:42:12.038473+05
planner.tests_before_deadline	1	planner	verified	{"id": "planner.tests_before_deadline", "text": "tests at least 6 weeks before the first deadline; first SAT sitting in June"}	f	\N	\N	\N	t	seed	2026-10-21 10:42:12.038473+05
planner.essays_before_deadline	1	planner	verified	{"id": "planner.essays_before_deadline", "text": "essays drafted at least 12 weeks before the first deadline"}	f	\N	\N	\N	t	seed	2026-10-21 10:42:12.038473+05
planner.recommenders_before_deadline	1	planner	verified	{"id": "planner.recommenders_before_deadline", "text": "recommenders asked at least 10 weeks before the first deadline"}	f	\N	\N	\N	t	seed	2026-10-21 10:42:12.038473+05
planner.final_list	1	planner	verified	{"id": "planner.final_list", "text": "final list at least 8 weeks before the first deadline, with a counselor"}	f	\N	\N	\N	t	seed	2026-10-21 10:42:12.038473+05
planner.early_choice	1	planner	verified	{"id": "planner.early_choice", "text": "early decision or early action chosen 4 weeks before the deadline, with a counselor"}	f	\N	\N	\N	t	seed	2026-10-21 10:42:12.038473+05
planner.school_report_before_deadline	1	planner	verified	{"id": "planner.school_report_before_deadline", "text": "school report and transcript requested at least 8 weeks before the first deadline"}	f	\N	\N	\N	t	seed	2026-10-21 10:42:12.038473+05
planner.aid_forms	1	planner	verified	{"id": "planner.aid_forms", "text": "financial aid forms 2 weeks before the first deadline, with a counselor"}	f	\N	\N	\N	t	seed	2026-10-21 10:42:12.038473+05
planner.visa_paperwork	1	planner	verified	{"id": "planner.visa_paperwork", "text": "visa paperwork by May of the graduation year, with a counselor"}	f	\N	\N	\N	t	seed	2026-10-21 10:42:12.038473+05
planner.verify_missing_rule	1	planner	verified	{"id": "planner.verify_missing_rule", "text": "a route without a checked rule gets a verify milestone, never a guessed date"}	f	\N	\N	\N	t	seed	2026-10-21 10:42:12.038473+05
CP_UZ	1	country_profile	proposed	{"label": "Uzbekistan", "grades": [{"code": "1", "label_i18n": "grade_1", "typical_age": 7}, {"code": "2", "label_i18n": "grade_2", "typical_age": 8}, {"code": "3", "label_i18n": "grade_3", "typical_age": 9}, {"code": "4", "label_i18n": "grade_4", "typical_age": 10}, {"code": "5", "label_i18n": "grade_5", "typical_age": 11}, {"code": "6", "label_i18n": "grade_6", "typical_age": 12}, {"code": "7", "label_i18n": "grade_7", "typical_age": 13}, {"code": "8", "label_i18n": "grade_8", "typical_age": 14}, {"code": "9", "label_i18n": "grade_9", "typical_age": 15}, {"code": "10", "label_i18n": "grade_10", "typical_age": 16}, {"code": "11", "label_i18n": "grade_11", "typical_age": 17}], "country": "UZ", "source_url": null, "final_grade": "11", "fork_points": [{"options": ["stay_grades_10_11", "academic_lyceum", "vocational_college", "international_school", "move_abroad"], "after_grade": "9"}], "verified_at": null, "verify_task": "Confirm grade structure, fork options after grade 9, DTM calendar and conscription/deferment rules on official sources", "conscription": {"age_range": "18-27", "applies_to": "male", "deferment_for_study_abroad": "unknown"}, "school_types": ["public_state", "presidential_school", "specialized_school", "academic_lyceum", "vocational_college", "private_national", "international_ib", "international_cambridge", "other"], "test_centers": [{"note": "dates fill early; some students travel to Almaty/Bishkek", "test": "SAT", "cities": ["Tashkent"]}, {"test": "IELTS", "cities": ["Tashkent", "Samarkand", "Fergana", "Namangan", "Bukhara"]}, {"note": "limited authorized centers", "test": "AP", "cities": ["Tashkent"]}], "grading_scales": ["five_point"], "national_exams": [{"id": "DTM", "name": "DTM state test for university admission", "typical_dates": "June-July (registration in spring)", "taken_in_grade": "11", "admission_logic": "exam_driven"}], "needs_verification": true, "instruction_languages": ["uz", "ru", "en"], "school_year_start_month": 9, "scholarship_programs_home": ["El-Yurt Umidi (mostly graduate level; check undergrad availability)"], "typical_family_budget_band_usd": "most families need full or near-full aid for US/UK; German/Turkish/Korean routes more often affordable"}	t	\N	\N	\N	f	seed	2026-10-21 10:42:12.038473+05
CP_UZ	2	country_profile	proposed	{"label": "Uzbekistan", "grades": [{"code": "1", "label_i18n": "grade_1", "typical_age": 7}, {"code": "2", "label_i18n": "grade_2", "typical_age": 8}, {"code": "3", "label_i18n": "grade_3", "typical_age": 9}, {"code": "4", "label_i18n": "grade_4", "typical_age": 10}, {"code": "5", "label_i18n": "grade_5", "typical_age": 11}, {"code": "6", "label_i18n": "grade_6", "typical_age": 12}, {"code": "7", "label_i18n": "grade_7", "typical_age": 13}, {"code": "8", "label_i18n": "grade_8", "typical_age": 14}, {"code": "9", "label_i18n": "grade_9", "typical_age": 15}, {"code": "10", "label_i18n": "grade_10", "typical_age": 16}, {"code": "11", "label_i18n": "grade_11", "typical_age": 17}], "country": "UZ", "source_url": null, "final_grade": "11", "fork_points": [{"options": ["stay_grades_10_11", "academic_lyceum", "vocational_college", "international_school", "move_abroad"], "after_grade": "9"}], "verified_at": null, "verify_task": "Confirm grade structure, fork options after grade 9, DTM calendar and conscription/deferment rules on official sources", "conscription": {"age_range": "18-27", "applies_to": "male", "deferment_for_study_abroad": "unknown"}, "school_types": ["public_state", "presidential_school", "specialized_school", "academic_lyceum", "vocational_college", "private_national", "international_ib", "international_cambridge", "other"], "test_centers": [{"note": "dates fill early; some students travel to Almaty/Bishkek", "test": "SAT", "cities": ["Tashkent"]}, {"test": "IELTS", "cities": ["Tashkent", "Samarkand", "Fergana", "Namangan", "Bukhara"]}, {"note": "limited authorized centers", "test": "AP", "cities": ["Tashkent"]}], "grading_scales": ["five_point"], "national_exams": [{"id": "DTM", "name": "DTM state test for university admission", "typical_dates": "June-July (registration in spring)", "taken_in_grade": "11", "admission_logic": "exam_driven"}, {"id": "MILLIY_SERTIFIKAT", "name": "Milliy sertifikat (national certificate exams by subject)", "notes": "P4b (owner 3 Oct 2026, R6): the student gives subject + grade (A+, A, B+, B, C+, C); how a certificate counts for admission is not in the rules yet", "needs_verification": true}], "needs_verification": true, "instruction_languages": ["uz", "ru", "en"], "school_year_start_month": 9, "scholarship_programs_home": ["El-Yurt Umidi (mostly graduate level; check undergrad availability)"], "typical_family_budget_band_usd": "most families need full or near-full aid for US/UK; German/Turkish/Korean routes more often affordable"}	t	\N	\N	\N	t	seed	2026-10-21 10:42:12.038473+05
GKS	1	scholarship	proposed	{"id": "GKS", "name": "Global Korea Scholarship (undergraduate)", "covers": "tuition, stipend, language year", "age_cap": "under 25 (verify)", "source_url": null, "destination": "KR", "verified_at": null, "verify_task": "Confirm on studyinkorea.go.kr", "citizenship_rules": "non-Korean; country quotas", "needs_verification": true}	t	\N	\N	\N	f	seed	2026-10-21 10:42:12.038473+05
GKS	2	scholarship	verified	{"id": "GKS", "name": "Global Korea Scholarship (undergraduate)", "steps": {"call": {"url": "https://www.studyinkorea.go.kr/", "host": "studyinkorea.go.kr", "menu": "Scholarships Notice", "page": "https://www.studyinkorea.go.kr/ko/notice/scholarshipsList.do?boardSort=3", "source": 1}, "apply": {"url": "https://www.studyinkorea.go.kr/", "host": "studyinkorea.go.kr", "menu": "GKS Scholarship", "page": "https://www.studyinkorea.go.kr/ko/plan/scholarship.do?tab=gks-tab1", "source": 0}, "language": {"url": "https://www.topik.go.kr/", "host": "topik.go.kr", "source": 3}, "documents": {"url": "https://www.studyinkorea.go.kr/", "host": "studyinkorea.go.kr", "menu": "Scholarships Notice", "page": "https://www.studyinkorea.go.kr/ko/notice/scholarshipsList.do?boardSort=3", "source": 2}}, "tests": [{"dates": null, "parts": "TOPIK I (Listening, Reading), TOPIK II (Listening, Writing, Reading)", "source": 3, "test_id": "TOPIK", "valid_years": 2}], "covers": "tuition, stipend, language year", "tracks": [{"id": "embassy", "apply_at": "https://www.studyinkorea.go.kr/", "month_to": 9, "month_from": 9}, {"id": "university", "apply_at": null, "month_to": 11, "month_from": 9}], "window": {"cycles": [{"note": "The dates are in the guideline attached to the notice (a PDF); it was not read, so none is written here.", "opens": null, "closes": null, "notice": "2027 Global Korea Scholarship for Undergraduate Degrees", "entry_year": 2027, "notice_posted": "2026-09-09"}], "results_month": 12, "announce_month": 9}, "age_cap": "under 25 (verify)", "sources": [{"url": "https://www.studyinkorea.go.kr/ko/plan/scholarship.do?tab=gks-tab1", "says": "GKS undergraduate degrees. Announcement: NIIED, September. Application submission: Embassy Track: September / University Track: September - November. Screening and selection: October - December. Final results: December. Embassy Track: apply online through Study in Korea; University Track: apply directly to a GKS university. Applicants and both of their parents must hold non-Korean citizenship. Applicants must be under 25 years of age as of the applicable year. A cumulative score of 80% or higher (or the class-rank or CGPA rule). Korean language training (1 year), then a bachelor's degree of 4-6 years. Benefits: airfare, Korean language training fees, tuition, and monthly allowances. On the day it was read the application button said it is not the application period.", "read_on": "2026-10-10"}, {"url": "https://www.studyinkorea.go.kr/ko/notice/scholarshipsList.do?boardSort=3", "says": "The GKS notice board. '2027 Global Korea Scholarship for Undergraduate Degrees' was posted on 2026-09-09 and '2027 GKS Undergraduate Program - University Track' on 2026-09-23. No notice for a later year.", "read_on": "2026-10-10"}, {"url": "https://www.studyinkorea.go.kr/ko/plan/gksNoticeRead.do?bbsId=BBSMSTR_000000000461&nttId=4522", "says": "The 2027 notice: deadlines, required documents and schedules are in the attached Application Guidelines ('2027 GKS-U Application Guidelines (English) 0914.pdf'); the universities and departments are in the University Information files. The page itself gives no date and no list of documents.", "read_on": "2026-10-10"}, {"url": "https://www.studyinkorea.go.kr/ko/plan/examAndKoreanStudy.do", "says": "International students must submit proof of language proficiency for admission and graduation; each university or department sets the level: Korean for Korean-taught programmes (typically a TOPIK score report, PBT or IBT), English for English-taught ones. TOPIK I (Listening, Reading), TOPIK II (Listening, Writing, Reading). A TOPIK score is valid for 2 years from the date of score announcement. The schedule and registration are on topik.go.kr. The page gives no test date.", "read_on": "2026-10-10"}, {"url": "https://en.snu.ac.kr/admission/overview/faq/admission", "says": "Seoul National University, admissions FAQ (the page says it was last updated in 2021): either proof of Korean or English proficiency is required for the application: TOPIK level 3 or higher, or TOEFL iBT 80, TEPS 551, IELTS 6.0 or higher. Standardized test results are supplementary material. The application fee is KRW 70,000 for undergraduate.", "read_on": "2026-10-10"}, {"url": "https://en.snu.ac.kr/admission/overview/notice?md=v&bbsidx=170606", "says": "Seoul National University, '2027 Spring Undergraduate Admissions Guide for International Students': online application Monday, July 6, 2026, 10:00 to Thursday, July 9, 2026, 17:00 (already held). No later intake is announced on the page.", "read_on": "2026-10-10"}, {"url": "https://www.mofa.go.kr/ke-en/brd/m_10538/view.do?seq=761541", "says": "Read by the content lane for C16-krprep (its fact 0), not again on 10 Oct: the 2027 GKS-U guideline: one year of Korean before the degree, every scholar must reach TOPIK level 3 within the language year to go on.", "read_on": "2026-10-07"}, {"url": "https://www.studyinkorea.go.kr/", "says": "Study in Korea's front page: its menu links 'GKS Scholarship' (the scholarship's own page) and 'Scholarships Notice' (the GKS notice board), and 'TOPIK' (topik.go.kr). No date of a call is on the front page.", "read_on": "2026-10-10"}], "age_under": 25, "documents": null, "not_found": ["The 2027 guideline PDF (dates, the documents list, the quota for Uzbekistan) was not read; its notice is source 2.", "TOPIK test dates: topik.go.kr serves its schedule through scripts and returned no text; no date is written.", "Yonsei University and KAIST: no admissions page of theirs was read on 10 Oct 2026."], "source_url": "https://www.studyinkorea.go.kr/ko/plan/scholarship.do?tab=gks-tab1", "steps_note": "A step shows the short address a phone can hold on one line (the site's front page, source 7) and names the menu entry to open; a step's own 'page' is the exact page that was read.", "destination": "KR", "min_percent": 80, "verified_at": "2026-10-10", "universities": [{"id": "snu", "one_of": {"ielts": 6, "toefl_ibt": 80, "topik_level": 3}, "source": 4, "needs_verification": true}], "language_year": {"years": 1, "language": "ko"}, "citizenship_rules": "non-Korean; country quotas", "needs_verification": false}	f	2026-10-10	https://www.studyinkorea.go.kr/ko/plan/scholarship.do?tab=gks-tab1	\N	f	seed	2026-10-21 10:42:12.038473+05
GKS	3	scholarship	verified	{"id": "GKS", "name": "Global Korea Scholarship (undergraduate)", "steps": {"call": {"url": "https://www.studyinkorea.go.kr/", "host": "studyinkorea.go.kr", "menu": "Scholarships Notice", "page": "https://www.studyinkorea.go.kr/ko/notice/scholarshipsList.do?boardSort=3", "source": 1}, "apply": {"url": "https://www.studyinkorea.go.kr/", "host": "studyinkorea.go.kr", "menu": "GKS Scholarship", "page": "https://www.studyinkorea.go.kr/ko/plan/scholarship.do?tab=gks-tab1", "source": 0}, "language": {"url": "https://www.topik.go.kr/", "host": "topik.go.kr", "source": 3}, "documents": {"url": "https://www.studyinkorea.go.kr/", "host": "studyinkorea.go.kr", "menu": "Scholarships Notice", "page": "https://www.studyinkorea.go.kr/ko/notice/scholarshipsList.do?boardSort=3", "source": 2}}, "tests": [{"dates": null, "parts": "TOPIK I (Listening, Reading), TOPIK II (Listening, Writing, Reading)", "source": 3, "test_id": "TOPIK", "valid_years": 2}], "covers": "tuition, stipend, language year", "tracks": [{"id": "embassy", "apply_at": "https://www.studyinkorea.go.kr/", "month_to": 9, "month_from": 9}, {"id": "university", "apply_at": null, "month_to": 11, "month_from": 9}], "window": {"cycles": [{"note": "The dates are in the guideline attached to the notice (a PDF); it was not read, so none is written here.", "opens": null, "closes": null, "notice": "2027 Global Korea Scholarship for Undergraduate Degrees", "entry_year": 2027, "notice_posted": "2026-09-09"}], "results_month": 12, "announce_month": 9}, "age_cap": "under 25 (verify)", "sources": [{"url": "https://www.studyinkorea.go.kr/ko/plan/scholarship.do?tab=gks-tab1", "says": "GKS undergraduate degrees. Announcement: NIIED, September. Application submission: Embassy Track: September / University Track: September - November. Screening and selection: October - December. Final results: December. Embassy Track: apply online through Study in Korea; University Track: apply directly to a GKS university. Applicants and both of their parents must hold non-Korean citizenship. Applicants must be under 25 years of age as of the applicable year. A cumulative score of 80% or higher (or the class-rank or CGPA rule). Korean language training (1 year), then a bachelor's degree of 4-6 years. Benefits: airfare, Korean language training fees, tuition, and monthly allowances. On the day it was read the application button said it is not the application period.", "read_on": "2026-10-10"}, {"url": "https://www.studyinkorea.go.kr/ko/notice/scholarshipsList.do?boardSort=3", "says": "The GKS notice board. '2027 Global Korea Scholarship for Undergraduate Degrees' was posted on 2026-09-09 and '2027 GKS Undergraduate Program - University Track' on 2026-09-23. No notice for a later year.", "read_on": "2026-10-10"}, {"url": "https://www.studyinkorea.go.kr/ko/plan/gksNoticeRead.do?bbsId=BBSMSTR_000000000461&nttId=4522", "says": "The 2027 notice: deadlines, required documents and schedules are in the attached Application Guidelines ('2027 GKS-U Application Guidelines (English) 0914.pdf'); the universities and departments are in the University Information files. The page itself gives no date and no list of documents.", "read_on": "2026-10-10"}, {"url": "https://www.studyinkorea.go.kr/ko/plan/examAndKoreanStudy.do", "says": "International students must submit proof of language proficiency for admission and graduation; each university or department sets the level: Korean for Korean-taught programmes (typically a TOPIK score report, PBT or IBT), English for English-taught ones. TOPIK I (Listening, Reading), TOPIK II (Listening, Writing, Reading). A TOPIK score is valid for 2 years from the date of score announcement. The schedule and registration are on topik.go.kr. The page gives no test date.", "read_on": "2026-10-10"}, {"url": "https://en.snu.ac.kr/admission/overview/faq/admission", "says": "Seoul National University, admissions FAQ (the page says it was last updated in 2021): either proof of Korean or English proficiency is required for the application: TOPIK level 3 or higher, or TOEFL iBT 80, TEPS 551, IELTS 6.0 or higher. Standardized test results are supplementary material. The application fee is KRW 70,000 for undergraduate.", "read_on": "2026-10-10"}, {"url": "https://en.snu.ac.kr/admission/overview/notice?md=v&bbsidx=170606", "says": "Seoul National University, '2027 Spring Undergraduate Admissions Guide for International Students': online application Monday, July 6, 2026, 10:00 to Thursday, July 9, 2026, 17:00 (already held). No later intake is announced on the page.", "read_on": "2026-10-10"}, {"url": "https://www.mofa.go.kr/ke-en/brd/m_10538/view.do?seq=761541", "says": "Read by the content lane for C16-krprep (its fact 0), not again on 10 Oct: the 2027 GKS-U guideline: one year of Korean before the degree, every scholar must reach TOPIK level 3 within the language year to go on.", "read_on": "2026-10-07"}, {"url": "https://www.studyinkorea.go.kr/", "says": "Study in Korea's front page: its menu links 'GKS Scholarship' (the scholarship's own page) and 'Scholarships Notice' (the GKS notice board), and 'TOPIK' (topik.go.kr). No date of a call is on the front page.", "read_on": "2026-10-10"}, {"url": "https://admission.yonsei.ac.kr/seoul/upload/guide/20260529144906YVFHLB.PDF", "says": "Yonsei University, the admission guide for international students entering in March 2027 (Korean and English in one file; linked from admission.yonsei.ac.kr/seoul/admission/html/international/guide.asp as 'Spring 2027 International Admission - Application Guide'). Online application: 2026. 9. 1.(Tue) 10:00 ~ 9. 17.(Thu) 17:00, online only. Documents by post: by 2026. 9. 30.(Wed) 17:00. Announcement of application results: 2026. 12. 4.(Fri) 17:00. Eligibility: applicants and both of their parents must hold a non-Korean nationality; expected graduates must graduate by February 2027. Applicants must submit documents to verify Korean or English proficiency, one of: official documentation proving completion of high school courses conducted in Korean or English; a certificate of completion from a Korean language institution; a standardized test result indicating proficiency in Korean or English; a Korean or English language proficiency test score. Medicine, Dentistry, Nursing and Pharmacy: TOPIK level 5 or above. No minimum score is named for the other majors.", "read_on": "2026-10-10"}, {"url": "https://admission.kaist.ac.kr/intl-undergraduate/application/ApplicationGuide/ApplicationTimeline", "says": "KAIST, international undergraduate, 'Application Timeline for 2027 Admissions' (one line under the heading still reads 2023). Early Admissions: online application September 22 ~ October 22, 2026, 6:00 PM (KST); results January 7, 2027, 10:00 AM (KST). Regular Admissions: November 10, 2026 ~ January 14, 2027, 6:00 PM (KST); results March 25, 2027, 10:00 AM (KST). The announcement dates are subject to change. The page states no language of instruction and no English test.", "read_on": "2026-10-10"}, {"url": "https://admission.kaist.ac.kr/intl-undergraduate/before/sub02", "says": "KAIST, eligibility: applicants who hold Korean citizenship (dual citizenship) are not eligible to apply as foreign students. Spring Semester 2027 (Early only): graduated or will graduate from high school by February 28th, 2027. Fall Semester 2027 (Early / Regular): by August 31st, 2027. The page states no language of instruction and no English test.", "read_on": "2026-10-10"}], "age_under": 25, "documents": null, "not_found": ["The 2027 guideline PDF (dates, the documents list, the quota for Uzbekistan) was not read; its notice is source 2. Tried again on 10 Oct 2026: the file is behind a script download.", "TOPIK test dates, 2027 too: topik.go.kr serves its schedule through scripts and returned its title only (tried again on 10 Oct 2026); no date is written.", "KAIST: the language it teaches in and any English test are on neither of the two pages read (sources 9 and 10); nothing is written about them.", "Yonsei University: the guide names no minimum score for the proof of Korean or English outside Medicine, Dentistry, Nursing and Pharmacy.", "Korea University: its admissions site (oia.korea.ac.kr) reset the connection on both tries on 10 Oct 2026; nothing is written about it."], "source_url": "https://www.studyinkorea.go.kr/ko/plan/scholarship.do?tab=gks-tab1", "steps_note": "A step shows the short address a phone can hold on one line (the site's front page, source 7) and names the menu entry to open; a step's own 'page' is the exact page that was read.", "destination": "KR", "min_percent": 80, "verified_at": "2026-10-10", "universities": [{"id": "snu", "one_of": {"ielts": 6, "toefl_ibt": 80, "topik_level": 3}, "source": 4, "needs_verification": true}, {"id": "yonsei", "source": 8, "intakes": [{"kind": "march", "year": 2027, "opens": "2026-09-01", "closes": "2026-09-17", "results": "2026-12-04"}], "language_proof": "korean_or_english", "needs_verification": false}, {"id": "kaist", "source": 9, "intakes": [{"kind": "early", "year": 2027, "opens": "2026-09-22", "closes": "2026-10-22", "results": "2027-01-07"}, {"kind": "regular", "year": 2027, "opens": "2026-11-10", "closes": "2027-01-14", "results": "2027-03-25"}], "needs_verification": false}], "language_year": {"years": 1, "language": "ko"}, "citizenship_rules": "non-Korean; country quotas", "needs_verification": false}	f	2026-10-10	https://www.studyinkorea.go.kr/ko/plan/scholarship.do?tab=gks-tab1	\N	t	seed	2026-10-21 10:42:12.038473+05
TURKIYE_BURSLARI	1	scholarship	proposed	{"id": "TURKIYE_BURSLARI", "name": "Turkiye Scholarships (undergraduate)", "covers": "tuition, stipend, housing, Turkish year", "age_cap": "under 21 (verify)", "source_url": null, "destination": "TR", "verified_at": null, "verify_task": "Confirm on turkiyeburslari.gov.tr", "citizenship_rules": "non-Turkish", "needs_verification": true}	t	\N	\N	\N	f	seed	2026-10-21 10:42:12.038473+05
TURKIYE_BURSLARI	2	scholarship	verified	{"id": "TURKIYE_BURSLARI", "name": "Turkiye Scholarships (undergraduate)", "steps": {"call": {"url": "https://turkiyeburslari.gov.tr/calendar", "host": "turkiyeburslari.gov.tr", "source": 0}, "apply": {"url": "https://tbbs.turkiyeburslari.gov.tr", "host": "turkiyeburslari.gov.tr", "source": 1}, "language": {"url": "https://www.osym.gov.tr/", "host": "osym.gov.tr", "source": 6}, "documents": {"url": "https://turkiyeburslari.gov.tr/applysteps", "host": "turkiyeburslari.gov.tr", "source": 3}}, "tests": [{"dates": null, "source": 6, "test_id": "TR_YOS", "last_sessions": [{"name": "2026-TR-YÖS/1", "results": "2026-05-07", "test_date": "2026-04-12", "apply_from": "2026-01-14", "apply_until": "2026-02-03"}, {"name": "2026-TR-YÖS/2", "results": "2026-11-05", "test_date": "2026-10-11", "apply_from": "2026-07-09", "apply_until": "2026-08-03"}]}], "covers": "tuition, stipend, housing, Turkish year", "tracks": [{"id": "online", "apply_at": "https://tbbs.turkiyeburslari.gov.tr", "month_to": 2, "month_from": 1}], "window": {"to_md": "02-20", "cycles": [{"opens": "2026-01-10", "closes": "2026-02-20", "notice": "Türkiye Scholarships 2026 Applications", "source": 1, "entry_year": 2026, "notice_posted": "2025-12-29"}], "from_md": "01-10", "results_month": 8}, "age_cap": "under 21 (verify)", "sources": [{"url": "https://www.turkiyeburslari.gov.tr/calendar", "says": "Application Calendar, General Application Period (the page names no year): application period January 10 - February 20; evaluation March-April; interviews April - June; announcement of results early August; initial procedures August; transfers of grantees to Türkiye September.", "read_on": "2026-10-10"}, {"url": "https://www.turkiyeburslari.gov.tr/announcements/turkiye-scholarships-2026-applications-121", "says": "'Türkiye Scholarships 2026 Applications', posted 29 December 2025: Application Dates: 10 January - 20 February 2026, for international students from all countries, for associate, bachelor's, master's and doctoral degrees, through tbbs.turkiyeburslari.gov.tr. No announcement for 2027 was on the site.", "read_on": "2026-10-10"}, {"url": "https://www.turkiyeburslari.gov.tr/scholarshipsprograms", "says": "Application criteria: citizens of all countries; graduates or those who will graduate at the end of the current academic year (before August); for associate and bachelor's degree programmes: under 21 years of age; minimum academic achievement for associate and bachelor's degree candidates: 70%. Turkish citizens cannot apply.", "read_on": "2026-10-10"}, {"url": "https://www.turkiyeburslari.gov.tr/applysteps", "says": "Applications are made online through the Türkiye Scholarships Application System (TBBS). All candidates upload: a valid ID card or passport; a photograph taken within the last year; national exam results, if any; a diploma or temporary graduation certificate; a transcript; international exam results (GRE, GMAT, SAT) if the chosen programme requires them; language test results (TOEFL, DELF) if the chosen programme requires them.", "read_on": "2026-10-10"}, {"url": "https://www.turkiyeburslari.gov.tr/fulltimeprograms", "says": "Scope of the scholarship: monthly stipend, undergraduate: 6.500 TL; tuition fee; accommodation; health insurance; Turkish language course (1 year); a once-off flight ticket at the beginning of education and when graduating.", "read_on": "2026-10-10"}, {"url": "https://www.turkiyeburslari.gov.tr/turkisheducation", "says": "Free 1 year Turkish language education for all Türkiye Scholarship students, regardless of the language of the programme they will study, at the Turkish Language Teaching Centers (TÖMER) within universities; a Turkish Proficiency Certificate at C1 level is expected at the end.", "read_on": "2026-10-10"}, {"url": "https://www.osym.gov.tr/", "says": "ÖSYM's calendar for 2026: 2026-TR-YÖS/1: applications 14.01.2026 - 03.02.2026, late 09.02.2026 - 11.02.2026, exam 12.04.2026, results 07.05.2026. 2026-TR-YÖS/2: applications 09.07.2026 - 03.08.2026, late 07.08.2026 - 11.08.2026, exam 11.10.2026, results 05.11.2026. No TR-YÖS session of 2027 is on the page.", "read_on": "2026-10-10"}, {"url": "https://intl.bogazici.edu.tr/node/100023029", "says": "Boğaziçi University, 'Admission of International Students to Undergraduate Programs: Required Documents': one of SAT (at least 1300/1600; engineering 1350 with Math 700; Mathematics, Molecular Biology and Genetics, Chemistry and Physics 1300 with Math 700; Faculty of Education 1200), TR-YÖS (minimum 450) or an A grade in three relevant GCE A Level subjects; scores valid for two years. Instruction is in English: BUEPT, TOEFL iBT 79 (Writing 22) or IELTS Academic 6.5 (Writing 6.5); students not meeting the requirement attend the English Preparatory Program at YADYOK. Application fee EUR 100 per programme. The page states no application period.", "read_on": "2026-10-10"}], "age_under": 21, "documents": ["id_or_passport", "photo", "national_exam_results", "diploma", "transcript", "international_exam_results", "language_test_results"], "not_found": ["The 2027 application window: not announced on 10 Oct 2026 (the 2026 one was announced on 29 December 2025).", "TR-YÖS sessions of 2027: not on ÖSYM's calendar on 10 Oct 2026.", "Boğaziçi's application period for the coming year; Middle East Technical, Koç and Istanbul Technical universities: no admissions page of theirs was read on 10 Oct 2026."], "source_url": "https://www.turkiyeburslari.gov.tr/calendar", "destination": "TR", "min_percent": 70, "verified_at": "2026-10-10", "universities": [{"id": "boun", "one_of": {"sat": 1300, "tr_yos": 450, "sat_engineering": 1350}, "source": 7, "english": {"ielts": 6.5, "toefl_ibt": 79}, "english_prep_year": true, "needs_verification": false}], "language_year": {"years": 1, "language": "tr", "level_at_end": "C1"}, "citizenship_rules": "non-Turkish", "stipend_try_month": 6500, "needs_verification": false}	f	2026-10-10	https://www.turkiyeburslari.gov.tr/calendar	\N	f	seed	2026-10-21 10:42:12.038473+05
TURKIYE_BURSLARI	3	scholarship	verified	{"id": "TURKIYE_BURSLARI", "name": "Turkiye Scholarships (undergraduate)", "steps": {"call": {"url": "https://turkiyeburslari.gov.tr/calendar", "host": "turkiyeburslari.gov.tr", "source": 0}, "apply": {"url": "https://tbbs.turkiyeburslari.gov.tr", "host": "turkiyeburslari.gov.tr", "source": 1}, "language": {"url": "https://www.osym.gov.tr/", "host": "osym.gov.tr", "source": 6}, "documents": {"url": "https://turkiyeburslari.gov.tr/applysteps", "host": "turkiyeburslari.gov.tr", "source": 3}}, "tests": [{"dates": null, "source": 6, "test_id": "TR_YOS", "last_sessions": [{"name": "2026-TR-YÖS/1", "results": "2026-05-07", "test_date": "2026-04-12", "apply_from": "2026-01-14", "apply_until": "2026-02-03"}, {"name": "2026-TR-YÖS/2", "results": "2026-11-05", "test_date": "2026-10-11", "apply_from": "2026-07-09", "apply_until": "2026-08-03"}]}], "covers": "tuition, stipend, housing, Turkish year", "tracks": [{"id": "online", "apply_at": "https://tbbs.turkiyeburslari.gov.tr", "month_to": 2, "month_from": 1}], "window": {"to_md": "02-20", "cycles": [{"opens": "2026-01-10", "closes": "2026-02-20", "notice": "Türkiye Scholarships 2026 Applications", "source": 1, "entry_year": 2026, "notice_posted": "2025-12-29"}], "from_md": "01-10", "results_month": 8}, "age_cap": "under 21 (verify)", "sources": [{"url": "https://www.turkiyeburslari.gov.tr/calendar", "says": "Application Calendar, General Application Period (the page names no year): application period January 10 - February 20; evaluation March-April; interviews April - June; announcement of results early August; initial procedures August; transfers of grantees to Türkiye September.", "read_on": "2026-10-10"}, {"url": "https://www.turkiyeburslari.gov.tr/announcements/turkiye-scholarships-2026-applications-121", "says": "'Türkiye Scholarships 2026 Applications', posted 29 December 2025: Application Dates: 10 January - 20 February 2026, for international students from all countries, for associate, bachelor's, master's and doctoral degrees, through tbbs.turkiyeburslari.gov.tr. No announcement for 2027 was on the site.", "read_on": "2026-10-10"}, {"url": "https://www.turkiyeburslari.gov.tr/scholarshipsprograms", "says": "Application criteria: citizens of all countries; graduates or those who will graduate at the end of the current academic year (before August); for associate and bachelor's degree programmes: under 21 years of age; minimum academic achievement for associate and bachelor's degree candidates: 70%. Turkish citizens cannot apply.", "read_on": "2026-10-10"}, {"url": "https://www.turkiyeburslari.gov.tr/applysteps", "says": "Applications are made online through the Türkiye Scholarships Application System (TBBS). All candidates upload: a valid ID card or passport; a photograph taken within the last year; national exam results, if any; a diploma or temporary graduation certificate; a transcript; international exam results (GRE, GMAT, SAT) if the chosen programme requires them; language test results (TOEFL, DELF) if the chosen programme requires them.", "read_on": "2026-10-10"}, {"url": "https://www.turkiyeburslari.gov.tr/fulltimeprograms", "says": "Scope of the scholarship: monthly stipend, undergraduate: 6.500 TL; tuition fee; accommodation; health insurance; Turkish language course (1 year); a once-off flight ticket at the beginning of education and when graduating.", "read_on": "2026-10-10"}, {"url": "https://www.turkiyeburslari.gov.tr/turkisheducation", "says": "Free 1 year Turkish language education for all Türkiye Scholarship students, regardless of the language of the programme they will study, at the Turkish Language Teaching Centers (TÖMER) within universities; a Turkish Proficiency Certificate at C1 level is expected at the end.", "read_on": "2026-10-10"}, {"url": "https://www.osym.gov.tr/", "says": "ÖSYM's calendar for 2026: 2026-TR-YÖS/1: applications 14.01.2026 - 03.02.2026, late 09.02.2026 - 11.02.2026, exam 12.04.2026, results 07.05.2026. 2026-TR-YÖS/2: applications 09.07.2026 - 03.08.2026, late 07.08.2026 - 11.08.2026, exam 11.10.2026, results 05.11.2026. No TR-YÖS session of 2027 is on the page.", "read_on": "2026-10-10"}, {"url": "https://intl.bogazici.edu.tr/node/100023029", "says": "Boğaziçi University, 'Admission of International Students to Undergraduate Programs: Required Documents': one of SAT (at least 1300/1600; engineering 1350 with Math 700; Mathematics, Molecular Biology and Genetics, Chemistry and Physics 1300 with Math 700; Faculty of Education 1200), TR-YÖS (minimum 450) or an A grade in three relevant GCE A Level subjects; scores valid for two years. Instruction is in English: BUEPT, TOEFL iBT 79 (Writing 22) or IELTS Academic 6.5 (Writing 6.5); students not meeting the requirement attend the English Preparatory Program at YADYOK. Application fee EUR 100 per programme. The page states no application period.", "read_on": "2026-10-10"}, {"url": "https://iso.metu.edu.tr/en/english-proficiency", "says": "Middle East Technical University (METU), International Students Office, 'English Proficiency' (the page says it was last updated 02/09/2026): 'The medium of instruction at METU is English.' Admitted students without a valid TOEFL, IELTS or PTE ACADEMIC score take the ODTÜ English Proficiency Exam; those who do not reach its minimum attend the English Preparatory Class at the Department of Basic English for one year; a valid score submitted at registration exempts from it. IELTS exams taken on or after the 24th of December 2022 are not accepted any more (University Senate decision of December 23, 2022). The minimum scores are in a linked equivalence table, not on the page.", "read_on": "2026-10-10"}, {"url": "https://iso.metu.edu.tr/en/application-requirements", "says": "METU, 'Application Requirements' (the page says it was last updated 09/01/2024): exam results such as TR-YÖS, SAT, QUDURAT and TQDK are valid for two years; documents holding the status of a high-school diploma are valid with any date. The minimum scores are in a linked file ('ODTÜ International Students Application Criteria'), not on the page.", "read_on": "2026-10-10"}], "age_under": 21, "documents": ["id_or_passport", "photo", "national_exam_results", "diploma", "transcript", "international_exam_results", "language_test_results"], "not_found": ["The 2027 application window: not announced on 10 Oct 2026 (the 2026 one was announced on 29 December 2025).", "TR-YÖS sessions of 2027: not on ÖSYM's calendar on 10 Oct 2026.", "Boğaziçi's application period for the coming year: not on its page on 10 Oct 2026.", "METU: the minimum scores (the exams' and the English tests') are in linked files that were not read, and its page says IELTS taken on or after 24 December 2022 is not accepted any more, so no number is written; applications for 2027-2028 are not announced.", "Koç University: its international pages answered 403 on 10 Oct 2026 (two addresses, each tried); nothing is written about it.", "Bilkent University: its pages that opened say only that it has 'a curriculum taught in English'; its requirement pages are on other hosts and were not read; nothing is written about it.", "Istanbul Technical University: not read in this pass."], "source_url": "https://www.turkiyeburslari.gov.tr/calendar", "destination": "TR", "min_percent": 70, "verified_at": "2026-10-10", "universities": [{"id": "boun", "one_of": {"sat": 1300, "tr_yos": 450, "sat_engineering": 1350}, "source": 7, "english": {"ielts": 6.5, "toefl_ibt": 79}, "english_prep_year": true, "needs_verification": false}, {"id": "metu", "exams": ["TR-YÖS", "SAT"], "source": 8, "exams_source": 9, "english_tests": ["TOEFL", "PTE Academic"], "english_medium": true, "exam_valid_years": 2, "english_prep_year": true, "ielts_refused_from": "2022-12-24", "needs_verification": true}], "language_year": {"years": 1, "language": "tr", "level_at_end": "C1"}, "citizenship_rules": "non-Turkish", "stipend_try_month": 6500, "needs_verification": false}	f	2026-10-10	https://www.turkiyeburslari.gov.tr/calendar	\N	t	seed	2026-10-21 10:42:12.038473+05
US	1	destination	verified	{"aid": {"note": "Brown reported need-blind for internationals from the class of 2029 - verify", "source_url": "https://www.thedp.com/article/2023/04/international-students-need-blind-financial-aid", "verified_at": "2026-09-24", "meets_full_need": ["same list; plus some need-aware schools meet full need for admitted internationals"], "needs_verification": false, "government_scholarships": [], "merit_full_ride_examples": ["check current lists; examples change yearly"], "need_blind_for_internationals": ["Harvard", "Yale", "Princeton", "MIT", "Amherst", "Dartmouth", "Bowdoin"]}, "visa": {"docs": ["I-20 from university", "SEVIS fee receipt", "DS-160", "passport", "proof of funds for year 1", "admission letter", "academic documents"], "type": "F-1", "source_url": "https://miracosta.edu/student-services/international-students/immigration-updates.html", "intent_rule": "nonimmigrant intent required (INA 214(b)); post-graduation 'stay' plans hurt interviews", "verified_at": "2026-09-24", "needs_verification": false, "proof_of_funds_rule": "documented funds covering I-20 estimated cost for the first year", "post_study_work_note": "OPT exists; from 2026-09-15 F-1 admission is a fixed period tied to the I-20 end date, max 4 years + 30-day grace; undergraduates may change major only after one academic year; H-1B path became costlier in 2025 (verify current fee)", "restrictions_by_citizenship": [{"type": "F/M/J entry suspended (e.g., Afghanistan, Iran, Myanmar, Haiti, Syria, Yemen and others)", "country": "full_ban_list_2026", "source_url": "https://isss.uoregon.edu/federal-updates"}, {"type": "F/M/J entry suspended (e.g., Nigeria, Venezuela, Cuba, Tanzania and others)", "country": "partial_ban_list_2026", "source_url": "https://isss.uoregon.edu/federal-updates"}, {"type": "not on F-1 ban lists; appears on 2026 list of countries with increased immigrant-visa (public charge) scrutiny; student visas still issued", "country": "UZ", "source_url": "https://manifestlaw.com/blog/212f-visa-rejections"}]}, "costs": {"source_url": null, "verified_at": null, "verify_task": "Confirm current fees", "living_band_usd": "15k-25k", "tuition_band_usd": "private 60k-70k; public out-of-state 35k-55k", "needs_verification": true, "visa_and_process_usd": "SEVIS + visa fee ~535; plus tests, translations", "application_fee_band_usd": "75-90 per application (waivers exist)"}, "cycles": [{"deadlines": [{"date": "2028-11-01", "hard": true, "name": "Early Decision / Early Action", "applies_to": "most selective universities; varies", "source_url": null, "verified_at": null, "verify_task": "Confirm per university; ED/EA dates vary (Oct 15 - Nov 15)", "needs_verification": true}, {"date": "2029-01-01", "hard": true, "name": "Regular Decision", "applies_to": "most universities; many are Jan 1-5", "source_url": null, "verified_at": null, "verify_task": "Confirm per university", "needs_verification": true}], "entry_term": "Fall 2029 (for a student graduating June 2029)", "decision_window": "Dec (ED) / Mar-Apr (RD)"}], "portals": ["Common App", "Coalition (Scoir)", "university-specific"], "interview": "some", "source_url": "https://thecollegeinvestor.com/77443/colleges-are-requiring-sat-and-act-scores-again-heres-the-full-list-for-2027/", "destination": "US", "verified_at": "2026-09-24", "requirements": {"tests": [{"test_id": "SAT_or_ACT", "source_url": "https://www.carnegieprep.com/college-admissions/college-admissions-testing-policy-updates/", "verified_at": "2026-09-24", "required_for": {"universities": ["Harvard", "Yale", "Dartmouth", "Brown", "Penn", "Cornell", "Stanford", "MIT", "Caltech", "Johns Hopkins", "UT Austin", "Ohio State", "Purdue", "Georgetown", "Florida and Georgia public systems"]}, "optional_where": "many other universities remain test-optional; Princeton requires from Fall 2028 entry; Columbia reverted for fall 2027 applicants", "needs_verification": false, "typical_score_band": "1500+ SAT for most selective as an international; 1300-1450 for strong publics"}, {"test_id": "AP", "source_url": null, "verified_at": null, "verify_task": "Optional; confirm availability at home test centers", "required_for": {}, "optional_where": "everywhere", "needs_verification": true, "typical_score_band": "4-5 as rigor evidence"}], "language": [{"waivers": "often waived with high SAT EBRW or English-medium schooling; varies", "language": "en", "min_level": "B2", "source_url": null, "verified_at": null, "verify_task": "Confirm per university", "needs_verification": true, "accepted_certificates": ["TOEFL iBT 100+ (selective) / 80+", "IELTS 7.0+ (selective) / 6.5+", "Duolingo 120-130+"]}], "school_leaving": {"accepted_certificates": ["national secondary certificate + transcript in English", "IB", "A-levels", "AP-based"], "needs_foundation_or_studienkolleg_for": []}}, "universities": [{"id": "mit", "name": "MIT", "notes": "need-blind, meets full need", "typical_scores": "SAT 1520-1580", "selectivity_band": "ultra", "need_aware_for_internationals": false}, {"id": "penn", "name": "University of Pennsylvania", "notes": "need-aware for internationals", "typical_scores": "SAT 1500-1570", "selectivity_band": "ultra", "need_aware_for_internationals": true}], "admission_logic": "holistic", "needs_verification": false, "recommendation_letters": {"who": "grade 10-11 teachers", "count": "2 teachers + counselor/school report"}}	f	2026-09-24	https://thecollegeinvestor.com/77443/colleges-are-requiring-sat-and-act-scores-again-heres-the-full-list-for-2027/	Fall 2029 (for a student graduating June 2029)	f	seed	2026-10-21 10:42:12.038473+05
US	2	destination	verified	{"aid": {"note": "Brown reported need-blind for internationals from the class of 2029 - verify", "source_url": "https://www.thedp.com/article/2023/04/international-students-need-blind-financial-aid", "verified_at": "2026-09-24", "meets_full_need": ["same list; plus some need-aware schools meet full need for admitted internationals"], "needs_verification": false, "government_scholarships": [], "merit_full_ride_examples": ["check current lists; examples change yearly"], "need_blind_for_internationals": ["Harvard", "Yale", "Princeton", "MIT", "Amherst", "Dartmouth", "Bowdoin"]}, "visa": {"docs": ["I-20 from university", "SEVIS fee receipt", "DS-160", "passport", "proof of funds for year 1", "admission letter", "academic documents"], "type": "F-1", "source_url": "https://miracosta.edu/student-services/international-students/immigration-updates.html", "intent_rule": "nonimmigrant intent required (INA 214(b)); post-graduation 'stay' plans hurt interviews", "verified_at": "2026-09-24", "needs_verification": false, "proof_of_funds_rule": "documented funds covering I-20 estimated cost for the first year", "post_study_work_note": "OPT exists; from 2026-09-15 F-1 admission is a fixed period tied to the I-20 end date, max 4 years + 30-day grace; undergraduates may change major only after one academic year; H-1B path became costlier in 2025 (verify current fee)", "restrictions_by_citizenship": [{"type": "F/M/J entry suspended (e.g., Afghanistan, Iran, Myanmar, Haiti, Syria, Yemen and others)", "country": "full_ban_list_2026", "source_url": "https://isss.uoregon.edu/federal-updates"}, {"type": "F/M/J entry suspended (e.g., Nigeria, Venezuela, Cuba, Tanzania and others)", "country": "partial_ban_list_2026", "source_url": "https://isss.uoregon.edu/federal-updates"}, {"type": "not on F-1 ban lists; appears on 2026 list of countries with increased immigrant-visa (public charge) scrutiny; student visas still issued", "country": "UZ", "source_url": "https://manifestlaw.com/blog/212f-visa-rejections"}]}, "costs": {"source_url": null, "verified_at": null, "verify_task": "Confirm current fees", "living_band_usd": "15k-25k", "tuition_band_usd": "private 60k-70k; public out-of-state 35k-55k", "needs_verification": true, "visa_and_process_usd": "SEVIS + visa fee ~535; plus tests, translations", "application_fee_band_usd": "75-90 per application (waivers exist)"}, "cycles": [{"deadlines": [{"date": "2028-11-01", "hard": true, "name": "Early Decision / Early Action", "applies_to": "most selective universities; varies", "source_url": null, "verified_at": null, "verify_task": "Confirm per university; ED/EA dates vary (Oct 15 - Nov 15)", "needs_verification": true}, {"date": "2029-01-01", "hard": true, "name": "Regular Decision", "applies_to": "most universities; many are Jan 1-5", "source_url": null, "verified_at": null, "verify_task": "Confirm per university", "needs_verification": true}], "entry_term": "Fall 2029 (for a student graduating June 2029)", "decision_window": "Dec (ED) / Mar-Apr (RD)"}], "portals": ["Common App", "Coalition (Scoir)", "university-specific"], "interview": "some", "source_url": "https://thecollegeinvestor.com/77443/colleges-are-requiring-sat-and-act-scores-again-heres-the-full-list-for-2027/", "destination": "US", "verified_at": "2026-09-24", "requirements": {"tests": [{"test_id": "SAT_or_ACT", "source_url": "https://www.carnegieprep.com/college-admissions/college-admissions-testing-policy-updates/", "verified_at": "2026-09-24", "required_for": {"universities": ["Harvard", "Yale", "Dartmouth", "Brown", "Penn", "Cornell", "Stanford", "MIT", "Caltech", "Johns Hopkins", "UT Austin", "Ohio State", "Purdue", "Georgetown", "Florida and Georgia public systems", "Princeton", "Carnegie Mellon"]}, "optional_where": "many other universities remain test-optional; Princeton requires from Fall 2028 entry; Columbia reverted for fall 2027 applicants", "needs_verification": false, "typical_score_band": "1500+ SAT for most selective as an international; 1300-1450 for strong publics", "sources_by_university": {"Princeton": {"url": "https://admission.princeton.edu/apply/standardized-testing", "says": "SAT or ACT required for fall 2028 entry onward; test optional for fall 2027 entry", "checked": "2026-10-04"}, "Carnegie Mellon": {"url": "https://admission-pantheon.cmu.edu/admission/standardized-testing", "says": "School of Computer Science requires SAT or ACT; Engineering, Dietrich, MCS, Tepper and Heinz IS are test flexible (scores required: SAT, ACT, IB, AP, A-level or French Bac); Fine Arts is test optional", "checked": "2026-10-04"}}}, {"test_id": "AP", "source_url": null, "verified_at": null, "verify_task": "Optional; confirm availability at home test centers", "required_for": {}, "optional_where": "everywhere", "needs_verification": true, "typical_score_band": "4-5 as rigor evidence"}], "language": [{"waivers": "often waived with high SAT EBRW or English-medium schooling; varies", "language": "en", "min_level": "B2", "source_url": null, "verified_at": null, "verify_task": "Confirm per university", "needs_verification": true, "accepted_certificates": ["TOEFL iBT 100+ (selective) / 80+", "IELTS 7.0+ (selective) / 6.5+", "Duolingo 120-130+"]}], "school_leaving": {"accepted_certificates": ["national secondary certificate + transcript in English", "IB", "A-levels", "AP-based"], "needs_foundation_or_studienkolleg_for": []}}, "universities": [{"id": "mit", "name": "MIT", "notes": "need-blind, meets full need", "typical_scores": "SAT 1520-1580", "selectivity_band": "ultra", "need_aware_for_internationals": false}, {"id": "penn", "name": "University of Pennsylvania", "notes": "need-aware for internationals", "typical_scores": "SAT 1500-1570", "selectivity_band": "ultra", "need_aware_for_internationals": true}], "admission_logic": "holistic", "needs_verification": false, "recommendation_letters": {"who": "grade 10-11 teachers", "count": "2 teachers + counselor/school report"}}	f	2026-09-24	https://thecollegeinvestor.com/77443/colleges-are-requiring-sat-and-act-scores-again-heres-the-full-list-for-2027/	Fall 2029 (for a student graduating June 2029)	f	seed	2026-10-21 10:42:12.038473+05
US	3	destination	verified	{"aid": {"note": "Brown reported need-blind for internationals from the class of 2029 - verify", "source_url": "https://www.thedp.com/article/2023/04/international-students-need-blind-financial-aid", "verified_at": "2026-09-24", "meets_full_need": ["same list; plus some need-aware schools meet full need for admitted internationals"], "needs_verification": false, "government_scholarships": [], "merit_full_ride_examples": ["check current lists; examples change yearly"], "need_blind_for_internationals": ["Harvard", "Yale", "Princeton", "MIT", "Amherst", "Dartmouth", "Bowdoin"]}, "visa": {"docs": ["I-20 from university", "SEVIS fee receipt", "DS-160", "passport", "proof of funds for year 1", "admission letter", "academic documents"], "type": "F-1", "source_url": "https://miracosta.edu/student-services/international-students/immigration-updates.html", "intent_rule": "nonimmigrant intent required (INA 214(b)); post-graduation 'stay' plans hurt interviews", "verified_at": "2026-09-24", "needs_verification": false, "proof_of_funds_rule": "documented funds covering I-20 estimated cost for the first year", "post_study_work_note": "OPT exists; from 2026-09-15 F-1 admission is a fixed period tied to the I-20 end date, max 4 years + 30-day grace; undergraduates may change major only after one academic year; H-1B path became costlier in 2025 (verify current fee)", "restrictions_by_citizenship": [{"type": "F/M/J entry suspended (e.g., Afghanistan, Iran, Myanmar, Haiti, Syria, Yemen and others)", "country": "full_ban_list_2026", "source_url": "https://isss.uoregon.edu/federal-updates"}, {"type": "F/M/J entry suspended (e.g., Nigeria, Venezuela, Cuba, Tanzania and others)", "country": "partial_ban_list_2026", "source_url": "https://isss.uoregon.edu/federal-updates"}, {"type": "not on F-1 ban lists; appears on 2026 list of countries with increased immigrant-visa (public charge) scrutiny; student visas still issued", "country": "UZ", "source_url": "https://manifestlaw.com/blog/212f-visa-rejections"}]}, "costs": {"source_url": null, "verified_at": null, "verify_task": "Confirm current fees", "living_band_usd": "15k-25k", "tuition_band_usd": "private 60k-70k; public out-of-state 35k-55k", "needs_verification": true, "visa_and_process_usd": "SEVIS + visa fee ~535; plus tests, translations", "application_fee_band_usd": "75-90 per application (waivers exist)"}, "dated": {"sat_scores": {"says": "Most scores from weekend tests are released 2–4 weeks after test day.", "label": "SAT Suite Score Release Dates for Students and Educators", "not_read": [{"got": "HTTP 404", "urls": ["https://satsuite.collegeboard.org/scores/when-to-expect-scores"], "tried": "2026-10-11"}], "releases": [{"date": "2026-08-22", "test": "SAT", "scores_on": "2026-09-04", "source_url": "https://satsuite.collegeboard.org/scores/score-release-dates", "verified_at": "2026-10-11"}, {"date": "2026-09-12", "test": "SAT", "scores_on": "2026-09-25", "source_url": "https://satsuite.collegeboard.org/scores/score-release-dates", "verified_at": "2026-10-11"}, {"date": "2026-10-03", "test": "SAT", "scores_on": "2026-10-16", "source_url": "https://satsuite.collegeboard.org/scores/score-release-dates", "verified_at": "2026-10-11"}, {"date": "2026-11-07", "test": "SAT", "scores_on": "2026-11-20", "source_url": "https://satsuite.collegeboard.org/scores/score-release-dates", "verified_at": "2026-10-11"}, {"date": "2026-12-05", "test": "SAT", "scores_on": "2026-12-18", "source_url": "https://satsuite.collegeboard.org/scores/score-release-dates", "verified_at": "2026-10-11"}, {"date": "2027-03-06", "test": "SAT", "scores_on": "2027-03-19", "source_url": "https://satsuite.collegeboard.org/scores/score-release-dates", "verified_at": "2026-10-11"}, {"date": "2027-05-01", "test": "SAT", "scores_on": "2027-05-14", "source_url": "https://satsuite.collegeboard.org/scores/score-release-dates", "verified_at": "2026-10-11"}, {"date": "2027-06-05", "test": "SAT", "scores_on": "2027-06-21", "source_url": "https://satsuite.collegeboard.org/scores/score-release-dates", "verified_at": "2026-10-11"}], "source_url": "https://satsuite.collegeboard.org/scores/score-release-dates", "verified_at": "2026-10-11"}, "universities": {"nyu": {"name": "New York University", "page": "NYU 2026-2027 Bulletins, Tisch School of the Arts, Undergraduate Admissions", "not_read": [{"got": "an empty page each time: the site answers a program with a browser check (HTTP 302 to the same address with a challenge, then 202 with no text). Nothing is written from these pages.", "urls": ["https://www.nyu.edu/admissions/undergraduate-admissions/how-to-apply/all-freshmen-applicants.html", "https://www.nyu.edu/admissions/undergraduate-admissions/how-to-apply/all-freshmen-applicants/early-decision.html", "https://www.nyu.edu/admissions/undergraduate-admissions/how-to-apply/standardized-tests.html", "https://www.nyu.edu/admissions/undergraduate-admissions/high-school-counselors/decision-information.html"], "what": "NYU's own first-year admissions pages (the deadlines, the testing policy, the English tests)", "tried": "2026-10-11"}, {"got": "read: it gives no date and sends the reader to the Undergraduate Admissions website.", "urls": ["https://bulletins.nyu.edu/undergraduate/arts-science/admissions/"], "what": "The College of Arts and Science's bulletin page", "tried": "2026-10-11"}], "deadlines": [{"date": "2026-11-01", "name": "Early Decision I", "says": "We urge you to complete and file your application by November 1 for Early Decision I admission", "month_day": "11-01", "source_url": "https://bulletins.nyu.edu/undergraduate/arts/admissions/", "verified_at": "2026-10-11", "needs_verification": false}, {"date": "2027-01-01", "name": "Early Decision II", "says": "by January 1 for Early Decision II", "month_day": "01-01", "source_url": "https://bulletins.nyu.edu/undergraduate/arts/admissions/", "verified_at": "2026-10-11", "needs_verification": false}, {"date": "2027-01-05", "name": "Regular Decision", "says": "by January 5 for regular decision", "month_day": "01-05", "source_url": "https://bulletins.nyu.edu/undergraduate/arts/admissions/", "verified_at": "2026-10-11", "needs_verification": false}], "entry_year": 2027, "year_basis": "The page gives the month and the day and names no year. It is the bulletin of 2026-2027, so an application filed under it is for entry in fall 2027: 1 November is 2026, 1 and 5 January are 2027.", "notifications": [{"name": "Early Decision I", "says": "Early decision candidates will be notified of the admission decision starting in the middle of December", "source_url": "https://bulletins.nyu.edu/undergraduate/arts/admissions/", "verified_at": "2026-10-11"}, {"name": "Early Decision II", "says": "or after the middle of February for Early Decision II", "source_url": "https://bulletins.nyu.edu/undergraduate/arts/admissions/", "verified_at": "2026-10-11"}, {"name": "Regular Decision", "says": "Regular decision candidates will receive notification on or around April 1.", "source_url": "https://bulletins.nyu.edu/undergraduate/arts/admissions/", "verified_at": "2026-10-11"}]}}}, "cycles": [{"deadlines": [{"date": "2028-11-01", "hard": true, "name": "Early Decision / Early Action", "applies_to": "most selective universities; varies", "source_url": null, "verified_at": null, "verify_task": "Confirm per university; ED/EA dates vary (Oct 15 - Nov 15)", "needs_verification": true}, {"date": "2029-01-01", "hard": true, "name": "Regular Decision", "applies_to": "most universities; many are Jan 1-5", "source_url": null, "verified_at": null, "verify_task": "Confirm per university", "needs_verification": true}], "entry_term": "Fall 2029 (for a student graduating June 2029)", "decision_window": "Dec (ED) / Mar-Apr (RD)"}], "portals": ["Common App", "Coalition (Scoir)", "university-specific"], "interview": "some", "source_url": "https://thecollegeinvestor.com/77443/colleges-are-requiring-sat-and-act-scores-again-heres-the-full-list-for-2027/", "destination": "US", "verified_at": "2026-09-24", "requirements": {"tests": [{"test_id": "SAT_or_ACT", "source_url": "https://www.carnegieprep.com/college-admissions/college-admissions-testing-policy-updates/", "verified_at": "2026-09-24", "required_for": {"universities": ["Harvard", "Yale", "Dartmouth", "Brown", "Penn", "Cornell", "Stanford", "MIT", "Caltech", "Johns Hopkins", "UT Austin", "Ohio State", "Purdue", "Georgetown", "Florida and Georgia public systems", "Princeton", "Carnegie Mellon"]}, "optional_where": "many other universities remain test-optional; Princeton requires from Fall 2028 entry; Columbia reverted for fall 2027 applicants", "needs_verification": false, "typical_score_band": "1500+ SAT for most selective as an international; 1300-1450 for strong publics", "sources_by_university": {"Princeton": {"url": "https://admission.princeton.edu/apply/standardized-testing", "says": "SAT or ACT required for fall 2028 entry onward; test optional for fall 2027 entry", "checked": "2026-10-04"}, "Carnegie Mellon": {"url": "https://admission-pantheon.cmu.edu/admission/standardized-testing", "says": "School of Computer Science requires SAT or ACT; Engineering, Dietrich, MCS, Tepper and Heinz IS are test flexible (scores required: SAT, ACT, IB, AP, A-level or French Bac); Fine Arts is test optional", "checked": "2026-10-04"}}}, {"test_id": "AP", "source_url": null, "verified_at": null, "verify_task": "Optional; confirm availability at home test centers", "required_for": {}, "optional_where": "everywhere", "needs_verification": true, "typical_score_band": "4-5 as rigor evidence"}], "language": [{"waivers": "often waived with high SAT EBRW or English-medium schooling; varies", "language": "en", "min_level": "B2", "source_url": null, "verified_at": null, "verify_task": "Confirm per university", "needs_verification": true, "accepted_certificates": ["TOEFL iBT 100+ (selective) / 80+", "IELTS 7.0+ (selective) / 6.5+", "Duolingo 120-130+"]}], "school_leaving": {"accepted_certificates": ["national secondary certificate + transcript in English", "IB", "A-levels", "AP-based"], "needs_foundation_or_studienkolleg_for": []}}, "universities": [{"id": "mit", "name": "MIT", "notes": "need-blind, meets full need", "typical_scores": "SAT 1520-1580", "selectivity_band": "ultra", "need_aware_for_internationals": false}, {"id": "penn", "name": "University of Pennsylvania", "notes": "need-aware for internationals", "typical_scores": "SAT 1500-1570", "selectivity_band": "ultra", "need_aware_for_internationals": true}], "admission_logic": "holistic", "needs_verification": false, "recommendation_letters": {"who": "grade 10-11 teachers", "count": "2 teachers + counselor/school report"}}	f	2026-09-24	https://thecollegeinvestor.com/77443/colleges-are-requiring-sat-and-act-scores-again-heres-the-full-list-for-2027/	Fall 2029 (for a student graduating June 2029)	f	seed	2026-10-21 10:42:12.038473+05
US	4	destination	verified	{"aid": {"note": "Brown reported need-blind for internationals from the class of 2029 - verify", "source_url": "https://www.thedp.com/article/2023/04/international-students-need-blind-financial-aid", "verified_at": "2026-09-24", "meets_full_need": ["same list; plus some need-aware schools meet full need for admitted internationals"], "needs_verification": false, "government_scholarships": [], "merit_full_ride_examples": ["check current lists; examples change yearly"], "need_blind_for_internationals": ["Harvard", "Yale", "Princeton", "MIT", "Amherst", "Dartmouth", "Bowdoin"]}, "visa": {"docs": ["I-20 from university", "SEVIS fee receipt", "DS-160", "passport", "proof of funds for year 1", "admission letter", "academic documents"], "type": "F-1", "source_url": "https://miracosta.edu/student-services/international-students/immigration-updates.html", "intent_rule": "nonimmigrant intent required (INA 214(b)); post-graduation 'stay' plans hurt interviews", "verified_at": "2026-09-24", "needs_verification": false, "proof_of_funds_rule": "documented funds covering I-20 estimated cost for the first year", "post_study_work_note": "OPT exists; from 2026-09-15 F-1 admission is a fixed period tied to the I-20 end date, max 4 years + 30-day grace; undergraduates may change major only after one academic year; H-1B path became costlier in 2025 (verify current fee)", "restrictions_by_citizenship": [{"type": "F/M/J entry suspended (e.g., Afghanistan, Iran, Myanmar, Haiti, Syria, Yemen and others)", "country": "full_ban_list_2026", "source_url": "https://isss.uoregon.edu/federal-updates"}, {"type": "F/M/J entry suspended (e.g., Nigeria, Venezuela, Cuba, Tanzania and others)", "country": "partial_ban_list_2026", "source_url": "https://isss.uoregon.edu/federal-updates"}, {"type": "not on F-1 ban lists; appears on 2026 list of countries with increased immigrant-visa (public charge) scrutiny; student visas still issued", "country": "UZ", "source_url": "https://manifestlaw.com/blog/212f-visa-rejections"}]}, "costs": {"source_url": null, "verified_at": null, "verify_task": "Confirm current fees", "living_band_usd": "15k-25k", "tuition_band_usd": "private 60k-70k; public out-of-state 35k-55k", "needs_verification": true, "visa_and_process_usd": "SEVIS + visa fee ~535; plus tests, translations", "application_fee_band_usd": "75-90 per application (waivers exist)"}, "dated": {"sat_scores": {"says": "Most scores from weekend tests are released 2–4 weeks after test day.", "label": "SAT Suite Score Release Dates for Students and Educators", "not_read": [{"got": "HTTP 404", "urls": ["https://satsuite.collegeboard.org/scores/when-to-expect-scores"], "tried": "2026-10-11"}], "releases": [{"date": "2026-08-22", "test": "SAT", "scores_on": "2026-09-04", "source_url": "https://satsuite.collegeboard.org/scores/score-release-dates", "verified_at": "2026-10-11"}, {"date": "2026-09-12", "test": "SAT", "scores_on": "2026-09-25", "source_url": "https://satsuite.collegeboard.org/scores/score-release-dates", "verified_at": "2026-10-11"}, {"date": "2026-10-03", "test": "SAT", "scores_on": "2026-10-16", "source_url": "https://satsuite.collegeboard.org/scores/score-release-dates", "verified_at": "2026-10-11"}, {"date": "2026-11-07", "test": "SAT", "scores_on": "2026-11-20", "source_url": "https://satsuite.collegeboard.org/scores/score-release-dates", "verified_at": "2026-10-11"}, {"date": "2026-12-05", "test": "SAT", "scores_on": "2026-12-18", "source_url": "https://satsuite.collegeboard.org/scores/score-release-dates", "verified_at": "2026-10-11"}, {"date": "2027-03-06", "test": "SAT", "scores_on": "2027-03-19", "source_url": "https://satsuite.collegeboard.org/scores/score-release-dates", "verified_at": "2026-10-11"}, {"date": "2027-05-01", "test": "SAT", "scores_on": "2027-05-14", "source_url": "https://satsuite.collegeboard.org/scores/score-release-dates", "verified_at": "2026-10-11"}, {"date": "2027-06-05", "test": "SAT", "scores_on": "2027-06-21", "source_url": "https://satsuite.collegeboard.org/scores/score-release-dates", "verified_at": "2026-10-11"}], "source_url": "https://satsuite.collegeboard.org/scores/score-release-dates", "verified_at": "2026-10-11"}, "universities": {"cmu": {"name": "Carnegie Mellon University", "page": "Carnegie Mellon Admission, application plans and deadlines", "deadlines": [{"date": "2026-11-02", "name": "Early Decision", "says": "Early Decision Timeline Deadline: November 2", "month_day": "11-02", "source_url": "https://www.cmu.edu/admission/admission/application-plans-deadlines", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-04", "name": "Regular Decision", "says": "Regular Decision Timeline Deadline: January 4", "month_day": "01-04", "source_url": "https://www.cmu.edu/admission/admission/application-plans-deadlines", "verified_at": "2026-10-20", "needs_verification": false}], "entry_year": 2027, "year_basis": "The page gives the month and the day and names no year. It was read on 20 October 2026, while applications for entry in fall 2027 were open (its first deadline was still ahead), so a November or December day is 2026 and a January or February day is 2027. Early Decision is not open to the School of Drama, BXA Design programs or the School of Music; their Regular Decision day is December 1."}, "jhu": {"name": "Johns Hopkins University", "page": "Johns Hopkins Admissions, application deadlines and requirements", "deadlines": [{"date": "2026-11-01", "name": "Early Decision I", "says": "Application Deadline November 1, 2026", "month_day": "11-01", "source_url": "https://apply.jhu.edu/how-to-apply/application-deadlines-requirements/", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-02", "name": "Early Decision II", "says": "January 2, 2027", "month_day": "01-02", "source_url": "https://apply.jhu.edu/how-to-apply/application-deadlines-requirements/", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-02", "name": "Regular Decision", "says": "January 2, 2027", "month_day": "01-02", "source_url": "https://apply.jhu.edu/how-to-apply/application-deadlines-requirements/", "verified_at": "2026-10-20", "needs_verification": false}], "entry_year": 2027, "year_basis": "The page names each day's year.", "aid_deadlines": [{"date": "2026-11-15", "name": "Financial aid, Early Decision I", "says": "Financial Aid Deadline November 15, 2026", "month_day": "11-15", "source_url": "https://apply.jhu.edu/how-to-apply/application-deadlines-requirements/", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-15", "name": "Financial aid, Early Decision II", "says": "January 15, 2027", "month_day": "01-15", "source_url": "https://apply.jhu.edu/how-to-apply/application-deadlines-requirements/", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-15", "name": "Financial aid, Regular Decision", "says": "January 15, 2027", "month_day": "01-15", "source_url": "https://apply.jhu.edu/how-to-apply/application-deadlines-requirements/", "verified_at": "2026-10-20", "needs_verification": false}]}, "mit": {"name": "MIT", "page": "MIT Admissions, first-year deadlines and requirements", "deadlines": [{"date": "2026-11-01", "name": "Early Action", "says": "Early Action (EA) applications are due November 1", "month_day": "11-01", "source_url": "https://mitadmissions.org/apply/firstyear/deadlines-requirements/", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-04", "name": "Regular Action", "says": "Regular Action (RA) applications are due January 4", "month_day": "01-04", "source_url": "https://mitadmissions.org/apply/firstyear/deadlines-requirements/", "verified_at": "2026-10-20", "needs_verification": false}], "entry_year": 2027, "year_basis": "The page gives the month and the day and names no year. It was read on 20 October 2026, while applications for entry in fall 2027 were open (its first deadline was still ahead), so a November or December day is 2026 and a January or February day is 2027.", "aid_deadlines": [{"date": "2026-11-30", "name": "Financial aid, Early Action applicants", "says": "due November 30 for EA applicants", "month_day": "11-30", "source_url": "https://mitadmissions.org/apply/firstyear/deadlines-requirements/", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-02-15", "name": "Financial aid, Regular Action applicants", "says": "and February 15 for RA applicants", "month_day": "02-15", "source_url": "https://mitadmissions.org/apply/firstyear/deadlines-requirements/", "verified_at": "2026-10-20", "needs_verification": false}]}, "nyu": {"name": "New York University", "page": "NYU 2026-2027 Bulletins, Tisch School of the Arts, Undergraduate Admissions", "not_read": [{"got": "an empty page each time: the site answers a program with a browser check (HTTP 302 to the same address with a challenge, then 202 with no text). Nothing is written from these pages.", "urls": ["https://www.nyu.edu/admissions/undergraduate-admissions/how-to-apply/all-freshmen-applicants.html", "https://www.nyu.edu/admissions/undergraduate-admissions/how-to-apply/all-freshmen-applicants/early-decision.html", "https://www.nyu.edu/admissions/undergraduate-admissions/how-to-apply/standardized-tests.html", "https://www.nyu.edu/admissions/undergraduate-admissions/high-school-counselors/decision-information.html"], "what": "NYU's own first-year admissions pages (the deadlines, the testing policy, the English tests)", "tried": "2026-10-11"}, {"got": "read: it gives no date and sends the reader to the Undergraduate Admissions website.", "urls": ["https://bulletins.nyu.edu/undergraduate/arts-science/admissions/"], "what": "The College of Arts and Science's bulletin page", "tried": "2026-10-11"}], "deadlines": [{"date": "2026-11-01", "name": "Early Decision I", "says": "We urge you to complete and file your application by November 1 for Early Decision I admission", "month_day": "11-01", "source_url": "https://bulletins.nyu.edu/undergraduate/arts/admissions/", "verified_at": "2026-10-11", "needs_verification": false}, {"date": "2027-01-01", "name": "Early Decision II", "says": "by January 1 for Early Decision II", "month_day": "01-01", "source_url": "https://bulletins.nyu.edu/undergraduate/arts/admissions/", "verified_at": "2026-10-11", "needs_verification": false}, {"date": "2027-01-05", "name": "Regular Decision", "says": "by January 5 for regular decision", "month_day": "01-05", "source_url": "https://bulletins.nyu.edu/undergraduate/arts/admissions/", "verified_at": "2026-10-11", "needs_verification": false}], "entry_year": 2027, "year_basis": "The page gives the month and the day and names no year. It is the bulletin of 2026-2027, so an application filed under it is for entry in fall 2027: 1 November is 2026, 1 and 5 January are 2027.", "notifications": [{"name": "Early Decision I", "says": "Early decision candidates will be notified of the admission decision starting in the middle of December", "source_url": "https://bulletins.nyu.edu/undergraduate/arts/admissions/", "verified_at": "2026-10-11"}, {"name": "Early Decision II", "says": "or after the middle of February for Early Decision II", "source_url": "https://bulletins.nyu.edu/undergraduate/arts/admissions/", "verified_at": "2026-10-11"}, {"name": "Regular Decision", "says": "Regular decision candidates will receive notification on or around April 1.", "source_url": "https://bulletins.nyu.edu/undergraduate/arts/admissions/", "verified_at": "2026-10-11"}]}, "osu": {"name": "Ohio State University", "page": "Ohio State Undergraduate Admissions, application step by step", "deadlines": [{"date": "2026-11-01", "name": "Early Action", "says": "Early action: Nov. 1, 2026", "month_day": "11-01", "source_url": "https://undergrad.osu.edu/apply/freshmen-columbus/apply-step-by-step", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-15", "name": "Regular Decision", "says": "Regular decision: Jan. 15, 2027", "month_day": "01-15", "source_url": "https://undergrad.osu.edu/apply/freshmen-columbus/apply-step-by-step", "verified_at": "2026-10-20", "needs_verification": false}], "entry_year": 2027, "year_basis": "The page names the intake (\\"Autumn 2027\\") and each deadline's year.", "aid_deadlines": [{"date": "2027-02-01", "name": "Financial aid priority date", "says": "Priority date for financial aid ... Feb. 1", "month_day": "02-01", "source_url": "https://undergrad.osu.edu/apply/freshmen-columbus/apply-step-by-step", "verified_at": "2026-10-20", "needs_verification": false}]}, "penn": {"name": "University of Pennsylvania", "page": "Penn Admissions, first-year applicants", "deadlines": [{"date": "2026-11-01", "name": "Early Decision", "says": "Early Decision Deadline: November 1, 2026", "month_day": "11-01", "source_url": "https://admissions.upenn.edu/how-to-apply/first-year-applicants", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-05", "name": "Regular Decision", "says": "Regular Decision Deadline: January 5, 2027", "month_day": "01-05", "source_url": "https://admissions.upenn.edu/how-to-apply/first-year-applicants", "verified_at": "2026-10-20", "needs_verification": false}], "entry_year": 2027, "year_basis": "The page names the year: \\"Our application for entry as a first year student in fall 2027 is now available\\", with each day's year."}, "yale": {"name": "Yale University", "page": "Yale Undergraduate Admissions, apply", "deadlines": [{"date": "2026-11-01", "name": "Single-Choice Early Action", "says": "Single-Choice Early Action (Deadline: November 1)", "month_day": "11-01", "source_url": "https://admissions.yale.edu/apply", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-02", "name": "Regular Decision", "says": "Regular Decision (Deadline: January 2)", "month_day": "01-02", "source_url": "https://admissions.yale.edu/apply", "verified_at": "2026-10-20", "needs_verification": false}], "entry_year": 2027, "year_basis": "The page gives the month and the day and names no year. It was read on 20 October 2026, while applications for entry in fall 2027 were open (its first deadline was still ahead), so a November or December day is 2026 and a January or February day is 2027."}, "brown": {"name": "Brown University", "page": "Brown Admission, first-year applicants", "deadlines": [{"date": "2026-11-01", "name": "Early Decision", "says": "Early Decision plan. Deadline: November 1", "month_day": "11-01", "source_url": "https://admission.brown.edu/first-year", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-05", "name": "Regular Decision", "says": "Regular Decision ... Deadline: January 5", "month_day": "01-05", "source_url": "https://admission.brown.edu/first-year", "verified_at": "2026-10-20", "needs_verification": false}], "entry_year": 2027, "year_basis": "The page gives the month and the day and names no year. It was read on 20 October 2026, while applications for entry in fall 2027 were open (its first deadline was still ahead), so a November or December day is 2026 and a January or February day is 2027."}, "purdue": {"name": "Purdue University", "page": "Purdue Admissions, first-year deadlines (last modified August 11, 2026)", "deadlines": [{"date": "2026-11-01", "name": "Early Action", "says": "the Early Action deadline of Nov. 1", "month_day": "11-01", "source_url": "https://admissions.purdue.edu/deadlines/first-year-college-student/", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-15", "name": "Regular Decision", "says": "Jan. 15 Regular decision application deadline", "month_day": "01-15", "source_url": "https://admissions.purdue.edu/deadlines/first-year-college-student/", "verified_at": "2026-10-20", "needs_verification": false}], "entry_year": 2027, "year_basis": "The page gives the month and the day and names no year; it was last modified on August 11, 2026 and read on 20 October 2026, while applications for entry in fall 2027 were open: November is 2026 and January is 2027."}, "bowdoin": {"name": "Bowdoin College", "page": "Bowdoin Admissions, application dates and deadlines", "deadlines": [{"date": "2026-11-15", "name": "Early Decision 1", "says": "Early Decision 1 ... Nov. 15", "month_day": "11-15", "source_url": "https://www.bowdoin.edu/admissions/apply/dates-deadlines/index.html", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-05", "name": "Early Decision 2", "says": "Early Decision 2 ... Jan. 5", "month_day": "01-05", "source_url": "https://www.bowdoin.edu/admissions/apply/dates-deadlines/index.html", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-05", "name": "Regular Decision", "says": "Regular Decision ... Jan. 5", "month_day": "01-05", "source_url": "https://www.bowdoin.edu/admissions/apply/dates-deadlines/index.html", "verified_at": "2026-10-20", "needs_verification": false}], "entry_year": 2027, "year_basis": "The page gives the month and the day and names no year. It was read on 20 October 2026, while applications for entry in fall 2027 were open (its first deadline was still ahead), so a November or December day is 2026 and a January or February day is 2027. International applicants (excluding Canadians) send their financial aid papers only once admitted, the page says.", "aid_deadlines": [{"date": "2026-11-15", "name": "Financial aid, Early Decision 1", "says": "Financial Aid Application Due ... Nov. 15", "month_day": "11-15", "source_url": "https://www.bowdoin.edu/admissions/apply/dates-deadlines/index.html", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-05", "name": "Financial aid, Early Decision 2", "says": "Jan. 5", "month_day": "01-05", "source_url": "https://www.bowdoin.edu/admissions/apply/dates-deadlines/index.html", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-02-01", "name": "Financial aid, Regular Decision", "says": "Feb. 1", "month_day": "02-01", "source_url": "https://www.bowdoin.edu/admissions/apply/dates-deadlines/index.html", "verified_at": "2026-10-20", "needs_verification": false}]}, "caltech": {"name": "Caltech", "page": "Caltech Undergraduate Admissions, first-year deadlines", "deadlines": [{"date": "2026-11-01", "name": "Restrictive Early Action", "says": "REA applications are due November 1", "month_day": "11-01", "source_url": "https://www.admissions.caltech.edu/apply/first-year-applicants/deadlines", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-04", "name": "Regular Decision", "says": "January 4, 2027 for Regular Decision", "month_day": "01-04", "source_url": "https://www.admissions.caltech.edu/apply/first-year-applicants/deadlines", "verified_at": "2026-10-20", "needs_verification": false}], "entry_year": 2027, "year_basis": "The page names the year of the Regular Decision day (\\"January 4, 2027 for Regular Decision\\"); its Restrictive Early Action day of November 1 comes before it, so it is 2026."}, "cornell": {"name": "Cornell University", "page": "Cornell Admissions, first-year applicants", "deadlines": [{"date": "2026-11-01", "name": "Early Decision", "says": "Application Deadlines ... November 1 Application; application fee or fee waiver", "month_day": "11-01", "source_url": "https://admissions.cornell.edu/how-to-apply/first-year-applicants", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-02", "name": "Regular Decision", "says": "Application Deadlines ... January 2 Application; application fee or fee waiver", "month_day": "01-02", "source_url": "https://admissions.cornell.edu/how-to-apply/first-year-applicants", "verified_at": "2026-10-20", "needs_verification": false}], "entry_year": 2027, "year_basis": "The page gives the month and the day and names no year. It was read on 20 October 2026, while applications for entry in fall 2027 were open (its first deadline was still ahead), so a November or December day is 2026 and a January or February day is 2027.", "aid_deadlines": [{"date": "2026-11-01", "name": "Financial aid, international students (Early Decision)", "says": "November 1 Aid application deadline for international students", "month_day": "11-01", "source_url": "https://admissions.cornell.edu/how-to-apply/first-year-applicants", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-02", "name": "Financial aid, international students (Regular Decision)", "says": "January 2 Aid application deadline for international students", "month_day": "01-02", "source_url": "https://admissions.cornell.edu/how-to-apply/first-year-applicants", "verified_at": "2026-10-20", "needs_verification": false}]}, "harvard": {"name": "Harvard University", "page": "Harvard College Admissions, first-year applicants", "deadlines": [{"date": "2026-11-01", "name": "Restrictive Early Action", "says": "Restrictive Early Action candidates apply by November 1", "month_day": "11-01", "source_url": "https://college.harvard.edu/admissions/apply/first-year-applicants", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-01", "name": "Regular Decision", "says": "Regular Decision candidates apply by January 1", "month_day": "01-01", "source_url": "https://college.harvard.edu/admissions/apply/first-year-applicants", "verified_at": "2026-10-20", "needs_verification": false}], "entry_year": 2027, "year_basis": "The page gives the month and the day and names no year. It was read on 20 October 2026, while applications for entry in fall 2027 were open (its first deadline was still ahead), so a November or December day is 2026 and a January or February day is 2027."}, "columbia": {"name": "Columbia University", "page": "Columbia Undergraduate Admissions, first-year applicants", "deadlines": [{"date": "2026-11-01", "name": "Early Decision", "says": "November 1 Early Decision and QuestBridge National College Match application deadline", "month_day": "11-01", "source_url": "https://undergrad.admissions.columbia.edu/apply/firstyear", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-01", "name": "Regular Decision", "says": "January 1 Regular Decision application deadline", "month_day": "01-01", "source_url": "https://undergrad.admissions.columbia.edu/apply/firstyear", "verified_at": "2026-10-20", "needs_verification": false}], "entry_year": 2027, "year_basis": "The page names the intake: \\"The Early Decision application deadline for Fall 2027 is approaching\\", by \\"Sunday, November 1\\" (2026). Its January day follows it (2027).", "aid_deadlines": [{"date": "2026-11-15", "name": "Financial aid, Early Decision", "says": "November 15 Early Decision financial aid application deadline", "month_day": "11-15", "source_url": "https://undergrad.admissions.columbia.edu/apply/firstyear", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-02-15", "name": "Financial aid, Regular Decision", "says": "February 15 Regular Decision financial aid application deadline", "month_day": "02-15", "source_url": "https://undergrad.admissions.columbia.edu/apply/firstyear", "verified_at": "2026-10-20", "needs_verification": false}]}, "stanford": {"name": "Stanford University", "page": "Stanford Undergraduate Admission, first-year applicants (updated September 10, 2026)", "deadlines": [{"date": "2026-11-01", "name": "Restrictive Early Action", "says": "Standard Application Deadline - November 1", "month_day": "11-01", "source_url": "https://admission.stanford.edu/apply/first-year/index.html", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-05", "name": "Regular Decision", "says": "Standard Application Deadline - January 5", "month_day": "01-05", "source_url": "https://admission.stanford.edu/apply/first-year/index.html", "verified_at": "2026-10-20", "needs_verification": false}], "entry_year": 2027, "year_basis": "The page gives the month and the day and names no year; it says it was updated on September 10, 2026, and was read on 20 October 2026, while applications for entry in fall 2027 were open: November is 2026 and January is 2027. With the optional arts portfolio the days are earlier (October 15 and December 5); those are not written as dates here."}, "utaustin": {"name": "UT Austin", "page": "UT Austin Admissions, frequently asked questions", "deadlines": [{"date": "2026-10-15", "name": "Early Action", "says": "submit your online application by October 15", "month_day": "10-15", "source_url": "https://admissions.utexas.edu/apply/frequently-asked-questions/", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2026-12-01", "name": "Regular deadline", "says": "The regular deadline is December 1.", "month_day": "12-01", "source_url": "https://admissions.utexas.edu/apply/frequently-asked-questions/", "verified_at": "2026-10-20", "needs_verification": false}], "entry_year": 2027, "year_basis": "The page gives the month and the day of the deadlines and names the year of the decisions that follow them (\\"by January 15, 2027\\", \\"by February 15, 2027\\"), so both deadlines are in 2026."}, "dartmouth": {"name": "Dartmouth College", "page": "Dartmouth Admissions, the application deadline and the financial aid deadline (glossary) and Apply to Dartmouth", "deadlines": [{"date": "2026-11-01", "name": "Early Decision", "says": "The Early Decision deadline is November 1.", "month_day": "11-01", "source_url": "https://admissions.dartmouth.edu/glossary-question/what-application-deadline", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-01", "name": "Regular Decision", "says": "The Regular Decision deadline is January 1.", "conflict": {"says": "the Regular Decision deadline is January 2", "source_url": "https://admissions.dartmouth.edu/apply-dartmouth", "verified_at": "2026-10-20"}, "month_day": "01-01", "source_url": "https://admissions.dartmouth.edu/glossary-question/what-application-deadline", "verified_at": "2026-10-20", "needs_verification": true}], "entry_year": 2027, "year_basis": "The page gives the month and the day and names no year. It was read on 20 October 2026, while applications for entry in fall 2027 were open (its first deadline was still ahead), so a November or December day is 2026 and a January or February day is 2027. Its own two pages disagree on the Regular Decision day (January 1 on the glossary page, January 2 on the Apply page): that day is flagged for checking and is not said.", "aid_deadlines": [{"date": "2026-11-01", "name": "Financial aid, Early Decision applicants", "says": "November 1 for Early Decision applicants", "month_day": "11-01", "source_url": "https://admissions.dartmouth.edu/glossary-question/when-financial-aid-deadline", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-02-01", "name": "Financial aid, Regular Decision applicants", "says": "February 1 for Regular Decision applicants", "month_day": "02-01", "source_url": "https://admissions.dartmouth.edu/glossary-question/when-financial-aid-deadline", "verified_at": "2026-10-20", "needs_verification": false}]}, "princeton": {"name": "Princeton University", "page": "Princeton Admission, apply", "deadlines": [{"date": "2026-11-01", "name": "Single-Choice Early Action", "says": "single-choice early action (restrictive) application is due Nov. 1", "month_day": "11-01", "source_url": "https://admission.princeton.edu/apply", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-01", "name": "Regular Decision", "says": "regular decision application is due Jan. 1", "month_day": "01-01", "source_url": "https://admission.princeton.edu/apply", "verified_at": "2026-10-20", "needs_verification": false}], "entry_year": 2027, "year_basis": "The page gives the month and the day and names no year. It was read on 20 October 2026, while applications for entry in fall 2027 were open (its first deadline was still ahead), so a November or December day is 2026 and a January or February day is 2027."}, "georgetown": {"name": "Georgetown University", "page": "Georgetown Undergraduate Admissions, first-year applicants", "deadlines": [{"date": "2026-11-01", "name": "Early Action", "says": "Early Action: November 1", "month_day": "11-01", "source_url": "https://uadmissions.georgetown.edu/apply/first-year-applicants/", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-01", "name": "Regular Decision", "says": "Regular Decision: January 1", "month_day": "01-01", "source_url": "https://uadmissions.georgetown.edu/apply/first-year-applicants/", "verified_at": "2026-10-20", "needs_verification": false}], "entry_year": 2027, "year_basis": "The page gives the month and the day and names no year. It was read on 20 October 2026, while applications for entry in fall 2027 were open (its first deadline was still ahead), so a November or December day is 2026 and a January or February day is 2027."}}, "not_published": [{"says": "No university of the catalogue had published its first-year deadlines for entry in fall 2028 on 20 October 2026 (their pages give this year's cycle only). They are written when the pages give them; until then the app says the days are not published.", "what": "Entry in fall 2028", "checked": "2026-10-20"}]}, "cycles": [{"deadlines": [{"date": "2028-11-01", "hard": true, "name": "Early Decision / Early Action", "applies_to": "most selective universities; varies", "source_url": null, "verified_at": null, "verify_task": "Confirm per university; ED/EA dates vary (Oct 15 - Nov 15)", "needs_verification": true}, {"date": "2029-01-01", "hard": true, "name": "Regular Decision", "applies_to": "most universities; many are Jan 1-5", "source_url": null, "verified_at": null, "verify_task": "Confirm per university", "needs_verification": true}], "entry_term": "Fall 2029 (for a student graduating June 2029)", "decision_window": "Dec (ED) / Mar-Apr (RD)"}], "portals": ["Common App", "Coalition (Scoir)", "university-specific"], "interview": "some", "source_url": "https://thecollegeinvestor.com/77443/colleges-are-requiring-sat-and-act-scores-again-heres-the-full-list-for-2027/", "destination": "US", "verified_at": "2026-09-24", "requirements": {"tests": [{"test_id": "SAT_or_ACT", "source_url": "https://www.carnegieprep.com/college-admissions/college-admissions-testing-policy-updates/", "verified_at": "2026-09-24", "required_for": {"universities": ["Harvard", "Yale", "Dartmouth", "Brown", "Penn", "Cornell", "Stanford", "MIT", "Caltech", "Johns Hopkins", "UT Austin", "Ohio State", "Purdue", "Georgetown", "Florida and Georgia public systems", "Princeton", "Carnegie Mellon"]}, "optional_where": "many other universities remain test-optional; Princeton requires from Fall 2028 entry; Columbia reverted for fall 2027 applicants", "needs_verification": false, "typical_score_band": "1500+ SAT for most selective as an international; 1300-1450 for strong publics", "sources_by_university": {"Princeton": {"url": "https://admission.princeton.edu/apply/standardized-testing", "says": "SAT or ACT required for fall 2028 entry onward; test optional for fall 2027 entry", "checked": "2026-10-04"}, "Carnegie Mellon": {"url": "https://admission-pantheon.cmu.edu/admission/standardized-testing", "says": "School of Computer Science requires SAT or ACT; Engineering, Dietrich, MCS, Tepper and Heinz IS are test flexible (scores required: SAT, ACT, IB, AP, A-level or French Bac); Fine Arts is test optional", "checked": "2026-10-04"}}}, {"test_id": "AP", "source_url": null, "verified_at": null, "verify_task": "Optional; confirm availability at home test centers", "required_for": {}, "optional_where": "everywhere", "needs_verification": true, "typical_score_band": "4-5 as rigor evidence"}], "language": [{"waivers": "often waived with high SAT EBRW or English-medium schooling; varies", "language": "en", "min_level": "B2", "source_url": null, "verified_at": null, "verify_task": "Confirm per university", "needs_verification": true, "accepted_certificates": ["TOEFL iBT 100+ (selective) / 80+", "IELTS 7.0+ (selective) / 6.5+", "Duolingo 120-130+"]}], "school_leaving": {"accepted_certificates": ["national secondary certificate + transcript in English", "IB", "A-levels", "AP-based"], "needs_foundation_or_studienkolleg_for": []}}, "universities": [{"id": "mit", "name": "MIT", "notes": "need-blind, meets full need", "typical_scores": "SAT 1520-1580", "selectivity_band": "ultra", "need_aware_for_internationals": false}, {"id": "penn", "name": "University of Pennsylvania", "notes": "need-aware for internationals", "typical_scores": "SAT 1500-1570", "selectivity_band": "ultra", "need_aware_for_internationals": true}], "admission_logic": "holistic", "needs_verification": false, "recommendation_letters": {"who": "grade 10-11 teachers", "count": "2 teachers + counselor/school report"}}	f	2026-09-24	https://thecollegeinvestor.com/77443/colleges-are-requiring-sat-and-act-scores-again-heres-the-full-list-for-2027/	Fall 2029 (for a student graduating June 2029)	t	seed	2026-10-21 10:42:12.038473+05
UK	2	destination	proposed	{"aid": {"source_url": null, "verified_at": null, "verify_task": "Confirm scholarship landscape per university", "meets_full_need": [], "needs_verification": true, "government_scholarships": [], "merit_full_ride_examples": ["very rare at undergraduate level; partial scholarships common"], "need_blind_for_internationals": []}, "visa": {"docs": ["CAS from university", "proof of funds (28-day rule)", "passport", "English evidence", "TB test for some countries"], "type": "Student visa", "source_url": null, "intent_rule": "genuine student; credibility interviews possible", "verified_at": null, "verify_task": "Confirm on gov.uk", "needs_verification": true, "proof_of_funds_rule": "tuition for year 1 + living costs held for 28 days", "post_study_work_note": "Graduate Route exists; length under review (verify)", "restrictions_by_citizenship": []}, "costs": {"source_url": null, "verified_at": null, "verify_task": "Confirm current fees", "living_band_usd": "15k-22k (London higher)", "tuition_band_usd": "28k-50k", "needs_verification": true, "visa_and_process_usd": "visa fee + immigration health surcharge per year (verify)", "application_fee_band_usd": "UCAS fee ~35"}, "cycles": [{"deadlines": [{"date": "2026-10-15", "hard": true, "name": "UCAS early deadline (Oxford, Cambridge, medicine, dentistry, veterinary)", "says": "Applications for any 2027 entry course at the universities of Oxford and Cambridge, or for most courses in medicine, veterinary medicine/science, and dentistry, should arrive at UCAS by 18:00 (UK time)", "time": "18:00 UK time", "applies_to": "any 2027-entry course at Oxford or Cambridge, and most courses in medicine, veterinary medicine/science and dentistry", "source_url": "https://www.ucas.com/events/2027-entry-deadline-for-the-universities-of-oxford-and-cambridge-and-most-courses-in-medicine-475536", "verified_at": "2026-10-20", "needs_verification": false}, {"date": "2027-01-13", "hard": true, "name": "UCAS main deadline", "says": "Applications for all 2027 entry undergraduate courses, except those with a 15 October deadline, should arrive at UCAS by 18:00 (UK time) on 13 January 2027.", "time": "18:00 UK time", "applies_to": "all other 2027-entry undergraduate courses (the equal consideration date)", "source_url": "https://www.ucas.com/events/2027-entry-deadline-for-all-undergraduate-courses-except-those-with-a-15-october-deadline-475546", "verified_at": "2026-10-20", "needs_verification": false}], "entry_term": "Sept 2027", "decision_window": "Nov-May"}, {"deadlines": [{"date": null, "hard": true, "name": "UCAS early deadline (Oxford, Cambridge, medicine, dentistry, veterinary)", "applies_to": "those courses", "source_url": null, "verified_at": null, "verify_task": "UCAS had not published its 2028-entry key dates on 20 Oct 2026; confirm on ucas.com when it does", "needs_verification": true}, {"date": null, "hard": true, "name": "UCAS main deadline", "applies_to": "most courses", "source_url": null, "verified_at": null, "verify_task": "UCAS had not published its 2028-entry key dates on 20 Oct 2026; confirm on ucas.com when it does", "needs_verification": true}], "entry_term": "Sept 2028", "decision_window": "Nov-May"}, {"deadlines": [{"date": "2028-10-15", "hard": true, "name": "UCAS early deadline (Oxford, Cambridge, medicine, dentistry, veterinary)", "applies_to": "those courses", "source_url": null, "verified_at": null, "verify_task": "Confirm UCAS date for that cycle", "needs_verification": true}, {"date": "2029-01-14", "hard": true, "name": "UCAS main deadline", "applies_to": "most courses (mid-January; exact date varies by year)", "source_url": null, "verified_at": null, "verify_task": "Confirm UCAS date for that cycle", "needs_verification": true}], "entry_term": "Sept 2029", "decision_window": "Nov-May"}], "portals": ["UCAS"], "interview": "some (Oxbridge, medicine)", "source_url": null, "destination": "UK", "verified_at": null, "verify_task": "Whole record: typical values, verify on ucas.com and university sites", "requirements": {"tests": [{"test_id": "UCAT", "source_url": null, "verified_at": null, "verify_task": "Confirm test dates/registration", "required_for": {"fields": ["medicine", "dentistry"]}, "needs_verification": true, "typical_score_band": "course-specific"}, {"test_id": "LNAT", "source_url": null, "verified_at": null, "verify_task": "Confirm list", "required_for": {"fields": ["law"], "universities": ["Oxford", "LSE", "UCL", "KCL", "Bristol", "Durham", "Glasgow", "Nottingham", "SOAS"]}, "needs_verification": true}, {"test_id": "MAT", "source_url": null, "verified_at": null, "verify_task": "Confirm", "required_for": {"fields": ["mathematics", "computer science"], "universities": ["Oxford", "Imperial"]}, "needs_verification": true}, {"test_id": "TMUA", "source_url": null, "verified_at": null, "verify_task": "Confirm per course", "required_for": {"fields": ["economics", "computer science", "mathematics"], "universities": ["Cambridge", "Imperial", "Durham", "LSE", "Warwick"]}, "needs_verification": true}, {"test_id": "ESAT", "source_url": null, "verified_at": null, "verify_task": "Confirm", "required_for": {"fields": ["engineering", "natural sciences"], "universities": ["Cambridge", "Imperial"]}, "needs_verification": true}, {"test_id": "STEP", "source_url": null, "verified_at": null, "verify_task": "Confirm", "required_for": {"fields": ["mathematics"], "universities": ["Cambridge (offer condition)", "Warwick"]}, "needs_verification": true}], "language": [{"waivers": "English-medium qualifications accepted by some", "language": "en", "min_level": "B2", "source_url": null, "verified_at": null, "verify_task": "Confirm per university and UKVI", "needs_verification": true, "accepted_certificates": ["IELTS for UKVI 6.0-7.0 by course", "TOEFL iBT (accepted by most universities; check visa rules)", "PTE Academic"]}], "school_leaving": {"accepted_certificates": ["A-levels", "IB", "national certificates with strong grades (varies; many non-EU certificates need a foundation year)"], "needs_foundation_or_studienkolleg_for": ["many national 11-year certificates -> International Foundation Year"]}, "personal_statement": "from 2026 entry UCAS uses three structured questions instead of one free statement (verify)"}, "universities": [], "admission_logic": "hybrid", "needs_verification": true, "recommendation_letters": {"who": "school", "count": "1 reference"}}	t	\N	\N	Sept 2029	t	seed	2026-10-21 10:42:12.038473+05
DE	1	destination	proposed	{"aid": {"source_url": null, "verified_at": null, "verify_task": "Confirm", "meets_full_need": [], "needs_verification": true, "government_scholarships": [], "merit_full_ride_examples": ["DAAD mostly graduate; Deutschlandstipendium 300 EUR/month"], "need_blind_for_internationals": ["n/a (tuition-free public system)"]}, "visa": {"docs": ["admission or Studienkolleg letter", "blocked account or sponsor", "health insurance", "passport", "certificates"], "type": "National visa (D) for studies", "source_url": null, "intent_rule": "study purpose; 18-month job-seeker residence after graduation (verify)", "verified_at": null, "verify_task": "Confirm on make-it-in-germany / consulate site", "needs_verification": true, "proof_of_funds_rule": "blocked account covering 12 months", "post_study_work_note": "18-month job search residence permit", "restrictions_by_citizenship": []}, "costs": {"source_url": null, "verified_at": null, "verify_task": "Confirm blocked account amount for the year", "living_band_usd": "12k-15k", "tuition_band_usd": "mostly 0 (semester fee 150-400 EUR); Baden-Wuerttemberg ~1500 EUR/semester for non-EU; private universities charge", "needs_verification": true, "visa_and_process_usd": "visa + blocked account (~12k EUR/year) + health insurance", "application_fee_band_usd": "uni-assist ~75 first application"}, "cycles": [{"deadlines": [{"date": "2029-07-15", "hard": true, "name": "uni-assist / university deadline (winter)", "applies_to": "many programs; some earlier (Jan-Apr for restricted programs)", "source_url": null, "verified_at": null, "verify_task": "Confirm per program", "needs_verification": true}, {"date": "2029-01-15", "hard": true, "name": "summer semester deadline", "applies_to": "some programs", "source_url": null, "verified_at": null, "verify_task": "Confirm", "needs_verification": true}], "entry_term": "Winter semester 2029/30", "decision_window": "Aug-Sept"}], "portals": ["uni-assist", "university portals", "hochschulstart (restricted programs)"], "interview": false, "source_url": null, "destination": "DE", "verified_at": null, "verify_task": "Whole record: typical values; verify with DAAD, anabin, uni-assist", "requirements": {"tests": [{"test_id": "TestAS", "source_url": null, "verified_at": null, "verify_task": "Confirm", "required_for": {}, "needs_verification": true, "typical_score_band": "optional/recommended by some universities"}, {"test_id": "Studienkolleg_FSP", "source_url": null, "verified_at": null, "verify_task": "Confirm per state", "required_for": {"fields": ["all, when certificate not directly recognized"]}, "needs_verification": true}], "language": [{"waivers": "none for German-taught programs", "language": "de", "min_level": "C1", "source_url": null, "verified_at": null, "verify_task": "Confirm per university", "needs_verification": true, "accepted_certificates": ["TestDaF 4x4", "DSH-2", "Goethe C1/C2", "telc C1 Hochschule"]}, {"waivers": "for English-taught programs only", "language": "en", "min_level": "B2", "source_url": null, "verified_at": null, "verify_task": "Confirm per program", "needs_verification": true, "accepted_certificates": ["IELTS 6.5", "TOEFL iBT 88-90"]}], "school_leaving": {"accepted_certificates": ["Abitur", "IB", "A-levels", "recognized national certificates via anabin/uni-assist"], "needs_foundation_or_studienkolleg_for": ["many non-EU 11-year certificates (e.g., Uzbekistan attestat) -> Studienkolleg + Feststellungspruefung, or 1-2 years of home university study; verify per country in anabin"]}}, "universities": [], "admission_logic": "exam_driven", "needs_verification": true, "recommendation_letters": {"who": "n/a", "count": "usually none"}}	t	\N	\N	Winter semester 2029/30	f	seed	2026-10-21 10:42:12.038473+05
DE	2	destination	proposed	{"aid": {"source_url": null, "verified_at": null, "verify_task": "Confirm", "meets_full_need": [], "needs_verification": true, "government_scholarships": [], "merit_full_ride_examples": ["DAAD mostly graduate; Deutschlandstipendium 300 EUR/month"], "need_blind_for_internationals": ["n/a (tuition-free public system)"]}, "visa": {"docs": ["admission or Studienkolleg letter", "blocked account or sponsor", "health insurance", "passport", "certificates"], "type": "National visa (D) for studies", "source_url": null, "intent_rule": "study purpose; 18-month job-seeker residence after graduation (verify)", "verified_at": null, "verify_task": "Confirm on make-it-in-germany / consulate site", "needs_verification": true, "proof_of_funds_rule": "blocked account covering 12 months", "post_study_work_note": "18-month job search residence permit", "restrictions_by_citizenship": []}, "costs": {"source_url": null, "verified_at": null, "verify_task": "Confirm blocked account amount for the year", "living_band_usd": "12k-15k", "tuition_band_usd": "mostly 0 (semester fee 150-400 EUR); Baden-Wuerttemberg ~1500 EUR/semester for non-EU; private universities charge", "needs_verification": true, "visa_and_process_usd": "visa + blocked account (~12k EUR/year) + health insurance", "application_fee_band_usd": "uni-assist ~75 first application"}, "dated": {"universities": {"tum": {"name": "Technical University of Munich", "page": "TUM, uni-assist (application info portal)", "deadlines": [{"date": "2027-07-15", "name": "uni-assist VPD, winter semester 2027/28", "says": "The deadlines for applying for the VPD are: if applying for a bachelor's degree program for the winter semester, by July 15", "month_day": "07-15", "source_url": "https://www.tum.de/en/studies/application/application-info-portal/uni-assist/", "verified_at": "2026-10-20", "needs_verification": false}], "entry_year": 2027, "year_basis": "The page states a standing rule with no year (\\"if applying for a bachelor's degree program for the winter semester, by July 15\\"). Read on 20 October 2026, the next winter semester a school leaver of 2027 can start is 2027/28, so the day is 15 July 2027. A summer-semester start (15 January) is not written: it begins in April, before a school year ending in June."}}}, "cycles": [{"deadlines": [{"date": "2029-07-15", "hard": true, "name": "uni-assist / university deadline (winter)", "applies_to": "many programs; some earlier (Jan-Apr for restricted programs)", "source_url": null, "verified_at": null, "verify_task": "Confirm per program", "needs_verification": true}, {"date": "2029-01-15", "hard": true, "name": "summer semester deadline", "applies_to": "some programs", "source_url": null, "verified_at": null, "verify_task": "Confirm", "needs_verification": true}], "entry_term": "Winter semester 2029/30", "decision_window": "Aug-Sept"}], "portals": ["uni-assist", "university portals", "hochschulstart (restricted programs)"], "interview": false, "source_url": null, "destination": "DE", "verified_at": null, "verify_task": "Whole record: typical values; verify with DAAD, anabin, uni-assist", "requirements": {"tests": [{"test_id": "TestAS", "source_url": null, "verified_at": null, "verify_task": "Confirm", "required_for": {}, "needs_verification": true, "typical_score_band": "optional/recommended by some universities"}, {"test_id": "Studienkolleg_FSP", "source_url": null, "verified_at": null, "verify_task": "Confirm per state", "required_for": {"fields": ["all, when certificate not directly recognized"]}, "needs_verification": true}], "language": [{"waivers": "none for German-taught programs", "language": "de", "min_level": "C1", "source_url": null, "verified_at": null, "verify_task": "Confirm per university", "needs_verification": true, "accepted_certificates": ["TestDaF 4x4", "DSH-2", "Goethe C1/C2", "telc C1 Hochschule"]}, {"waivers": "for English-taught programs only", "language": "en", "min_level": "B2", "source_url": null, "verified_at": null, "verify_task": "Confirm per program", "needs_verification": true, "accepted_certificates": ["IELTS 6.5", "TOEFL iBT 88-90"]}], "school_leaving": {"accepted_certificates": ["Abitur", "IB", "A-levels", "recognized national certificates via anabin/uni-assist"], "needs_foundation_or_studienkolleg_for": ["many non-EU 11-year certificates (e.g., Uzbekistan attestat) -> Studienkolleg + Feststellungspruefung, or 1-2 years of home university study; verify per country in anabin"]}}, "universities": [], "admission_logic": "exam_driven", "needs_verification": true, "recommendation_letters": {"who": "n/a", "count": "usually none"}}	t	\N	\N	Winter semester 2029/30	t	seed	2026-10-21 10:42:12.038473+05
TC_SAT	1	test_calendar	verified	{"id": "TC_SAT", "test": "SAT", "label": "SAT Weekend October 2026–June 2027 Test Dates", "sittings": [{"date": "2026-10-03", "test": "SAT", "source_url": "https://satsuite.collegeboard.org/sat/registration/dates-deadlines", "register_by": "2026-09-18", "verified_at": "2026-10-10", "late_register_by": "2026-09-22"}, {"date": "2026-11-07", "test": "SAT", "source_url": "https://satsuite.collegeboard.org/sat/registration/dates-deadlines", "register_by": "2026-10-23", "verified_at": "2026-10-10", "late_register_by": "2026-10-27"}, {"date": "2026-12-05", "test": "SAT", "source_url": "https://satsuite.collegeboard.org/sat/registration/dates-deadlines", "register_by": "2026-11-20", "verified_at": "2026-10-10", "late_register_by": "2026-11-24"}, {"date": "2027-03-06", "test": "SAT", "source_url": "https://satsuite.collegeboard.org/sat/registration/dates-deadlines", "register_by": "2027-02-19", "verified_at": "2026-10-10", "late_register_by": "2027-02-23"}, {"date": "2027-05-01", "test": "SAT", "source_url": "https://satsuite.collegeboard.org/sat/registration/dates-deadlines", "register_by": "2027-04-16", "verified_at": "2026-10-10", "late_register_by": "2027-04-20"}, {"date": "2027-06-05", "test": "SAT", "source_url": "https://satsuite.collegeboard.org/sat/registration/dates-deadlines", "register_by": "2027-05-21", "verified_at": "2026-10-10", "late_register_by": "2027-05-25"}], "applies_to": "These test dates and deadlines apply to all students—U.S. and international—taking the SAT", "source_url": "https://satsuite.collegeboard.org/sat/registration/dates-deadlines", "verified_at": "2026-10-10", "register_url": "https://mysat.collegeboard.org/", "testing_year": "2026-27", "deadline_time": "SAT Weekend deadlines expire at 11:59 p.m. ET, U.S.", "late_registration": "Late registration is available worldwide. Additional fees apply.", "needs_verification": false}	f	2026-10-10	https://satsuite.collegeboard.org/sat/registration/dates-deadlines	\N	f	seed	2026-10-21 10:42:12.038473+05
TC_SAT	2	test_calendar	verified	{"id": "TC_SAT", "test": "SAT", "label": "SAT Weekend October 2026–June 2027 Test Dates", "sittings": [{"date": "2026-10-03", "test": "SAT", "source_url": "https://satsuite.collegeboard.org/sat/registration/dates-deadlines", "register_by": "2026-09-18", "verified_at": "2026-10-20", "late_register_by": "2026-09-22"}, {"date": "2026-11-07", "test": "SAT", "source_url": "https://satsuite.collegeboard.org/sat/registration/dates-deadlines", "register_by": "2026-10-23", "verified_at": "2026-10-20", "late_register_by": "2026-10-27"}, {"date": "2026-12-05", "test": "SAT", "source_url": "https://satsuite.collegeboard.org/sat/registration/dates-deadlines", "register_by": "2026-11-20", "verified_at": "2026-10-20", "late_register_by": "2026-11-24"}, {"date": "2027-03-06", "test": "SAT", "source_url": "https://satsuite.collegeboard.org/sat/registration/dates-deadlines", "register_by": "2027-02-19", "verified_at": "2026-10-20", "late_register_by": "2027-02-23"}, {"date": "2027-05-01", "test": "SAT", "source_url": "https://satsuite.collegeboard.org/sat/registration/dates-deadlines", "register_by": "2027-04-16", "verified_at": "2026-10-20", "late_register_by": "2027-04-20"}, {"date": "2027-06-05", "test": "SAT", "source_url": "https://satsuite.collegeboard.org/sat/registration/dates-deadlines", "register_by": "2027-05-21", "verified_at": "2026-10-20", "late_register_by": "2027-05-25"}], "applies_to": "These test dates and deadlines apply to all students—U.S. and international—taking the SAT", "source_url": "https://satsuite.collegeboard.org/sat/registration/dates-deadlines", "anticipated": {"says": "The page calls these days anticipated and gives no registration deadlines for them; the October day was moved once already (it reads \\"Updated October 9, 2027\\"). They are held here only so the report can say when the year is confirmed; no plan and no sitting reads them.", "dates": ["2027-08-28", "2027-09-18", "2027-10-09", "2027-11-06", "2027-12-04", "2028-03-04", "2028-05-06", "2028-06-03"], "label": "Anticipated SAT Weekend 2027-28 Test Dates", "source_url": "https://satsuite.collegeboard.org/sat/registration/dates-deadlines", "verified_at": "2026-10-20", "testing_year": "2027-28", "needs_verification": true}, "verified_at": "2026-10-20", "register_url": "https://mysat.collegeboard.org/", "testing_year": "2026-27", "deadline_time": "SAT Weekend deadlines expire at 11:59 p.m. ET, U.S.", "late_registration": "Late registration is available worldwide. Additional fees apply.", "needs_verification": false}	f	2026-10-20	https://satsuite.collegeboard.org/sat/registration/dates-deadlines	\N	t	seed	2026-10-21 10:42:12.038473+05
TC_IELTS_UZ	1	test_calendar	verified	{"id": "TC_IELTS_UZ", "city": "Tashkent", "test": "IELTS", "label": "IELTS test dates in Tashkent, as IDP's own page for Uzbekistan lists them", "venue": "Edu Action Tashkent", "listed": "The page showed the first 50 of 297 sessions on the day it was read: 14 October to 1 November 2026. The later ones load only in a browser and are not written here.", "fee_uzs": 2800000, "book_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "delivery": "IELTS on computer", "not_read": [{"got": "no answer within 60 seconds, three tries. Nothing is written from them.", "urls": ["https://www.britishcouncil.uz/en/exam/ielts/dates-fees-locations", "https://www.britishcouncil.uz/en/exam/ielts"], "what": "The British Council's own pages for Uzbekistan", "tried": "2026-10-11"}], "sessions": [{"date": "2026-10-14", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-11"}, {"date": "2026-10-15", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-11"}, {"date": "2026-10-16", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-11"}, {"date": "2026-10-17", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-11"}, {"date": "2026-10-18", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-11"}, {"date": "2026-10-19", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-11"}, {"date": "2026-10-20", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-11"}, {"date": "2026-10-21", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-11"}, {"date": "2026-10-22", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-11"}, {"date": "2026-10-23", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-11"}, {"date": "2026-10-25", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-11"}, {"date": "2026-10-26", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-11"}, {"date": "2026-10-27", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-11"}, {"date": "2026-10-28", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-11"}, {"date": "2026-10-29", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-11"}, {"date": "2026-10-30", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-11"}, {"date": "2026-10-31", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-11"}, {"date": "2026-11-01", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-11"}], "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "year_basis": "The page prints the day and the month; the year is in its booking links (2026).", "verified_at": "2026-10-11", "needs_verification": false}	f	2026-10-11	https://ielts.idp.com/uzbekistan/test-dates/tashkent	\N	f	seed	2026-10-21 10:42:12.038473+05
TC_IELTS_UZ	2	test_calendar	verified	{"id": "TC_IELTS_UZ", "city": "Tashkent", "test": "IELTS", "label": "IELTS test dates in Tashkent, as IDP's own page for Uzbekistan lists them", "venue": "Edu Action Tashkent", "listed": "Read on 20 October 2026. The page said \\"Showing 263 test sessions in Tashkent\\" and listed them a few at a time: the 70 sessions it listed (27 days, 2026-10-23 to 2026-11-19) were all IELTS Academic on computer at Edu Action Tashkent, 2,800,000 UZS (rows \\"seen\\": \\"list\\"). The days after those come from the page's own date calendar, which marks the days that hold at least one session in Tashkent up to 2027-01-31 without saying the module, the format or the venue (rows \\"seen\\": \\"calendar\\"). The page broke off after a few more pages in the browser; nothing is written from what it did not show.", "fee_uzs": 2800000, "book_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "delivery": "IELTS on computer", "not_read": [{"got": "no answer within 60 seconds, two tries (as on 11 October 2026). Nothing is written from them.", "urls": ["https://www.britishcouncil.uz/en/exam/ielts/dates-fees-locations", "https://www.britishcouncil.uz/en/exam/ielts"], "what": "The British Council's own pages for Uzbekistan", "tried": "2026-10-20"}], "sessions": [{"date": "2026-10-23", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-10-25", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-10-26", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-10-27", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-10-28", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-10-29", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-10-30", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-10-31", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-01", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-02", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-03", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-04", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-05", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-06", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-07", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-08", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-09", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-10", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-11", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-12", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-13", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-14", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-15", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-16", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-17", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-18", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-19", "seen": "list", "test": "IELTS", "module": "Academic", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-20", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-23", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-24", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-25", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-26", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-27", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-28", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-29", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-11-30", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-01", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-02", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-03", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-04", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-05", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-06", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-07", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-09", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-10", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-11", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-12", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-13", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-14", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-15", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-16", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-17", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-18", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-19", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-20", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-21", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-22", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-23", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-24", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-25", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-26", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-27", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2026-12-28", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-04", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-05", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-06", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-07", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-08", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-09", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-10", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-11", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-12", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-13", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-14", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-15", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-16", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-17", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-18", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-19", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-20", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-21", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-22", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-23", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-24", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-25", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-26", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-27", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-28", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-29", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-30", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}, {"date": "2027-01-31", "seen": "calendar", "test": "IELTS", "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "verified_at": "2026-10-20"}], "source_url": "https://ielts.idp.com/uzbekistan/test-dates/tashkent", "year_basis": "The page and its calendar give full dates (year, month, day).", "verified_at": "2026-10-20", "needs_verification": false}	f	2026-10-20	https://ielts.idp.com/uzbekistan/test-dates/tashkent	\N	t	seed	2026-10-21 10:42:12.038473+05
\.


--
-- Data for Name: sat_sitting; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sat_sitting (student_id, form_id, mock_date, started_at, finished_at, ended, data, answers, marks, result, updated_at) FROM stdin;
\.


--
-- Data for Name: schedule_state; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.schedule_state (student_id, state, repair, synced_on, reminder_on, updated_at) FROM stdin;
\.


--
-- Data for Name: score_report; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.score_report (id, student_id, test, subject, scores, test_date, proof_id, status, reviewed_by, reviewed_at, review_note, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session ("sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: speaking_practice; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.speaking_practice (student_id, lesson_id, opened_at, plan_at, talk_at, plan_s, talk_s, ticks, checked_at, attempts, done_at, coins, updated_at) FROM stdin;
\.


--
-- Data for Name: srs_card; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.srs_card (student_id, item_id, skill, due, fsrs, reviews, served, last_served_at, seen, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: staff_checkpoint; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff_checkpoint (id, student_id, kind, payload, task_id, proof_id, completes, status, decided_by, decided_at, reason, note, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: staff_member; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff_member (user_id, role, on_duty, added_by, added_at, removed_at, removed_by) FROM stdin;
\.


--
-- Data for Name: streak_state; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.streak_state (student_id, current, best, best_end, freezes, closed_through, last_grant_week, updated_at) FROM stdin;
20f8ca74-7736-4f9b-8140-b5ae819ccdea	0	0	\N	0	\N	\N	2026-10-21 10:42:15.9389+05
\.


--
-- Data for Name: student_motivation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_motivation (student_id, why, why_at, letter_text, letter_sealed_at, letter_ps, letter_opened_at, comeback, comebacks, style_active, updated_at) FROM stdin;
\.


--
-- Data for Name: study_consent; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.study_consent (study, student_id, invite_id, asked_at, parent_id, answer, answered_at, version) FROM stdin;
\.


--
-- Data for Name: study_invite; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.study_invite (id, study, code_hash, label, created_by, created_at, expires_at, max_uses, uses, revoked_at) FROM stdin;
\.


--
-- Data for Name: study_pair; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.study_pair (id, study, invite_id, student_id, consent_version, consent_at, bluebook_kind, bluebook_date, bluebook_math, bluebook_total, proof_id, withdrawn_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: study_session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.study_session (id, student_id, client_id, subject, task_id, minutes_planned, started_at, ends_at, ended_at, status, break_reason, minutes_studied, bricks_awarded, xp_awarded, dbh_bonus, local_date) FROM stdin;
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscription (id, student_id, tier, starts_on, ends_on, source, order_id, gift_id, coupon_id, payer_id, gifted_by, created_at, ended_at, ended_reason) FROM stdin;
\.


--
-- Data for Name: task_batch; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.task_batch (id, student_id, week_start, roadmap_id, cadence, generated_by, engine_version, rules_version, generated_at) FROM stdin;
\.


--
-- Data for Name: task_completion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.task_completion (student_id, task_id, date, completed_at, proof_kind, proof, result, review, coins_awarded, client_id) FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."user" (id, name, email, "emailVerified", image) FROM stdin;
20f8ca74-7736-4f9b-8140-b5ae819ccdea	Oqil Odilov	oqil@demo.jamals.uz	\N	\N
4df9f11a-8063-4e44-b0ec-264d6f21c930	Rustam Odilov	rustam@demo.jamals.uz	\N	\N
04f57c03-e834-4993-a0bb-5e75cf13e3f6	Kamola Rahimova	ctr-student@example.test	\N	\N
77033d93-1cd3-49d8-996b-e2c53e8a818f	Jasur Toshmatov	ctr-student2@example.test	\N	\N
b8fc13fe-a420-460a-9b10-78ead416039e	Nodira Rahimova	ctr-parent@example.test	\N	\N
7267cecf-9f09-4150-872e-e186d3cd728c	Staff Contract	ctr-staff@example.test	\N	\N
\.


--
-- Data for Name: user_block; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_block (blocker_id, blocked_id, created_at) FROM stdin;
\.


--
-- Data for Name: user_state; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_state (user_id, key, value, updated_at) FROM stdin;
\.


--
-- Data for Name: verificationToken; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."verificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: video_clip; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.video_clip (id, source_id, lesson_id, course, kind, piece_n, start_s, end_s, duration_s, file_key, poster_key, bytes, status, error, captions, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: video_source; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.video_source (id, file_key, name, origin, bytes, duration_s, teacher_name, teacher_consent, captions, created_by, created_at, updated_at, file_removed_at) FROM stdin;
\.


--
-- Data for Name: video_watch; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.video_watch (student_id, clip_id, seen, seen_s, of_s, first_at, updated_at) FROM stdin;
\.


--
-- Data for Name: wallet; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallet (student_id, balance, updated_at) FROM stdin;
20f8ca74-7736-4f9b-8140-b5ae819ccdea	120	2026-10-21 10:42:15.946+05
\.


--
-- Data for Name: wallet_backfill; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallet_backfill (coin_entry_id, student_id, amount, at) FROM stdin;
\.


--
-- Data for Name: writing_piece; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.writing_piece (student_id, lesson_id, opened_at, draft, draft_words, draft_at, feedback, feedback_by, ai_run_id, revision, revision_words, revision_at, revisions, done_at, coins, updated_at) FROM stdin;
\.


--
-- Data for Name: xp_entry; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.xp_entry (id, student_id, amount, reason, ref, local_date, at) FROM stdin;
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: -
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 51, true);


--
-- Name: chat_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chat_message_id_seq', 1, false);


--
-- Name: jia_lead_number_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.jia_lead_number_seq', 1, false);


--
-- Name: pay_order_number_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pay_order_number_seq', 100001, false);


--
-- Name: pay_txn_seq_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pay_txn_seq_seq', 1, false);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: account account_provider_providerAccountId_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY (provider, "providerAccountId");


--
-- Name: account_suspension account_suspension_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_suspension
    ADD CONSTRAINT account_suspension_pkey PRIMARY KEY (id);


--
-- Name: achievement_award achievement_award_student_id_achievement_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievement_award
    ADD CONSTRAINT achievement_award_student_id_achievement_pk PRIMARY KEY (student_id, achievement);


--
-- Name: activity_day activity_day_student_id_date_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_day
    ADD CONSTRAINT activity_day_student_id_date_pk PRIMARY KEY (student_id, date);


--
-- Name: admission_outcome admission_outcome_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admission_outcome
    ADD CONSTRAINT admission_outcome_pkey PRIMARY KEY (id);


--
-- Name: admission_prediction admission_prediction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admission_prediction
    ADD CONSTRAINT admission_prediction_pkey PRIMARY KEY (id);


--
-- Name: ai_consent ai_consent_user_id_notice_version_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_consent
    ADD CONSTRAINT ai_consent_user_id_notice_version_pk PRIMARY KEY (user_id, notice_version);


--
-- Name: ai_interpretation ai_interpretation_student_id_question_id_answer_hash_prompt_ver; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_interpretation
    ADD CONSTRAINT ai_interpretation_student_id_question_id_answer_hash_prompt_ver PRIMARY KEY (student_id, question_id, answer_hash, prompt_version);


--
-- Name: ai_job ai_job_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_job
    ADD CONSTRAINT ai_job_pkey PRIMARY KEY (id);


--
-- Name: ai_run ai_run_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_run
    ADD CONSTRAINT ai_run_pkey PRIMARY KEY (id);


--
-- Name: ai_settings ai_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_settings
    ADD CONSTRAINT ai_settings_pkey PRIMARY KEY (id);


--
-- Name: ai_usage ai_usage_user_id_day_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_usage
    ADD CONSTRAINT ai_usage_user_id_day_pk PRIMARY KEY (user_id, day);


--
-- Name: brick_entry brick_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brick_entry
    ADD CONSTRAINT brick_entry_pkey PRIMARY KEY (id);


--
-- Name: chat chat_dm_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT chat_dm_key_unique UNIQUE (dm_key);


--
-- Name: chat_member chat_member_chat_id_user_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_member
    ADD CONSTRAINT chat_member_chat_id_user_id_pk PRIMARY KEY (chat_id, user_id);


--
-- Name: chat_message chat_message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT chat_message_pkey PRIMARY KEY (id);


--
-- Name: chat_pin chat_pin_chat_id_message_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_pin
    ADD CONSTRAINT chat_pin_chat_id_message_id_pk PRIMARY KEY (chat_id, message_id);


--
-- Name: chat chat_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT chat_pkey PRIMARY KEY (id);


--
-- Name: chat_poll chat_poll_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_poll
    ADD CONSTRAINT chat_poll_pkey PRIMARY KEY (message_id);


--
-- Name: chat_poll_vote chat_poll_vote_message_id_user_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_poll_vote
    ADD CONSTRAINT chat_poll_vote_message_id_user_id_pk PRIMARY KEY (message_id, user_id);


--
-- Name: chat_reaction chat_reaction_message_id_user_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_reaction
    ADD CONSTRAINT chat_reaction_message_id_user_id_pk PRIMARY KEY (message_id, user_id);


--
-- Name: check_run check_run_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.check_run
    ADD CONSTRAINT check_run_pkey PRIMARY KEY (id);


--
-- Name: coin_entry coin_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coin_entry
    ADD CONSTRAINT coin_entry_pkey PRIMARY KEY (id);


--
-- Name: community_comment community_comment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_comment
    ADD CONSTRAINT community_comment_pkey PRIMARY KEY (id);


--
-- Name: community_follow community_follow_follower_id_followee_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_follow
    ADD CONSTRAINT community_follow_follower_id_followee_id_pk PRIMARY KEY (follower_id, followee_id);


--
-- Name: community_like community_like_post_id_user_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_like
    ADD CONSTRAINT community_like_post_id_user_id_pk PRIMARY KEY (post_id, user_id);


--
-- Name: community_media community_media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_media
    ADD CONSTRAINT community_media_pkey PRIMARY KEY (id);


--
-- Name: community_note community_note_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_note
    ADD CONSTRAINT community_note_pkey PRIMARY KEY (id);


--
-- Name: community_poll_vote community_poll_vote_post_id_user_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_poll_vote
    ADD CONSTRAINT community_poll_vote_post_id_user_id_pk PRIMARY KEY (post_id, user_id);


--
-- Name: community_post community_post_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_post
    ADD CONSTRAINT community_post_pkey PRIMARY KEY (id);


--
-- Name: community_profile community_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_profile
    ADD CONSTRAINT community_profile_pkey PRIMARY KEY (user_id);


--
-- Name: community_save community_save_user_id_post_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_save
    ADD CONSTRAINT community_save_user_id_post_id_pk PRIMARY KEY (user_id, post_id);


--
-- Name: community_story community_story_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_story
    ADD CONSTRAINT community_story_pkey PRIMARY KEY (id);


--
-- Name: community_story_view community_story_view_story_id_viewer_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_story_view
    ADD CONSTRAINT community_story_view_story_id_viewer_id_pk PRIMARY KEY (story_id, viewer_id);


--
-- Name: community_view community_view_post_id_user_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_view
    ADD CONSTRAINT community_view_post_id_user_id_pk PRIMARY KEY (post_id, user_id);


--
-- Name: core_deletion_request core_deletion_request_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.core_deletion_request
    ADD CONSTRAINT core_deletion_request_pkey PRIMARY KEY (id);


--
-- Name: daily_task daily_task_student_id_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_task
    ADD CONSTRAINT daily_task_student_id_id_pk PRIMARY KEY (student_id, id);


--
-- Name: diagnostic_answer diagnostic_answer_student_id_question_id_source_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagnostic_answer
    ADD CONSTRAINT diagnostic_answer_student_id_question_id_source_pk PRIMARY KEY (student_id, question_id, source);


--
-- Name: dream_build dream_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dream_build
    ADD CONSTRAINT dream_build_pkey PRIMARY KEY (student_id);


--
-- Name: dtm_sitting dtm_sitting_student_id_mock_date_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dtm_sitting
    ADD CONSTRAINT dtm_sitting_student_id_mock_date_pk PRIMARY KEY (student_id, mock_date);


--
-- Name: engine_event engine_event_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.engine_event
    ADD CONSTRAINT engine_event_pkey PRIMARY KEY (id);


--
-- Name: engine_result engine_result_student_id_profile_version_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.engine_result
    ADD CONSTRAINT engine_result_student_id_profile_version_pk PRIMARY KEY (student_id, profile_version);


--
-- Name: engine_state engine_state_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.engine_state
    ADD CONSTRAINT engine_state_pkey PRIMARY KEY (student_id);


--
-- Name: entitlement entitlement_student_id_what_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entitlement
    ADD CONSTRAINT entitlement_student_id_what_pk PRIMARY KEY (student_id, what);


--
-- Name: family_code family_code_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_code
    ADD CONSTRAINT family_code_pkey PRIMARY KEY (code);


--
-- Name: family_link family_link_parent_id_student_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_link
    ADD CONSTRAINT family_link_parent_id_student_id_pk PRIMARY KEY (parent_id, student_id);


--
-- Name: freeze_entry freeze_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freeze_entry
    ADD CONSTRAINT freeze_entry_pkey PRIMARY KEY (id);


--
-- Name: game_campus_round game_campus_round_student_id_date_round_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_campus_round
    ADD CONSTRAINT game_campus_round_student_id_date_round_pk PRIMARY KEY (student_id, date, round);


--
-- Name: game_daily_answer game_daily_answer_student_id_date_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_daily_answer
    ADD CONSTRAINT game_daily_answer_student_id_date_pk PRIMARY KEY (student_id, date);


--
-- Name: game_rating game_rating_student_id_kind_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_rating
    ADD CONSTRAINT game_rating_student_id_kind_pk PRIMARY KEY (student_id, kind);


--
-- Name: game_result game_result_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_result
    ADD CONSTRAINT game_result_pkey PRIMARY KEY (id);


--
-- Name: homework homework_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homework
    ADD CONSTRAINT homework_pkey PRIMARY KEY (id);


--
-- Name: homework_turn homework_turn_homework_id_student_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homework_turn
    ADD CONSTRAINT homework_turn_homework_id_student_id_pk PRIMARY KEY (homework_id, student_id);


--
-- Name: jia_lead jia_lead_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jia_lead
    ADD CONSTRAINT jia_lead_pkey PRIMARY KEY (id);


--
-- Name: league_cohort league_cohort_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.league_cohort
    ADD CONSTRAINT league_cohort_pkey PRIMARY KEY (id);


--
-- Name: league_member league_member_week_student_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.league_member
    ADD CONSTRAINT league_member_week_student_id_pk PRIMARY KEY (week, student_id);


--
-- Name: league_player league_player_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.league_player
    ADD CONSTRAINT league_player_pkey PRIMARY KEY (student_id);


--
-- Name: league_week league_week_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.league_week
    ADD CONSTRAINT league_week_pkey PRIMARY KEY (week);


--
-- Name: learner_skill learner_skill_student_id_skill_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learner_skill
    ADD CONSTRAINT learner_skill_student_id_skill_pk PRIMARY KEY (student_id, skill);


--
-- Name: lesson_progress lesson_progress_student_id_lesson_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_student_id_lesson_id_pk PRIMARY KEY (student_id, lesson_id);


--
-- Name: lesson_skill lesson_skill_student_id_skill_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_skill
    ADD CONSTRAINT lesson_skill_student_id_skill_pk PRIMARY KEY (student_id, skill);


--
-- Name: milestone_report milestone_report_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.milestone_report
    ADD CONSTRAINT milestone_report_pkey PRIMARY KEY (id);


--
-- Name: mock_result mock_result_student_id_mock_date_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mock_result
    ADD CONSTRAINT mock_result_student_id_mock_date_pk PRIMARY KEY (student_id, mock_date);


--
-- Name: moderation_audit moderation_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moderation_audit
    ADD CONSTRAINT moderation_audit_pkey PRIMARY KEY (id);


--
-- Name: moderation_item moderation_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moderation_item
    ADD CONSTRAINT moderation_item_pkey PRIMARY KEY (id);


--
-- Name: outcome_prompt outcome_prompt_user_id_window_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outcome_prompt
    ADD CONSTRAINT outcome_prompt_user_id_window_pk PRIMARY KEY (user_id, "window");


--
-- Name: parent_alert parent_alert_parent_id_student_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_alert
    ADD CONSTRAINT parent_alert_parent_id_student_id_pk PRIMARY KEY (parent_id, student_id);


--
-- Name: parent_note parent_note_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_note
    ADD CONSTRAINT parent_note_pkey PRIMARY KEY (id);


--
-- Name: password password_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password
    ADD CONSTRAINT password_pkey PRIMARY KEY (user_id);


--
-- Name: pay_coupon pay_coupon_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pay_coupon
    ADD CONSTRAINT pay_coupon_pkey PRIMARY KEY (id);


--
-- Name: pay_event pay_event_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pay_event
    ADD CONSTRAINT pay_event_pkey PRIMARY KEY (id);


--
-- Name: pay_gift pay_gift_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pay_gift
    ADD CONSTRAINT pay_gift_pkey PRIMARY KEY (id);


--
-- Name: pay_order pay_order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pay_order
    ADD CONSTRAINT pay_order_pkey PRIMARY KEY (id);


--
-- Name: pay_txn pay_txn_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pay_txn
    ADD CONSTRAINT pay_txn_pkey PRIMARY KEY (id);


--
-- Name: plan_usage plan_usage_user_id_day_kind_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_usage
    ADD CONSTRAINT plan_usage_user_id_day_kind_pk PRIMARY KEY (user_id, day, kind);


--
-- Name: pledge pledge_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pledge
    ADD CONSTRAINT pledge_pkey PRIMARY KEY (id);


--
-- Name: practice_item practice_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practice_item
    ADD CONSTRAINT practice_item_pkey PRIMARY KEY (item_id);


--
-- Name: profile_photo profile_photo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_photo
    ADD CONSTRAINT profile_photo_pkey PRIMARY KEY (user_id);


--
-- Name: profile profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_pkey PRIMARY KEY (user_id);


--
-- Name: proof_file proof_file_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proof_file
    ADD CONSTRAINT proof_file_pkey PRIMARY KEY (id);


--
-- Name: readiness_snapshot readiness_snapshot_student_id_taken_at_kind_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.readiness_snapshot
    ADD CONSTRAINT readiness_snapshot_student_id_taken_at_kind_pk PRIMARY KEY (student_id, taken_at, kind);


--
-- Name: report report_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT report_pkey PRIMARY KEY (id);


--
-- Name: roadmap_change roadmap_change_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roadmap_change
    ADD CONSTRAINT roadmap_change_pkey PRIMARY KEY (id);


--
-- Name: roadmap_milestone roadmap_milestone_roadmap_id_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roadmap_milestone
    ADD CONSTRAINT roadmap_milestone_roadmap_id_id_pk PRIMARY KEY (roadmap_id, id);


--
-- Name: roadmap roadmap_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roadmap
    ADD CONSTRAINT roadmap_pkey PRIMARY KEY (id);


--
-- Name: rule_record rule_record_id_version_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rule_record
    ADD CONSTRAINT rule_record_id_version_pk PRIMARY KEY (id, version);


--
-- Name: sat_sitting sat_sitting_student_id_form_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sat_sitting
    ADD CONSTRAINT sat_sitting_student_id_form_id_pk PRIMARY KEY (student_id, form_id);


--
-- Name: schedule_state schedule_state_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_state
    ADD CONSTRAINT schedule_state_pkey PRIMARY KEY (student_id);


--
-- Name: score_report score_report_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.score_report
    ADD CONSTRAINT score_report_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY ("sessionToken");


--
-- Name: speaking_practice speaking_practice_student_id_lesson_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.speaking_practice
    ADD CONSTRAINT speaking_practice_student_id_lesson_id_pk PRIMARY KEY (student_id, lesson_id);


--
-- Name: srs_card srs_card_student_id_item_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.srs_card
    ADD CONSTRAINT srs_card_student_id_item_id_pk PRIMARY KEY (student_id, item_id);


--
-- Name: staff_checkpoint staff_checkpoint_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_checkpoint
    ADD CONSTRAINT staff_checkpoint_pkey PRIMARY KEY (id);


--
-- Name: staff_member staff_member_user_id_role_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_member
    ADD CONSTRAINT staff_member_user_id_role_pk PRIMARY KEY (user_id, role);


--
-- Name: streak_state streak_state_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.streak_state
    ADD CONSTRAINT streak_state_pkey PRIMARY KEY (student_id);


--
-- Name: student_motivation student_motivation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_motivation
    ADD CONSTRAINT student_motivation_pkey PRIMARY KEY (student_id);


--
-- Name: study_consent study_consent_study_student_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_consent
    ADD CONSTRAINT study_consent_study_student_id_pk PRIMARY KEY (study, student_id);


--
-- Name: study_invite study_invite_code_hash_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_invite
    ADD CONSTRAINT study_invite_code_hash_unique UNIQUE (code_hash);


--
-- Name: study_invite study_invite_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_invite
    ADD CONSTRAINT study_invite_pkey PRIMARY KEY (id);


--
-- Name: study_pair study_pair_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_pair
    ADD CONSTRAINT study_pair_pkey PRIMARY KEY (id);


--
-- Name: study_session study_session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_session
    ADD CONSTRAINT study_session_pkey PRIMARY KEY (id);


--
-- Name: subscription subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT subscription_pkey PRIMARY KEY (id);


--
-- Name: task_batch task_batch_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_batch
    ADD CONSTRAINT task_batch_pkey PRIMARY KEY (id);


--
-- Name: task_completion task_completion_student_id_task_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_completion
    ADD CONSTRAINT task_completion_student_id_task_id_pk PRIMARY KEY (student_id, task_id);


--
-- Name: user_block user_block_blocker_id_blocked_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_block
    ADD CONSTRAINT user_block_blocker_id_blocked_id_pk PRIMARY KEY (blocker_id, blocked_id);


--
-- Name: user user_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_unique UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: user_state user_state_user_id_key_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_state
    ADD CONSTRAINT user_state_user_id_key_pk PRIMARY KEY (user_id, key);


--
-- Name: verificationToken verificationToken_identifier_token_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."verificationToken"
    ADD CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY (identifier, token);


--
-- Name: video_clip video_clip_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_clip
    ADD CONSTRAINT video_clip_pkey PRIMARY KEY (id);


--
-- Name: video_source video_source_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_source
    ADD CONSTRAINT video_source_pkey PRIMARY KEY (id);


--
-- Name: video_watch video_watch_student_id_clip_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_watch
    ADD CONSTRAINT video_watch_student_id_clip_id_pk PRIMARY KEY (student_id, clip_id);


--
-- Name: wallet_backfill wallet_backfill_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_backfill
    ADD CONSTRAINT wallet_backfill_pkey PRIMARY KEY (coin_entry_id);


--
-- Name: wallet wallet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet
    ADD CONSTRAINT wallet_pkey PRIMARY KEY (student_id);


--
-- Name: writing_piece writing_piece_student_id_lesson_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.writing_piece
    ADD CONSTRAINT writing_piece_student_id_lesson_id_pk PRIMARY KEY (student_id, lesson_id);


--
-- Name: xp_entry xp_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.xp_entry
    ADD CONSTRAINT xp_entry_pkey PRIMARY KEY (id);


--
-- Name: account_suspension_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX account_suspension_user ON public.account_suspension USING btree (user_id);


--
-- Name: achievement_award_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX achievement_award_id ON public.achievement_award USING btree (achievement);


--
-- Name: admission_outcome_cycle; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admission_outcome_cycle ON public.admission_outcome USING btree (cycle);


--
-- Name: admission_outcome_once; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admission_outcome_once ON public.admission_outcome USING btree (student_id, cycle, target);


--
-- Name: admission_prediction_once; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admission_prediction_once ON public.admission_prediction USING btree (student_id, university, profile_version, model_version);


--
-- Name: admission_prediction_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admission_prediction_student ON public.admission_prediction USING btree (student_id, created_at);


--
-- Name: ai_job_claim; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_job_claim ON public.ai_job USING btree (status, priority, not_before);


--
-- Name: ai_job_live; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ai_job_live ON public.ai_job USING btree (student_id, kind, ref) WHERE (status = ANY (ARRAY['queued'::text, 'running'::text]));


--
-- Name: ai_job_student_live; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_job_student_live ON public.ai_job USING btree (student_id) WHERE (status = ANY (ARRAY['queued'::text, 'running'::text]));


--
-- Name: ai_run_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_run_created ON public.ai_run USING btree (created_at);


--
-- Name: ai_run_input; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_run_input ON public.ai_run USING btree (student_id, kind, input_hash);


--
-- Name: ai_run_pending; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ai_run_pending ON public.ai_run USING btree (student_id, kind, input_hash, prompt_version) WHERE (status = 'pending'::text);


--
-- Name: ai_run_student_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_run_student_created ON public.ai_run USING btree (student_id, created_at);


--
-- Name: brick_entry_once; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX brick_entry_once ON public.brick_entry USING btree (student_id, reason, ref);


--
-- Name: chat_league_ref; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX chat_league_ref ON public.chat USING btree (ref) WHERE (kind = 'league'::text);


--
-- Name: chat_member_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chat_member_user ON public.chat_member USING btree (user_id);


--
-- Name: chat_message_chat; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chat_message_chat ON public.chat_message USING btree (chat_id, id);


--
-- Name: chat_message_client; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX chat_message_client ON public.chat_message USING btree (sender_id, client_id) WHERE (client_id IS NOT NULL);


--
-- Name: chat_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chat_parent ON public.chat USING btree (parent_id);


--
-- Name: check_run_once; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX check_run_once ON public.check_run USING btree (student_id, kind, ref, attempt);


--
-- Name: coin_entry_idem; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX coin_entry_idem ON public.coin_entry USING btree (student_id, idem);


--
-- Name: coin_entry_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX coin_entry_student ON public.coin_entry USING btree (student_id, created_at);


--
-- Name: community_comment_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_comment_parent ON public.community_comment USING btree (parent_id);


--
-- Name: community_comment_post; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_comment_post ON public.community_comment USING btree (post_id, created_at);


--
-- Name: community_follow_followee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_follow_followee ON public.community_follow USING btree (followee_id, state);


--
-- Name: community_media_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_media_owner ON public.community_media USING btree (owner_id, created_at);


--
-- Name: community_note_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_note_user ON public.community_note USING btree (user_id, created_at);


--
-- Name: community_post_author; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_post_author ON public.community_post USING btree (author_id, created_at);


--
-- Name: community_post_feed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_post_feed ON public.community_post USING btree (status, approved_at);


--
-- Name: community_profile_handle; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX community_profile_handle ON public.community_profile USING btree (handle);


--
-- Name: community_save_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_save_user ON public.community_save USING btree (user_id, at);


--
-- Name: community_story_author; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_story_author ON public.community_story USING btree (author_id, expires_at);


--
-- Name: core_deletion_request_open; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX core_deletion_request_open ON public.core_deletion_request USING btree (student_id) WHERE (state = 'open'::text);


--
-- Name: daily_task_live_slot; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX daily_task_live_slot ON public.daily_task USING btree (student_id, date, slot) WHERE (status <> 'replaced'::text);


--
-- Name: daily_task_template; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX daily_task_template ON public.daily_task USING btree (student_id, template);


--
-- Name: engine_event_client; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX engine_event_client ON public.engine_event USING btree (student_id, client_id) WHERE (client_id IS NOT NULL);


--
-- Name: engine_event_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX engine_event_student ON public.engine_event USING btree (student_id, at);


--
-- Name: family_code_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX family_code_student ON public.family_code USING btree (student_id);


--
-- Name: family_link_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX family_link_student ON public.family_link USING btree (student_id);


--
-- Name: freeze_entry_once; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX freeze_entry_once ON public.freeze_entry USING btree (student_id, kind, ref);


--
-- Name: game_campus_round_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX game_campus_round_date ON public.game_campus_round USING btree (date);


--
-- Name: game_daily_answer_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX game_daily_answer_date ON public.game_daily_answer USING btree (date);


--
-- Name: game_result_client; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX game_result_client ON public.game_result USING btree (student_id, client_id);


--
-- Name: game_result_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX game_result_student ON public.game_result USING btree (student_id, at);


--
-- Name: homework_one_a_day; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX homework_one_a_day ON public.homework USING btree (student_id, for_day);


--
-- Name: homework_turn_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX homework_turn_status ON public.homework_turn USING btree (student_id, status);


--
-- Name: jia_lead_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jia_lead_user ON public.jia_lead USING btree (user_id, created_at);


--
-- Name: league_cohort_fill; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX league_cohort_fill ON public.league_cohort USING btree (week, tier, stage);


--
-- Name: league_member_cohort; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX league_member_cohort ON public.league_member USING btree (cohort_id);


--
-- Name: milestone_report_once; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX milestone_report_once ON public.milestone_report USING btree (student_id, milestone_id);


--
-- Name: milestone_rule; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX milestone_rule ON public.roadmap_milestone USING btree (source_rule_id);


--
-- Name: milestone_student_due; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX milestone_student_due ON public.roadmap_milestone USING btree (student_id, due);


--
-- Name: moderation_audit_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX moderation_audit_at ON public.moderation_audit USING btree (at);


--
-- Name: moderation_audit_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX moderation_audit_item ON public.moderation_audit USING btree (item_id);


--
-- Name: moderation_item_author; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX moderation_item_author ON public.moderation_item USING btree (author_id);


--
-- Name: moderation_item_queue; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX moderation_item_queue ON public.moderation_item USING btree (status, urgent, created_at);


--
-- Name: moderation_item_ref; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX moderation_item_ref ON public.moderation_item USING btree (kind, ref_id);


--
-- Name: outcome_prompt_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX outcome_prompt_student ON public.outcome_prompt USING btree (student_id);


--
-- Name: parent_note_once; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX parent_note_once ON public.parent_note USING btree (parent_id, student_id, event);


--
-- Name: parent_note_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX parent_note_student ON public.parent_note USING btree (student_id, seen_at);


--
-- Name: pay_coupon_source; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX pay_coupon_source ON public.pay_coupon USING btree (source, source_ref);


--
-- Name: pay_coupon_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pay_coupon_student ON public.pay_coupon USING btree (student_id);


--
-- Name: pay_event_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pay_event_at ON public.pay_event USING btree (at);


--
-- Name: pay_event_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pay_event_order ON public.pay_event USING btree (order_id);


--
-- Name: pay_gift_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX pay_gift_code ON public.pay_gift USING btree (code_hash);


--
-- Name: pay_gift_order; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX pay_gift_order ON public.pay_gift USING btree (order_id);


--
-- Name: pay_order_number; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX pay_order_number ON public.pay_order USING btree (number);


--
-- Name: pay_order_payer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pay_order_payer ON public.pay_order USING btree (payer_id);


--
-- Name: pay_order_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pay_order_student ON public.pay_order USING btree (student_id);


--
-- Name: pay_txn_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pay_txn_order ON public.pay_txn USING btree (order_id);


--
-- Name: pay_txn_order_paid; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX pay_txn_order_paid ON public.pay_txn USING btree (order_id) WHERE ((paid_at IS NOT NULL) AND (cancelled_at IS NULL));


--
-- Name: pay_txn_provider_ref; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX pay_txn_provider_ref ON public.pay_txn USING btree (provider, provider_ref);


--
-- Name: pay_txn_seq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX pay_txn_seq ON public.pay_txn USING btree (seq);


--
-- Name: pledge_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pledge_parent ON public.pledge USING btree (parent_id);


--
-- Name: pledge_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pledge_student ON public.pledge USING btree (student_id, status);


--
-- Name: proof_file_once; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX proof_file_once ON public.proof_file USING btree (student_id, kind, sha256);


--
-- Name: proof_file_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX proof_file_student ON public.proof_file USING btree (student_id);


--
-- Name: readiness_period; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX readiness_period ON public.readiness_snapshot USING btree (student_id, kind, local_date) WHERE (kind <> 'rescore'::text);


--
-- Name: report_open; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_open ON public.report USING btree (status, urgent, created_at);


--
-- Name: report_reporter; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_reporter ON public.report USING btree (reporter_id);


--
-- Name: roadmap_change_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX roadmap_change_student ON public.roadmap_change USING btree (student_id, created_at);


--
-- Name: roadmap_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX roadmap_student ON public.roadmap USING btree (student_id, is_current);


--
-- Name: rule_record_current; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rule_record_current ON public.rule_record USING btree (is_current);


--
-- Name: sat_sitting_mock_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sat_sitting_mock_date ON public.sat_sitting USING btree (student_id, mock_date);


--
-- Name: score_report_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX score_report_status ON public.score_report USING btree (status);


--
-- Name: score_report_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX score_report_student ON public.score_report USING btree (student_id);


--
-- Name: srs_card_due; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX srs_card_due ON public.srs_card USING btree (student_id, due);


--
-- Name: staff_checkpoint_open_task; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX staff_checkpoint_open_task ON public.staff_checkpoint USING btree (student_id, task_id) WHERE ((status = 'open'::text) AND (task_id IS NOT NULL));


--
-- Name: staff_checkpoint_queue; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX staff_checkpoint_queue ON public.staff_checkpoint USING btree (status, created_at);


--
-- Name: staff_checkpoint_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX staff_checkpoint_student ON public.staff_checkpoint USING btree (student_id);


--
-- Name: study_pair_once; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX study_pair_once ON public.study_pair USING btree (study, student_id);


--
-- Name: study_session_client; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX study_session_client ON public.study_session USING btree (student_id, client_id);


--
-- Name: study_session_day; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX study_session_day ON public.study_session USING btree (student_id, local_date);


--
-- Name: study_session_running; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX study_session_running ON public.study_session USING btree (student_id) WHERE (status = 'running'::text);


--
-- Name: subscription_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX subscription_student ON public.subscription USING btree (student_id, ends_on);


--
-- Name: task_batch_week; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX task_batch_week ON public.task_batch USING btree (student_id, week_start);


--
-- Name: task_completion_client; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX task_completion_client ON public.task_completion USING btree (student_id, client_id) WHERE (client_id IS NOT NULL);


--
-- Name: user_block_blocked; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_block_blocked ON public.user_block USING btree (blocked_id);


--
-- Name: video_clip_lesson; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX video_clip_lesson ON public.video_clip USING btree (lesson_id);


--
-- Name: video_clip_piece; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX video_clip_piece ON public.video_clip USING btree (lesson_id, piece_n) WHERE (kind = 'clip'::text);


--
-- Name: video_clip_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX video_clip_source ON public.video_clip USING btree (source_id);


--
-- Name: video_clip_whole; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX video_clip_whole ON public.video_clip USING btree (lesson_id) WHERE (kind = 'whole'::text);


--
-- Name: xp_entry_once; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX xp_entry_once ON public.xp_entry USING btree (student_id, reason, ref);


--
-- Name: admission_prediction admission_prediction_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER admission_prediction_immutable BEFORE UPDATE ON public.admission_prediction FOR EACH ROW EXECUTE FUNCTION public.admission_prediction_immutable();


--
-- Name: account_suspension account_suspension_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_suspension
    ADD CONSTRAINT account_suspension_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: account account_userId_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: achievement_award achievement_award_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievement_award
    ADD CONSTRAINT achievement_award_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: activity_day activity_day_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_day
    ADD CONSTRAINT activity_day_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: admission_outcome admission_outcome_proof_id_proof_file_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admission_outcome
    ADD CONSTRAINT admission_outcome_proof_id_proof_file_id_fk FOREIGN KEY (proof_id) REFERENCES public.proof_file(id) ON DELETE SET NULL;


--
-- Name: admission_outcome admission_outcome_reported_by_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admission_outcome
    ADD CONSTRAINT admission_outcome_reported_by_user_id_fk FOREIGN KEY (reported_by) REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: admission_outcome admission_outcome_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admission_outcome
    ADD CONSTRAINT admission_outcome_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: admission_prediction admission_prediction_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admission_prediction
    ADD CONSTRAINT admission_prediction_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: ai_consent ai_consent_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_consent
    ADD CONSTRAINT ai_consent_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: ai_interpretation ai_interpretation_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_interpretation
    ADD CONSTRAINT ai_interpretation_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: ai_job ai_job_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_job
    ADD CONSTRAINT ai_job_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: ai_run ai_run_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_run
    ADD CONSTRAINT ai_run_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: ai_usage ai_usage_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_usage
    ADD CONSTRAINT ai_usage_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: brick_entry brick_entry_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brick_entry
    ADD CONSTRAINT brick_entry_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: chat chat_created_by_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT chat_created_by_user_id_fk FOREIGN KEY (created_by) REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: chat_member chat_member_chat_id_chat_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_member
    ADD CONSTRAINT chat_member_chat_id_chat_id_fk FOREIGN KEY (chat_id) REFERENCES public.chat(id) ON DELETE CASCADE;


--
-- Name: chat_member chat_member_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_member
    ADD CONSTRAINT chat_member_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: chat_message chat_message_chat_id_chat_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT chat_message_chat_id_chat_id_fk FOREIGN KEY (chat_id) REFERENCES public.chat(id) ON DELETE CASCADE;


--
-- Name: chat_message chat_message_reply_to_chat_message_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT chat_message_reply_to_chat_message_id_fk FOREIGN KEY (reply_to) REFERENCES public.chat_message(id) ON DELETE SET NULL;


--
-- Name: chat_message chat_message_sender_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT chat_message_sender_id_user_id_fk FOREIGN KEY (sender_id) REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: chat chat_parent_id_chat_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT chat_parent_id_chat_id_fk FOREIGN KEY (parent_id) REFERENCES public.chat(id) ON DELETE CASCADE;


--
-- Name: chat_pin chat_pin_chat_id_chat_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_pin
    ADD CONSTRAINT chat_pin_chat_id_chat_id_fk FOREIGN KEY (chat_id) REFERENCES public.chat(id) ON DELETE CASCADE;


--
-- Name: chat_pin chat_pin_message_id_chat_message_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_pin
    ADD CONSTRAINT chat_pin_message_id_chat_message_id_fk FOREIGN KEY (message_id) REFERENCES public.chat_message(id) ON DELETE CASCADE;


--
-- Name: chat_pin chat_pin_pinned_by_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_pin
    ADD CONSTRAINT chat_pin_pinned_by_user_id_fk FOREIGN KEY (pinned_by) REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: chat_poll chat_poll_message_id_chat_message_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_poll
    ADD CONSTRAINT chat_poll_message_id_chat_message_id_fk FOREIGN KEY (message_id) REFERENCES public.chat_message(id) ON DELETE CASCADE;


--
-- Name: chat_poll_vote chat_poll_vote_message_id_chat_poll_message_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_poll_vote
    ADD CONSTRAINT chat_poll_vote_message_id_chat_poll_message_id_fk FOREIGN KEY (message_id) REFERENCES public.chat_poll(message_id) ON DELETE CASCADE;


--
-- Name: chat_poll_vote chat_poll_vote_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_poll_vote
    ADD CONSTRAINT chat_poll_vote_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: chat_reaction chat_reaction_message_id_chat_message_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_reaction
    ADD CONSTRAINT chat_reaction_message_id_chat_message_id_fk FOREIGN KEY (message_id) REFERENCES public.chat_message(id) ON DELETE CASCADE;


--
-- Name: chat_reaction chat_reaction_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_reaction
    ADD CONSTRAINT chat_reaction_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: check_run check_run_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.check_run
    ADD CONSTRAINT check_run_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: coin_entry coin_entry_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coin_entry
    ADD CONSTRAINT coin_entry_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: community_comment community_comment_author_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_comment
    ADD CONSTRAINT community_comment_author_id_user_id_fk FOREIGN KEY (author_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: community_comment community_comment_parent_id_community_comment_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_comment
    ADD CONSTRAINT community_comment_parent_id_community_comment_id_fk FOREIGN KEY (parent_id) REFERENCES public.community_comment(id) ON DELETE CASCADE;


--
-- Name: community_comment community_comment_post_id_community_post_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_comment
    ADD CONSTRAINT community_comment_post_id_community_post_id_fk FOREIGN KEY (post_id) REFERENCES public.community_post(id) ON DELETE CASCADE;


--
-- Name: community_follow community_follow_followee_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_follow
    ADD CONSTRAINT community_follow_followee_id_user_id_fk FOREIGN KEY (followee_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: community_follow community_follow_follower_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_follow
    ADD CONSTRAINT community_follow_follower_id_user_id_fk FOREIGN KEY (follower_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: community_like community_like_post_id_community_post_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_like
    ADD CONSTRAINT community_like_post_id_community_post_id_fk FOREIGN KEY (post_id) REFERENCES public.community_post(id) ON DELETE CASCADE;


--
-- Name: community_like community_like_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_like
    ADD CONSTRAINT community_like_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: community_media community_media_owner_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_media
    ADD CONSTRAINT community_media_owner_id_user_id_fk FOREIGN KEY (owner_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: community_note community_note_actor_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_note
    ADD CONSTRAINT community_note_actor_id_user_id_fk FOREIGN KEY (actor_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: community_note community_note_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_note
    ADD CONSTRAINT community_note_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: community_poll_vote community_poll_vote_post_id_community_post_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_poll_vote
    ADD CONSTRAINT community_poll_vote_post_id_community_post_id_fk FOREIGN KEY (post_id) REFERENCES public.community_post(id) ON DELETE CASCADE;


--
-- Name: community_poll_vote community_poll_vote_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_poll_vote
    ADD CONSTRAINT community_poll_vote_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: community_post community_post_author_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_post
    ADD CONSTRAINT community_post_author_id_user_id_fk FOREIGN KEY (author_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: community_post community_post_media_id_community_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_post
    ADD CONSTRAINT community_post_media_id_community_media_id_fk FOREIGN KEY (media_id) REFERENCES public.community_media(id) ON DELETE SET NULL;


--
-- Name: community_profile community_profile_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_profile
    ADD CONSTRAINT community_profile_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: community_save community_save_post_id_community_post_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_save
    ADD CONSTRAINT community_save_post_id_community_post_id_fk FOREIGN KEY (post_id) REFERENCES public.community_post(id) ON DELETE CASCADE;


--
-- Name: community_save community_save_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_save
    ADD CONSTRAINT community_save_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: community_story community_story_author_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_story
    ADD CONSTRAINT community_story_author_id_user_id_fk FOREIGN KEY (author_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: community_story community_story_media_id_community_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_story
    ADD CONSTRAINT community_story_media_id_community_media_id_fk FOREIGN KEY (media_id) REFERENCES public.community_media(id) ON DELETE SET NULL;


--
-- Name: community_story_view community_story_view_story_id_community_story_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_story_view
    ADD CONSTRAINT community_story_view_story_id_community_story_id_fk FOREIGN KEY (story_id) REFERENCES public.community_story(id) ON DELETE CASCADE;


--
-- Name: community_story_view community_story_view_viewer_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_story_view
    ADD CONSTRAINT community_story_view_viewer_id_user_id_fk FOREIGN KEY (viewer_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: community_view community_view_post_id_community_post_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_view
    ADD CONSTRAINT community_view_post_id_community_post_id_fk FOREIGN KEY (post_id) REFERENCES public.community_post(id) ON DELETE CASCADE;


--
-- Name: community_view community_view_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_view
    ADD CONSTRAINT community_view_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: core_deletion_request core_deletion_request_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.core_deletion_request
    ADD CONSTRAINT core_deletion_request_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: daily_task daily_task_batch_id_task_batch_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_task
    ADD CONSTRAINT daily_task_batch_id_task_batch_id_fk FOREIGN KEY (batch_id) REFERENCES public.task_batch(id) ON DELETE CASCADE;


--
-- Name: daily_task daily_task_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_task
    ADD CONSTRAINT daily_task_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: diagnostic_answer diagnostic_answer_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagnostic_answer
    ADD CONSTRAINT diagnostic_answer_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: dream_build dream_build_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dream_build
    ADD CONSTRAINT dream_build_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: dtm_sitting dtm_sitting_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dtm_sitting
    ADD CONSTRAINT dtm_sitting_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: engine_event engine_event_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.engine_event
    ADD CONSTRAINT engine_event_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: engine_result engine_result_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.engine_result
    ADD CONSTRAINT engine_result_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: engine_state engine_state_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.engine_state
    ADD CONSTRAINT engine_state_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: entitlement entitlement_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entitlement
    ADD CONSTRAINT entitlement_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: family_code family_code_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_code
    ADD CONSTRAINT family_code_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: family_link family_link_parent_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_link
    ADD CONSTRAINT family_link_parent_id_user_id_fk FOREIGN KEY (parent_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: family_link family_link_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_link
    ADD CONSTRAINT family_link_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: freeze_entry freeze_entry_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.freeze_entry
    ADD CONSTRAINT freeze_entry_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: game_campus_round game_campus_round_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_campus_round
    ADD CONSTRAINT game_campus_round_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: game_daily_answer game_daily_answer_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_daily_answer
    ADD CONSTRAINT game_daily_answer_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: game_rating game_rating_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_rating
    ADD CONSTRAINT game_rating_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: game_result game_result_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_result
    ADD CONSTRAINT game_result_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: homework homework_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homework
    ADD CONSTRAINT homework_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: homework_turn homework_turn_homework_id_homework_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homework_turn
    ADD CONSTRAINT homework_turn_homework_id_homework_id_fk FOREIGN KEY (homework_id) REFERENCES public.homework(id) ON DELETE CASCADE;


--
-- Name: homework_turn homework_turn_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homework_turn
    ADD CONSTRAINT homework_turn_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: jia_lead jia_lead_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jia_lead
    ADD CONSTRAINT jia_lead_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: league_cohort league_cohort_week_league_week_week_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.league_cohort
    ADD CONSTRAINT league_cohort_week_league_week_week_fk FOREIGN KEY (week) REFERENCES public.league_week(week) ON DELETE CASCADE;


--
-- Name: league_member league_member_cohort_id_league_cohort_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.league_member
    ADD CONSTRAINT league_member_cohort_id_league_cohort_id_fk FOREIGN KEY (cohort_id) REFERENCES public.league_cohort(id) ON DELETE CASCADE;


--
-- Name: league_member league_member_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.league_member
    ADD CONSTRAINT league_member_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: league_player league_player_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.league_player
    ADD CONSTRAINT league_player_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: learner_skill learner_skill_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learner_skill
    ADD CONSTRAINT learner_skill_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: lesson_progress lesson_progress_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: lesson_skill lesson_skill_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_skill
    ADD CONSTRAINT lesson_skill_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: milestone_report milestone_report_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.milestone_report
    ADD CONSTRAINT milestone_report_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: mock_result mock_result_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mock_result
    ADD CONSTRAINT mock_result_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: moderation_audit moderation_audit_item_id_moderation_item_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moderation_audit
    ADD CONSTRAINT moderation_audit_item_id_moderation_item_id_fk FOREIGN KEY (item_id) REFERENCES public.moderation_item(id) ON DELETE SET NULL;


--
-- Name: moderation_item moderation_item_author_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moderation_item
    ADD CONSTRAINT moderation_item_author_id_user_id_fk FOREIGN KEY (author_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: moderation_item moderation_item_decided_by_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moderation_item
    ADD CONSTRAINT moderation_item_decided_by_user_id_fk FOREIGN KEY (decided_by) REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: moderation_item moderation_item_subject_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moderation_item
    ADD CONSTRAINT moderation_item_subject_id_user_id_fk FOREIGN KEY (subject_id) REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: outcome_prompt outcome_prompt_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outcome_prompt
    ADD CONSTRAINT outcome_prompt_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: outcome_prompt outcome_prompt_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outcome_prompt
    ADD CONSTRAINT outcome_prompt_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: parent_alert parent_alert_parent_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_alert
    ADD CONSTRAINT parent_alert_parent_id_user_id_fk FOREIGN KEY (parent_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: parent_alert parent_alert_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_alert
    ADD CONSTRAINT parent_alert_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: parent_note parent_note_parent_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_note
    ADD CONSTRAINT parent_note_parent_id_user_id_fk FOREIGN KEY (parent_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: parent_note parent_note_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_note
    ADD CONSTRAINT parent_note_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: password password_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password
    ADD CONSTRAINT password_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: pay_coupon pay_coupon_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pay_coupon
    ADD CONSTRAINT pay_coupon_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: pay_gift pay_gift_claimed_by_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pay_gift
    ADD CONSTRAINT pay_gift_claimed_by_user_id_fk FOREIGN KEY (claimed_by) REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: pay_gift pay_gift_order_id_pay_order_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pay_gift
    ADD CONSTRAINT pay_gift_order_id_pay_order_id_fk FOREIGN KEY (order_id) REFERENCES public.pay_order(id) ON DELETE RESTRICT;


--
-- Name: pay_order pay_order_payer_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pay_order
    ADD CONSTRAINT pay_order_payer_id_user_id_fk FOREIGN KEY (payer_id) REFERENCES public."user"(id) ON DELETE RESTRICT;


--
-- Name: pay_order pay_order_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pay_order
    ADD CONSTRAINT pay_order_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE RESTRICT;


--
-- Name: pay_txn pay_txn_order_id_pay_order_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pay_txn
    ADD CONSTRAINT pay_txn_order_id_pay_order_id_fk FOREIGN KEY (order_id) REFERENCES public.pay_order(id) ON DELETE RESTRICT;


--
-- Name: plan_usage plan_usage_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_usage
    ADD CONSTRAINT plan_usage_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: pledge pledge_parent_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pledge
    ADD CONSTRAINT pledge_parent_id_user_id_fk FOREIGN KEY (parent_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: pledge pledge_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pledge
    ADD CONSTRAINT pledge_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: profile_photo profile_photo_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_photo
    ADD CONSTRAINT profile_photo_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: profile profile_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: proof_file proof_file_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proof_file
    ADD CONSTRAINT proof_file_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: proof_file proof_file_uploaded_by_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proof_file
    ADD CONSTRAINT proof_file_uploaded_by_user_id_fk FOREIGN KEY (uploaded_by) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: readiness_snapshot readiness_snapshot_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.readiness_snapshot
    ADD CONSTRAINT readiness_snapshot_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: report report_item_id_moderation_item_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT report_item_id_moderation_item_id_fk FOREIGN KEY (item_id) REFERENCES public.moderation_item(id) ON DELETE SET NULL;


--
-- Name: report report_reporter_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT report_reporter_id_user_id_fk FOREIGN KEY (reporter_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: report report_target_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT report_target_user_id_user_id_fk FOREIGN KEY (target_user_id) REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: roadmap_change roadmap_change_roadmap_id_roadmap_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roadmap_change
    ADD CONSTRAINT roadmap_change_roadmap_id_roadmap_id_fk FOREIGN KEY (roadmap_id) REFERENCES public.roadmap(id) ON DELETE CASCADE;


--
-- Name: roadmap_change roadmap_change_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roadmap_change
    ADD CONSTRAINT roadmap_change_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: roadmap_milestone roadmap_milestone_roadmap_id_roadmap_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roadmap_milestone
    ADD CONSTRAINT roadmap_milestone_roadmap_id_roadmap_id_fk FOREIGN KEY (roadmap_id) REFERENCES public.roadmap(id) ON DELETE CASCADE;


--
-- Name: roadmap_milestone roadmap_milestone_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roadmap_milestone
    ADD CONSTRAINT roadmap_milestone_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: roadmap roadmap_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roadmap
    ADD CONSTRAINT roadmap_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: sat_sitting sat_sitting_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sat_sitting
    ADD CONSTRAINT sat_sitting_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: schedule_state schedule_state_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_state
    ADD CONSTRAINT schedule_state_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: score_report score_report_proof_id_proof_file_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.score_report
    ADD CONSTRAINT score_report_proof_id_proof_file_id_fk FOREIGN KEY (proof_id) REFERENCES public.proof_file(id) ON DELETE CASCADE;


--
-- Name: score_report score_report_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.score_report
    ADD CONSTRAINT score_report_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: session session_userId_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: speaking_practice speaking_practice_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.speaking_practice
    ADD CONSTRAINT speaking_practice_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: srs_card srs_card_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.srs_card
    ADD CONSTRAINT srs_card_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: staff_checkpoint staff_checkpoint_decided_by_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_checkpoint
    ADD CONSTRAINT staff_checkpoint_decided_by_user_id_fk FOREIGN KEY (decided_by) REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: staff_checkpoint staff_checkpoint_proof_id_proof_file_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_checkpoint
    ADD CONSTRAINT staff_checkpoint_proof_id_proof_file_id_fk FOREIGN KEY (proof_id) REFERENCES public.proof_file(id) ON DELETE SET NULL;


--
-- Name: staff_checkpoint staff_checkpoint_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_checkpoint
    ADD CONSTRAINT staff_checkpoint_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: staff_member staff_member_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_member
    ADD CONSTRAINT staff_member_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: streak_state streak_state_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.streak_state
    ADD CONSTRAINT streak_state_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: student_motivation student_motivation_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_motivation
    ADD CONSTRAINT student_motivation_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: study_consent study_consent_invite_id_study_invite_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_consent
    ADD CONSTRAINT study_consent_invite_id_study_invite_id_fk FOREIGN KEY (invite_id) REFERENCES public.study_invite(id) ON DELETE CASCADE;


--
-- Name: study_consent study_consent_parent_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_consent
    ADD CONSTRAINT study_consent_parent_id_user_id_fk FOREIGN KEY (parent_id) REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: study_consent study_consent_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_consent
    ADD CONSTRAINT study_consent_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: study_pair study_pair_invite_id_study_invite_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_pair
    ADD CONSTRAINT study_pair_invite_id_study_invite_id_fk FOREIGN KEY (invite_id) REFERENCES public.study_invite(id) ON DELETE CASCADE;


--
-- Name: study_pair study_pair_proof_id_proof_file_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_pair
    ADD CONSTRAINT study_pair_proof_id_proof_file_id_fk FOREIGN KEY (proof_id) REFERENCES public.proof_file(id) ON DELETE SET NULL;


--
-- Name: study_pair study_pair_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_pair
    ADD CONSTRAINT study_pair_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: study_session study_session_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_session
    ADD CONSTRAINT study_session_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: subscription subscription_order_id_pay_order_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT subscription_order_id_pay_order_id_fk FOREIGN KEY (order_id) REFERENCES public.pay_order(id) ON DELETE RESTRICT;


--
-- Name: subscription subscription_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT subscription_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: task_batch task_batch_roadmap_id_roadmap_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_batch
    ADD CONSTRAINT task_batch_roadmap_id_roadmap_id_fk FOREIGN KEY (roadmap_id) REFERENCES public.roadmap(id) ON DELETE SET NULL;


--
-- Name: task_batch task_batch_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_batch
    ADD CONSTRAINT task_batch_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: task_completion task_completion_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_completion
    ADD CONSTRAINT task_completion_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: user_block user_block_blocked_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_block
    ADD CONSTRAINT user_block_blocked_id_user_id_fk FOREIGN KEY (blocked_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: user_block user_block_blocker_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_block
    ADD CONSTRAINT user_block_blocker_id_user_id_fk FOREIGN KEY (blocker_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: user_state user_state_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_state
    ADD CONSTRAINT user_state_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: video_clip video_clip_source_id_video_source_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_clip
    ADD CONSTRAINT video_clip_source_id_video_source_id_fk FOREIGN KEY (source_id) REFERENCES public.video_source(id) ON DELETE CASCADE;


--
-- Name: video_watch video_watch_clip_id_video_clip_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_watch
    ADD CONSTRAINT video_watch_clip_id_video_clip_id_fk FOREIGN KEY (clip_id) REFERENCES public.video_clip(id) ON DELETE CASCADE;


--
-- Name: video_watch video_watch_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_watch
    ADD CONSTRAINT video_watch_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: wallet_backfill wallet_backfill_coin_entry_id_coin_entry_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_backfill
    ADD CONSTRAINT wallet_backfill_coin_entry_id_coin_entry_id_fk FOREIGN KEY (coin_entry_id) REFERENCES public.coin_entry(id) ON DELETE CASCADE;


--
-- Name: wallet wallet_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet
    ADD CONSTRAINT wallet_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: writing_piece writing_piece_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.writing_piece
    ADD CONSTRAINT writing_piece_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: xp_entry xp_entry_student_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.xp_entry
    ADD CONSTRAINT xp_entry_student_id_user_id_fk FOREIGN KEY (student_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--



