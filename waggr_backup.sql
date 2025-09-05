--
-- PostgreSQL database dump
--

\restrict a556JgYSkZxTw6CpWZiwBcQb8WXcjmhebTldEszrjHquGUrXObdX0hYy0UHVpdx

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 14.19 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    username character varying(25) NOT NULL,
    dog_id integer NOT NULL,
    start_at timestamp with time zone NOT NULL,
    duration_minutes integer NOT NULL,
    status text NOT NULL,
    notes text,
    CONSTRAINT bookings_duration_minutes_check CHECK ((duration_minutes > 0)),
    CONSTRAINT bookings_status_check CHECK ((status = ANY (ARRAY['requested'::text, 'approved'::text, 'declined'::text, 'cancelled'::text, 'completed'::text])))
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- Name: dogs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dogs (
    id integer NOT NULL,
    petfinder_id text,
    name text NOT NULL,
    age_years integer,
    breed text,
    house_trained boolean,
    health text,
    description text,
    photo_url text,
    shelter_handle character varying(25) NOT NULL,
    CONSTRAINT dogs_age_years_check CHECK ((age_years >= 0))
);


ALTER TABLE public.dogs OWNER TO postgres;

--
-- Name: dogs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dogs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dogs_id_seq OWNER TO postgres;

--
-- Name: dogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dogs_id_seq OWNED BY public.dogs.id;


--
-- Name: matches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.matches (
    id integer NOT NULL,
    username character varying(25) NOT NULL,
    dog_id integer NOT NULL,
    status text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT matches_status_check CHECK ((status = ANY (ARRAY['liked'::text, 'passed'::text, 'bookmarked'::text, 'matched'::text])))
);


ALTER TABLE public.matches OWNER TO postgres;

--
-- Name: matches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.matches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.matches_id_seq OWNER TO postgres;

--
-- Name: matches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.matches_id_seq OWNED BY public.matches.id;


--
-- Name: shelters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shelters (
    handle character varying(25) NOT NULL,
    name text NOT NULL,
    num_employees integer,
    description text NOT NULL,
    logo_url text,
    CONSTRAINT shelters_handle_check CHECK (((handle)::text = lower((handle)::text))),
    CONSTRAINT shelters_num_employees_check CHECK ((num_employees >= 0))
);


ALTER TABLE public.shelters OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    username character varying(25) NOT NULL,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_check CHECK ((POSITION(('@'::text) IN (email)) > 1)),
    CONSTRAINT users_username_check CHECK (((username)::text = lower((username)::text)))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: dogs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dogs ALTER COLUMN id SET DEFAULT nextval('public.dogs_id_seq'::regclass);


--
-- Name: matches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches ALTER COLUMN id SET DEFAULT nextval('public.matches_id_seq'::regclass);


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (username, dog_id, start_at, duration_minutes, status, notes) FROM stdin;
testadmin	5	2025-08-21 09:27:25.884567-07	30	completed	Rocky was calm and friendly
\.


--
-- Data for Name: dogs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dogs (id, petfinder_id, name, age_years, breed, house_trained, health, description, photo_url, shelter_handle) FROM stdin;
1	pf_1001	Buddy	2	Golden Retriever	t	Vaccinated, Neutered	Friendly and loves long walks.	/photos/dog1.png	happy-paws
2	pf_1002	Luna	1	German Shepherd	t	Vaccinated	Energetic and needs an active owner.	/photos/dog2.png	second-chance
3	pf_1003	Milo	4	Beagle	f	Vaccinated	Sweet but still learning house manners.	/photos/dog3.png	city-shelter
4	pf_1004	Daisy	3	Labrador Mix	t	Spayed, Vaccinated	Gentle with kids and loves to play fetch.	/photos/dog3.png	green-haven
5	pf_1005	Rocky	5	Bulldog	t	Neutered	Chill personality, great for apartments.	/photos/dog4.png	pup-place
6	pf_1006	Bella	2	Border Collie	t	Vaccinated	High-energy herding dog, very smart.	/photos/dog5.png	happy-paws
7	pf_1007	Max	7	Poodle	t	Neutered, Vaccinated	Senior dog looking for a calm home.	/photos/dog6.png	second-chance
\.


--
-- Data for Name: matches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.matches (id, username, dog_id, status, created_at) FROM stdin;
3	testadmin	1	matched	2025-08-18 09:27:25.874553-07
4	testadmin	3	bookmarked	2025-08-18 09:27:25.874553-07
\.


