--
-- PostgreSQL database dump
--

\restrict QNbCgyBPvkm2iZ4ISwMGgtTujC4t87hVqvXZ9THHlCHmayYMEr4clZqPy7Vq7E5

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: greenpoint_materiales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.greenpoint_materiales (
    id_greenpoint_material integer NOT NULL,
    id_greenpoint integer NOT NULL,
    id_material integer NOT NULL,
    cantidad character varying(50),
    descripcion_extra text
);


ALTER TABLE public.greenpoint_materiales OWNER TO postgres;

--
-- Name: greenpoint_materiales_id_greenpoint_material_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.greenpoint_materiales_id_greenpoint_material_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.greenpoint_materiales_id_greenpoint_material_seq OWNER TO postgres;

--
-- Name: greenpoint_materiales_id_greenpoint_material_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.greenpoint_materiales_id_greenpoint_material_seq OWNED BY public.greenpoint_materiales.id_greenpoint_material;


--
-- Name: greenpoints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.greenpoints (
    id_greenpoint integer NOT NULL,
    coordenada point,
    descripcion text,
    qr_code character varying(255),
    id_ciudadano integer NOT NULL,
    id_recolector integer,
    fecha_publicacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estado character varying(20) DEFAULT 'pendiente'::character varying,
    CONSTRAINT greenpoints_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'en_proceso'::character varying, 'finalizado'::character varying])::text[])))
);


ALTER TABLE public.greenpoints OWNER TO postgres;

--
-- Name: greenpoints_id_greenpoint_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.greenpoints_id_greenpoint_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.greenpoints_id_greenpoint_seq OWNER TO postgres;

--
-- Name: greenpoints_id_greenpoint_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.greenpoints_id_greenpoint_seq OWNED BY public.greenpoints.id_greenpoint;


--
-- Name: materiales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materiales (
    id_material integer NOT NULL,
    nombre character varying(100) NOT NULL,
    tipo character varying(50),
    descripcion text
);


ALTER TABLE public.materiales OWNER TO postgres;

--
-- Name: materiales_id_material_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.materiales_id_material_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.materiales_id_material_seq OWNER TO postgres;

--
-- Name: materiales_id_material_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.materiales_id_material_seq OWNED BY public.materiales.id_material;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    tipo character varying(20),
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    correo character varying(100),
    CONSTRAINT usuarios_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['ciudadano'::character varying, 'recolector'::character varying, 'centro'::character varying])::text[])))
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_usuario_seq OWNER TO postgres;

--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_usuario_seq OWNED BY public.usuarios.id_usuario;


--
-- Name: greenpoint_materiales id_greenpoint_material; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.greenpoint_materiales ALTER COLUMN id_greenpoint_material SET DEFAULT nextval('public.greenpoint_materiales_id_greenpoint_material_seq'::regclass);


--
-- Name: greenpoints id_greenpoint; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.greenpoints ALTER COLUMN id_greenpoint SET DEFAULT nextval('public.greenpoints_id_greenpoint_seq'::regclass);


--
-- Name: materiales id_material; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materiales ALTER COLUMN id_material SET DEFAULT nextval('public.materiales_id_material_seq'::regclass);


--
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);


--
-- Data for Name: greenpoint_materiales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.greenpoint_materiales (id_greenpoint_material, id_greenpoint, id_material, cantidad, descripcion_extra) FROM stdin;
1	4	1	2	Plástico
2	4	2	2	Vidrio
8	8	10	3	Electrónicos
9	8	5	3	Aluminio
11	10	2	2	Vidrio
12	10	2	3	Vidrio
13	11	2	12	Vidrio
14	12	4	131	Cartón
15	13	5	131	Aluminio
16	14	10	112	Electrónicos
17	15	7	121	Cobre
18	16	9	12	Textiles
19	17	7	1231	Cobre
20	18	6	12	Hierro
21	19	8	1231	Orgánico
22	20	4	13	Cartón
23	21	7	131	Cobre
24	22	4	13	Cartón
25	23	6	23	Hierro
\.


--
-- Data for Name: greenpoints; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.greenpoints (id_greenpoint, coordenada, descripcion, qr_code, id_ciudadano, id_recolector, fecha_publicacion, estado) FROM stdin;
4	(-18.0298025093472,-70.2850646334482)	GreenPoint1	\N	1	\N	2025-10-06 20:43:23.663347	pendiente
10	(-18.03923812373401,-70.27093648910524)	GreenPoint4	\N	1	\N	2025-10-07 15:16:52.000121	finalizado
11	(-18.004529347255957,-70.24403470279108)	121dasa	\N	1	\N	2025-10-07 18:00:45.746129	pendiente
12	(-18.02167033873392,-70.23888257483645)	1231fasa	\N	1	\N	2025-10-07 18:01:25.972485	pendiente
13	(-18.041258000536835,-70.25193463232148)	123dasads	\N	1	\N	2025-10-07 18:01:41.509092	pendiente
14	(-17.974079572776855,-70.244703169463)	asdas131213	\N	1	\N	2025-10-07 18:02:00.085787	pendiente
15	(-18.002733527860165,-70.27374530732939)	fsfdfs12312	\N	1	\N	2025-10-07 18:02:25.97766	pendiente
16	(-17.991305157747036,-70.20796980710877)	131231r1as	\N	1	\N	2025-10-07 18:02:46.289153	pendiente
17	(-17.985590695040983,-70.22565877975293)	1231dfasa	\N	1	\N	2025-10-07 18:03:07.623731	pendiente
18	(-18.02130304925908,-70.2655180070216)	131211231	\N	1	\N	2025-10-07 18:03:40.307902	pendiente
19	(-17.96366993322597,-70.21744822912727)	werdrs	\N	1	\N	2025-10-07 18:04:17.736054	pendiente
20	(-18.008610686938425,-70.21878927581346)	134125	\N	1	\N	2025-10-07 18:05:10.00213	pendiente
21	(-17.98412123186451,-70.24712597956383)	321fdfqr	\N	1	\N	2025-10-07 18:05:43.488782	pendiente
22	(-18.020364417121186,-70.25045319676326)	123123123	\N	1	\N	2025-10-07 18:06:07.045972	pendiente
8	(-18.0377648960178,-70.2700161144084)	GreenPoint3 - modificado	\N	11	\N	2025-10-06 22:06:01.653324	pendiente
23	(-17.9967,-70.2565715474807)	Greenpoint12	\N	1	\N	2025-10-07 18:06:42.997031	pendiente
\.


