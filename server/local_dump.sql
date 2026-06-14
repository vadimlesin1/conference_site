--
-- PostgreSQL database dump
--

\restrict KC9R1qHjY5hLImN09ANiCavtVL5yd7mELKgwldBZj064URGL1IzDkMg50Dhkh8j

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

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

ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.submissions DROP CONSTRAINT IF EXISTS submissions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.submissions DROP CONSTRAINT IF EXISTS submissions_section_id_fkey;
ALTER TABLE IF EXISTS ONLY public.submissions DROP CONSTRAINT IF EXISTS submissions_reviewer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.submission_versions DROP CONSTRAINT IF EXISTS submission_versions_submission_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sections DROP CONSTRAINT IF EXISTS sections_conference_id_fkey;
ALTER TABLE IF EXISTS ONLY public.schedule_items DROP CONSTRAINT IF EXISTS schedule_items_submission_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_submission_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_reviewer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_assignments DROP CONSTRAINT IF EXISTS review_assignments_submission_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_assignments DROP CONSTRAINT IF EXISTS review_assignments_reviewer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
DROP INDEX IF EXISTS public.idx_review_assignment_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.submissions DROP CONSTRAINT IF EXISTS submissions_pkey;
ALTER TABLE IF EXISTS ONLY public.submission_versions DROP CONSTRAINT IF EXISTS submission_versions_pkey;
ALTER TABLE IF EXISTS ONLY public.sections DROP CONSTRAINT IF EXISTS sections_pkey;
ALTER TABLE IF EXISTS ONLY public.schedule_items DROP CONSTRAINT IF EXISTS schedule_items_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_name_key;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_pkey;
ALTER TABLE IF EXISTS ONLY public.review_assignments DROP CONSTRAINT IF EXISTS review_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.news DROP CONSTRAINT IF EXISTS news_pkey;
ALTER TABLE IF EXISTS ONLY public.conferences DROP CONSTRAINT IF EXISTS conferences_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.submissions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.submission_versions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.sections ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.schedule_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.roles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reviews ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.review_assignments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.news ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.conferences ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.submissions_id_seq;
DROP TABLE IF EXISTS public.submissions;
DROP SEQUENCE IF EXISTS public.submission_versions_id_seq;
DROP TABLE IF EXISTS public.submission_versions;
DROP SEQUENCE IF EXISTS public.sections_id_seq;
DROP TABLE IF EXISTS public.sections;
DROP SEQUENCE IF EXISTS public.schedule_items_id_seq;
DROP TABLE IF EXISTS public.schedule_items;
DROP SEQUENCE IF EXISTS public.roles_id_seq;
DROP TABLE IF EXISTS public.roles;
DROP SEQUENCE IF EXISTS public.reviews_id_seq;
DROP TABLE IF EXISTS public.reviews;
DROP SEQUENCE IF EXISTS public.review_assignments_id_seq;
DROP TABLE IF EXISTS public.review_assignments;
DROP SEQUENCE IF EXISTS public.notifications_id_seq;
DROP TABLE IF EXISTS public.notifications;
DROP SEQUENCE IF EXISTS public.news_id_seq;
DROP TABLE IF EXISTS public.news;
DROP SEQUENCE IF EXISTS public.conferences_id_seq;
DROP TABLE IF EXISTS public.conferences;
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: conferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conferences (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    date_start date NOT NULL,
    date_end date NOT NULL,
    location character varying(200),
    is_active boolean DEFAULT true,
    proceedings_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    submission_deadline timestamp without time zone,
    program_formation_date timestamp without time zone
);


--
-- Name: conferences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conferences_id_seq OWNED BY public.conferences.id;


--
-- Name: news; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    content text NOT NULL,
    image_url text,
    is_published boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: news_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.news_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: news_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.news_id_seq OWNED BY public.news.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: review_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_assignments (
    id integer NOT NULL,
    submission_id integer,
    reviewer_id integer,
    assigned_at timestamp without time zone DEFAULT now(),
    status character varying(50) DEFAULT 'assigned'::character varying
);


--
-- Name: review_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.review_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: review_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.review_assignments_id_seq OWNED BY public.review_assignments.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    submission_id integer,
    reviewer_id integer,
    version_number integer NOT NULL,
    decision character varying(20) NOT NULL,
    rejection_reason character varying(200),
    comment text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT reviews_decision_check CHECK (((decision)::text = ANY ((ARRAY['accepted'::character varying, 'rejected'::character varying])::text[])))
);


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: schedule_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_items (
    id integer NOT NULL,
    submission_id integer,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    room character varying(50)
);


--
-- Name: schedule_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.schedule_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: schedule_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.schedule_items_id_seq OWNED BY public.schedule_items.id;


--
-- Name: sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sections (
    id integer NOT NULL,
    title character varying(100) NOT NULL,
    conference_id integer,
    room character varying(100),
    section_date date,
    manager_ids integer[] DEFAULT '{}'::integer[],
    managers_text character varying(255)
);


--
-- Name: sections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sections_id_seq OWNED BY public.sections.id;


--
-- Name: submission_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submission_versions (
    id integer NOT NULL,
    submission_id integer,
    version_number integer DEFAULT 1 NOT NULL,
    file_url character varying(500) NOT NULL,
    title character varying(500),
    abstract text,
    uploaded_at timestamp without time zone DEFAULT now(),
    is_current boolean DEFAULT true
);


--
-- Name: submission_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.submission_versions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: submission_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.submission_versions_id_seq OWNED BY public.submission_versions.id;


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submissions (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    abstract text,
    file_url text NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    user_id integer,
    section_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    start_time timestamp without time zone,
    duration integer DEFAULT 30,
    advisor_name character varying(255),
    advisor_email character varying(255),
    advisor_is_author boolean DEFAULT false,
    payment_status character varying(50) DEFAULT 'unpaid'::character varying,
    coauthors_list jsonb DEFAULT '[]'::jsonb,
    rejection_count integer DEFAULT 0,
    reviewer_id integer,
    current_version integer DEFAULT 1
);


--
-- Name: submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.submissions_id_seq OWNED BY public.submissions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    last_name character varying(100) NOT NULL,
    first_name character varying(100) NOT NULL,
    middle_name character varying(100),
    phone_number character varying(20),
    country character varying(100),
    city character varying(100),
    institution character varying(200),
    faculty character varying(200),
    study_direction character varying(100),
    academic_status character varying(50),
    role_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_verified boolean DEFAULT false,
    verification_token text
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: conferences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conferences ALTER COLUMN id SET DEFAULT nextval('public.conferences_id_seq'::regclass);