--
-- Data for Name: shelters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shelters (handle, name, num_employees, description, logo_url) FROM stdin;
happy-paws	Happy Paws Rescue	25	Small rescue dedicated to rehoming dogs in need.	/logos/logo1.png
second-chance	Second Chance Shelter	40	Giving dogs a second chance at life.	/logos/logo2.png
city-shelter	City Animal Shelter	100	Municipal shelter serving the metro area.	/logos/logo3.png
green-haven	Green Haven Rescue	15	Eco-friendly shelter focused on sustainable pet care.	/logos/logo4.png
pup-place	The Pup Place	8	Boutique shelter for small dog breeds.	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (username, password, first_name, last_name, email, is_admin) FROM stdin;
testadmin	$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q	Test	Admin	admin@example.com	t
tess.testington	$2b$12$IWgEd4IWEfjOOhJ.GL33.usJn5FZe6qdWmDwU5NCAy9oneqUXQBgC	Tess	Testington	tess@testington.com	f
chilldude	$2b$12$oKIw9tutO5UN4ry0kMSrQ.ZJrCqimQR8swf6VSxmyPcK7KwZS3/5m	Lewis	Stone	chilldude@chilldude.com	f
calmman	$2b$12$ueM2MZtgGNrSceTQxPuQeuWWoiIAI9//ITXas54DtIWr6M1EjC18.	Lewis	Stone	calmman@calmman.com	f
dogdude	$2b$12$EIBqjhlKqAuskzoH8Fi0OOgD9KhM6dkEYX5EYYusG20JBtPIG.WvK	Lewis	Stone	dogdude@dogdude.com	f
noobmaster	$2b$12$CjSKDxoPnWbXlrG1EMxbBOs.YMAxSWluH/l9EHT62Z3y3T82pO3Pe	John	Stone	lewis.r.stone@gmail.com	f
jesttestuser	$2b$12$X8zmx56rnYAL2FuBB5hpIuTnZaGu9ZQMa/IFpoyhqbMEgnDQkqO1O	Jest	Test	jesttest@example.com	f
noobmaster1	$2b$12$9TWDTe5AgM0aQl6yYxZvheY5SMr94Te3MmYUEK1mS8Pgd3AZYeyPm	Lewis	Stone	noobmaster1@gmail.com	f
noobmaster2	$2b$12$D7ZPSc81eRx2deNAcG3aF.srs4DhLjvrZX./lMGfDRr.NwbNUpEda	Lewis	Stone	noobmaster2@gmail.com	f
noobmaster3	$2b$12$vSP4MMVAYK7/ZlJguBR8YOWC6bX/7bfPT1pxZDHqN68WyMUyWBxlG	Lewis	Stone	noobmaster3@gmail.com	f
niceguy	$2b$12$nf/fjJ4ZSaTW3.UrXGRfu.Q8omDHTxGWjH5KKHMY.I4.V/a4Bj93K	Lewis	Stone	niceguy@gmail.com	f
tester1	$2b$12$/8eZxA43Huhg97w5a3UgJOs9JON.srQD3722UyMIVdozAYOu2wW6K	Lewis	Stone	tester1@gmail.com	f
\.


--
-- Name: dogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dogs_id_seq', 7, true);


--
-- Name: matches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.matches_id_seq', 4, true);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (username, dog_id, start_at);


--
-- Name: dogs dogs_petfinder_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dogs
    ADD CONSTRAINT dogs_petfinder_id_key UNIQUE (petfinder_id);


--
-- Name: dogs dogs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dogs
    ADD CONSTRAINT dogs_pkey PRIMARY KEY (id);


--
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_pkey PRIMARY KEY (id);


--
-- Name: matches matches_username_dog_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_username_dog_id_key UNIQUE (username, dog_id);


--
-- Name: shelters shelters_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shelters
    ADD CONSTRAINT shelters_name_key UNIQUE (name);


--
-- Name: shelters shelters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shelters
    ADD CONSTRAINT shelters_pkey PRIMARY KEY (handle);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (username);


--
-- Name: idx_bookings_dog_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_dog_time ON public.bookings USING btree (dog_id, start_at);


--
-- Name: idx_bookings_user_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_user_time ON public.bookings USING btree (username, start_at);


--
-- Name: idx_dogs_shelter_handle; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dogs_shelter_handle ON public.dogs USING btree (shelter_handle);


--
-- Name: idx_matches_dog; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_matches_dog ON public.matches USING btree (dog_id);


--
-- Name: idx_matches_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_matches_status ON public.matches USING btree (status);


--
-- Name: idx_matches_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_matches_user ON public.matches USING btree (username);


--
-- Name: bookings bookings_dog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_dog_id_fkey FOREIGN KEY (dog_id) REFERENCES public.dogs(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_username_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_username_fkey FOREIGN KEY (username) REFERENCES public.users(username) ON DELETE CASCADE;


--
-- Name: dogs dogs_shelter_handle_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dogs
    ADD CONSTRAINT dogs_shelter_handle_fkey FOREIGN KEY (shelter_handle) REFERENCES public.shelters(handle) ON DELETE CASCADE;


--
-- Name: matches matches_dog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_dog_id_fkey FOREIGN KEY (dog_id) REFERENCES public.dogs(id) ON DELETE CASCADE;


--
-- Name: matches matches_username_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_username_fkey FOREIGN KEY (username) REFERENCES public.users(username) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict a556JgYSkZxTw6CpWZiwBcQb8WXcjmhebTldEszrjHquGUrXObdX0hYy0UHVpdx