--
-- Data for Name: materiales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materiales (id_material, nombre, tipo, descripcion) FROM stdin;
1	Plástico	Plástico	Botellas, envases, bolsas.
2	Vidrio	Vidrio	Botellas, frascos.
3	Papel	Papel	Hojas, periódicos, cuadernos.
4	Cartón	Cartón	Cajas, embalajes.
5	Aluminio	Metal	Latas de bebidas y alimentos.
6	Hierro	Metal	Clavos, herramientas, chatarra.
7	Cobre	Metal	Cables eléctricos, tuberías.
8	Orgánico	Orgánico	Restos de comida, cáscaras, hojas.
9	Textiles	Textil	Ropa, telas.
10	Electrónicos	E-Waste	Celulares, computadoras, cargadores.
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id_usuario, username, password, tipo, fecha_registro, correo) FROM stdin;
2	mariagonzales	clave5678	ciudadano	2025-10-06 19:45:25.969644	\N
3	recolector1	rec0pass!	recolector	2025-10-06 19:45:25.969644	\N
4	recolector2	passReco22	recolector	2025-10-06 19:45:25.969644	\N
5	centroverde	centro2025	centro	2025-10-06 19:45:25.969644	\N
6	eco_tacna	tacnaeco	centro	2025-10-06 19:45:25.969644	\N
7	usuario1	13123123	recolector	2025-10-06 19:45:57.993941	\N
8	aadasdas	13123123	ciudadano	2025-10-06 19:47:44.026426	\N
9	adasdas	131231231	ciudadano	2025-10-06 19:48:27.383942	\N
10	adasdas131231	1312312131sdasd	ciudadano	2025-10-06 19:50:25.857894	\N
11	usuarioprueba1	13131412132	ciudadano	2025-10-06 21:43:46.170937	\N
12	Marco Polo	marcopolo	ciudadano	2025-10-06 22:12:05.902448	\N
13	Maria Torres	12345678	ciudadano	2025-10-06 22:12:59.234898	\N
1	marcos13	131231231	ciudadano	2025-10-06 19:45:25.969644	marcos12@gmail.com
\.


--
-- Name: greenpoint_materiales_id_greenpoint_material_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.greenpoint_materiales_id_greenpoint_material_seq', 25, true);


--
-- Name: greenpoints_id_greenpoint_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.greenpoints_id_greenpoint_seq', 23, true);


--
-- Name: materiales_id_material_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materiales_id_material_seq', 10, true);


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_usuario_seq', 13, true);


--
-- Name: greenpoint_materiales greenpoint_materiales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.greenpoint_materiales
    ADD CONSTRAINT greenpoint_materiales_pkey PRIMARY KEY (id_greenpoint_material);


--
-- Name: greenpoints greenpoints_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.greenpoints
    ADD CONSTRAINT greenpoints_pkey PRIMARY KEY (id_greenpoint);


--
-- Name: materiales materiales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materiales
    ADD CONSTRAINT materiales_pkey PRIMARY KEY (id_material);


--
-- Name: usuarios usuarios_correo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- Name: usuarios usuarios_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_username_key UNIQUE (username);


--
-- Name: greenpoint_materiales greenpoint_materiales_id_greenpoint_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.greenpoint_materiales
    ADD CONSTRAINT greenpoint_materiales_id_greenpoint_fkey FOREIGN KEY (id_greenpoint) REFERENCES public.greenpoints(id_greenpoint) ON DELETE CASCADE;


--
-- Name: greenpoint_materiales greenpoint_materiales_id_material_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.greenpoint_materiales
    ADD CONSTRAINT greenpoint_materiales_id_material_fkey FOREIGN KEY (id_material) REFERENCES public.materiales(id_material);


--
-- Name: greenpoints greenpoints_id_ciudadano_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.greenpoints
    ADD CONSTRAINT greenpoints_id_ciudadano_fkey FOREIGN KEY (id_ciudadano) REFERENCES public.usuarios(id_usuario);


--
-- Name: greenpoints greenpoints_id_recolector_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.greenpoints
    ADD CONSTRAINT greenpoints_id_recolector_fkey FOREIGN KEY (id_recolector) REFERENCES public.usuarios(id_usuario);


--
-- PostgreSQL database dump complete
--

\unrestrict QNbCgyBPvkm2iZ4ISwMGgtTujC4t87hVqvXZ9THHlCHmayYMEr4clZqPy7Vq7E5