--
-- Name: news id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news ALTER COLUMN id SET DEFAULT nextval('public.news_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: review_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_assignments ALTER COLUMN id SET DEFAULT nextval('public.review_assignments_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: schedule_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_items ALTER COLUMN id SET DEFAULT nextval('public.schedule_items_id_seq'::regclass);


--
-- Name: sections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sections ALTER COLUMN id SET DEFAULT nextval('public.sections_id_seq'::regclass);


--
-- Name: submission_versions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submission_versions ALTER COLUMN id SET DEFAULT nextval('public.submission_versions_id_seq'::regclass);


--
-- Name: submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions ALTER COLUMN id SET DEFAULT nextval('public.submissions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: conferences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.conferences (id, title, description, date_start, date_end, location, is_active, proceedings_url, created_at, submission_deadline, program_formation_date) FROM stdin;
13	конференция	123	2026-05-28	2026-06-25	СГТУ	t	\N	2026-05-29 22:13:09.619018	2026-06-14 00:00:00	2026-06-09 00:00:00
11	конференция		2026-05-28	2026-06-06	СГТУ	f	\N	2026-05-29 21:43:54.259603	2026-05-28 00:00:00	2026-05-31 00:00:00
2	Информационные технологии 2025	\N	2025-05-20	2025-05-22	\N	f	\N	2025-12-14 14:19:39.632083	\N	\N
7	IT Конференция 2023 (Архив)	Материалы прошлогодней конференции	2023-05-20	2023-05-22	СГТУ, Главный корпус	f	\N	2025-12-14 22:02:17.637746	\N	\N
1	IT Conference 2025	Актуальные проблемы управления, информационных технологий и цифровой трансформации	2025-05-20	2025-05-22	СГТУ	f	\N	2025-12-14 13:27:08.740371	\N	\N
8	Тестовая конференция	Тестовое мероприятие для проверки работы системы.	2026-05-01	2026-07-01	СГТУ	f	\N	2025-12-21 18:13:15.731583	\N	\N
9	Конферения тест		2026-05-01	2026-07-01	\N	f	\N	2026-05-26 23:45:35.146178	2026-06-01 00:00:00	2026-06-15 00:00:00
10	TEST		2026-05-23	2026-05-28	СГТУ	f	/uploads/proceedings-1779999294453.pdf	2026-05-28 00:10:06.543965	2026-05-24 00:00:00	2026-05-27 00:00:00
12	конф		2026-05-27	2026-06-27	СГТУ	f	\N	2026-05-29 21:48:41.787458	2026-05-29 00:00:00	2026-06-05 00:00:00
\.


--
-- Data for Name: news; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.news (id, title, content, image_url, is_published, created_at) FROM stdin;
11	вфа	фва	\N	t	2026-05-28 23:59:41.812598
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, message, is_read, created_at) FROM stdin;
44	15	Рецензент отклонил доклад «123» (попытка 1 из 3). Причина: Несоответствие тематике конференции	f	2026-05-28 00:41:20.832817
46	1	Рецензент отклонил доклад «123» (попытка 1 из 3). Причина: Несоответствие тематике конференции	f	2026-05-28 00:41:20.833898
21	12	Ваш доклад «привет спишь?» принят! Поздравляем!	f	2026-05-08 01:18:00.69093
47	15	Рецензент отклонил доклад «123». Требуется решение программного комитета.	f	2026-05-28 00:47:20.113518
49	1	Рецензент отклонил доклад «123». Требуется решение программного комитета.	f	2026-05-28 00:47:20.115282
52	15	Рецензент принял доклад «123». Требуется решение программного комитета.	f	2026-05-28 00:49:10.320932
33	7	Ваш доклад «Доклад» принят! Поздравляем!	t	2026-05-20 10:48:29.031321
34	7	Назначено время выступления для доклада «Доклад»: 20 мая 2026 г., 15:00 (10 мин.)	t	2026-05-20 10:48:41.457561
54	1	Рецензент принял доклад «123». Требуется решение программного комитета.	f	2026-05-28 00:49:10.322767
58	15	Рецензент отклонил доклад «222222222». Требуется решение программного комитета.	f	2026-05-28 00:51:43.556989
60	1	Рецензент отклонил доклад «222222222». Требуется решение программного комитета.	f	2026-05-28 00:51:43.558187
63	15	Рецензент принял доклад «222222222». Требуется решение программного комитета.	f	2026-05-28 00:53:13.536996
65	1	Рецензент принял доклад «222222222». Требуется решение программного комитета.	f	2026-05-28 00:53:13.539071
45	6	Рецензент отклонил доклад «123» (попытка 1 из 3). Причина: Несоответствие тематике конференции	t	2026-05-28 00:41:20.833339
48	6	Рецензент отклонил доклад «123». Требуется решение программного комитета.	t	2026-05-28 00:47:20.114656
53	6	Рецензент принял доклад «123». Требуется решение программного комитета.	t	2026-05-28 00:49:10.322198
59	6	Рецензент отклонил доклад «222222222». Требуется решение программного комитета.	t	2026-05-28 00:51:43.557638
64	6	Рецензент принял доклад «222222222». Требуется решение программного комитета.	t	2026-05-28 00:53:13.538278
68	15	Рецензент отклонил доклад «вфыаафв». Требуется решение программного комитета.	f	2026-05-28 00:58:35.607778
70	1	Рецензент отклонил доклад «вфыаафв». Требуется решение программного комитета.	f	2026-05-28 00:58:35.60957
69	6	Рецензент отклонил доклад «вфыаафв». Требуется решение программного комитета.	t	2026-05-28 00:58:35.609079
39	3	Вам назначен доклад для рецензирования: «123»	t	2026-05-28 00:40:29.271827
40	3	Вам назначен доклад для рецензирования: «123»	t	2026-05-28 00:40:30.496735
50	4	Рецензент отклонил доклад «123». Требуется решение программного комитета.	t	2026-05-28 00:47:20.116136
55	4	Рецензент принял доклад «123». Требуется решение программного комитета.	t	2026-05-28 00:49:10.323309
61	4	Рецензент отклонил доклад «222222222». Требуется решение программного комитета.	t	2026-05-28 00:51:43.558731
66	4	Рецензент принял доклад «222222222». Требуется решение программного комитета.	t	2026-05-28 00:53:13.539627
43	7	Ваш доклад «123» отклонён рецензентом (попытка 1 из 3). Причина: Несоответствие тематике конференции. Исправьте и отправьте повторно.	t	2026-05-28 00:41:20.831346
51	7	Программный комитет направил вам рецензию по докладу «123». Причина: Ошибки в методологии. Пожалуйста, исправьте и отправьте повторно.	t	2026-05-28 00:48:07.284692
35	7	Ваш доклад «Доклад» опубликован! 🌟	t	2026-05-20 10:49:22.076265
38	7	Ваш доклад «123» принят рецензентом! Поздравляем!	t	2026-05-26 23:44:05.710651
56	7	Ваш доклад «123» принят! Поздравляем!	t	2026-05-28 00:49:51.123851
140	3	Автор прислал исправленную версию доклада «123». Требуется повторная рецензия.	t	2026-06-11 17:18:44.285599
41	3	Вам назначен доклад для рецензирования: «123»	t	2026-05-28 00:40:30.637554
42	3	Вам назначен доклад для рецензирования: «123»	t	2026-05-28 00:40:30.786307
57	3	Вам назначен доклад для рецензирования: «222222222»	t	2026-05-28 00:51:28.746415
67	3	Вам назначен доклад для рецензирования: «вфыаафв»	t	2026-05-28 00:57:59.433651
74	3	Вам назначен доклад для рецензирования: «праавыр»	t	2026-05-28 01:02:06.350293
75	3	Вам назначен доклад для рецензирования: «праавыр»	t	2026-05-28 01:02:07.11672
76	3	Вам назначен доклад для рецензирования: «праавыр»	t	2026-05-28 01:02:07.287791
77	3	Вам назначен доклад для рецензирования: «праавыр»	t	2026-05-28 01:02:07.425835
78	3	Вам назначен доклад для рецензирования: «праавыр»	t	2026-05-28 01:02:07.572491
79	3	Вам назначен доклад для рецензирования: «dfsaf»	t	2026-05-28 01:40:33.728622
80	15	Рецензент отклонил доклад «dfsaf». Требуется решение программного комитета.	f	2026-05-28 22:45:15.620756
82	1	Рецензент отклонил доклад «dfsaf». Требуется решение программного комитета.	f	2026-05-28 22:45:15.645332
84	15	Рецензент принял доклад «праавыр». Требуется решение программного комитета.	f	2026-05-28 22:46:00.105209
86	1	Рецензент принял доклад «праавыр». Требуется решение программного комитета.	f	2026-05-28 22:46:00.107125
90	15	Рецензент отклонил доклад «213». Требуется решение программного комитета.	f	2026-05-28 22:47:40.987399
92	1	Рецензент отклонил доклад «213». Требуется решение программного комитета.	f	2026-05-28 22:47:40.989265
94	15	Рецензент отклонил доклад «dsfasfs». Требуется решение программного комитета.	f	2026-05-28 22:47:52.456414
96	1	Рецензент отклонил доклад «dsfasfs». Требуется решение программного комитета.	f	2026-05-28 22:47:52.458144
83	4	Рецензент отклонил доклад «dfsaf». Требуется решение программного комитета.	t	2026-05-28 22:45:15.645891
87	4	Рецензент принял доклад «праавыр». Требуется решение программного комитета.	t	2026-05-28 22:46:00.107674
93	4	Рецензент отклонил доклад «213». Требуется решение программного комитета.	t	2026-05-28 22:47:40.989959
97	4	Рецензент отклонил доклад «dsfasfs». Требуется решение программного комитета.	t	2026-05-28 22:47:52.458766
73	7	Программный комитет направил вам рецензию по докладу «вфыаафв». Причина: Ошибки в методологии. Пожалуйста, исправьте и отправьте повторно.	t	2026-05-28 00:59:25.489503
98	7	Ваш доклад «праавыр» принят! Поздравляем!	t	2026-05-28 22:48:15.010693
99	7	Программный комитет направил вам рецензию по докладу «213». Причина: Требуется значительная переработка статьи и повторное рецензирование. Комментарий: 1. Соответствует содержание статьи ее названию?\nОтвет: \n\n2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?\nОтвет: \n\n3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?\nОтвет: \n\n4. Обоснована в статье актуальность научной проблемы?\nОтвет: \n\n5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?\nОтвет: \n\n6. Корректно сформулированы выводы?\nОтвет: \n\n7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?\nОтвет: \n\n8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?\nОтвет: \n\n9. В чем заключается научная и/или практическая значимость?\nОтвет: \n\n10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?\nОтвет: \n\n11. В статье есть ошибочные утверждения?\nОтвет: \n\n12. Дополнительные замечания и комментарии по тексту статьи\nОтвет: \n\nЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА:\nТребуется значительная переработка статьи и повторное рецензирование Пожалуйста, исправьте и отправьте повторно.	t	2026-05-28 22:48:16.353198
88	3	Вам назначен доклад для рецензирования: «dsfasfs»	t	2026-05-28 22:47:26.669857
89	3	Вам назначен доклад для рецензирования: «213»	t	2026-05-28 22:47:27.624703
143	1	Рецензент отклонил доклад «123». Требуется решение программного комитета.	f	2026-06-11 17:21:19.686738
144	4	Рецензент отклонил доклад «123». Требуется решение программного комитета.	f	2026-06-11 17:21:19.687406
81	6	Рецензент отклонил доклад «dfsaf». Требуется решение программного комитета.	t	2026-05-28 22:45:15.644606
85	6	Рецензент принял доклад «праавыр». Требуется решение программного комитета.	t	2026-05-28 22:46:00.106636
91	6	Рецензент отклонил доклад «213». Требуется решение программного комитета.	t	2026-05-28 22:47:40.988731
95	6	Рецензент отклонил доклад «dsfasfs». Требуется решение программного комитета.	t	2026-05-28 22:47:52.45757
71	4	Рецензент отклонил доклад «вфыаафв». Требуется решение программного комитета.	t	2026-05-28 00:58:35.610383
36	7	Ваш доклад «123» отклонён рецензентом (попытка 1 из 3). Причина: Несоответствие тематике конференции. Исправьте и отправьте повторно.	t	2026-05-26 23:37:30.61327
37	7	Программный комитет направил вам рецензию по докладу «123». Причина: Несоответствие тематике конференции. Пожалуйста, исправьте и отправьте повторно.	t	2026-05-26 23:39:09.473703
62	7	Программный комитет направил вам рецензию по докладу «222222222». Причина: Недостаточная научная новизна. Пожалуйста, исправьте и отправьте повторно.	t	2026-05-28 00:52:26.682172
72	7	Ваш доклад «222222222» принят! Поздравляем!	t	2026-05-28 00:59:24.130489
100	7	Программный комитет направил вам рецензию по докладу «dsfasfs». Причина: Статья не рекомендуется для печати. Комментарий: 1. Соответствует содержание статьи ее названию?\nОтвет: \n\n2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?\nОтвет: \n\n3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?\nОтвет: \n\n4. Обоснована в статье актуальность научной проблемы?\nОтвет: \n\n5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?\nОтвет: \n\n6. Корректно сформулированы выводы?\nОтвет: \n\n7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?\nОтвет: \n\n8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?\nОтвет: \n\n9. В чем заключается научная и/или практическая значимость?\nОтвет: \n\n10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?\nОтвет: \n\n11. В статье есть ошибочные утверждения?\nОтвет: \n\n12. Дополнительные замечания и комментарии по тексту статьи\nОтвет: \n\nЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА:\nСтатья не рекомендуется для печати Пожалуйста, исправьте и отправьте повторно.	t	2026-05-28 22:48:17.343961
101	7	Назначено время выступления для доклада «123»: 28 мая 2026 г., 12:20 (30 мин.)	t	2026-05-28 23:51:30.648221
102	15	Рецензент отклонил доклад «ДОКЛАД 1». Требуется решение программного комитета.	f	2026-05-29 21:46:54.398379
104	1	Рецензент отклонил доклад «ДОКЛАД 1». Требуется решение программного комитета.	f	2026-05-29 21:46:54.410975
107	15	Рецензент отклонил доклад «Доклад 1». Требуется решение программного комитета.	f	2026-05-29 21:52:21.078166
109	1	Рецензент отклонил доклад «Доклад 1». Требуется решение программного комитета.	f	2026-05-29 21:52:21.07946
106	7	Программный комитет направил вам рецензию по докладу «ДОКЛАД 1». Причина: Статья может быть рекомендована для печати после устранения замечаний. Комментарий: 1. Соответствует содержание статьи ее названию?\nОтвет: \n\n2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?\nОтвет: \n\n3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?\nОтвет: \n\n4. Обоснована в статье актуальность научной проблемы?\nОтвет: \n\n5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?\nОтвет: \n\n6. Корректно сформулированы выводы?\nОтвет: \n\n7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?\nОтвет: \n\n8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?\nОтвет: \n\n9. В чем заключается научная и/или практическая значимость?\nОтвет: \n\n10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?\nОтвет: \n\n11. В статье есть ошибочные утверждения?\nОтвет: \n\n12. Дополнительные замечания и комментарии по тексту статьи\nОтвет: \n\nЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА:\nСтатья может быть рекомендована для печати после устранения замечаний Пожалуйста, исправьте и отправьте повторно.	t	2026-05-29 21:47:16.60411
105	4	Рецензент отклонил доклад «ДОКЛАД 1». Требуется решение программного комитета.	t	2026-05-29 21:46:54.411523
110	4	Рецензент отклонил доклад «Доклад 1». Требуется решение программного комитета.	t	2026-05-29 21:52:21.080267
103	6	Рецензент отклонил доклад «ДОКЛАД 1». Требуется решение программного комитета.	t	2026-05-29 21:46:54.410367
108	6	Рецензент отклонил доклад «Доклад 1». Требуется решение программного комитета.	t	2026-05-29 21:52:21.078868
130	6	Рецензент отклонил доклад «123». Требуется решение программного комитета.	t	2026-06-11 17:15:37.543603
136	6	Рецензент отклонил доклад «123». Требуется решение программного комитета.	t	2026-06-11 17:17:23.865236
142	6	Рецензент отклонил доклад «123». Требуется решение программного комитета.	t	2026-06-11 17:21:19.686211
145	7	Ваш доклад «123» окончательно отклонён после 3 попыток.	t	2026-06-11 17:22:22.761588
113	15	Рецензент отклонил доклад «Доклад 2». Требуется решение программного комитета.	f	2026-05-29 22:16:18.386159
115	1	Рецензент отклонил доклад «Доклад 2». Требуется решение программного комитета.	f	2026-05-29 22:16:18.39809
118	15	Рецензент отклонил доклад «Доклад 2». Требуется решение программного комитета.	f	2026-05-29 22:17:35.082617
120	1	Рецензент отклонил доклад «Доклад 2». Требуется решение программного комитета.	f	2026-05-29 22:17:35.084461
123	15	Рецензент принял доклад «Доклад 2». Требуется решение программного комитета.	f	2026-05-29 22:18:21.864899
125	1	Рецензент принял доклад «Доклад 2». Требуется решение программного комитета.	f	2026-05-29 22:18:21.867022
111	7	Программный комитет направил вам рецензию по докладу «Доклад 1». Причина: Статья может быть рекомендована для печати после устранения замечаний. Комментарий: 1. Соответствует содержание статьи ее названию?\nОтвет: \n\n2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?\nОтвет: \n\n3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?\nОтвет: \n\n4. Обоснована в статье актуальность научной проблемы?\nОтвет: \n\n5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?\nОтвет: \n\n6. Корректно сформулированы выводы?\nОтвет: \n\n7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?\nОтвет: \n\n8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?\nОтвет: \n\n9. В чем заключается научная и/или практическая значимость?\nОтвет: \n\n10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?\nОтвет: \n\n11. В статье есть ошибочные утверждения?\nОтвет: \n\n12. Дополнительные замечания и комментарии по тексту статьи\nОтвет: \n\nЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА:\nСтатья может быть рекомендована для печати после устранения замечаний Пожалуйста, исправьте и отправьте повторно.	t	2026-05-29 21:52:41.262118
127	7	Ваш доклад «Доклад 2» принят! Поздравляем!	t	2026-05-29 22:19:00.192111
116	4	Рецензент отклонил доклад «Доклад 2». Требуется решение программного комитета.	t	2026-05-29 22:16:18.398641
121	4	Рецензент отклонил доклад «Доклад 2». Требуется решение программного комитета.	t	2026-05-29 22:17:35.085019
126	4	Рецензент принял доклад «Доклад 2». Требуется решение программного комитета.	t	2026-05-29 22:18:21.867619
114	6	Рецензент отклонил доклад «Доклад 2». Требуется решение программного комитета.	t	2026-05-29 22:16:18.397537
119	6	Рецензент отклонил доклад «Доклад 2». Требуется решение программного комитета.	t	2026-05-29 22:17:35.083934
124	6	Рецензент принял доклад «Доклад 2». Требуется решение программного комитета.	t	2026-05-29 22:18:21.866217
112	7	Программный комитет направил вам рецензию по докладу «Доклад 1». Причина: Статья может быть рекомендована для печати после устранения замечаний. Комментарий: 1. Соответствует содержание статьи ее названию?\nОтвет: \n\n2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?\nОтвет: \n\n3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?\nОтвет: \n\n4. Обоснована в статье актуальность научной проблемы?\nОтвет: \n\n5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?\nОтвет: \n\n6. Корректно сформулированы выводы?\nОтвет: \n\n7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?\nОтвет: \n\n8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?\nОтвет: \n\n9. В чем заключается научная и/или практическая значимость?\nОтвет: \n\n10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?\nОтвет: \n\n11. В статье есть ошибочные утверждения?\nОтвет: \n\n12. Дополнительные замечания и комментарии по тексту статьи\nОтвет: \n\nЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА:\nСтатья может быть рекомендована для печати после устранения замечаний Пожалуйста, исправьте и отправьте повторно.	t	2026-05-29 21:52:42.076367
117	7	Программный комитет направил вам рецензию по докладу «Доклад 2». Причина: Статья может быть рекомендована для печати после устранения замечаний. Комментарий: 1. Соответствует содержание статьи ее названию?\nОтвет: \n\n2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?\nОтвет: \n\n3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?\nОтвет: \n\n4. Обоснована в статье актуальность научной проблемы?\nОтвет: \n\n5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?\nОтвет: \n\n6. Корректно сформулированы выводы?\nОтвет: \n\n7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?\nОтвет: \n\n8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?\nОтвет: \n\n9. В чем заключается научная и/или практическая значимость?\nОтвет: \n\n10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?\nОтвет: \n\n11. В статье есть ошибочные утверждения?\nОтвет: \n\n12. Дополнительные замечания и комментарии по тексту статьи\nОтвет: \n\nЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА:\nСтатья может быть рекомендована для печати после устранения замечаний Пожалуйста, исправьте и отправьте повторно.	t	2026-05-29 22:16:39.891803
122	7	Программный комитет направил вам рецензию по докладу «Доклад 2». Причина: Статья может быть рекомендована для печати после устранения замечаний. Комментарий: 1. Соответствует содержание статьи ее названию?\nОтвет: \n\n2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?\nОтвет: \n\n3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?\nОтвет: \n\n4. Обоснована в статье актуальность научной проблемы?\nОтвет: \n\n5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?\nОтвет: \n\n6. Корректно сформулированы выводы?\nОтвет: \n\n7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?\nОтвет: \n\n8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?\nОтвет: \n\n9. В чем заключается научная и/или практическая значимость?\nОтвет: \n\n10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?\nОтвет: \n\n11. В статье есть ошибочные утверждения?\nОтвет: \n\n12. Дополнительные замечания и комментарии по тексту статьи\nОтвет: \n\nЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА:\nСтатья может быть рекомендована для печати после устранения замечаний Пожалуйста, исправьте и отправьте повторно.	t	2026-05-29 22:17:48.351714
129	15	Рецензент отклонил доклад «123». Требуется решение программного комитета.	f	2026-06-11 17:15:37.532115
131	1	Рецензент отклонил доклад «123». Требуется решение программного комитета.	f	2026-06-11 17:15:37.544126
132	4	Рецензент отклонил доклад «123». Требуется решение программного комитета.	f	2026-06-11 17:15:37.544686
135	15	Рецензент отклонил доклад «123». Требуется решение программного комитета.	f	2026-06-11 17:17:23.863834
137	1	Рецензент отклонил доклад «123». Требуется решение программного комитета.	f	2026-06-11 17:17:23.865752
138	4	Рецензент отклонил доклад «123». Требуется решение программного комитета.	f	2026-06-11 17:17:23.866318
134	3	Автор прислал исправленную версию доклада «123». Требуется повторная рецензия.	t	2026-06-11 17:17:05.134739
141	15	Рецензент отклонил доклад «123». Требуется решение программного комитета.	f	2026-06-11 17:21:19.684879
128	7	Назначено время выступления для доклада «Доклад 2»: 6 июня 2026 г., 12:00 (30 мин.)	t	2026-05-29 22:37:50.266585
133	7	Программный комитет направил вам рецензию по докладу «123». Причина: Статья может быть рекомендована для печати после устранения замечаний. Комментарий: 1. Соответствует содержание статьи ее названию?\nОтвет: \n\n2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?\nОтвет: \n\n3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?\nОтвет: \n\n4. Обоснована в статье актуальность научной проблемы?\nОтвет: \n\n5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?\nОтвет: \n\n6. Корректно сформулированы выводы?\nОтвет: \n\n7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?\nОтвет: \n\n8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?\nОтвет: \n\n9. В чем заключается научная и/или практическая значимость?\nОтвет: \n\n10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?\nОтвет: \n\n11. В статье есть ошибочные утверждения?\nОтвет: \n\n12. Дополнительные замечания и комментарии по тексту статьи\nОтвет: \n\nЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА:\nСтатья может быть рекомендована для печати после устранения замечаний Пожалуйста, исправьте и отправьте повторно.	t	2026-06-11 17:16:04.245768
139	7	Программный комитет направил вам рецензию по докладу «123». Причина: Статья может быть рекомендована для печати после устранения замечаний. Комментарий: 1. Соответствует содержание статьи ее названию?\nОтвет: \n\n2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?\nОтвет: \n\n3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?\nОтвет: \n\n4. Обоснована в статье актуальность научной проблемы?\nОтвет: \n\n5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?\nОтвет: \n\n6. Корректно сформулированы выводы?\nОтвет: \n\n7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?\nОтвет: \n\n8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?\nОтвет: \n\n9. В чем заключается научная и/или практическая значимость?\nОтвет: \n\n10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?\nОтвет: \n\n11. В статье есть ошибочные утверждения?\nОтвет: \n\n12. Дополнительные замечания и комментарии по тексту статьи\nОтвет: \n\nЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА:\nСтатья может быть рекомендована для печати после устранения замечаний Пожалуйста, исправьте и отправьте повторно.	t	2026-06-11 17:17:52.937086
\.


--
-- Data for Name: review_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.review_assignments (id, submission_id, reviewer_id, assigned_at, status) FROM stdin;
1	30	3	2026-05-26 23:37:03.617794	completed
5	32	3	2026-05-28 00:40:30.785147	completed
6	33	3	2026-05-28 00:51:28.744356	completed
13	36	3	2026-05-28 01:40:33.726243	completed
12	35	3	2026-05-28 01:02:07.571355	completed
15	37	3	2026-05-28 22:47:27.623387	completed
14	38	3	2026-05-28 22:47:26.666587	completed
16	40	3	2026-05-29 21:46:27.497105	completed
17	41	3	2026-05-29 21:51:28.432018	completed
18	42	3	2026-05-29 22:15:41.818788	completed
19	43	3	2026-06-11 17:15:19.420964	completed
20	44	3	2026-06-11 17:39:39.908789	in_progress
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, submission_id, reviewer_id, version_number, decision, rejection_reason, comment, created_at) FROM stdin;
1	30	3	1	rejected	Несоответствие тематике конференции	\N	2026-05-26 23:37:30.609617
2	30	3	3	accepted	\N	\N	2026-05-26 23:44:05.707674
3	32	3	1	rejected	Несоответствие тематике конференции	\N	2026-05-28 00:41:20.827372
4	32	3	2	rejected	Ошибки в методологии	\N	2026-05-28 00:47:20.109971
5	32	3	3	accepted	\N	\N	2026-05-28 00:49:10.317124
6	33	3	1	rejected	Недостаточная научная новизна	\N	2026-05-28 00:51:43.554472
7	33	3	2	accepted	\N	\N	2026-05-28 00:53:13.533513
9	36	3	1	rejected	Статья может быть рекомендована для печати после устранения замечаний	1. Соответствует содержание статьи ее названию?\nОтвет: \n\n2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?\nОтвет: \n\n3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?\nОтвет: \n\n4. Обоснована в статье актуальность научной проблемы?\nОтвет: \n\n5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?\nОтвет: \n\n6. Корректно сформулированы выводы?\nОтвет: \n\n7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?\nОтвет: \n\n8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?\nОтвет: \n\n9. В чем заключается научная и/или практическая значимость?\nОтвет: \n\n10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?\nОтвет: \n\n11. В статье есть ошибочные утверждения?\nОтвет: \n\n12. Дополнительные замечания и комментарии по тексту статьи\nОтвет: \n\nЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА:\nСтатья может быть рекомендована для печати после устранения замечаний	2026-05-28 22:45:15.608204
10	35	3	1	accepted	\N	1. Соответствует содержание статьи ее названию?\nОтвет: \n\n2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?\nОтвет: \n\n3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?\nОтвет: \n\n4. Обоснована в статье актуальность научной проблемы?\nОтвет: \n\n5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?\nОтвет: \n\n6. Корректно сформулированы выводы?\nОтвет: \n\n7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?\nОтвет: \n\n8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?\nОтвет: \n\n9. В чем заключается научная и/или практическая значимость?\nОтвет: \n\n10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?\nОтвет: \n\n11. В статье есть ошибочные утверждения?\nОтвет: \n\n12. Дополнительные замечания и комментарии по тексту статьи\nОтвет: \n\nЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА:\nСтатья рекомендуется для печати в представленном виде	2026-05-28 22:46:00.102289
11	37	3	1	rejected	Требуется значительная переработка статьи и повторное рецензирование	1. Соответствует содержание статьи ее названию?\nОтвет: \n\n2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?\nОтвет: \n\n3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?\nОтвет: \n\n4. Обоснована в статье актуальность научной проблемы?\nОтвет: \n\n5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?\nОтвет: \n\n6. Корректно сформулированы выводы?\nОтвет: \n\n7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?\nОтвет: \n\n8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?\nОтвет: \n\n9. В чем заключается научная и/или практическая значимость?\nОтвет: \n\n10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?\nОтвет: \n\n11. В статье есть ошибочные утверждения?\nОтвет: \n\n12. Дополнительные замечания и комментарии по тексту статьи\nОтвет: \n\nЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА:\nТребуется значительная переработка статьи и повторное рецензирование	2026-05-28 22:47:40.984404
12	38	3	1	rejected	Статья не рекомендуется для печати	1. Соответствует содержание статьи ее названию?\nОтвет: \n\n2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?\nОтвет: \n\n3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?\nОтвет: \n\n4. Обоснована в статье актуальность научной проблемы?\nОтвет: \n\n5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?\nОтвет: \n\n6. Корректно сформулированы выводы?\nОтвет: \n\n7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?\nОтвет: \n\n8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?\nОтвет: \n\n9. В чем заключается научная и/или практическая значимость?\nОтвет: \n\n10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?\nОтвет: \n\n11. В статье есть ошибочные утверждения?\nОтвет: \n\n12. Дополнительные замечания и комментарии по тексту статьи\nОтвет: \n\nЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА:\nСтатья не рекомендуется для печати	2026-05-28 22:47:52.453801
13	40	3	1	rejected	Статья может быть рекомендована для печати после устранения замечаний	1. Соответствует содержание статьи ее названию?\nОтвет: \n\n2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?\nОтвет: \n\n3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?\nОтвет: \n\n4. Обоснована в статье актуальность научной проблемы?\nОтвет: \n\n5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?\nОтвет: \n\n6. Корректно сформулированы выводы?\nОтвет: \n\n7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?\nОтвет: \n\n8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?\nОтвет: \n\n9. В чем заключается научная и/или практическая значимость?\nОтвет: \n\n10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?\nОтвет: \n\n11. В статье есть ошибочные утверждения?\nОтвет: \n\n12. Дополнительные замечания и комментарии по тексту статьи\nОтвет: \n\nЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА:\nСтатья может быть рекомендована для печати после устранения замечаний	2026-05-29 21:46:54.391467
14	41	3	1	rejected	Статья может быть рекомендована для печати после устранения замечаний	1. Соответствует содержание статьи ее названию?\nОтвет: \n\n2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?\nОтвет: \n\n3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?\nОтвет: \n\n4. Обоснована в статье актуальность научной проблемы?\nОтвет: \n\n5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?\nОтвет: \n\n6. Корректно сформулированы выводы?\nОтвет: \n\n7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?\nОтвет: \n\n8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?\nОтвет: \n\n9. В чем заключается научная и/или практическая значимость?\nОтвет: \n\n10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?\nОтвет: \n\n11. В статье есть ошибочные утверждения?\nОтвет: \n\n12. Дополнительные замечания и комментарии по тексту статьи\nОтвет: \n\nЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА:\nСтатья может быть рекомендована для печати после устранения замечаний	2026-05-29 21:52:21.074777
15	42	3	1	rejected	Статья может быть рекомендована для печати после устранения замечаний	1. Соответствует содержание статьи ее названию?\nОтвет: \n\n2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?\nОтвет: \n\n3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?\nОтвет: \n\n4. Обоснована в статье актуальность научной проблемы?\nОтвет: \n\n5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?\nОтвет: \n\n6. Корректно сформулированы выводы?\nОтвет: \n\n7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?\nОтвет: \n\n8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?\nОтвет: \n\n9. В чем заключается научная и/или практическая значимость?\nОтвет: \n\n10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?\nОтвет: \n\n11. В статье есть ошибочные утверждения?\nОтвет: \n\n12. Дополнительные замечания и комментарии по тексту статьи\nОтвет: \n\nЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА:\nСтатья может быть рекомендована для печати после устранения замечаний	2026-05-29 22:16:18.382017
16	42	3	2	rejected	Статья может быть рекомендована для печати после устранения замечаний	1. Соответствует содержание статьи ее названию?\nОтвет: \n\n2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?\nОтвет: \n\n3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?\nОтвет: \n\n4. Обоснована в статье актуальность научной проблемы?\nОтвет: \n\n5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?\nОтвет: \n\n6. Корректно сформулированы выводы?\nОтвет: \n\n7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?\nОтвет: \n\n8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?\nОтвет: \n\n9. В чем заключается научная и/или практическая значимость?\nОтвет: \n\n10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?\nОтвет: \n\n11. В статье есть ошибочные утверждения?\nОтвет: \n\n12. Дополнительные замечания и комментарии по тексту статьи\nОтвет: \n\nЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА:\nСтатья может быть рекомендована для печати после устранения замечаний	2026-05-29 22:17:35.068479
17	42	3	3	accepted	\N	1. Соответствует содержание статьи ее названию?\nОтвет: \n\n2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?\nОтвет: \n\n3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?\nОтвет: \n\n4. Обоснована в статье актуальность научной проблемы?\nОтвет: \n\n5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?\nОтвет: \n\n6. Корректно сформулированы выводы?\nОтвет: \n\n7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?\nОтвет: \n\n8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?\nОтвет: \n\n9. В чем заключается научная и/или практическая значимость?\nОтвет: \n\n10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?\nОтвет: \n\n11. В статье есть ошибочные утверждения?\nОтвет: \n\n12. Дополнительные замечания и комментарии по тексту статьи\nОтвет: \n\nЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА:\nСтатья рекомендуется для печати в представленном виде	2026-05-29 22:18:21.85326
18	43	3	1	rejected	Статья может быть рекомендована для печати после устранения замечаний	1. Соответствует содержание статьи ее названию?\nОтвет: \n\n2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?\nОтвет: \n\n3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?\nОтвет: \n\n4. Обоснована в статье актуальность научной проблемы?\nОтвет: \n\n5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?\nОтвет: \n\n6. Корректно сформулированы выводы?\nОтвет: \n\n7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?\nОтвет: \n\n8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?\nОтвет: \n\n9. В чем заключается научная и/или практическая значимость?\nОтвет: \n\n10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?\nОтвет: \n\n11. В статье есть ошибочные утверждения?\nОтвет: \n\n12. Дополнительные замечания и комментарии по тексту статьи\nОтвет: \n\nЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА:\nСтатья может быть рекомендована для печати после устранения замечаний	2026-06-11 17:15:37.515823
19	43	3	2	rejected	Статья может быть рекомендована для печати после устранения замечаний	1. Соответствует содержание статьи ее названию?\nОтвет: \n\n2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?\nОтвет: \n\n3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?\nОтвет: \n\n4. Обоснована в статье актуальность научной проблемы?\nОтвет: \n\n5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?\nОтвет: \n\n6. Корректно сформулированы выводы?\nОтвет: \n\n7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?\nОтвет: \n\n8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?\nОтвет: \n\n9. В чем заключается научная и/или практическая значимость?\nОтвет: \n\n10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?\nОтвет: \n\n11. В статье есть ошибочные утверждения?\nОтвет: \n\n12. Дополнительные замечания и комментарии по тексту статьи\nОтвет: \n\nЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА:\nСтатья может быть рекомендована для печати после устранения замечаний	2026-06-11 17:17:23.860213
20	43	3	3	rejected	Требуется значительная переработка статьи и повторное рецензирование	1. Соответствует содержание статьи ее названию?\nОтвет: \n\n2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?\nОтвет: \n\n3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?\nОтвет: \n\n4. Обоснована в статье актуальность научной проблемы?\nОтвет: \n\n5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?\nОтвет: \n\n6. Корректно сформулированы выводы?\nОтвет: \n\n7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?\nОтвет: \n\n8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?\nОтвет: \n\n9. В чем заключается научная и/или практическая значимость?\nОтвет: \n\n10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?\nОтвет: \n\n11. В статье есть ошибочные утверждения?\nОтвет: \n\n12. Дополнительные замечания и комментарии по тексту статьи\nОтвет: \n\nЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА:\nТребуется значительная переработка статьи и повторное рецензирование	2026-06-11 17:21:19.681071
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, name) FROM stdin;
3	participant
4	reviewer
5	program_committee
2	pc_admin
\.


