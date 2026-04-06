--
-- PostgreSQL database dump
--

\restrict u4DWUg60TM9LDY5RPCHqlSyHZiTDoIZLzWdjevXbno0a5E03HE5ereCpuSUwnV1

-- Dumped from database version 17.7 (Debian 17.7-3.pgdg13+1)
-- Dumped by pg_dump version 17.9

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
-- Data for Name: credit_cards; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.credit_cards (id, name, bank, brand, last_four_digits, expiration_month, expiration_year, due_day, user_id, created_at, updated_at) VALUES (1, 'Visa Damián', 'BBVA', 'Visa', '7403', 12, 2027, 1, 1, '2026-02-09 11:50:08.432+00', '2026-02-09 11:50:08.432+00');
INSERT INTO public.credit_cards (id, name, bank, brand, last_four_digits, expiration_month, expiration_year, due_day, user_id, created_at, updated_at) VALUES (2, 'MasterCard Damián', 'BBVA', 'Mastercard', '1789', 12, 2027, 1, 1, '2026-02-09 11:50:44.507+00', '2026-02-09 11:50:44.507+00');
INSERT INTO public.credit_cards (id, name, bank, brand, last_four_digits, expiration_month, expiration_year, due_day, user_id, created_at, updated_at) VALUES (3, 'Visa Luz', 'Galicia', 'Visa', '3772', 6, 2026, 1, 1, '2026-02-12 23:38:23.088+00', '2026-02-12 23:38:23.088+00');
INSERT INTO public.credit_cards (id, name, bank, brand, last_four_digits, expiration_month, expiration_year, due_day, user_id, created_at, updated_at) VALUES (4, 'Mastercard Luz', 'Galicia', 'Mastercard', '6465', 11, 2032, 1, 1, '2026-02-12 23:38:58.016+00', '2026-02-12 23:38:58.016+00');
INSERT INTO public.credit_cards (id, name, bank, brand, last_four_digits, expiration_month, expiration_year, due_day, user_id, created_at, updated_at) VALUES (5, 'Visa BNA Luz', 'Banco Nacion', 'Visa', '6113', 11, 2030, 1, 1, '2026-02-12 23:48:48.647+00', '2026-02-12 23:48:48.647+00');
INSERT INTO public.credit_cards (id, name, bank, brand, last_four_digits, expiration_month, expiration_year, due_day, user_id, created_at, updated_at) VALUES (6, 'Visa ADICIONAL Luz', 'BBVA', 'Visa', '9279', 12, 2027, 1, 3, '2026-02-23 15:46:52.572+00', '2026-02-23 15:46:52.572+00');
INSERT INTO public.credit_cards (id, name, bank, brand, last_four_digits, expiration_month, expiration_year, due_day, user_id, created_at, updated_at) VALUES (7, 'MasterCard Adicional Luz', 'BBVA', 'Mastercard', '4234', 12, 2027, 1, 3, '2026-02-23 15:47:28.524+00', '2026-02-23 15:47:28.524+00');