--
-- Data for Name: schedule_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.schedule_items (id, submission_id, start_time, end_time, room) FROM stdin;
\.


--
-- Data for Name: sections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sections (id, title, conference_id, room, section_date, manager_ids, managers_text) FROM stdin;
1	Искусственный интеллект	1	\N	\N	{}	\N
2	Искусственный интеллект	1	\N	\N	{}	\N
3	Веб-технологии и дизайн	1	\N	\N	{}	\N
4	Кибербезопасность	1	\N	\N	{}	\N
11	Историческая секция	7	\N	\N	{}	\N
53	секция 1	13	222	2026-06-07	{}	Иванов И.И.
55	sec 3	13	212	\N	{}	dsfsd
5	ИИ в медецине	1	201	2025-12-17	{3}	\N
6	New	1	201	2025-12-18	{3}	\N
39	Секция 2	8	222	2026-05-22	{1}	\N
38	Секция 1	8	222	2026-05-21	{3}	\N
41	Секция 1	9	222	\N	{15,6}	\N
40	Секция 1	9	222	\N	{1}	\N
43	Sec 2	10	222	\N	{}	Петр П.П.
44	Sec 3	10	3	\N	{}	выаыв
45	Sec 4	10	22	\N	{}	2131
46	Sec 5	10	213	\N	{}	321
47	Sec 6 	10	123	\N	{}	123
42	Sec 1	10	222	2026-05-31	{}	Иван И.И.
48	sec 7 	10	dfs	\N	{}	fsd
49	sec 1	11	201	\N	{}	Иванов И.И.
50	Sec 2	11	222	\N	{}	Петров И.И., Иванов И.И.
51	секция 1	12	222	\N	{}	Иванов И.И.
52	Секция 2	12	222	\N	{}	Петров И.И., Иванов И.И.
54	секция 2	13	222	\N	{}	Петров И.И., Иванов И.И.
\.