--
-- Data for Name: credit_card_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (9, 'Pasaje Luz Tucuman', 132917.50, 5, '2026-02-10', 'ARS', 1, 5, 1, '2026-02-10 17:25:39.056+00', '2026-02-10 17:25:39.056+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (10, 'Pasaje Luz Tucuman', 181750.00, 3, '2026-02-10', 'ARS', 1, 5, 1, '2026-02-10 17:28:17.51+00', '2026-02-10 17:28:17.51+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (11, 'Pasaje Tucuman Malena', 116465.50, 2, '2026-02-10', 'ARS', 1, 5, 1, '2026-02-10 17:29:39.027+00', '2026-02-10 17:29:39.027+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (12, 'Zapateria Febo', 113000.00, 2, '2026-02-10', 'ARS', 2, 227, 1, '2026-02-10 17:39:52.513+00', '2026-02-10 17:39:52.513+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (13, 'Pintura Merc. Libre', 213200.00, 4, '2026-02-10', 'ARS', 2, 154, 1, '2026-02-10 17:41:04.05+00', '2026-02-10 17:41:04.05+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (14, 'Easy Palermo', 57793.00, 1, '2026-02-10', 'ARS', 2, 154, 1, '2026-02-10 17:41:51.264+00', '2026-02-10 17:41:51.264+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (15, 'URBANMDA', 76666.68, 2, '2026-02-10', 'ARS', 2, 226, 1, '2026-02-10 17:43:09.701+00', '2026-02-10 17:43:09.701+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (16, 'Pinturas Prestigio', 100006.00, 5, '2026-02-10', 'ARS', 2, 154, 1, '2026-02-10 17:44:30.787+00', '2026-02-10 17:44:30.787+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (17, 'Pinturas Prestigio', 90150.00, 5, '2026-02-10', 'ARS', 2, 154, 1, '2026-02-10 17:46:00.986+00', '2026-02-10 17:46:00.986+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (18, 'Easy Palermo', 126990.00, 2, '2026-02-10', 'ARS', 2, 154, 1, '2026-02-10 17:47:52.397+00', '2026-02-10 17:47:52.397+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (19, 'Pinturas Prestigio', 125000.00, 5, '2026-02-10', 'ARS', 2, 154, 1, '2026-02-10 17:48:29.507+00', '2026-02-10 17:48:29.507+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (20, 'Easy Palermo', 145925.50, 2, '2026-02-10', 'ARS', 2, 154, 1, '2026-02-10 17:49:36.334+00', '2026-02-10 17:49:36.334+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (21, 'Sodimac Palermo', 131100.00, 2, '2026-02-10', 'ARS', 2, 154, 1, '2026-02-10 17:55:57.752+00', '2026-02-10 17:55:57.752+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (22, 'Filtro PSA', 582600.00, 15, '2026-02-10', 'ARS', 2, 154, 1, '2026-02-10 17:57:58.639+00', '2026-02-10 17:57:58.639+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (23, 'Regalo Diego', 69900.00, 1, '2026-02-12', 'ARS', 1, 228, 1, '2026-02-12 12:28:50.892+00', '2026-02-12 12:28:50.892+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (24, 'Compra Pesce', 117000.00, 1, '2026-02-12', 'ARS', 1, 158, 1, '2026-02-12 23:29:47.944+00', '2026-02-12 23:29:47.944+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (26, 'Nafta', 70000.00, 1, '2026-02-13', 'ARS', 2, 161, 1, '2026-02-13 18:00:12.886+00', '2026-02-13 18:00:12.886+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (27, 'Compra Easy Palermo', 89000.00, 1, '2026-02-16', 'ARS', 1, 154, 1, '2026-02-16 20:04:44.645+00', '2026-02-16 20:04:44.645+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (28, 'Aplique pared Led - Pana Iluminación', 40949.10, 1, '2026-02-09', 'ARS', 6, 228, 3, '2026-02-23 15:50:07.828+00', '2026-02-23 15:50:07.828+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (29, 'Papel freidora + Bazar', 35318.00, 1, '2026-02-09', 'ARS', 7, 228, 3, '2026-02-23 15:50:44.793+00', '2026-02-23 15:50:44.793+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (30, 'Tacho de Ropa sucia', 35748.89, 1, '2026-02-09', 'ARS', 7, 228, 3, '2026-02-23 15:51:18.746+00', '2026-02-23 15:51:18.746+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (31, 'Repasadores', 39391.00, 1, '2026-02-09', 'ARS', 7, 228, 3, '2026-02-23 15:51:52.12+00', '2026-02-23 15:51:52.12+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (32, 'Producto limpia sillón', 24560.09, 1, '2026-02-09', 'ARS', 7, 228, 3, '2026-02-23 15:52:24.597+00', '2026-02-23 15:52:24.597+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (33, 'Soporte organizador lavadero', 39833.96, 1, '2026-02-09', 'ARS', 7, 228, 3, '2026-02-23 15:52:55.354+00', '2026-02-23 15:52:55.354+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (34, 'Cremas carita Luz', 21000.00, 1, '2026-02-19', 'ARS', 3, 168, 3, '2026-02-23 15:54:30.147+00', '2026-02-23 15:54:30.147+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (36, 'Cebra - Regalo niños', 16663.32, 2, '2026-02-19', 'ARS', 3, 228, 3, '2026-02-23 15:57:07.289+00', '2026-02-23 15:57:07.289+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (38, 'Vacuna Varicela', 110672.00, 1, '2026-02-20', 'ARS', 6, 167, 3, '2026-02-23 16:00:10.158+00', '2026-02-23 16:00:10.158+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (39, 'Jardinería - macetas', 238000.00, 1, '2026-02-18', 'ARS', 6, 228, 3, '2026-02-23 16:00:58.383+00', '2026-02-23 16:00:58.383+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (40, 'Aspiradora Robot Gadnic', 300999.00, 6, '2026-02-12', 'ARS', 6, 228, 3, '2026-02-23 16:01:56.136+00', '2026-02-23 16:01:56.136+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (41, 'Farmacity', 127866.12, 3, '2026-02-07', 'ARS', 3, 168, 3, '2026-02-23 16:04:05.749+00', '2026-02-23 16:04:05.749+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (42, 'Plateanet - Servicio de compra (Moria)', 14400.00, 1, '2026-02-21', 'ARS', 6, 228, 3, '2026-02-23 16:08:13.787+00', '2026-02-23 16:08:13.787+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (43, 'Plateanet - Servicio de compra (Moldavsky)', 25200.00, 1, '2026-02-21', 'ARS', 6, 228, 3, '2026-02-23 16:09:00.871+00', '2026-02-23 16:09:10+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (44, 'Plateanet - Entradas (Moria)', 120000.00, 1, '2026-02-21', 'ARS', 6, 228, 3, '2026-02-23 16:11:10.712+00', '2026-02-23 16:11:10.712+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (45, 'Plateanet - Entradas Moldavsky', 210000.00, 3, '2026-02-21', 'ARS', 6, 228, 3, '2026-02-23 16:12:24.042+00', '2026-02-23 16:12:24.042+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (46, 'Pregna - Tratamiento', 702000.00, 6, '2026-02-19', 'ARS', 4, 167, 3, '2026-02-23 16:31:14.343+00', '2026-02-23 16:31:14.343+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (47, 'Passline - Entradas Bs As Cumbia Diciembre', 92000.00, 4, '2026-02-19', 'ARS', 3, 228, 3, '2026-02-23 16:31:58.872+00', '2026-02-23 16:31:58.872+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (48, 'Nafta', 32000.00, 1, '2026-02-23', 'ARS', 2, 161, 1, '2026-02-23 16:40:58.748+00', '2026-02-23 16:40:58.748+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (49, 'Vacuna Hepatitis A y B - 1era dosis', 103825.00, 1, '2026-02-26', 'ARS', 6, 168, 3, '2026-02-26 14:55:41.46+00', '2026-02-26 14:55:41.46+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (51, 'Nafta', 70000.00, 1, '2026-03-03', 'ARS', 2, 161, 1, '2026-03-03 17:25:37.43+00', '2026-03-03 17:25:37.43+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (52, 'Nafta', 57000.00, 1, '2026-03-10', 'ARS', 7, 161, 1, '2026-03-10 12:14:01.951+00', '2026-03-10 12:14:01.951+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (53, 'Machi', 200948.00, 6, '2026-03-10', 'ARS', 5, 226, 3, '2026-03-10 15:24:22.794+00', '2026-03-10 15:24:22.794+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (54, 'MacStation', 319980.00, 3, '2026-03-03', 'ARS', 6, 228, 3, '2026-03-10 15:27:05.173+00', '2026-03-10 15:27:05.173+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (55, 'Nafta', 57000.00, 1, '2026-03-12', 'ARS', 7, 161, 1, '2026-03-12 12:15:31.174+00', '2026-03-12 12:15:31.174+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (56, 'Almacen', 46900.00, 1, '2026-03-31', 'ARS', 5, 156, 1, '2026-03-31 11:35:50.351+00', '2026-03-31 11:35:50.351+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (57, 'Vacunas', 108282.00, 1, '2026-03-31', 'ARS', 7, 167, 1, '2026-03-31 11:36:45.342+00', '2026-03-31 11:36:45.342+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (58, 'Medicamentos Damian', 125000.00, 1, '2026-03-31', 'ARS', 2, 168, 1, '2026-03-31 11:37:44.277+00', '2026-03-31 11:37:44.277+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (59, 'Regalos Niños', 95997.00, 3, '2026-03-31', 'ARS', 7, 228, 1, '2026-03-31 11:39:33.588+00', '2026-03-31 11:39:33.588+00');
INSERT INTO public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (60, 'Vacunas Luz', 55752.00, 1, '2026-03-31', 'ARS', 6, 168, 1, '2026-03-31 11:41:06.573+00', '2026-03-31 11:41:06.573+00');


--
-- Data for Name: credit_card_installments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (41, 1, 26583.50, '2026-03-01', false, NULL, 9, '2026-02-10 17:25:39.191+00', '2026-02-10 17:25:39.191+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (42, 2, 26583.50, '2026-04-01', false, NULL, 9, '2026-02-10 17:25:39.191+00', '2026-02-10 17:25:39.191+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (43, 3, 26583.50, '2026-05-01', false, NULL, 9, '2026-02-10 17:25:39.191+00', '2026-02-10 17:25:39.191+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (44, 4, 26583.50, '2026-06-01', false, NULL, 9, '2026-02-10 17:25:39.191+00', '2026-02-10 17:25:39.191+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (45, 5, 26583.50, '2026-07-01', false, NULL, 9, '2026-02-10 17:25:39.191+00', '2026-02-10 17:25:39.191+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (46, 1, 60583.33, '2026-03-01', false, NULL, 10, '2026-02-10 17:28:17.64+00', '2026-02-10 17:28:17.64+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (47, 2, 60583.33, '2026-04-01', false, NULL, 10, '2026-02-10 17:28:17.64+00', '2026-02-10 17:28:17.64+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (48, 3, 60583.33, '2026-05-01', false, NULL, 10, '2026-02-10 17:28:17.64+00', '2026-02-10 17:28:17.64+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (49, 1, 58232.75, '2026-03-01', false, NULL, 11, '2026-02-10 17:29:39.164+00', '2026-02-10 17:29:39.164+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (50, 2, 58232.75, '2026-04-01', false, NULL, 11, '2026-02-10 17:29:39.164+00', '2026-02-10 17:29:39.164+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (51, 1, 56500.00, '2026-03-01', false, NULL, 12, '2026-02-10 17:39:52.647+00', '2026-02-10 17:39:52.647+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (52, 2, 56500.00, '2026-04-01', false, NULL, 12, '2026-02-10 17:39:52.647+00', '2026-02-10 17:39:52.647+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (53, 1, 53300.00, '2026-03-01', false, NULL, 13, '2026-02-10 17:41:04.175+00', '2026-02-10 17:41:04.175+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (54, 2, 53300.00, '2026-04-01', false, NULL, 13, '2026-02-10 17:41:04.175+00', '2026-02-10 17:41:04.175+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (55, 3, 53300.00, '2026-05-01', false, NULL, 13, '2026-02-10 17:41:04.175+00', '2026-02-10 17:41:04.175+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (56, 4, 53300.00, '2026-06-01', false, NULL, 13, '2026-02-10 17:41:04.175+00', '2026-02-10 17:41:04.175+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (57, 1, 57793.00, '2026-03-01', false, NULL, 14, '2026-02-10 17:41:51.387+00', '2026-02-10 17:41:51.387+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (58, 1, 38333.34, '2026-03-01', false, NULL, 15, '2026-02-10 17:43:09.822+00', '2026-02-10 17:43:09.822+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (59, 2, 38333.34, '2026-04-01', false, NULL, 15, '2026-02-10 17:43:09.822+00', '2026-02-10 17:43:09.822+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (60, 1, 20001.20, '2026-03-01', false, NULL, 16, '2026-02-10 17:44:30.911+00', '2026-02-10 17:44:30.911+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (61, 2, 20001.20, '2026-04-01', false, NULL, 16, '2026-02-10 17:44:30.911+00', '2026-02-10 17:44:30.911+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (62, 3, 20001.20, '2026-05-01', false, NULL, 16, '2026-02-10 17:44:30.911+00', '2026-02-10 17:44:30.911+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (63, 4, 20001.20, '2026-06-01', false, NULL, 16, '2026-02-10 17:44:30.911+00', '2026-02-10 17:44:30.911+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (64, 5, 20001.20, '2026-07-01', false, NULL, 16, '2026-02-10 17:44:30.911+00', '2026-02-10 17:44:30.911+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (65, 1, 18030.00, '2026-03-01', false, NULL, 17, '2026-02-10 17:46:01.114+00', '2026-02-10 17:46:01.114+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (66, 2, 18030.00, '2026-04-01', false, NULL, 17, '2026-02-10 17:46:01.114+00', '2026-02-10 17:46:01.114+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (67, 3, 18030.00, '2026-05-01', false, NULL, 17, '2026-02-10 17:46:01.114+00', '2026-02-10 17:46:01.114+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (68, 4, 18030.00, '2026-06-01', false, NULL, 17, '2026-02-10 17:46:01.114+00', '2026-02-10 17:46:01.114+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (69, 5, 18030.00, '2026-07-01', false, NULL, 17, '2026-02-10 17:46:01.114+00', '2026-02-10 17:46:01.114+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (70, 1, 63495.00, '2026-03-01', false, NULL, 18, '2026-02-10 17:47:52.523+00', '2026-02-10 17:47:52.523+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (71, 2, 63495.00, '2026-04-01', false, NULL, 18, '2026-02-10 17:47:52.523+00', '2026-02-10 17:47:52.523+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (72, 1, 25000.00, '2026-03-01', false, NULL, 19, '2026-02-10 17:48:29.645+00', '2026-02-10 17:48:29.645+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (73, 2, 25000.00, '2026-04-01', false, NULL, 19, '2026-02-10 17:48:29.645+00', '2026-02-10 17:48:29.645+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (74, 3, 25000.00, '2026-05-01', false, NULL, 19, '2026-02-10 17:48:29.645+00', '2026-02-10 17:48:29.645+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (75, 4, 25000.00, '2026-06-01', false, NULL, 19, '2026-02-10 17:48:29.645+00', '2026-02-10 17:48:29.645+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (76, 5, 25000.00, '2026-07-01', false, NULL, 19, '2026-02-10 17:48:29.645+00', '2026-02-10 17:48:29.645+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (77, 1, 72962.75, '2026-03-01', false, NULL, 20, '2026-02-10 17:49:36.463+00', '2026-02-10 17:49:36.463+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (78, 2, 72962.75, '2026-04-01', false, NULL, 20, '2026-02-10 17:49:36.463+00', '2026-02-10 17:49:36.463+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (79, 1, 65550.00, '2026-03-01', false, NULL, 21, '2026-02-10 17:55:57.888+00', '2026-02-10 17:55:57.888+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (80, 2, 65550.00, '2026-04-01', false, NULL, 21, '2026-02-10 17:55:57.888+00', '2026-02-10 17:55:57.888+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (81, 1, 38840.00, '2026-03-01', false, NULL, 22, '2026-02-10 17:57:58.769+00', '2026-02-10 17:57:58.769+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (82, 2, 38840.00, '2026-04-01', false, NULL, 22, '2026-02-10 17:57:58.769+00', '2026-02-10 17:57:58.769+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (83, 3, 38840.00, '2026-05-01', false, NULL, 22, '2026-02-10 17:57:58.769+00', '2026-02-10 17:57:58.769+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (84, 4, 38840.00, '2026-06-01', false, NULL, 22, '2026-02-10 17:57:58.769+00', '2026-02-10 17:57:58.769+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (85, 5, 38840.00, '2026-07-01', false, NULL, 22, '2026-02-10 17:57:58.769+00', '2026-02-10 17:57:58.769+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (86, 6, 38840.00, '2026-08-01', false, NULL, 22, '2026-02-10 17:57:58.769+00', '2026-02-10 17:57:58.769+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (87, 7, 38840.00, '2026-09-01', false, NULL, 22, '2026-02-10 17:57:58.769+00', '2026-02-10 17:57:58.769+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (88, 8, 38840.00, '2026-10-01', false, NULL, 22, '2026-02-10 17:57:58.769+00', '2026-02-10 17:57:58.769+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (89, 9, 38840.00, '2026-11-01', false, NULL, 22, '2026-02-10 17:57:58.769+00', '2026-02-10 17:57:58.769+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (90, 10, 38840.00, '2026-12-01', false, NULL, 22, '2026-02-10 17:57:58.769+00', '2026-02-10 17:57:58.769+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (91, 11, 38840.00, '2027-01-01', false, NULL, 22, '2026-02-10 17:57:58.769+00', '2026-02-10 17:57:58.769+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (92, 12, 38840.00, '2027-02-01', false, NULL, 22, '2026-02-10 17:57:58.769+00', '2026-02-10 17:57:58.769+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (93, 13, 38840.00, '2027-03-01', false, NULL, 22, '2026-02-10 17:57:58.769+00', '2026-02-10 17:57:58.769+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (94, 14, 38840.00, '2027-04-01', false, NULL, 22, '2026-02-10 17:57:58.769+00', '2026-02-10 17:57:58.769+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (95, 15, 38840.00, '2027-05-01', false, NULL, 22, '2026-02-10 17:57:58.769+00', '2026-02-10 17:57:58.769+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (96, 1, 69900.00, '2026-03-01', false, NULL, 23, '2026-02-12 12:28:50.904+00', '2026-02-12 12:28:50.904+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (97, 1, 117000.00, '2026-03-01', false, NULL, 24, '2026-02-12 23:29:47.954+00', '2026-02-12 23:29:47.954+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (99, 1, 70000.00, '2026-03-01', false, NULL, 26, '2026-02-13 18:00:12.899+00', '2026-02-13 18:00:12.899+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (100, 1, 89000.00, '2026-03-01', false, NULL, 27, '2026-02-16 20:04:44.652+00', '2026-02-16 20:04:44.652+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (101, 1, 40949.10, '2026-03-01', false, NULL, 28, '2026-02-23 15:50:07.835+00', '2026-02-23 15:50:07.835+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (102, 1, 35318.00, '2026-03-01', false, NULL, 29, '2026-02-23 15:50:44.796+00', '2026-02-23 15:50:44.796+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (103, 1, 35748.89, '2026-03-01', false, NULL, 30, '2026-02-23 15:51:18.752+00', '2026-02-23 15:51:18.752+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (104, 1, 39391.00, '2026-03-01', false, NULL, 31, '2026-02-23 15:51:52.126+00', '2026-02-23 15:51:52.126+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (105, 1, 24560.09, '2026-03-01', false, NULL, 32, '2026-02-23 15:52:24.602+00', '2026-02-23 15:52:24.602+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (106, 1, 39833.96, '2026-03-01', false, NULL, 33, '2026-02-23 15:52:55.359+00', '2026-02-23 15:52:55.359+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (107, 1, 21000.00, '2026-03-01', false, NULL, 34, '2026-02-23 15:54:30.152+00', '2026-02-23 15:54:30.152+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (112, 1, 8331.66, '2026-03-01', false, NULL, 36, '2026-02-23 15:57:07.294+00', '2026-02-23 15:57:07.294+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (113, 2, 8331.66, '2026-04-01', false, NULL, 36, '2026-02-23 15:57:07.294+00', '2026-02-23 15:57:07.294+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (120, 1, 110672.00, '2026-03-01', false, NULL, 38, '2026-02-23 16:00:10.164+00', '2026-02-23 16:00:10.164+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (121, 1, 238000.00, '2026-03-01', false, NULL, 39, '2026-02-23 16:00:58.388+00', '2026-02-23 16:00:58.388+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (122, 1, 50166.50, '2026-03-01', false, NULL, 40, '2026-02-23 16:01:56.141+00', '2026-02-23 16:01:56.141+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (123, 2, 50166.50, '2026-04-01', false, NULL, 40, '2026-02-23 16:01:56.141+00', '2026-02-23 16:01:56.141+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (124, 3, 50166.50, '2026-05-01', false, NULL, 40, '2026-02-23 16:01:56.141+00', '2026-02-23 16:01:56.141+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (125, 4, 50166.50, '2026-06-01', false, NULL, 40, '2026-02-23 16:01:56.141+00', '2026-02-23 16:01:56.141+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (126, 5, 50166.50, '2026-07-01', false, NULL, 40, '2026-02-23 16:01:56.141+00', '2026-02-23 16:01:56.141+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (127, 6, 50166.50, '2026-08-01', false, NULL, 40, '2026-02-23 16:01:56.141+00', '2026-02-23 16:01:56.141+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (128, 1, 42622.04, '2026-03-01', false, NULL, 41, '2026-02-23 16:04:05.754+00', '2026-02-23 16:04:05.754+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (129, 2, 42622.04, '2026-04-01', false, NULL, 41, '2026-02-23 16:04:05.754+00', '2026-02-23 16:04:05.754+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (130, 3, 42622.04, '2026-05-01', false, NULL, 41, '2026-02-23 16:04:05.754+00', '2026-02-23 16:04:05.754+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (131, 1, 14400.00, '2026-03-01', false, NULL, 42, '2026-02-23 16:08:13.792+00', '2026-02-23 16:08:13.792+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (132, 1, 25200.00, '2026-03-01', false, NULL, 43, '2026-02-23 16:09:00.877+00', '2026-02-23 16:09:00.877+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (133, 1, 120000.00, '2026-03-01', false, NULL, 44, '2026-02-23 16:11:10.717+00', '2026-02-23 16:11:10.717+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (134, 1, 70000.00, '2026-03-01', false, NULL, 45, '2026-02-23 16:12:24.047+00', '2026-02-23 16:12:24.047+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (135, 2, 70000.00, '2026-04-01', false, NULL, 45, '2026-02-23 16:12:24.047+00', '2026-02-23 16:12:24.047+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (136, 3, 70000.00, '2026-05-01', false, NULL, 45, '2026-02-23 16:12:24.047+00', '2026-02-23 16:12:24.047+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (137, 1, 117000.00, '2026-03-01', false, NULL, 46, '2026-02-23 16:31:14.348+00', '2026-02-23 16:31:14.348+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (138, 2, 117000.00, '2026-04-01', false, NULL, 46, '2026-02-23 16:31:14.348+00', '2026-02-23 16:31:14.348+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (139, 3, 117000.00, '2026-05-01', false, NULL, 46, '2026-02-23 16:31:14.348+00', '2026-02-23 16:31:14.348+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (140, 4, 117000.00, '2026-06-01', false, NULL, 46, '2026-02-23 16:31:14.348+00', '2026-02-23 16:31:14.348+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (141, 5, 117000.00, '2026-07-01', false, NULL, 46, '2026-02-23 16:31:14.348+00', '2026-02-23 16:31:14.348+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (142, 6, 117000.00, '2026-08-01', false, NULL, 46, '2026-02-23 16:31:14.348+00', '2026-02-23 16:31:14.348+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (143, 1, 23000.00, '2026-03-01', false, NULL, 47, '2026-02-23 16:31:58.877+00', '2026-02-23 16:31:58.877+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (144, 2, 23000.00, '2026-04-01', false, NULL, 47, '2026-02-23 16:31:58.877+00', '2026-02-23 16:31:58.877+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (145, 3, 23000.00, '2026-05-01', false, NULL, 47, '2026-02-23 16:31:58.877+00', '2026-02-23 16:31:58.877+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (146, 4, 23000.00, '2026-06-01', false, NULL, 47, '2026-02-23 16:31:58.877+00', '2026-02-23 16:31:58.877+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (147, 1, 32000.00, '2026-03-01', false, NULL, 48, '2026-02-23 16:40:58.754+00', '2026-02-23 16:40:58.754+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (148, 1, 103825.00, '2026-03-01', false, NULL, 49, '2026-02-26 14:55:41.466+00', '2026-02-26 14:55:41.466+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (150, 1, 70000.00, '2026-04-01', false, NULL, 51, '2026-03-03 17:25:37.443+00', '2026-03-03 17:25:37.443+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (151, 1, 57000.00, '2026-04-01', false, NULL, 52, '2026-03-10 12:14:01.958+00', '2026-03-10 12:14:01.958+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (152, 1, 33491.33, '2026-04-01', false, NULL, 53, '2026-03-10 15:24:22.798+00', '2026-03-10 15:24:22.798+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (153, 2, 33491.33, '2026-05-01', false, NULL, 53, '2026-03-10 15:24:22.798+00', '2026-03-10 15:24:22.798+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (154, 3, 33491.33, '2026-06-01', false, NULL, 53, '2026-03-10 15:24:22.798+00', '2026-03-10 15:24:22.798+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (155, 4, 33491.33, '2026-07-01', false, NULL, 53, '2026-03-10 15:24:22.798+00', '2026-03-10 15:24:22.798+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (156, 5, 33491.33, '2026-08-01', false, NULL, 53, '2026-03-10 15:24:22.798+00', '2026-03-10 15:24:22.798+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (157, 6, 33491.33, '2026-09-01', false, NULL, 53, '2026-03-10 15:24:22.798+00', '2026-03-10 15:24:22.798+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (158, 1, 106660.00, '2026-04-01', false, NULL, 54, '2026-03-10 15:27:05.177+00', '2026-03-10 15:27:05.177+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (159, 2, 106660.00, '2026-05-01', false, NULL, 54, '2026-03-10 15:27:05.177+00', '2026-03-10 15:27:05.177+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (160, 3, 106660.00, '2026-06-01', false, NULL, 54, '2026-03-10 15:27:05.177+00', '2026-03-10 15:27:05.177+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (161, 1, 57000.00, '2026-04-01', false, NULL, 55, '2026-03-12 12:15:31.178+00', '2026-03-12 12:15:31.178+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (162, 1, 46900.00, '2026-04-01', false, NULL, 56, '2026-03-31 11:35:50.357+00', '2026-03-31 11:35:50.357+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (163, 1, 108282.00, '2026-04-01', false, NULL, 57, '2026-03-31 11:36:45.35+00', '2026-03-31 11:36:45.35+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (164, 1, 125000.00, '2026-04-01', false, NULL, 58, '2026-03-31 11:37:44.284+00', '2026-03-31 11:37:44.284+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (165, 1, 31999.00, '2026-04-01', false, NULL, 59, '2026-03-31 11:39:33.597+00', '2026-03-31 11:39:33.597+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (166, 2, 31999.00, '2026-05-01', false, NULL, 59, '2026-03-31 11:39:33.597+00', '2026-03-31 11:39:33.597+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (167, 3, 31999.00, '2026-06-01', false, NULL, 59, '2026-03-31 11:39:33.597+00', '2026-03-31 11:39:33.597+00');
INSERT INTO public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) VALUES (168, 1, 55752.00, '2026-04-01', false, NULL, 60, '2026-03-31 11:41:06.579+00', '2026-03-31 11:41:06.579+00');


--
-- Data for Name: credit_card_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.credit_card_payments (id, amount, payment_date, currency, notes, credit_card_id, transaction_id, user_id, created_at, updated_at) VALUES (1, 1399591.61, '2026-02-04', 'ARS', 'Pago Mastercard Febrero', 2, 25, 1, '2026-02-10 18:05:06.696+00', '2026-02-10 18:05:06.696+00');
INSERT INTO public.credit_card_payments (id, amount, payment_date, currency, notes, credit_card_id, transaction_id, user_id, created_at, updated_at) VALUES (2, 1153511.02, '2026-02-04', 'ARS', 'Pago Visa Febrero', 1, 26, 1, '2026-02-10 18:05:49.482+00', '2026-02-10 18:05:49.482+00');
INSERT INTO public.credit_card_payments (id, amount, payment_date, currency, notes, credit_card_id, transaction_id, user_id, created_at, updated_at) VALUES (3, 224430.00, '2026-02-12', 'ARS', NULL, 4, 34, 1, '2026-02-12 23:46:25.735+00', '2026-02-12 23:46:25.735+00');
INSERT INTO public.credit_card_payments (id, amount, payment_date, currency, notes, credit_card_id, transaction_id, user_id, created_at, updated_at) VALUES (4, 120508.00, '2026-02-12', 'ARS', NULL, 3, 35, 1, '2026-02-12 23:47:42.637+00', '2026-02-12 23:47:42.637+00');
INSERT INTO public.credit_card_payments (id, amount, payment_date, currency, notes, credit_card_id, transaction_id, user_id, created_at, updated_at) VALUES (5, 28667.00, '2026-02-12', 'ARS', NULL, 5, 36, 1, '2026-02-12 23:49:12.837+00', '2026-02-12 23:49:12.837+00');
INSERT INTO public.credit_card_payments (id, amount, payment_date, currency, notes, credit_card_id, transaction_id, user_id, created_at, updated_at) VALUES (6, 1975552.42, '2026-03-04', 'ARS', NULL, 1, 62, 1, '2026-03-04 13:43:47.572+00', '2026-03-04 13:43:47.572+00');
INSERT INTO public.credit_card_payments (id, amount, payment_date, currency, notes, credit_card_id, transaction_id, user_id, created_at, updated_at) VALUES (7, 1332279.65, '2026-03-04', 'ARS', NULL, 2, 63, 1, '2026-03-04 13:45:29.364+00', '2026-03-04 13:45:29.364+00');
INSERT INTO public.credit_card_payments (id, amount, payment_date, currency, notes, credit_card_id, transaction_id, user_id, created_at, updated_at) VALUES (8, 1581051.64, '2026-04-06', 'ARS', NULL, 1, 87, 1, '2026-04-06 16:03:13.743+00', '2026-04-06 16:03:13.743+00');
INSERT INTO public.credit_card_payments (id, amount, payment_date, currency, notes, credit_card_id, transaction_id, user_id, created_at, updated_at) VALUES (9, 1036760.58, '2026-04-06', 'ARS', NULL, 2, 88, 1, '2026-04-06 16:04:48.65+00', '2026-04-06 16:04:48.65+00');


--
-- Data for Name: credit_card_recurring_charges; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.credit_card_recurring_charges (id, description, amount, charge_day, is_active, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (2, 'Personal Flow 2', 46449.89, 1, true, 'ARS', 1, 151, 1, '2026-02-10 17:31:25.893+00', '2026-02-10 17:31:25.893+00');
INSERT INTO public.credit_card_recurring_charges (id, description, amount, charge_day, is_active, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (3, 'Wellhub', 72999.00, 1, true, 'ARS', 1, 169, 1, '2026-02-10 17:32:29.694+00', '2026-02-10 17:32:29.694+00');
INSERT INTO public.credit_card_recurring_charges (id, description, amount, charge_day, is_active, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (4, 'Pregna', 42000.00, 1, true, 'ARS', 1, 167, 1, '2026-02-10 17:33:23.788+00', '2026-02-10 17:33:23.788+00');
INSERT INTO public.credit_card_recurring_charges (id, description, amount, charge_day, is_active, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (6, 'Boca Juniors', 36800.00, 1, true, 'ARS', 1, 6, 1, '2026-02-10 17:35:38.077+00', '2026-02-10 17:35:38.077+00');
INSERT INTO public.credit_card_recurring_charges (id, description, amount, charge_day, is_active, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (5, 'San Cristobal Seguros', 178574.00, 1, true, 'ARS', 2, 164, 1, '2026-02-10 17:33:53.836+00', '2026-02-10 17:36:30.393+00');
INSERT INTO public.credit_card_recurring_charges (id, description, amount, charge_day, is_active, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (1, 'Personal Flow 1', 127756.77, 1, true, 'ARS', 2, 151, 1, '2026-02-10 17:30:29.351+00', '2026-02-10 17:36:48.264+00');
INSERT INTO public.credit_card_recurring_charges (id, description, amount, charge_day, is_active, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (7, 'Netflix', 6.14, 1, true, 'USD', 2, 177, 1, '2026-02-10 17:37:59.194+00', '2026-02-10 17:37:59.194+00');
INSERT INTO public.credit_card_recurring_charges (id, description, amount, charge_day, is_active, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (8, 'Canva', 27759.89, 1, true, 'ARS', 2, 7, 1, '2026-02-10 17:51:43.959+00', '2026-02-10 17:51:43.959+00');
INSERT INTO public.credit_card_recurring_charges (id, description, amount, charge_day, is_active, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (9, 'Spotify', 3.84, 1, true, 'USD', 2, 178, 1, '2026-02-10 17:52:41.109+00', '2026-02-10 17:52:41.109+00');
INSERT INTO public.credit_card_recurring_charges (id, description, amount, charge_day, is_active, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (10, 'Apple icloud', 2.99, 1, true, 'USD', 2, 179, 1, '2026-02-10 17:53:24.994+00', '2026-02-10 17:53:24.994+00');
INSERT INTO public.credit_card_recurring_charges (id, description, amount, charge_day, is_active, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (11, 'GitHub Copilot', 39.00, 1, true, 'USD', 2, 180, 1, '2026-02-10 17:58:29.124+00', '2026-02-10 17:58:29.124+00');
INSERT INTO public.credit_card_recurring_charges (id, description, amount, charge_day, is_active, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (12, 'RailWay', 5.00, 1, true, 'USD', 1, 9, 1, '2026-02-11 15:59:49.164+00', '2026-02-11 15:59:49.164+00');
INSERT INTO public.credit_card_recurring_charges (id, description, amount, charge_day, is_active, currency, credit_card_id, category_id, user_id, created_at, updated_at) VALUES (13, 'Apple Luz', 2.99, 1, true, 'USD', 1, 179, 1, '2026-02-12 23:31:43.166+00', '2026-02-12 23:31:43.166+00');


--
-- Name: credit_card_expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.credit_card_expenses_id_seq', 60, true);


--
-- Name: credit_card_installments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.credit_card_installments_id_seq', 168, true);


--
-- Name: credit_card_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.credit_card_payments_id_seq', 9, true);


--
-- Name: credit_card_recurring_charges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.credit_card_recurring_charges_id_seq', 13, true);


--
-- Name: credit_cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.credit_cards_id_seq', 7, true);


--
-- PostgreSQL database dump complete
--

\unrestrict u4DWUg60TM9LDY5RPCHqlSyHZiTDoIZLzWdjevXbno0a5E03HE5ereCpuSUwnV1