--
-- Data for Name: submission_versions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.submission_versions (id, submission_id, version_number, file_url, title, abstract, uploaded_at, is_current) FROM stdin;
1	30	1	/uploads/1779709703205-575354775.docx	123	123	2026-05-26 23:37:30.606865	f
2	30	2	/uploads/1779824275938-630694792.docx	123	123	2026-05-26 23:37:56.094507	f
3	30	3	/uploads/1779824619748-255304150.docx	123	123	2026-05-26 23:43:39.812044	t
4	32	1	/uploads/1779913424849-762519991.docx	123	123	2026-05-28 00:41:20.824841	f
5	32	2	/uploads/1779914816749-182508364.docx	123	123	2026-05-28 00:46:56.759555	f
6	32	3	/uploads/1779914908336-49659987.docx	123	123	2026-05-28 00:48:28.34274	t
7	33	1	/uploads/1779915058979-584652867.docx	222222222	222222222	2026-05-28 00:51:43.552995	f
8	33	2	/uploads/1779915181553-881813225.docx	222222222	222222222	2026-05-28 00:53:01.606664	t
10	36	1	/uploads/1779917756586-370308944.docx	dfsaf	sdfsdf	2026-05-28 22:45:15.589952	t
11	35	1	/uploads/1779915715286-544206662.docx	праавыр	аыпаываыв	2026-05-28 22:46:00.100703	t
12	37	1	/uploads/1779994020368-138586597.docx	213	321	2026-05-28 22:47:40.983001	t
13	38	1	/uploads/1779994036236-132315949.docx	dsfasfs	fdsaff	2026-05-28 22:47:52.452449	t
14	40	1	/uploads/1780076728680-690251038.docx	ДОКЛАД 1		2026-05-29 21:46:54.378849	t
15	41	1	/uploads/1780077012681-815639467.docx	Доклад 1	123	2026-05-29 21:52:21.073449	t
16	42	1	/uploads/1780078496416-860062680.docx	Доклад 2	123	2026-05-29 22:16:18.380475	f
17	42	2	/uploads/1780078618140-822943903.docx	Доклад 2	123	2026-05-29 22:16:58.146197	f
18	42	3	/uploads/1780078680239-892675270.docx	Доклад 2	123	2026-05-29 22:18:00.247261	t
19	43	1	/uploads/1781183626123-551812453.docx	123	213	2026-06-11 17:15:37.513283	f
20	43	2	/uploads/1781183787113-677757392.docx	123	213	2026-06-11 17:16:27.121481	f
21	43	3	/uploads/1781183896814-715649601.docx	123	213	2026-06-11 17:18:16.820671	t
\.


--
-- Data for Name: submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.submissions (id, title, abstract, file_url, status, user_id, section_id, created_at, start_time, duration, advisor_name, advisor_email, advisor_is_author, payment_status, coauthors_list, rejection_count, reviewer_id, current_version) FROM stdin;
1	Доклад1	\N	/uploads/1765709621059-372434773.docx	pending	3	1	2025-12-14 14:53:41.142661	\N	30	\N	\N	f	unpaid	[]	0	\N	1
3	ИИ	\N	/uploads/1765716202498-883065271.docx	pending	5	1	2025-12-14 16:43:22.602322	\N	30	\N	\N	f	unpaid	[]	0	\N	1
10	Архивный доклад 2023 года	Тестовое описание старого доклада для проверки архива.	/uploads/fake_archive_file.docx	accepted	1	11	2023-05-21 10:00:00	\N	30	\N	\N	f	unpaid	[]	0	\N	1
12	название1	аннотация1	/uploads/1765735971064-481813498.docx	accepted	5	5	2025-12-14 22:12:51.15437	2025-12-16 14:30:00	30	\N	\N	f	unpaid	[]	0	\N	1
13	new	nenene	/uploads/1765736031103-423272472.docx	accepted	5	6	2025-12-14 22:13:51.188327	2025-12-17 12:00:00	30	\N	\N	f	unpaid	[]	0	\N	1
35	праавыр	аыпаываыв	/uploads/1779915715286-544206662.docx	accepted	7	44	2026-05-28 01:01:55.38008	\N	30	выаыв	dsfsf@mail.ru	f	unpaid	[]	0	3	1
37	213	321	/uploads/1779994020368-138586597.docx	revision_requested	7	46	2026-05-28 22:47:00.49829	\N	30	sdfs	dfs@mail.ru	f	unpaid	[]	1	3	1
38	dsfasfs	fdsaff	/uploads/1779994036236-132315949.docx	revision_requested	7	47	2026-05-28 22:47:16.29272	\N	30	sdfsaf	fsdaf@mail.ru	f	unpaid	[]	1	3	1
39	dsfa	afsd	/uploads/1779994512448-437380492.docx	pending	7	48	2026-05-28 22:55:12.453227	\N	30	dfsf	dasd@mail.ru	f	unpaid	[]	0	\N	1
32	123	123	/uploads/1779914908336-49659987.docx	accepted	7	42	2026-05-28 00:48:28.343533	2026-05-28 12:20:00	30	выафв	sdfsdfsd@mail.ru	f	paid	[]	2	3	3
29	Доклад		/uploads/1779259682936-620469264.docx	published	7	38	2026-05-20 10:48:12.0058	2026-05-20 15:00:00	10	Иванов И.И.	ivanov@mail.ru	f	paid	["Петров И.И."]	0	\N	1
44	dsfsd	fsdsdf	/uploads/1781185134745-191778204.docx	under_review	7	55	2026-06-11 17:38:54.801722	\N	30	dfsfsd	dsfsd@mail.ru	f	unpaid	[]	0	3	1
33	222222222	222222222	/uploads/1779915181553-881813225.docx	accepted	7	43	2026-05-28 00:53:01.60751	\N	30	2222222	sda@mail.ru	f	unpaid	[]	1	3	2
30	123	123	/uploads/1779824619748-255304150.docx	accepted	7	39	2026-05-26 23:43:39.815152	\N	30	213	213@mail.ru	f	unpaid	[]	1	3	3
31	222222	dfsfs	/uploads/1779826288435-695540746.docx	pending	7	41	2026-05-27 00:11:28.520161	\N	30	dfsfsd	dsfsd@mail.ru	f	unpaid	[]	0	\N	1
40	ДОКЛАД 1		/uploads/1780076858219-179290199.docx	pending	7	49	2026-05-29 21:47:38.295569	\N	30	Иванов И.И.	SDGSFG@mail.ru	f	unpaid	[]	1	3	1
43	efsd	sdfsdf	/uploads/1781185523927-147377758.docx	final_rejected	7	54	2026-06-11 17:45:24.020702	\N	30	sadfas	dasf@mail.ru	f	unpaid	[]	3	3	3
42	Доклад 2	123	/uploads/1780078680239-892675270.docx	accepted	7	53	2026-05-29 22:18:00.248174	2026-06-06 12:00:00	30	Иванов И.И.	kdfsolksf@mail.ru	f	paid	[]	2	3	3
36	dfsaf	sdfsdf	/uploads/1779917756586-370308944.docx	reviewed	7	45	2026-05-28 01:35:56.663096	\N	30	sdfsdf	fds@mail.ru	f	unpaid	[]	0	3	1
41	Доклад 1	123	/uploads/1780077012681-815639467.docx	revision_requested	7	51	2026-05-29 21:50:12.861512	\N	30	Иванов И.И.	SDFSAF@mail.ru	f	unpaid	[]	1	3	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, last_name, first_name, middle_name, phone_number, country, city, institution, faculty, study_direction, academic_status, role_id, created_at, is_verified, verification_token) FROM stdin;
5	artem@mail.ru	$2b$10$pU0IQCbrlk3B3WFnR8F2AOEwd3j8V/ee1Y9wVZrG2ODAWuQ/5l/hO	Алешин	Артем	Алексеевич	+79541235422	Россия	Саратов	СГТУ им. Гагарина Ю.А.	ИНПИТ	ПИНЖ	Студент	3	2025-12-14 16:17:41.333012	f	\N
2	student@kpu.ru	hash_123	Студентов	Петр	Петрович	\N	\N	\N	СГТУ	\N	\N	Студент	3	2025-12-14 13:27:08.740371	f	\N
12	dexpes16004@gmail.com	$2b$10$TSmXMCXkICnsnrluIoInReP1Mf/jZhKCzKe5pNaeK3FcqUDWGbJ.W	Фадеев	Федор	Алексеевич	79099099999	Россия	Саратов	СГТУ им. Гагарина Ю.А.	инпит	пинж	Студент	3	2026-05-03 19:34:07.655593	t	\N
13	sh1kors2@mail.ru	$2b$10$qhKdhL0G1bZaiyKc3zJNZOAjU3DSogDpxviUh2VX4jDGuuprOYCpG	Фадеев324	324Федор	Алексеевич	79099099999	Россия	Саратов	СГТУ им. Гагарина Ю.А.	инпит	пинж	Студент	3	2026-05-03 19:42:45.361358	f	c92436ab1fa2fa8ba21f814713faba91ed11181761c8ce4297fd897228dc0e52
3	lesin.vadimka@list.ru	$2b$10$WlAWnj6Ogb0c0otB6jZcDODVG3sttBq85p8xkvx6OVXOwNNoPHbAq	Лесин	Вадим	Евгеньевич	+79518812389	Россия	Саратов	СГТУ им. Гагарина Ю.А.	Институт прикладных информационныъ технологий	Программная инженерия	Студент	4	2025-12-14 14:04:36.287357	t	37c00a677d6f1ebc321e2d570a0418aaa5e0a4091e61eb04810c38e8ce9f76f5
15	sh1kors4@mail.ru	$2b$10$37iizst8lL9LjXoiWGKHRuI7n3hSHrso4PvEuT3GCwVaWcKEA2oGG	екнкр	акрке	Алексеевич	79099099999	Россия	Саратов	СГТУ им. Гагарина Ю.А.	рппь	аооа	Студент	5	2026-05-03 19:46:12.896062	t	283417fa87311e55ea9f3878417ffbe9c002fd6210b2c5d27eaeceb56326654b
14	sh1kors3@mail.ru	$2b$10$xfabR6LNGkMM3pnroLHVteqfssh.wIFnxJq52gHhhzzJzro7uq1MC	екнкр	акрке	Алексеевич	79099099999	Россия	Саратов	СГТУ им. Гагарина Ю.А.	рппь	аооа	Студент	3	2026-05-03 19:45:35.362106	t	07798adcc2118c43f1a1750aed16af45508ee68898c100168770de6f6a61f12a
6	ivan@mail.ru	$2b$10$bdidQBqZlEtkaJRE0fVoP.ZueuBqzLNmVGJa.3xMvEdFC1nIN4kMe	Иванов	Иван	Иванович		Россия	Саратов	СГТУ им. Гагарина Ю.А.	Инпит	ПИНЖ	Студент	5	2025-12-21 18:14:33.341165	t	\N
1	admin@kpu.ru	hash_123	Админов	Иван	Иванович	\N	\N	\N	\N	\N	\N	\N	5	2025-12-14 13:27:08.740371	f	\N
4	org@mail.ru	$2b$10$yiQOAjm/DcsrWBtbmbmu0O5MKvgN5BPnSsPguy0aJdVTI2uX2Ah9O	Иванов	Иван	Петрович	+79999999999	Россия	Саратов	СГТУ им. Гагарина Ю.А.	ИНПИТ	ПИНЖ	Преподаватель	2	2025-12-14 15:17:22.012682	t	\N
7	sh1kors1@mail.ru	$2b$10$T/1D6LNNAtqvlk4aEomH1eKWSe5vRfYtSSRDOCHdVzavns6sqX8j.	Сергеев	Дмитрий	Иванов	+79093379736	Россия	Саратов	СГТУ им. Гагарина Ю.А.	Инпит	ПИНЖ	Студент	3	2026-05-02 16:37:21.882907	t	\N
\.


--
-- Name: conferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.conferences_id_seq', 13, true);


--
-- Name: news_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.news_id_seq', 11, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 145, true);


--
-- Name: review_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.review_assignments_id_seq', 20, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reviews_id_seq', 20, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_seq', 3, true);


--
-- Name: schedule_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.schedule_items_id_seq', 1, false);


--
-- Name: sections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sections_id_seq', 55, true);


--
-- Name: submission_versions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.submission_versions_id_seq', 21, true);


--
-- Name: submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.submissions_id_seq', 44, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 15, true);


--
-- Name: conferences conferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conferences
    ADD CONSTRAINT conferences_pkey PRIMARY KEY (id);


--
-- Name: news news_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: review_assignments review_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_assignments
    ADD CONSTRAINT review_assignments_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: schedule_items schedule_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_items
    ADD CONSTRAINT schedule_items_pkey PRIMARY KEY (id);


--
-- Name: sections sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_pkey PRIMARY KEY (id);


--
-- Name: submission_versions submission_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submission_versions
    ADD CONSTRAINT submission_versions_pkey PRIMARY KEY (id);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_review_assignment_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_review_assignment_unique ON public.review_assignments USING btree (submission_id, reviewer_id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: review_assignments review_assignments_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_assignments
    ADD CONSTRAINT review_assignments_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id);


--
-- Name: review_assignments review_assignments_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_assignments
    ADD CONSTRAINT review_assignments_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id);


--
-- Name: reviews reviews_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id) ON DELETE CASCADE;


--
-- Name: schedule_items schedule_items_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_items
    ADD CONSTRAINT schedule_items_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id) ON DELETE CASCADE;


--
-- Name: sections sections_conference_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_conference_id_fkey FOREIGN KEY (conference_id) REFERENCES public.conferences(id) ON DELETE CASCADE;


--
-- Name: submission_versions submission_versions_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submission_versions
    ADD CONSTRAINT submission_versions_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id);


--
-- Name: submissions submissions_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON DELETE SET NULL;


--
-- Name: submissions submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict KC9R1qHjY5hLImN09ANiCavtVL5yd7mELKgwldBZj064URGL1IzDkMg50Dhkh8j

