--
-- PostgreSQL database dump
--

\restrict DIYbpmG2Rn1HArQVaBKTfLKoWdz1UIQ9RELDTzQzTY2eLpIqo5avSmTG6tQeiJI

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: enum_categories_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_categories_type AS ENUM (
    'Ingreso',
    'Egreso'
);


--
-- Name: enum_credit_cards_brand; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_credit_cards_brand AS ENUM (
    'Visa',
    'Mastercard',
    'American Express',
    'Otras'
);


--
-- Name: enum_exchange_rates_source; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_exchange_rates_source AS ENUM (
    'manual',
    'api',
    'oficial',
    'blue'
);


--
-- Name: enum_investments_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_investments_status AS ENUM (
    'Activo',
    'Vencido',
    'Rescatado'
);


--
-- Name: enum_investments_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_investments_type AS ENUM (
    'Plazo Fijo',
    'Compra Divisa',
    'Venta Divisa',
    'Otro'
);


--
-- Name: enum_loans_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_loans_status AS ENUM (
    'Activo',
    'Pagado',
    'Vencido'
);


--
-- Name: enum_mortgage_loans_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_mortgage_loans_status AS ENUM (
    'Activo',
    'Pagado'
);


--
-- Name: enum_payment_methods_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_payment_methods_type AS ENUM (
    'Efectivo',
    'Tarjeta',
    'Transferencia',
    'Billetera Virtual',
    'Otro'
);


--
-- Name: enum_pending_transactions_currency; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_pending_transactions_currency AS ENUM (
    'ARS',
    'USD'
);


--
-- Name: enum_pending_transactions_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_pending_transactions_status AS ENUM (
    'pending',
    'processed',
    'discarded'
);


--
-- Name: enum_pending_transactions_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_pending_transactions_type AS ENUM (
    'Ingreso',
    'Egreso'
);


--
-- Name: enum_transactions_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_transactions_type AS ENUM (
    'Ingreso',
    'Egreso'
);


--
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_users_role AS ENUM (
    'Admin',
    'Operador'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    type public.enum_categories_type NOT NULL,
    is_recurring boolean DEFAULT false NOT NULL,
    parent_category_id integer,
    user_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN categories.is_recurring; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.categories.is_recurring IS 'Indica si es una categor├¡a de gasto/ingreso fijo mensual';


--
-- Name: COLUMN categories.parent_category_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.categories.parent_category_id IS 'ID de la categor├¡a padre (null si es categor├¡a principal)';


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: credit_card_expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_card_expenses (
    id integer NOT NULL,
    description character varying(255) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    installments integer DEFAULT 1 NOT NULL,
    purchase_date date NOT NULL,
    currency character varying(3) DEFAULT 'ARS'::character varying NOT NULL,
    credit_card_id integer NOT NULL,
    category_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN credit_card_expenses.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_expenses.description IS 'Descripci├│n del gasto';


--
-- Name: COLUMN credit_card_expenses.total_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_expenses.total_amount IS 'Monto total del gasto (ya incluye inter├⌐s si aplica)';


--
-- Name: COLUMN credit_card_expenses.installments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_expenses.installments IS 'Cantidad de cuotas (1 = pago ├║nico)';


--
-- Name: COLUMN credit_card_expenses.purchase_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_expenses.purchase_date IS 'Fecha de la compra';


--
-- Name: COLUMN credit_card_expenses.currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_expenses.currency IS 'Moneda del gasto (ARS, USD)';


--
-- Name: credit_card_expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.credit_card_expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: credit_card_expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.credit_card_expenses_id_seq OWNED BY public.credit_card_expenses.id;


--
-- Name: credit_card_installments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_card_installments (
    id integer NOT NULL,
    installment_number integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    due_date date NOT NULL,
    is_paid boolean DEFAULT false NOT NULL,
    paid_date date,
    expense_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN credit_card_installments.installment_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_installments.installment_number IS 'N├║mero de cuota (1, 2, 3...)';


--
-- Name: COLUMN credit_card_installments.amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_installments.amount IS 'Monto de esta cuota';


--
-- Name: COLUMN credit_card_installments.due_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_installments.due_date IS 'Fecha de vencimiento de la cuota';


--
-- Name: COLUMN credit_card_installments.is_paid; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_installments.is_paid IS 'Indica si la cuota fue pagada';


--
-- Name: COLUMN credit_card_installments.paid_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_installments.paid_date IS 'Fecha en que se pag├│ la cuota';


--
-- Name: credit_card_installments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.credit_card_installments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: credit_card_installments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.credit_card_installments_id_seq OWNED BY public.credit_card_installments.id;


--
-- Name: credit_card_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_card_payments (
    id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_date date NOT NULL,
    currency character varying(3) DEFAULT 'ARS'::character varying NOT NULL,
    notes text,
    credit_card_id integer NOT NULL,
    transaction_id integer,
    user_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN credit_card_payments.amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_payments.amount IS 'Monto pagado del resumen';


--
-- Name: COLUMN credit_card_payments.payment_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_payments.payment_date IS 'Fecha en que se realiz├│ el pago';


--
-- Name: COLUMN credit_card_payments.currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_payments.currency IS 'Moneda del pago (ARS, USD)';


--
-- Name: COLUMN credit_card_payments.notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_payments.notes IS 'Notas adicionales sobre el pago';


--
-- Name: COLUMN credit_card_payments.transaction_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_payments.transaction_id IS 'Transacci├│n de egreso asociada al pago (afecta el balance)';


--
-- Name: credit_card_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.credit_card_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: credit_card_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.credit_card_payments_id_seq OWNED BY public.credit_card_payments.id;


--
-- Name: credit_card_recurring_charges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_card_recurring_charges (
    id integer NOT NULL,
    description character varying(255) NOT NULL,
    amount numeric(10,2) NOT NULL,
    charge_day integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    currency character varying(3) DEFAULT 'ARS'::character varying NOT NULL,
    credit_card_id integer NOT NULL,
    category_id integer,
    user_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN credit_card_recurring_charges.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_recurring_charges.description IS 'Descripci├│n del d├⌐bito (ej: Netflix, Spotify)';


--
-- Name: COLUMN credit_card_recurring_charges.amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_recurring_charges.amount IS 'Monto mensual del d├⌐bito';


--
-- Name: COLUMN credit_card_recurring_charges.charge_day; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_recurring_charges.charge_day IS 'D├¡a del mes en que se carga (1-31)';


--
-- Name: COLUMN credit_card_recurring_charges.is_active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_recurring_charges.is_active IS 'Indica si el d├⌐bito est├í activo';


--
-- Name: COLUMN credit_card_recurring_charges.currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_recurring_charges.currency IS 'Moneda del d├⌐bito (ARS, USD)';


--
-- Name: credit_card_recurring_charges_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.credit_card_recurring_charges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: credit_card_recurring_charges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.credit_card_recurring_charges_id_seq OWNED BY public.credit_card_recurring_charges.id;


--
-- Name: credit_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_cards (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    bank character varying(100) NOT NULL,
    brand public.enum_credit_cards_brand DEFAULT 'Otras'::public.enum_credit_cards_brand NOT NULL,
    last_four_digits character varying(4) NOT NULL,
    expiration_month integer NOT NULL,
    expiration_year integer NOT NULL,
    due_day integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN credit_cards.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_cards.name IS 'Nombre identificador de la tarjeta (ej: Visa Personal)';


--
-- Name: COLUMN credit_cards.bank; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_cards.bank IS 'Entidad emisora (ej: Banco Galicia)';


--
-- Name: COLUMN credit_cards.brand; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_cards.brand IS 'Marca de la tarjeta';


--
-- Name: COLUMN credit_cards.last_four_digits; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_cards.last_four_digits IS '├Ültimos 4 d├¡gitos de la tarjeta';


--
-- Name: COLUMN credit_cards.expiration_month; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_cards.expiration_month IS 'Mes de vencimiento (1-12)';


--
-- Name: COLUMN credit_cards.expiration_year; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_cards.expiration_year IS 'A├▒o de vencimiento (YYYY)';


--
-- Name: COLUMN credit_cards.due_day; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_cards.due_day IS 'D├¡a del mes de vencimiento del pago (1-31)';


--
-- Name: credit_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.credit_cards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: credit_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.credit_cards_id_seq OWNED BY public.credit_cards.id;


--
-- Name: exchange_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exchange_rates (
    id integer NOT NULL,
    currency_from character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    currency_to character varying(3) DEFAULT 'ARS'::character varying NOT NULL,
    rate numeric(10,2) NOT NULL,
    source public.enum_exchange_rates_source DEFAULT 'api'::public.enum_exchange_rates_source NOT NULL,
    date date NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN exchange_rates.rate; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.exchange_rates.rate IS 'Tasa de cambio';


--
-- Name: COLUMN exchange_rates.source; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.exchange_rates.source IS 'Origen de la cotizaci├│n';


--
-- Name: exchange_rates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.exchange_rates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: exchange_rates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.exchange_rates_id_seq OWNED BY public.exchange_rates.id;


--
-- Name: investment_earnings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.investment_earnings (
    id integer NOT NULL,
    investment_id integer NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency character varying(3) DEFAULT 'ARS'::character varying NOT NULL,
    earning_date date NOT NULL,
    notes text,
    transaction_id integer,
    user_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN investment_earnings.amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.investment_earnings.amount IS 'Monto del rendimiento';


--
-- Name: COLUMN investment_earnings.currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.investment_earnings.currency IS 'Moneda del rendimiento';


--
-- Name: COLUMN investment_earnings.earning_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.investment_earnings.earning_date IS 'Fecha del rendimiento';


--
-- Name: COLUMN investment_earnings.notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.investment_earnings.notes IS 'Notas adicionales';


--
-- Name: investment_earnings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.investment_earnings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: investment_earnings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.investment_earnings_id_seq OWNED BY public.investment_earnings.id;


--
-- Name: investments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.investments (
    id integer NOT NULL,
    type public.enum_investments_type NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency character varying(3) DEFAULT 'ARS'::character varying NOT NULL,
    "exchangeRate" numeric(10,2),
    "exchangeAmount" numeric(12,2),
    "exchangeCurrency" character varying(3),
    "startDate" date NOT NULL,
    "endDate" date,
    "interestRate" numeric(5,2),
    status public.enum_investments_status DEFAULT 'Activo'::public.enum_investments_status NOT NULL,
    entity character varying(255) NOT NULL,
    description text,
    "userId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN investments.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.investments.type IS 'Tipo de inversi├│n';


--
-- Name: COLUMN investments.amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.investments.amount IS 'Monto de la inversi├│n';


--
-- Name: COLUMN investments.currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.investments.currency IS 'Moneda de la inversi├│n';


--
-- Name: COLUMN investments."exchangeRate"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.investments."exchangeRate" IS 'Tipo de cambio usado (para compra/venta divisas)';


--
-- Name: COLUMN investments."exchangeAmount"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.investments."exchangeAmount" IS 'Monto en la otra moneda (para compra/venta divisas)';


--
-- Name: COLUMN investments."exchangeCurrency"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.investments."exchangeCurrency" IS 'Moneda de intercambio (para compra/venta divisas)';


--
-- Name: COLUMN investments."startDate"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.investments."startDate" IS 'Fecha de inicio';


--
-- Name: COLUMN investments."endDate"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.investments."endDate" IS 'Fecha de vencimiento';


--
-- Name: COLUMN investments."interestRate"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.investments."interestRate" IS 'Tasa de inter├⌐s anual';


--
-- Name: COLUMN investments.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.investments.status IS 'Estado de la inversi├│n';


--
-- Name: COLUMN investments.entity; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.investments.entity IS 'Banco, casa de cambio, etc.';


--
-- Name: investments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.investments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: investments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.investments_id_seq OWNED BY public.investments.id;


--
-- Name: loan_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loan_payments (
    id integer NOT NULL,
    loan_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_date date NOT NULL,
    transaction_id integer,
    notes text,
    user_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN loan_payments.amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loan_payments.amount IS 'Monto del pago';


--
-- Name: COLUMN loan_payments.payment_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loan_payments.payment_date IS 'Fecha del pago';


--
-- Name: COLUMN loan_payments.transaction_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loan_payments.transaction_id IS 'Transacci├│n asociada al pago';


--
-- Name: loan_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.loan_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: loan_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.loan_payments_id_seq OWNED BY public.loan_payments.id;


--
-- Name: loans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loans (
    id integer NOT NULL,
    entity character varying(100) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    pending_amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'ARS'::character varying NOT NULL,
    interest_rate numeric(5,2),
    loan_date date NOT NULL,
    due_date date,
    installments integer,
    installment_amount numeric(10,2),
    status public.enum_loans_status DEFAULT 'Activo'::public.enum_loans_status NOT NULL,
    description text,
    user_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN loans.entity; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loans.entity IS 'Banco/Entidad/Persona que otorg├│ el pr├⌐stamo';


--
-- Name: COLUMN loans.total_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loans.total_amount IS 'Monto total del pr├⌐stamo';


--
-- Name: COLUMN loans.pending_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loans.pending_amount IS 'Monto pendiente por pagar';


--
-- Name: COLUMN loans.currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loans.currency IS 'Moneda del pr├⌐stamo (ARS, USD)';


--
-- Name: COLUMN loans.interest_rate; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loans.interest_rate IS 'Tasa de inter├⌐s (%)';


--
-- Name: COLUMN loans.loan_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loans.loan_date IS 'Fecha de otorgamiento';


--
-- Name: COLUMN loans.due_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loans.due_date IS 'Fecha de vencimiento final';


--
-- Name: COLUMN loans.installments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loans.installments IS 'Cantidad de cuotas';


--
-- Name: COLUMN loans.installment_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loans.installment_amount IS 'Monto de cuota fija';


--
-- Name: COLUMN loans.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loans.description IS 'Notas adicionales';


--
-- Name: loans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.loans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: loans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.loans_id_seq OWNED BY public.loans.id;


--
-- Name: mortgage_installments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mortgage_installments (
    id integer NOT NULL,
    mortgage_loan_id integer NOT NULL,
    installment_number integer NOT NULL,
    capital_uva numeric(10,2) NOT NULL,
    interest_uva numeric(10,2) NOT NULL,
    total_uva numeric(10,2) NOT NULL,
    due_date date NOT NULL,
    is_paid boolean DEFAULT false NOT NULL,
    paid_date date,
    uva_rate numeric(10,2),
    amount_paid numeric(14,2),
    dollar_rate numeric(10,2),
    amount_usd numeric(12,2),
    transaction_id integer,
    user_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN mortgage_installments.installment_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mortgage_installments.installment_number IS 'N├║mero de cuota (1 a 360)';


--
-- Name: COLUMN mortgage_installments.capital_uva; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mortgage_installments.capital_uva IS 'Capital en UVAs de esta cuota';


--
-- Name: COLUMN mortgage_installments.interest_uva; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mortgage_installments.interest_uva IS 'Inter├⌐s en UVAs de esta cuota';


--
-- Name: COLUMN mortgage_installments.total_uva; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mortgage_installments.total_uva IS 'Total en UVAs (capital + inter├⌐s)';


--
-- Name: COLUMN mortgage_installments.due_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mortgage_installments.due_date IS 'Fecha de vencimiento de la cuota';


--
-- Name: COLUMN mortgage_installments.paid_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mortgage_installments.paid_date IS 'Fecha en que se pag├│ efectivamente';


--
-- Name: COLUMN mortgage_installments.uva_rate; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mortgage_installments.uva_rate IS 'Cotizaci├│n del UVA al momento del pago';


--
-- Name: COLUMN mortgage_installments.amount_paid; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mortgage_installments.amount_paid IS 'Monto pagado en pesos (totalUva ├ù uvaRate)';


--
-- Name: COLUMN mortgage_installments.dollar_rate; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mortgage_installments.dollar_rate IS 'Cotizaci├│n del d├│lar al momento del pago (dato estad├¡stico)';


--
-- Name: COLUMN mortgage_installments.amount_usd; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mortgage_installments.amount_usd IS 'Equivalente en USD (amountPaid / dollarRate)';


--
-- Name: COLUMN mortgage_installments.transaction_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mortgage_installments.transaction_id IS 'Transacci├│n asociada al pago';


--
-- Name: mortgage_installments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mortgage_installments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mortgage_installments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mortgage_installments_id_seq OWNED BY public.mortgage_installments.id;


--
-- Name: mortgage_loans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mortgage_loans (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    total_uva numeric(12,2) NOT NULL,
    paid_uva numeric(12,2) DEFAULT 0 NOT NULL,
    total_installments integer DEFAULT 360 NOT NULL,
    paid_installments integer DEFAULT 0 NOT NULL,
    annual_rate numeric(5,2) NOT NULL,
    start_date date NOT NULL,
    status public.enum_mortgage_loans_status DEFAULT 'Activo'::public.enum_mortgage_loans_status NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN mortgage_loans.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mortgage_loans.name IS 'Nombre descriptivo del pr├⌐stamo (ej: Hipotecario Banco Naci├│n)';


--
-- Name: COLUMN mortgage_loans.total_uva; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mortgage_loans.total_uva IS 'Monto total del pr├⌐stamo en UVAs';


--
-- Name: COLUMN mortgage_loans.paid_uva; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mortgage_loans.paid_uva IS 'Total de UVAs pagadas hasta ahora';


--
-- Name: COLUMN mortgage_loans.total_installments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mortgage_loans.total_installments IS 'Cantidad total de cuotas';


--
-- Name: COLUMN mortgage_loans.paid_installments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mortgage_loans.paid_installments IS 'Cantidad de cuotas pagadas';


--
-- Name: COLUMN mortgage_loans.annual_rate; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mortgage_loans.annual_rate IS 'TNA del pr├⌐stamo (%)';


--
-- Name: COLUMN mortgage_loans.start_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mortgage_loans.start_date IS 'Fecha de inicio del pr├⌐stamo';


--
-- Name: mortgage_loans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mortgage_loans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mortgage_loans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mortgage_loans_id_seq OWNED BY public.mortgage_loans.id;


--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_methods (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    type public.enum_payment_methods_type NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: payment_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_methods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_methods_id_seq OWNED BY public.payment_methods.id;


--
-- Name: pending_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pending_transactions (
    id integer NOT NULL,
    "rawMessage" text NOT NULL,
    amount numeric(15,2),
    currency public.enum_pending_transactions_currency DEFAULT 'ARS'::public.enum_pending_transactions_currency,
    type public.enum_pending_transactions_type,
    "suggestedCategory" character varying(100),
    description character varying(255),
    "transactionDate" timestamp with time zone NOT NULL,
    status public.enum_pending_transactions_status DEFAULT 'pending'::public.enum_pending_transactions_status NOT NULL,
    "userId" integer NOT NULL,
    "processedTransactionId" integer,
    "telegramMessageId" character varying(100),
    "telegramChatId" character varying(100),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN pending_transactions."rawMessage"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_transactions."rawMessage" IS 'Mensaje original enviado por Telegram';


--
-- Name: COLUMN pending_transactions.amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_transactions.amount IS 'Monto detectado autom├íticamente';


--
-- Name: COLUMN pending_transactions.currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_transactions.currency IS 'Moneda detectada';


--
-- Name: COLUMN pending_transactions.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_transactions.type IS 'Tipo de transacci├│n detectado';


--
-- Name: COLUMN pending_transactions."suggestedCategory"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_transactions."suggestedCategory" IS 'Categor├¡a sugerida por el parser';


--
-- Name: COLUMN pending_transactions.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_transactions.description IS 'Descripci├│n extra├¡da del mensaje';


--
-- Name: COLUMN pending_transactions."transactionDate"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_transactions."transactionDate" IS 'Fecha/hora del mensaje';


--
-- Name: COLUMN pending_transactions.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_transactions.status IS 'Estado de la transacci├│n pendiente';


--
-- Name: COLUMN pending_transactions."processedTransactionId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_transactions."processedTransactionId" IS 'ID de la transacci├│n creada al procesar';


--
-- Name: COLUMN pending_transactions."telegramMessageId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_transactions."telegramMessageId" IS 'ID del mensaje de Telegram';


--
-- Name: COLUMN pending_transactions."telegramChatId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_transactions."telegramChatId" IS 'Chat ID de Telegram del usuario';


--
-- Name: pending_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pending_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pending_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pending_transactions_id_seq OWNED BY public.pending_transactions.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    date date NOT NULL,
    description character varying(255),
    type public.enum_transactions_type NOT NULL,
    currency character varying(3) DEFAULT 'ARS'::character varying NOT NULL,
    category_id integer NOT NULL,
    payment_method_id integer,
    user_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN transactions.currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.transactions.currency IS 'Moneda de la transacci├│n (ARS, USD)';


--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: user_telegram_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_telegram_links (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "telegramChatId" character varying(100) NOT NULL,
    "telegramUsername" character varying(255),
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: user_telegram_links_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_telegram_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_telegram_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_telegram_links_id_seq OWNED BY public.user_telegram_links.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash character varying(200) NOT NULL,
    role public.enum_users_role DEFAULT 'Operador'::public.enum_users_role NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
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
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: credit_card_expenses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_expenses ALTER COLUMN id SET DEFAULT nextval('public.credit_card_expenses_id_seq'::regclass);


--
-- Name: credit_card_installments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_installments ALTER COLUMN id SET DEFAULT nextval('public.credit_card_installments_id_seq'::regclass);


--
-- Name: credit_card_payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_payments ALTER COLUMN id SET DEFAULT nextval('public.credit_card_payments_id_seq'::regclass);


--
-- Name: credit_card_recurring_charges id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_recurring_charges ALTER COLUMN id SET DEFAULT nextval('public.credit_card_recurring_charges_id_seq'::regclass);


--
-- Name: credit_cards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_cards ALTER COLUMN id SET DEFAULT nextval('public.credit_cards_id_seq'::regclass);


--
-- Name: exchange_rates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_rates ALTER COLUMN id SET DEFAULT nextval('public.exchange_rates_id_seq'::regclass);


--
-- Name: investment_earnings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_earnings ALTER COLUMN id SET DEFAULT nextval('public.investment_earnings_id_seq'::regclass);


--
-- Name: investments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investments ALTER COLUMN id SET DEFAULT nextval('public.investments_id_seq'::regclass);


--
-- Name: loan_payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_payments ALTER COLUMN id SET DEFAULT nextval('public.loan_payments_id_seq'::regclass);


--
-- Name: loans id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans ALTER COLUMN id SET DEFAULT nextval('public.loans_id_seq'::regclass);


--
-- Name: mortgage_installments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mortgage_installments ALTER COLUMN id SET DEFAULT nextval('public.mortgage_installments_id_seq'::regclass);


--
-- Name: mortgage_loans id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mortgage_loans ALTER COLUMN id SET DEFAULT nextval('public.mortgage_loans_id_seq'::regclass);


--
-- Name: payment_methods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods ALTER COLUMN id SET DEFAULT nextval('public.payment_methods_id_seq'::regclass);


--
-- Name: pending_transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_transactions ALTER COLUMN id SET DEFAULT nextval('public.pending_transactions_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: user_telegram_links id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_telegram_links ALTER COLUMN id SET DEFAULT nextval('public.user_telegram_links_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, type, is_recurring, parent_category_id, user_id, created_at, updated_at) FROM stdin;
169	Gimnasio/Deportes	Egreso	t	166	1	2026-01-28 13:07:44+00	2026-02-04 16:58:46.33+00
235	Sueldo Dami├ín	Ingreso	t	234	1	2026-01-30 14:39:01+00	2026-02-04 17:52:59.082+00
148	Electricidad	Egreso	t	145	1	2026-01-28 13:07:44+00	2026-02-04 16:59:01.427+00
147	Expensas	Egreso	t	145	1	2026-01-28 13:07:44+00	2026-02-04 16:59:04.503+00
149	Gas	Egreso	t	145	1	2026-01-28 13:07:44+00	2026-02-04 16:59:07.073+00
146	Hipoteca	Egreso	t	145	1	2026-01-28 13:07:44+00	2026-02-04 16:59:09.503+00
151	Internet	Egreso	t	145	1	2026-01-28 13:07:44+00	2026-02-04 16:59:12.475+00
153	Limpieza	Egreso	t	145	1	2026-01-28 13:07:44+00	2026-02-04 16:59:15.42+00
2	Gastos personales Damian	Egreso	t	1	1	2026-02-09 11:38:24.185+00	2026-02-09 11:38:24.185+00
1	Gastos Personales	Egreso	f	\N	1	2026-02-09 11:38:07.354+00	2026-02-09 11:38:27.049+00
152	ABL	Egreso	f	145	1	2026-01-28 13:07:44+00	2026-02-04 17:13:04.079+00
3	Gastos Personales Luz	Egreso	t	1	1	2026-02-09 11:38:41.81+00	2026-02-09 11:38:41.81+00
4	Pasajes	Egreso	f	\N	1	2026-02-10 12:47:54.785+00	2026-02-10 12:47:54.785+00
5	Pasajes a├⌐reos	Egreso	f	4	1	2026-02-10 12:48:10.761+00	2026-02-10 12:48:10.761+00
6	Cuota Club	Egreso	t	176	1	2026-02-10 17:35:08.25+00	2026-02-10 17:35:08.25+00
7	Canva	Egreso	t	176	1	2026-02-10 17:50:32.763+00	2026-02-10 17:50:32.763+00
145	Gastos del Departamento	Egreso	f	\N	1	2026-01-28 13:07:44+00	2026-02-04 17:13:25.799+00
180	Git Copilot	Egreso	t	176	1	2026-01-28 13:07:44+00	2026-02-10 17:50:42.688+00
177	Netflix	Egreso	t	176	1	2026-01-28 13:07:44+00	2026-02-10 17:50:43.561+00
178	Spotify	Egreso	t	176	1	2026-01-28 13:07:44+00	2026-02-10 17:50:45.149+00
179	Apple	Egreso	t	176	1	2026-01-28 13:07:44+00	2026-02-10 17:50:46.455+00
160	Auto	Egreso	f	\N	1	2026-01-28 13:07:44+00	2026-02-04 17:14:12.181+00
8	Tarjetas de credito	Egreso	f	\N	1	2026-02-10 18:05:06.448+00	2026-02-10 18:05:06.448+00
230	Servicios profesionales	Egreso	t	229	3	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
159	Otros	Egreso	f	155	1	2026-01-28 13:07:44+00	2026-02-04 17:52:11.861+00
162	Mantenimiento	Egreso	f	160	1	2026-01-28 13:07:44+00	2026-02-04 17:52:17.248+00
167	Consultas medicas	Egreso	f	166	1	2026-01-28 13:07:44+00	2026-02-04 17:52:22.362+00
150	Agua	Egreso	t	145	1	2026-01-28 13:07:44+00	2026-02-04 17:52:35.409+00
154	Mantenimiento	Egreso	f	145	1	2026-01-28 13:07:44+00	2026-02-04 17:52:39.004+00
155	Alimentaci├│n	Egreso	f	\N	1	2026-01-28 13:07:44+00	2026-01-28 13:15:02+00
165	Patente	Egreso	f	160	1	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
166	Deporte y Salud	Egreso	f	\N	1	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
168	Farmacia	Egreso	f	166	1	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
170	Peluquer├¡a	Egreso	f	166	1	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
176	Suscripciones	Egreso	f	\N	1	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
215	Educaci├│n	Egreso	f	\N	3	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
216	Cursos/Capacitaciones	Egreso	f	215	3	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
217	Materiales de estudio	Egreso	f	215	3	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
218	Libros	Egreso	f	215	3	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
219	Suscripciones educativas	Egreso	f	215	3	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
225	Ropa y Accesorios	Egreso	f	\N	3	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
226	Ropa	Egreso	f	225	3	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
227	Zapatillas	Egreso	f	225	3	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
228	Otros	Egreso	f	225	3	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
229	Impuestos y Servicios	Egreso	f	\N	3	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
231	Honorarios	Egreso	f	229	3	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
232	Tr├ímites	Egreso	f	229	3	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
237	Inversiones	Ingreso	f	\N	1	2026-01-30 14:44:26+00	2026-01-30 14:44:26+00
158	Carnicer├¡a	Egreso	t	155	1	2026-01-28 13:07:44+00	2026-02-04 16:57:54.711+00
156	Supermercado	Egreso	t	155	1	2026-01-28 13:07:44+00	2026-02-04 16:58:21.736+00
157	Verduler├¡a	Egreso	t	155	1	2026-01-28 13:07:44+00	2026-02-04 16:58:24.162+00
9	Railway	Egreso	t	176	1	2026-02-11 15:59:05.492+00	2026-02-11 15:59:05.492+00
234	Sueldos	Ingreso	f	\N	1	2026-01-30 14:38:13+00	2026-02-11 16:09:38.888+00
236	Sueldo Luz	Ingreso	t	234	1	2026-01-30 14:39:21+00	2026-02-11 16:14:20.677+00
13	Pr├⌐stamos	Egreso	f	\N	1	2026-02-12 23:40:07.13+00	2026-02-12 23:40:07.13+00
161	Combustible	Egreso	t	160	1	2026-01-28 13:07:44+00	2026-02-13 16:14:50.717+00
164	Seguros del auto	Egreso	t	160	1	2026-01-28 13:07:44+00	2026-02-13 16:14:54.798+00
14	Inversiones	Ingreso	f	\N	1	2026-03-03 15:44:18.661+00	2026-03-03 15:44:18.661+00
163	Estacionamiento	Egreso	t	160	1	2026-01-28 13:07:44+00	2026-03-03 17:26:09.575+00
15	Hipotecario	Egreso	f	\N	1	2026-03-11 14:29:40.218+00	2026-03-11 14:29:40.218+00
\.


--
-- Data for Name: credit_card_expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.credit_card_expenses (id, description, total_amount, installments, purchase_date, currency, credit_card_id, category_id, user_id, created_at, updated_at) FROM stdin;
9	Pasaje Luz Tucuman	132917.50	5	2026-02-10	ARS	1	5	1	2026-02-10 17:25:39.056+00	2026-02-10 17:25:39.056+00
10	Pasaje Luz Tucuman	181750.00	3	2026-02-10	ARS	1	5	1	2026-02-10 17:28:17.51+00	2026-02-10 17:28:17.51+00
11	Pasaje Tucuman Malena	116465.50	2	2026-02-10	ARS	1	5	1	2026-02-10 17:29:39.027+00	2026-02-10 17:29:39.027+00
12	Zapateria Febo	113000.00	2	2026-02-10	ARS	2	227	1	2026-02-10 17:39:52.513+00	2026-02-10 17:39:52.513+00
13	Pintura Merc. Libre	213200.00	4	2026-02-10	ARS	2	154	1	2026-02-10 17:41:04.05+00	2026-02-10 17:41:04.05+00
14	Easy Palermo	57793.00	1	2026-02-10	ARS	2	154	1	2026-02-10 17:41:51.264+00	2026-02-10 17:41:51.264+00
15	URBANMDA	76666.68	2	2026-02-10	ARS	2	226	1	2026-02-10 17:43:09.701+00	2026-02-10 17:43:09.701+00
16	Pinturas Prestigio	100006.00	5	2026-02-10	ARS	2	154	1	2026-02-10 17:44:30.787+00	2026-02-10 17:44:30.787+00
17	Pinturas Prestigio	90150.00	5	2026-02-10	ARS	2	154	1	2026-02-10 17:46:00.986+00	2026-02-10 17:46:00.986+00
18	Easy Palermo	126990.00	2	2026-02-10	ARS	2	154	1	2026-02-10 17:47:52.397+00	2026-02-10 17:47:52.397+00
19	Pinturas Prestigio	125000.00	5	2026-02-10	ARS	2	154	1	2026-02-10 17:48:29.507+00	2026-02-10 17:48:29.507+00
20	Easy Palermo	145925.50	2	2026-02-10	ARS	2	154	1	2026-02-10 17:49:36.334+00	2026-02-10 17:49:36.334+00
21	Sodimac Palermo	131100.00	2	2026-02-10	ARS	2	154	1	2026-02-10 17:55:57.752+00	2026-02-10 17:55:57.752+00
22	Filtro PSA	582600.00	15	2026-02-10	ARS	2	154	1	2026-02-10 17:57:58.639+00	2026-02-10 17:57:58.639+00
23	Regalo Diego	69900.00	1	2026-02-12	ARS	1	228	1	2026-02-12 12:28:50.892+00	2026-02-12 12:28:50.892+00
24	Compra Pesce	117000.00	1	2026-02-12	ARS	1	158	1	2026-02-12 23:29:47.944+00	2026-02-12 23:29:47.944+00
26	Nafta	70000.00	1	2026-02-13	ARS	2	161	1	2026-02-13 18:00:12.886+00	2026-02-13 18:00:12.886+00
27	Compra Easy Palermo	89000.00	1	2026-02-16	ARS	1	154	1	2026-02-16 20:04:44.645+00	2026-02-16 20:04:44.645+00
28	Aplique pared Led - Pana Iluminaci├│n	40949.10	1	2026-02-09	ARS	6	228	3	2026-02-23 15:50:07.828+00	2026-02-23 15:50:07.828+00
29	Papel freidora + Bazar	35318.00	1	2026-02-09	ARS	7	228	3	2026-02-23 15:50:44.793+00	2026-02-23 15:50:44.793+00
30	Tacho de Ropa sucia	35748.89	1	2026-02-09	ARS	7	228	3	2026-02-23 15:51:18.746+00	2026-02-23 15:51:18.746+00
31	Repasadores	39391.00	1	2026-02-09	ARS	7	228	3	2026-02-23 15:51:52.12+00	2026-02-23 15:51:52.12+00
32	Producto limpia sill├│n	24560.09	1	2026-02-09	ARS	7	228	3	2026-02-23 15:52:24.597+00	2026-02-23 15:52:24.597+00
33	Soporte organizador lavadero	39833.96	1	2026-02-09	ARS	7	228	3	2026-02-23 15:52:55.354+00	2026-02-23 15:52:55.354+00
34	Cremas carita Luz	21000.00	1	2026-02-19	ARS	3	168	3	2026-02-23 15:54:30.147+00	2026-02-23 15:54:30.147+00
36	Cebra - Regalo ni├▒os	16663.32	2	2026-02-19	ARS	3	228	3	2026-02-23 15:57:07.289+00	2026-02-23 15:57:07.289+00
38	Vacuna Varicela	110672.00	1	2026-02-20	ARS	6	167	3	2026-02-23 16:00:10.158+00	2026-02-23 16:00:10.158+00
39	Jardiner├¡a - macetas	238000.00	1	2026-02-18	ARS	6	228	3	2026-02-23 16:00:58.383+00	2026-02-23 16:00:58.383+00
40	Aspiradora Robot Gadnic	300999.00	6	2026-02-12	ARS	6	228	3	2026-02-23 16:01:56.136+00	2026-02-23 16:01:56.136+00
41	Farmacity	127866.12	3	2026-02-07	ARS	3	168	3	2026-02-23 16:04:05.749+00	2026-02-23 16:04:05.749+00
42	Plateanet - Servicio de compra (Moria)	14400.00	1	2026-02-21	ARS	6	228	3	2026-02-23 16:08:13.787+00	2026-02-23 16:08:13.787+00
43	Plateanet - Servicio de compra (Moldavsky)	25200.00	1	2026-02-21	ARS	6	228	3	2026-02-23 16:09:00.871+00	2026-02-23 16:09:10+00
44	Plateanet - Entradas (Moria)	120000.00	1	2026-02-21	ARS	6	228	3	2026-02-23 16:11:10.712+00	2026-02-23 16:11:10.712+00
45	Plateanet - Entradas Moldavsky	210000.00	3	2026-02-21	ARS	6	228	3	2026-02-23 16:12:24.042+00	2026-02-23 16:12:24.042+00
46	Pregna - Tratamiento	702000.00	6	2026-02-19	ARS	4	167	3	2026-02-23 16:31:14.343+00	2026-02-23 16:31:14.343+00
47	Passline - Entradas Bs As Cumbia Diciembre	92000.00	4	2026-02-19	ARS	3	228	3	2026-02-23 16:31:58.872+00	2026-02-23 16:31:58.872+00
48	Nafta	32000.00	1	2026-02-23	ARS	2	161	1	2026-02-23 16:40:58.748+00	2026-02-23 16:40:58.748+00
49	Vacuna Hepatitis A y B - 1era dosis	103825.00	1	2026-02-26	ARS	6	168	3	2026-02-26 14:55:41.46+00	2026-02-26 14:55:41.46+00
51	Nafta	70000.00	1	2026-03-03	ARS	2	161	1	2026-03-03 17:25:37.43+00	2026-03-03 17:25:37.43+00
52	Nafta	57000.00	1	2026-03-10	ARS	7	161	1	2026-03-10 12:14:01.951+00	2026-03-10 12:14:01.951+00
53	Machi	200948.00	6	2026-03-10	ARS	5	226	3	2026-03-10 15:24:22.794+00	2026-03-10 15:24:22.794+00
54	MacStation	319980.00	3	2026-03-03	ARS	6	228	3	2026-03-10 15:27:05.173+00	2026-03-10 15:27:05.173+00
55	Nafta	57000.00	1	2026-03-12	ARS	7	161	1	2026-03-12 12:15:31.174+00	2026-03-12 12:15:31.174+00
56	Almacen	46900.00	1	2026-03-31	ARS	5	156	1	2026-03-31 11:35:50.351+00	2026-03-31 11:35:50.351+00
57	Vacunas	108282.00	1	2026-03-31	ARS	7	167	1	2026-03-31 11:36:45.342+00	2026-03-31 11:36:45.342+00
58	Medicamentos Damian	125000.00	1	2026-03-31	ARS	2	168	1	2026-03-31 11:37:44.277+00	2026-03-31 11:37:44.277+00
59	Regalos Ni├▒os	95997.00	3	2026-03-31	ARS	7	228	1	2026-03-31 11:39:33.588+00	2026-03-31 11:39:33.588+00
60	Vacunas Luz	55752.00	1	2026-03-31	ARS	6	168	1	2026-03-31 11:41:06.573+00	2026-03-31 11:41:06.573+00
\.


--
-- Data for Name: credit_card_installments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.credit_card_installments (id, installment_number, amount, due_date, is_paid, paid_date, expense_id, created_at, updated_at) FROM stdin;
41	1	26583.50	2026-03-01	f	\N	9	2026-02-10 17:25:39.191+00	2026-02-10 17:25:39.191+00
42	2	26583.50	2026-04-01	f	\N	9	2026-02-10 17:25:39.191+00	2026-02-10 17:25:39.191+00
43	3	26583.50	2026-05-01	f	\N	9	2026-02-10 17:25:39.191+00	2026-02-10 17:25:39.191+00
44	4	26583.50	2026-06-01	f	\N	9	2026-02-10 17:25:39.191+00	2026-02-10 17:25:39.191+00
45	5	26583.50	2026-07-01	f	\N	9	2026-02-10 17:25:39.191+00	2026-02-10 17:25:39.191+00
46	1	60583.33	2026-03-01	f	\N	10	2026-02-10 17:28:17.64+00	2026-02-10 17:28:17.64+00
47	2	60583.33	2026-04-01	f	\N	10	2026-02-10 17:28:17.64+00	2026-02-10 17:28:17.64+00
48	3	60583.33	2026-05-01	f	\N	10	2026-02-10 17:28:17.64+00	2026-02-10 17:28:17.64+00
49	1	58232.75	2026-03-01	f	\N	11	2026-02-10 17:29:39.164+00	2026-02-10 17:29:39.164+00
50	2	58232.75	2026-04-01	f	\N	11	2026-02-10 17:29:39.164+00	2026-02-10 17:29:39.164+00
51	1	56500.00	2026-03-01	f	\N	12	2026-02-10 17:39:52.647+00	2026-02-10 17:39:52.647+00
52	2	56500.00	2026-04-01	f	\N	12	2026-02-10 17:39:52.647+00	2026-02-10 17:39:52.647+00
53	1	53300.00	2026-03-01	f	\N	13	2026-02-10 17:41:04.175+00	2026-02-10 17:41:04.175+00
54	2	53300.00	2026-04-01	f	\N	13	2026-02-10 17:41:04.175+00	2026-02-10 17:41:04.175+00
55	3	53300.00	2026-05-01	f	\N	13	2026-02-10 17:41:04.175+00	2026-02-10 17:41:04.175+00
56	4	53300.00	2026-06-01	f	\N	13	2026-02-10 17:41:04.175+00	2026-02-10 17:41:04.175+00
57	1	57793.00	2026-03-01	f	\N	14	2026-02-10 17:41:51.387+00	2026-02-10 17:41:51.387+00
58	1	38333.34	2026-03-01	f	\N	15	2026-02-10 17:43:09.822+00	2026-02-10 17:43:09.822+00
59	2	38333.34	2026-04-01	f	\N	15	2026-02-10 17:43:09.822+00	2026-02-10 17:43:09.822+00
60	1	20001.20	2026-03-01	f	\N	16	2026-02-10 17:44:30.911+00	2026-02-10 17:44:30.911+00
61	2	20001.20	2026-04-01	f	\N	16	2026-02-10 17:44:30.911+00	2026-02-10 17:44:30.911+00
62	3	20001.20	2026-05-01	f	\N	16	2026-02-10 17:44:30.911+00	2026-02-10 17:44:30.911+00
63	4	20001.20	2026-06-01	f	\N	16	2026-02-10 17:44:30.911+00	2026-02-10 17:44:30.911+00
64	5	20001.20	2026-07-01	f	\N	16	2026-02-10 17:44:30.911+00	2026-02-10 17:44:30.911+00
65	1	18030.00	2026-03-01	f	\N	17	2026-02-10 17:46:01.114+00	2026-02-10 17:46:01.114+00
66	2	18030.00	2026-04-01	f	\N	17	2026-02-10 17:46:01.114+00	2026-02-10 17:46:01.114+00
67	3	18030.00	2026-05-01	f	\N	17	2026-02-10 17:46:01.114+00	2026-02-10 17:46:01.114+00
68	4	18030.00	2026-06-01	f	\N	17	2026-02-10 17:46:01.114+00	2026-02-10 17:46:01.114+00
69	5	18030.00	2026-07-01	f	\N	17	2026-02-10 17:46:01.114+00	2026-02-10 17:46:01.114+00
70	1	63495.00	2026-03-01	f	\N	18	2026-02-10 17:47:52.523+00	2026-02-10 17:47:52.523+00
71	2	63495.00	2026-04-01	f	\N	18	2026-02-10 17:47:52.523+00	2026-02-10 17:47:52.523+00
72	1	25000.00	2026-03-01	f	\N	19	2026-02-10 17:48:29.645+00	2026-02-10 17:48:29.645+00
73	2	25000.00	2026-04-01	f	\N	19	2026-02-10 17:48:29.645+00	2026-02-10 17:48:29.645+00
74	3	25000.00	2026-05-01	f	\N	19	2026-02-10 17:48:29.645+00	2026-02-10 17:48:29.645+00
75	4	25000.00	2026-06-01	f	\N	19	2026-02-10 17:48:29.645+00	2026-02-10 17:48:29.645+00
76	5	25000.00	2026-07-01	f	\N	19	2026-02-10 17:48:29.645+00	2026-02-10 17:48:29.645+00
77	1	72962.75	2026-03-01	f	\N	20	2026-02-10 17:49:36.463+00	2026-02-10 17:49:36.463+00
78	2	72962.75	2026-04-01	f	\N	20	2026-02-10 17:49:36.463+00	2026-02-10 17:49:36.463+00
79	1	65550.00	2026-03-01	f	\N	21	2026-02-10 17:55:57.888+00	2026-02-10 17:55:57.888+00
80	2	65550.00	2026-04-01	f	\N	21	2026-02-10 17:55:57.888+00	2026-02-10 17:55:57.888+00
81	1	38840.00	2026-03-01	f	\N	22	2026-02-10 17:57:58.769+00	2026-02-10 17:57:58.769+00
82	2	38840.00	2026-04-01	f	\N	22	2026-02-10 17:57:58.769+00	2026-02-10 17:57:58.769+00
83	3	38840.00	2026-05-01	f	\N	22	2026-02-10 17:57:58.769+00	2026-02-10 17:57:58.769+00
84	4	38840.00	2026-06-01	f	\N	22	2026-02-10 17:57:58.769+00	2026-02-10 17:57:58.769+00
85	5	38840.00	2026-07-01	f	\N	22	2026-02-10 17:57:58.769+00	2026-02-10 17:57:58.769+00
86	6	38840.00	2026-08-01	f	\N	22	2026-02-10 17:57:58.769+00	2026-02-10 17:57:58.769+00
87	7	38840.00	2026-09-01	f	\N	22	2026-02-10 17:57:58.769+00	2026-02-10 17:57:58.769+00
88	8	38840.00	2026-10-01	f	\N	22	2026-02-10 17:57:58.769+00	2026-02-10 17:57:58.769+00
89	9	38840.00	2026-11-01	f	\N	22	2026-02-10 17:57:58.769+00	2026-02-10 17:57:58.769+00
90	10	38840.00	2026-12-01	f	\N	22	2026-02-10 17:57:58.769+00	2026-02-10 17:57:58.769+00
91	11	38840.00	2027-01-01	f	\N	22	2026-02-10 17:57:58.769+00	2026-02-10 17:57:58.769+00
92	12	38840.00	2027-02-01	f	\N	22	2026-02-10 17:57:58.769+00	2026-02-10 17:57:58.769+00
93	13	38840.00	2027-03-01	f	\N	22	2026-02-10 17:57:58.769+00	2026-02-10 17:57:58.769+00
94	14	38840.00	2027-04-01	f	\N	22	2026-02-10 17:57:58.769+00	2026-02-10 17:57:58.769+00
95	15	38840.00	2027-05-01	f	\N	22	2026-02-10 17:57:58.769+00	2026-02-10 17:57:58.769+00
96	1	69900.00	2026-03-01	f	\N	23	2026-02-12 12:28:50.904+00	2026-02-12 12:28:50.904+00
97	1	117000.00	2026-03-01	f	\N	24	2026-02-12 23:29:47.954+00	2026-02-12 23:29:47.954+00
99	1	70000.00	2026-03-01	f	\N	26	2026-02-13 18:00:12.899+00	2026-02-13 18:00:12.899+00
100	1	89000.00	2026-03-01	f	\N	27	2026-02-16 20:04:44.652+00	2026-02-16 20:04:44.652+00
101	1	40949.10	2026-03-01	f	\N	28	2026-02-23 15:50:07.835+00	2026-02-23 15:50:07.835+00
102	1	35318.00	2026-03-01	f	\N	29	2026-02-23 15:50:44.796+00	2026-02-23 15:50:44.796+00
103	1	35748.89	2026-03-01	f	\N	30	2026-02-23 15:51:18.752+00	2026-02-23 15:51:18.752+00
104	1	39391.00	2026-03-01	f	\N	31	2026-02-23 15:51:52.126+00	2026-02-23 15:51:52.126+00
105	1	24560.09	2026-03-01	f	\N	32	2026-02-23 15:52:24.602+00	2026-02-23 15:52:24.602+00
106	1	39833.96	2026-03-01	f	\N	33	2026-02-23 15:52:55.359+00	2026-02-23 15:52:55.359+00
107	1	21000.00	2026-03-01	f	\N	34	2026-02-23 15:54:30.152+00	2026-02-23 15:54:30.152+00
112	1	8331.66	2026-03-01	f	\N	36	2026-02-23 15:57:07.294+00	2026-02-23 15:57:07.294+00
113	2	8331.66	2026-04-01	f	\N	36	2026-02-23 15:57:07.294+00	2026-02-23 15:57:07.294+00
120	1	110672.00	2026-03-01	f	\N	38	2026-02-23 16:00:10.164+00	2026-02-23 16:00:10.164+00
121	1	238000.00	2026-03-01	f	\N	39	2026-02-23 16:00:58.388+00	2026-02-23 16:00:58.388+00
122	1	50166.50	2026-03-01	f	\N	40	2026-02-23 16:01:56.141+00	2026-02-23 16:01:56.141+00
123	2	50166.50	2026-04-01	f	\N	40	2026-02-23 16:01:56.141+00	2026-02-23 16:01:56.141+00
124	3	50166.50	2026-05-01	f	\N	40	2026-02-23 16:01:56.141+00	2026-02-23 16:01:56.141+00
125	4	50166.50	2026-06-01	f	\N	40	2026-02-23 16:01:56.141+00	2026-02-23 16:01:56.141+00
126	5	50166.50	2026-07-01	f	\N	40	2026-02-23 16:01:56.141+00	2026-02-23 16:01:56.141+00
127	6	50166.50	2026-08-01	f	\N	40	2026-02-23 16:01:56.141+00	2026-02-23 16:01:56.141+00
128	1	42622.04	2026-03-01	f	\N	41	2026-02-23 16:04:05.754+00	2026-02-23 16:04:05.754+00
129	2	42622.04	2026-04-01	f	\N	41	2026-02-23 16:04:05.754+00	2026-02-23 16:04:05.754+00
130	3	42622.04	2026-05-01	f	\N	41	2026-02-23 16:04:05.754+00	2026-02-23 16:04:05.754+00
131	1	14400.00	2026-03-01	f	\N	42	2026-02-23 16:08:13.792+00	2026-02-23 16:08:13.792+00
132	1	25200.00	2026-03-01	f	\N	43	2026-02-23 16:09:00.877+00	2026-02-23 16:09:00.877+00
133	1	120000.00	2026-03-01	f	\N	44	2026-02-23 16:11:10.717+00	2026-02-23 16:11:10.717+00
134	1	70000.00	2026-03-01	f	\N	45	2026-02-23 16:12:24.047+00	2026-02-23 16:12:24.047+00
135	2	70000.00	2026-04-01	f	\N	45	2026-02-23 16:12:24.047+00	2026-02-23 16:12:24.047+00
136	3	70000.00	2026-05-01	f	\N	45	2026-02-23 16:12:24.047+00	2026-02-23 16:12:24.047+00
137	1	117000.00	2026-03-01	f	\N	46	2026-02-23 16:31:14.348+00	2026-02-23 16:31:14.348+00
138	2	117000.00	2026-04-01	f	\N	46	2026-02-23 16:31:14.348+00	2026-02-23 16:31:14.348+00
139	3	117000.00	2026-05-01	f	\N	46	2026-02-23 16:31:14.348+00	2026-02-23 16:31:14.348+00
140	4	117000.00	2026-06-01	f	\N	46	2026-02-23 16:31:14.348+00	2026-02-23 16:31:14.348+00
141	5	117000.00	2026-07-01	f	\N	46	2026-02-23 16:31:14.348+00	2026-02-23 16:31:14.348+00
142	6	117000.00	2026-08-01	f	\N	46	2026-02-23 16:31:14.348+00	2026-02-23 16:31:14.348+00
143	1	23000.00	2026-03-01	f	\N	47	2026-02-23 16:31:58.877+00	2026-02-23 16:31:58.877+00
144	2	23000.00	2026-04-01	f	\N	47	2026-02-23 16:31:58.877+00	2026-02-23 16:31:58.877+00
145	3	23000.00	2026-05-01	f	\N	47	2026-02-23 16:31:58.877+00	2026-02-23 16:31:58.877+00
146	4	23000.00	2026-06-01	f	\N	47	2026-02-23 16:31:58.877+00	2026-02-23 16:31:58.877+00
147	1	32000.00	2026-03-01	f	\N	48	2026-02-23 16:40:58.754+00	2026-02-23 16:40:58.754+00
148	1	103825.00	2026-03-01	f	\N	49	2026-02-26 14:55:41.466+00	2026-02-26 14:55:41.466+00
150	1	70000.00	2026-04-01	f	\N	51	2026-03-03 17:25:37.443+00	2026-03-03 17:25:37.443+00
151	1	57000.00	2026-04-01	f	\N	52	2026-03-10 12:14:01.958+00	2026-03-10 12:14:01.958+00
152	1	33491.33	2026-04-01	f	\N	53	2026-03-10 15:24:22.798+00	2026-03-10 15:24:22.798+00
153	2	33491.33	2026-05-01	f	\N	53	2026-03-10 15:24:22.798+00	2026-03-10 15:24:22.798+00
154	3	33491.33	2026-06-01	f	\N	53	2026-03-10 15:24:22.798+00	2026-03-10 15:24:22.798+00
155	4	33491.33	2026-07-01	f	\N	53	2026-03-10 15:24:22.798+00	2026-03-10 15:24:22.798+00
156	5	33491.33	2026-08-01	f	\N	53	2026-03-10 15:24:22.798+00	2026-03-10 15:24:22.798+00
157	6	33491.33	2026-09-01	f	\N	53	2026-03-10 15:24:22.798+00	2026-03-10 15:24:22.798+00
158	1	106660.00	2026-04-01	f	\N	54	2026-03-10 15:27:05.177+00	2026-03-10 15:27:05.177+00
159	2	106660.00	2026-05-01	f	\N	54	2026-03-10 15:27:05.177+00	2026-03-10 15:27:05.177+00
160	3	106660.00	2026-06-01	f	\N	54	2026-03-10 15:27:05.177+00	2026-03-10 15:27:05.177+00
161	1	57000.00	2026-04-01	f	\N	55	2026-03-12 12:15:31.178+00	2026-03-12 12:15:31.178+00
162	1	46900.00	2026-04-01	f	\N	56	2026-03-31 11:35:50.357+00	2026-03-31 11:35:50.357+00
163	1	108282.00	2026-04-01	f	\N	57	2026-03-31 11:36:45.35+00	2026-03-31 11:36:45.35+00
164	1	125000.00	2026-04-01	f	\N	58	2026-03-31 11:37:44.284+00	2026-03-31 11:37:44.284+00
165	1	31999.00	2026-04-01	f	\N	59	2026-03-31 11:39:33.597+00	2026-03-31 11:39:33.597+00
166	2	31999.00	2026-05-01	f	\N	59	2026-03-31 11:39:33.597+00	2026-03-31 11:39:33.597+00
167	3	31999.00	2026-06-01	f	\N	59	2026-03-31 11:39:33.597+00	2026-03-31 11:39:33.597+00
168	1	55752.00	2026-04-01	f	\N	60	2026-03-31 11:41:06.579+00	2026-03-31 11:41:06.579+00
\.


--
-- Data for Name: credit_card_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.credit_card_payments (id, amount, payment_date, currency, notes, credit_card_id, transaction_id, user_id, created_at, updated_at) FROM stdin;
1	1399591.61	2026-02-04	ARS	Pago Mastercard Febrero	2	25	1	2026-02-10 18:05:06.696+00	2026-02-10 18:05:06.696+00
2	1153511.02	2026-02-04	ARS	Pago Visa Febrero	1	26	1	2026-02-10 18:05:49.482+00	2026-02-10 18:05:49.482+00
3	224430.00	2026-02-12	ARS	\N	4	34	1	2026-02-12 23:46:25.735+00	2026-02-12 23:46:25.735+00
4	120508.00	2026-02-12	ARS	\N	3	35	1	2026-02-12 23:47:42.637+00	2026-02-12 23:47:42.637+00
5	28667.00	2026-02-12	ARS	\N	5	36	1	2026-02-12 23:49:12.837+00	2026-02-12 23:49:12.837+00
6	1975552.42	2026-03-04	ARS	\N	1	62	1	2026-03-04 13:43:47.572+00	2026-03-04 13:43:47.572+00
7	1332279.65	2026-03-04	ARS	\N	2	63	1	2026-03-04 13:45:29.364+00	2026-03-04 13:45:29.364+00
8	1581051.64	2026-04-06	ARS	\N	1	87	1	2026-04-06 16:03:13.743+00	2026-04-06 16:03:13.743+00
9	1036760.58	2026-04-06	ARS	\N	2	88	1	2026-04-06 16:04:48.65+00	2026-04-06 16:04:48.65+00
\.


--
-- Data for Name: credit_card_recurring_charges; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.credit_card_recurring_charges (id, description, amount, charge_day, is_active, currency, credit_card_id, category_id, user_id, created_at, updated_at) FROM stdin;
2	Personal Flow 2	46449.89	1	t	ARS	1	151	1	2026-02-10 17:31:25.893+00	2026-02-10 17:31:25.893+00
3	Wellhub	72999.00	1	t	ARS	1	169	1	2026-02-10 17:32:29.694+00	2026-02-10 17:32:29.694+00
4	Pregna	42000.00	1	t	ARS	1	167	1	2026-02-10 17:33:23.788+00	2026-02-10 17:33:23.788+00
6	Boca Juniors	36800.00	1	t	ARS	1	6	1	2026-02-10 17:35:38.077+00	2026-02-10 17:35:38.077+00
5	San Cristobal Seguros	178574.00	1	t	ARS	2	164	1	2026-02-10 17:33:53.836+00	2026-02-10 17:36:30.393+00
1	Personal Flow 1	127756.77	1	t	ARS	2	151	1	2026-02-10 17:30:29.351+00	2026-02-10 17:36:48.264+00
7	Netflix	6.14	1	t	USD	2	177	1	2026-02-10 17:37:59.194+00	2026-02-10 17:37:59.194+00
8	Canva	27759.89	1	t	ARS	2	7	1	2026-02-10 17:51:43.959+00	2026-02-10 17:51:43.959+00
9	Spotify	3.84	1	t	USD	2	178	1	2026-02-10 17:52:41.109+00	2026-02-10 17:52:41.109+00
10	Apple icloud	2.99	1	t	USD	2	179	1	2026-02-10 17:53:24.994+00	2026-02-10 17:53:24.994+00
11	GitHub Copilot	39.00	1	t	USD	2	180	1	2026-02-10 17:58:29.124+00	2026-02-10 17:58:29.124+00
12	RailWay	5.00	1	t	USD	1	9	1	2026-02-11 15:59:49.164+00	2026-02-11 15:59:49.164+00
13	Apple Luz	2.99	1	t	USD	1	179	1	2026-02-12 23:31:43.166+00	2026-02-12 23:31:43.166+00
\.


--
-- Data for Name: credit_cards; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.credit_cards (id, name, bank, brand, last_four_digits, expiration_month, expiration_year, due_day, user_id, created_at, updated_at) FROM stdin;
1	Visa Dami├ín	BBVA	Visa	7403	12	2027	1	1	2026-02-09 11:50:08.432+00	2026-02-09 11:50:08.432+00
2	MasterCard Dami├ín	BBVA	Mastercard	1789	12	2027	1	1	2026-02-09 11:50:44.507+00	2026-02-09 11:50:44.507+00
3	Visa Luz	Galicia	Visa	3772	6	2026	1	1	2026-02-12 23:38:23.088+00	2026-02-12 23:38:23.088+00
4	Mastercard Luz	Galicia	Mastercard	6465	11	2032	1	1	2026-02-12 23:38:58.016+00	2026-02-12 23:38:58.016+00
5	Visa BNA Luz	Banco Nacion	Visa	6113	11	2030	1	1	2026-02-12 23:48:48.647+00	2026-02-12 23:48:48.647+00
6	Visa ADICIONAL Luz	BBVA	Visa	9279	12	2027	1	3	2026-02-23 15:46:52.572+00	2026-02-23 15:46:52.572+00
7	MasterCard Adicional Luz	BBVA	Mastercard	4234	12	2027	1	3	2026-02-23 15:47:28.524+00	2026-02-23 15:47:28.524+00
\.


--
-- Data for Name: exchange_rates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.exchange_rates (id, currency_from, currency_to, rate, source, date, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: investment_earnings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.investment_earnings (id, investment_id, amount, currency, earning_date, notes, transaction_id, user_id, created_at, updated_at) FROM stdin;
15	1	500.00	USD	2025-07-01	\N	\N	1	2026-01-30 14:44:26+00	2026-01-30 14:44:26+00
17	1	500.00	USD	2025-09-01	\N	\N	1	2026-01-30 14:45:18+00	2026-01-30 14:45:18+00
18	1	500.00	USD	2025-10-01	\N	\N	1	2026-01-30 14:45:29+00	2026-01-30 14:45:29+00
19	1	500.00	USD	2025-08-01	\N	\N	1	2026-01-30 14:47:12+00	2026-01-30 14:47:12+00
20	1	500.00	USD	2025-11-01	\N	\N	1	2026-01-30 14:47:32+00	2026-01-30 14:47:32+00
21	1	500.00	USD	2025-12-01	\N	\N	1	2026-01-30 14:47:44+00	2026-01-30 14:47:44+00
22	1	500.00	USD	2026-01-01	\N	\N	1	2026-01-30 14:47:52+00	2026-01-30 14:47:52+00
1	1	500.00	USD	2026-03-03	Rendimiento Marzo	57	1	2026-03-03 15:44:18.669+00	2026-03-03 15:44:18.669+00
\.


--
-- Data for Name: investments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.investments (id, type, amount, currency, "exchangeRate", "exchangeAmount", "exchangeCurrency", "startDate", "endDate", "interestRate", status, entity, description, "userId", "createdAt", "updatedAt") FROM stdin;
1	Plazo Fijo	40000.00	USD	\N	\N	\N	2025-06-01	\N	15.00	Activo	Vincent	\N	1	2025-11-27 15:25:44+00	2025-11-27 15:36:47+00
8	Compra Divisa	80.00	USD	1475.00	118000.00	ARS	2025-12-02	\N	\N	Activo	Banco BBVA	Compra dolares para abonar tarjetas	1	2025-12-02 12:12:29+00	2025-12-02 12:12:29+00
9	Venta Divisa	5.07	USD	1425.00	7224.75	ARS	2025-12-04	\N	\N	Activo	BBVA	Venta de Dolares	1	2025-12-04 14:49:58+00	2025-12-04 14:49:58+00
10	Compra Divisa	400.00	USD	1470.00	588000.00	ARS	2025-12-05	\N	\N	Activo	BBVA	\N	1	2025-12-05 11:55:07+00	2025-12-05 11:55:07+00
11	Compra Divisa	1600.00	USD	1480.00	2368000.00	ARS	2025-12-17	\N	\N	Activo	BBVA	Compra dolares	1	2025-12-17 13:09:17+00	2025-12-17 13:09:17+00
\.


--
-- Data for Name: loan_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loan_payments (id, loan_id, amount, payment_date, transaction_id, notes, user_id, created_at, updated_at) FROM stdin;
1	2	500.00	2025-09-30	\N	Pago voluntario 1	1	2025-11-27 14:46:44+00	2025-11-27 14:46:44+00
2	2	400.00	2025-10-15	\N	Pago Voluntario 2	1	2025-11-27 14:49:25+00	2025-11-27 14:49:25+00
3	2	900.00	2025-11-27	\N	Pago por sitio web	1	2025-11-27 14:52:08+00	2025-11-27 14:52:08+00
4	2	700.00	2026-02-12	32	Pago Voluntario	1	2026-02-12 23:40:07.138+00	2026-02-12 23:40:07.138+00
5	2	700.00	2026-02-28	54	Freelance redes	1	2026-03-03 13:50:19.902+00	2026-03-03 13:50:19.902+00
6	2	1000.00	2026-03-03	55	Pago Vol	1	2026-03-03 13:50:35.424+00	2026-03-03 13:50:35.424+00
7	2	700.00	2026-04-06	83	Redes Apart	1	2026-04-06 15:28:48.554+00	2026-04-06 15:28:48.554+00
\.


--
-- Data for Name: loans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loans (id, entity, total_amount, pending_amount, currency, interest_rate, loan_date, due_date, installments, installment_amount, status, description, user_id, created_at, updated_at) FROM stdin;
2	Prestamo Personal DEPTO	42000.00	37100.00	USD	\N	2025-09-01	\N	\N	\N	Activo	Pr├⌐stamo personal para la compra de departamento	1	2025-11-27 14:45:59+00	2026-04-06 15:28:48.56+00
\.


--
-- Data for Name: mortgage_installments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mortgage_installments (id, mortgage_loan_id, installment_number, capital_uva, interest_uva, total_uva, due_date, is_paid, paid_date, uva_rate, amount_paid, dollar_rate, amount_usd, transaction_id, user_id, created_at, updated_at) FROM stdin;
1	1	1	184.44	735.31	919.75	2026-02-10	t	2026-02-10	1768.65	1626715.84	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
3	1	3	185.83	523.83	709.66	2026-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
4	1	4	186.52	523.14	709.66	2026-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
5	1	5	187.22	522.44	709.66	2026-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
6	1	6	187.92	521.74	709.66	2026-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
7	1	7	188.63	521.03	709.66	2026-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
8	1	8	189.34	520.32	709.66	2026-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
9	1	9	190.05	519.61	709.66	2026-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
10	1	10	190.76	518.90	709.66	2026-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
11	1	11	191.48	518.18	709.66	2026-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
12	1	12	192.19	517.47	709.66	2027-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
13	1	13	192.91	516.75	709.66	2027-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
14	1	14	193.64	516.02	709.66	2027-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
15	1	15	194.36	515.30	709.66	2027-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
16	1	16	195.09	514.57	709.66	2027-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
17	1	17	195.82	513.84	709.66	2027-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
18	1	18	196.56	513.10	709.66	2027-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
19	1	19	197.30	512.36	709.66	2027-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
20	1	20	198.04	511.62	709.66	2027-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
21	1	21	198.78	510.88	709.66	2027-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
22	1	22	199.52	510.14	709.66	2027-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
23	1	23	200.27	509.39	709.66	2027-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
24	1	24	201.02	508.64	709.66	2028-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
25	1	25	201.78	507.88	709.66	2028-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
26	1	26	202.53	507.13	709.66	2028-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
27	1	27	203.29	506.37	709.66	2028-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
28	1	28	204.05	505.61	709.66	2028-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
29	1	29	204.82	504.84	709.66	2028-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
30	1	30	205.59	504.07	709.66	2028-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
31	1	31	206.36	503.30	709.66	2028-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
32	1	32	207.13	502.53	709.66	2028-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
33	1	33	207.91	501.75	709.66	2028-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
34	1	34	208.69	500.97	709.66	2028-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
35	1	35	209.47	500.19	709.66	2028-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
36	1	36	210.26	499.40	709.66	2029-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
37	1	37	211.05	498.61	709.66	2029-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
38	1	38	211.84	497.82	709.66	2029-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
39	1	39	212.63	497.03	709.66	2029-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
40	1	40	213.43	496.23	709.66	2029-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
41	1	41	214.23	495.43	709.66	2029-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
42	1	42	215.03	494.63	709.66	2029-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
43	1	43	215.84	493.82	709.66	2029-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
44	1	44	216.65	493.01	709.66	2029-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
45	1	45	217.46	492.20	709.66	2029-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
46	1	46	218.28	491.38	709.66	2029-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
47	1	47	219.09	490.57	709.66	2029-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
48	1	48	219.92	489.74	709.66	2030-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
49	1	49	220.74	488.92	709.66	2030-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
50	1	50	221.57	488.09	709.66	2030-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
51	1	51	222.40	487.26	709.66	2030-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
52	1	52	223.23	486.43	709.66	2030-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
53	1	53	224.07	485.59	709.66	2030-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
54	1	54	224.91	484.75	709.66	2030-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
55	1	55	225.75	483.91	709.66	2030-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
56	1	56	226.60	483.06	709.66	2030-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
57	1	57	227.45	482.21	709.66	2030-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
58	1	58	228.30	481.36	709.66	2030-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
59	1	59	229.16	480.50	709.66	2030-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
60	1	60	230.02	479.64	709.66	2031-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
61	1	61	230.88	478.78	709.66	2031-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
62	1	62	231.75	477.91	709.66	2031-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
63	1	63	232.62	477.04	709.66	2031-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
64	1	64	233.49	476.17	709.66	2031-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
65	1	65	234.36	475.30	709.66	2031-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
66	1	66	235.24	474.42	709.66	2031-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
67	1	67	236.13	473.53	709.66	2031-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
68	1	68	237.01	472.65	709.66	2031-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
69	1	69	237.90	471.76	709.66	2031-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
70	1	70	238.79	470.87	709.66	2031-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
71	1	71	239.69	469.97	709.66	2031-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
72	1	72	240.59	469.07	709.66	2032-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
73	1	73	241.49	468.17	709.66	2032-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
74	1	74	242.39	467.27	709.66	2032-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
75	1	75	243.30	466.36	709.66	2032-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
76	1	76	244.22	465.44	709.66	2032-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
77	1	77	245.13	464.53	709.66	2032-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
78	1	78	246.05	463.61	709.66	2032-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
79	1	79	246.97	462.69	709.66	2032-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
80	1	80	247.90	461.76	709.66	2032-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
81	1	81	248.83	460.83	709.66	2032-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
82	1	82	249.76	459.90	709.66	2032-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
83	1	83	250.70	458.96	709.66	2032-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
84	1	84	251.64	458.02	709.66	2033-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
85	1	85	252.58	457.08	709.66	2033-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
86	1	86	253.53	456.13	709.66	2033-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
87	1	87	254.48	455.18	709.66	2033-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
88	1	88	255.43	454.23	709.66	2033-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
89	1	89	256.39	453.27	709.66	2033-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
90	1	90	257.35	452.31	709.66	2033-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
91	1	91	258.32	451.34	709.66	2033-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
92	1	92	259.29	450.37	709.66	2033-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
93	1	93	260.26	449.40	709.66	2033-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
94	1	94	261.24	448.42	709.66	2033-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
95	1	95	262.22	447.44	709.66	2033-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
96	1	96	263.20	446.46	709.66	2034-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
97	1	97	264.19	445.47	709.66	2034-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
98	1	98	265.18	444.48	709.66	2034-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
99	1	99	266.17	443.49	709.66	2034-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
100	1	100	267.17	442.49	709.66	2034-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
101	1	101	268.17	441.49	709.66	2034-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
102	1	102	269.18	440.48	709.66	2034-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
103	1	103	270.19	439.47	709.66	2034-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
104	1	104	271.20	438.46	709.66	2034-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
105	1	105	272.22	437.44	709.66	2034-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
106	1	106	273.24	436.42	709.66	2034-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
107	1	107	274.26	435.40	709.66	2034-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
108	1	108	275.29	434.37	709.66	2035-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
109	1	109	276.32	433.34	709.66	2035-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
110	1	110	277.36	432.30	709.66	2035-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
111	1	111	278.40	431.26	709.66	2035-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
112	1	112	279.44	430.22	709.66	2035-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
113	1	113	280.49	429.17	709.66	2035-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
114	1	114	281.54	428.12	709.66	2035-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
115	1	115	282.60	427.06	709.66	2035-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
116	1	116	283.66	426.00	709.66	2035-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
117	1	117	284.72	424.94	709.66	2035-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
118	1	118	285.79	423.87	709.66	2035-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
119	1	119	286.86	422.80	709.66	2035-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
120	1	120	287.94	421.72	709.66	2036-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
121	1	121	289.02	420.64	709.66	2036-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
122	1	122	290.10	419.56	709.66	2036-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
123	1	123	291.19	418.47	709.66	2036-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
124	1	124	292.28	417.38	709.66	2036-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
125	1	125	293.38	416.28	709.66	2036-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
126	1	126	294.48	415.18	709.66	2036-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
127	1	127	295.58	414.08	709.66	2036-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
128	1	128	296.69	412.97	709.66	2036-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
129	1	129	297.80	411.86	709.66	2036-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
130	1	130	298.92	410.74	709.66	2036-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
131	1	131	300.04	409.62	709.66	2036-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
132	1	132	301.17	408.49	709.66	2037-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
133	1	133	302.29	407.37	709.66	2037-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
134	1	134	303.43	406.23	709.66	2037-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
135	1	135	304.57	405.09	709.66	2037-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
136	1	136	305.71	403.95	709.66	2037-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
137	1	137	306.85	402.81	709.66	2037-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
138	1	138	308.01	401.65	709.66	2037-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
139	1	139	309.16	400.50	709.66	2037-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
140	1	140	310.32	399.34	709.66	2037-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
141	1	141	311.48	398.18	709.66	2037-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
142	1	142	312.65	397.01	709.66	2037-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
143	1	143	313.82	395.84	709.66	2037-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
144	1	144	315.00	394.66	709.66	2038-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
145	1	145	316.18	393.48	709.66	2038-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
146	1	146	317.37	392.29	709.66	2038-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
147	1	147	318.56	391.10	709.66	2038-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
148	1	148	319.75	389.91	709.66	2038-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
149	1	149	320.95	388.71	709.66	2038-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
150	1	150	322.15	387.51	709.66	2038-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
151	1	151	323.36	386.30	709.66	2038-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
152	1	152	324.58	385.08	709.66	2038-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
153	1	153	325.79	383.87	709.66	2038-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
154	1	154	327.01	382.65	709.66	2038-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
155	1	155	328.24	381.42	709.66	2038-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
156	1	156	329.47	380.19	709.66	2039-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
157	1	157	330.71	378.95	709.66	2039-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
158	1	158	331.95	377.71	709.66	2039-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
159	1	159	333.19	376.47	709.66	2039-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
160	1	160	334.44	375.22	709.66	2039-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
161	1	161	335.70	373.96	709.66	2039-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
162	1	162	336.95	372.71	709.66	2039-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
163	1	163	338.22	371.44	709.66	2039-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
164	1	164	339.49	370.17	709.66	2039-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
165	1	165	340.76	368.90	709.66	2039-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
166	1	166	342.04	367.62	709.66	2039-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
167	1	167	343.32	366.34	709.66	2039-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
168	1	168	344.61	365.05	709.66	2040-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
169	1	169	345.90	363.76	709.66	2040-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
170	1	170	347.20	362.46	709.66	2040-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
171	1	171	348.50	361.16	709.66	2040-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
172	1	172	349.81	359.85	709.66	2040-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
173	1	173	351.12	358.54	709.66	2040-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
174	1	174	352.43	357.23	709.66	2040-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
175	1	175	353.76	355.90	709.66	2040-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
176	1	176	355.08	354.58	709.66	2040-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
177	1	177	356.41	353.25	709.66	2040-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
178	1	178	357.75	351.91	709.66	2040-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
179	1	179	359.09	350.57	709.66	2040-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
180	1	180	360.44	349.22	709.66	2041-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
181	1	181	361.79	347.87	709.66	2041-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
182	1	182	363.15	346.51	709.66	2041-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
183	1	183	364.51	345.15	709.66	2041-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
184	1	184	365.88	343.78	709.66	2041-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
185	1	185	367.25	342.41	709.66	2041-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
186	1	186	368.63	341.03	709.66	2041-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
187	1	187	370.01	339.65	709.66	2041-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
188	1	188	371.40	338.26	709.66	2041-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
189	1	189	372.79	336.87	709.66	2041-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
190	1	190	374.19	335.47	709.66	2041-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
191	1	191	375.59	334.07	709.66	2041-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
192	1	192	377.00	332.66	709.66	2042-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
193	1	193	378.41	331.25	709.66	2042-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
194	1	194	379.83	329.83	709.66	2042-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
195	1	195	381.25	328.41	709.66	2042-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
196	1	196	382.68	326.98	709.66	2042-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
197	1	197	384.12	325.54	709.66	2042-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
198	1	198	385.56	324.10	709.66	2042-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
199	1	199	387.01	322.65	709.66	2042-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
200	1	200	388.46	321.20	709.66	2042-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
201	1	201	389.91	319.75	709.66	2042-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
202	1	202	391.38	318.28	709.66	2042-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
203	1	203	392.84	316.82	709.66	2042-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
204	1	204	394.32	315.34	709.66	2043-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
205	1	205	395.80	313.86	709.66	2043-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
206	1	206	397.28	312.38	709.66	2043-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
207	1	207	398.77	310.89	709.66	2043-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
208	1	208	400.26	309.40	709.66	2043-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
209	1	209	401.77	307.89	709.66	2043-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
210	1	210	403.27	306.39	709.66	2043-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
211	1	211	404.78	304.88	709.66	2043-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
212	1	212	406.30	303.36	709.66	2043-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
213	1	213	407.83	301.83	709.66	2043-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
214	1	214	409.36	300.30	709.66	2043-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
215	1	215	410.89	298.77	709.66	2043-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
216	1	216	412.43	297.23	709.66	2044-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
217	1	217	413.98	295.68	709.66	2044-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
218	1	218	415.53	294.13	709.66	2044-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
219	1	219	417.09	292.57	709.66	2044-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
220	1	220	418.65	291.01	709.66	2044-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
221	1	221	420.22	289.44	709.66	2044-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
222	1	222	421.80	287.86	709.66	2044-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
223	1	223	423.38	286.28	709.66	2044-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
224	1	224	424.97	284.69	709.66	2044-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
225	1	225	426.56	283.10	709.66	2044-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
226	1	226	428.16	281.50	709.66	2044-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
227	1	227	429.77	279.89	709.66	2044-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
228	1	228	431.38	278.28	709.66	2045-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
229	1	229	433.00	276.66	709.66	2045-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
230	1	230	434.62	275.04	709.66	2045-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
231	1	231	436.25	273.41	709.66	2045-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
232	1	232	437.89	271.77	709.66	2045-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
233	1	233	439.53	270.13	709.66	2045-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
234	1	234	441.18	268.48	709.66	2045-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
235	1	235	442.83	266.83	709.66	2045-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
236	1	236	444.49	265.17	709.66	2045-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
237	1	237	446.16	263.50	709.66	2045-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
238	1	238	447.83	261.83	709.66	2045-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
239	1	239	449.51	260.15	709.66	2045-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
240	1	240	451.20	258.46	709.66	2046-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
241	1	241	452.89	256.77	709.66	2046-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
242	1	242	454.59	255.07	709.66	2046-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
243	1	243	456.29	253.37	709.66	2046-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
244	1	244	458.00	251.66	709.66	2046-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
245	1	245	459.72	249.94	709.66	2046-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
246	1	246	461.44	248.22	709.66	2046-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
247	1	247	463.17	246.49	709.66	2046-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
248	1	248	464.91	244.75	709.66	2046-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
249	1	249	466.65	243.01	709.66	2046-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
250	1	250	468.40	241.26	709.66	2046-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
251	1	251	470.16	239.50	709.66	2046-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
252	1	252	471.92	237.74	709.66	2047-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
253	1	253	473.69	235.97	709.66	2047-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
254	1	254	475.47	234.19	709.66	2047-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
255	1	255	477.25	232.41	709.66	2047-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
256	1	256	479.04	230.62	709.66	2047-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
257	1	257	480.84	228.82	709.66	2047-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
258	1	258	482.64	227.02	709.66	2047-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
259	1	259	484.45	225.21	709.66	2047-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
260	1	260	486.27	223.39	709.66	2047-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
261	1	261	488.09	221.57	709.66	2047-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
262	1	262	489.92	219.74	709.66	2047-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
263	1	263	491.76	217.90	709.66	2047-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
264	1	264	493.60	216.06	709.66	2048-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
265	1	265	495.45	214.21	709.66	2048-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
266	1	266	497.31	212.35	709.66	2048-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
267	1	267	499.18	210.48	709.66	2048-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
268	1	268	501.05	208.61	709.66	2048-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
269	1	269	502.93	206.73	709.66	2048-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
270	1	270	504.81	204.85	709.66	2048-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
271	1	271	506.71	202.95	709.66	2048-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
272	1	272	508.61	201.05	709.66	2048-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
273	1	273	510.52	199.14	709.66	2048-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
274	1	274	512.43	197.23	709.66	2048-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
275	1	275	514.35	195.31	709.66	2048-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
276	1	276	516.28	193.38	709.66	2049-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
277	1	277	518.22	191.44	709.66	2049-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
278	1	278	520.16	189.50	709.66	2049-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
279	1	279	522.11	187.55	709.66	2049-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
280	1	280	524.07	185.59	709.66	2049-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
281	1	281	526.03	183.63	709.66	2049-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
282	1	282	528.01	181.65	709.66	2049-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
283	1	283	529.99	179.67	709.66	2049-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
284	1	284	531.97	177.69	709.66	2049-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
285	1	285	533.97	175.69	709.66	2049-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
286	1	286	535.97	173.69	709.66	2049-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
287	1	287	537.98	171.68	709.66	2049-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
288	1	288	540.00	169.66	709.66	2050-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
289	1	289	542.02	167.64	709.66	2050-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
290	1	290	544.06	165.60	709.66	2050-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
291	1	291	546.10	163.56	709.66	2050-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
292	1	292	548.14	161.52	709.66	2050-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
293	1	293	550.20	159.46	709.66	2050-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
294	1	294	552.26	157.40	709.66	2050-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
295	1	295	554.33	155.33	709.66	2050-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
296	1	296	556.41	153.25	709.66	2050-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
297	1	297	558.50	151.16	709.66	2050-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
298	1	298	560.59	149.07	709.66	2050-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
299	1	299	562.70	146.96	709.66	2050-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
300	1	300	564.81	144.85	709.66	2051-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
301	1	301	566.92	142.74	709.66	2051-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
302	1	302	569.05	140.61	709.66	2051-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
303	1	303	571.18	138.48	709.66	2051-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
304	1	304	573.33	136.33	709.66	2051-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
305	1	305	575.48	134.18	709.66	2051-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
306	1	306	577.63	132.03	709.66	2051-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
307	1	307	579.80	129.86	709.66	2051-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
308	1	308	581.97	127.69	709.66	2051-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
309	1	309	584.16	125.50	709.66	2051-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
310	1	310	586.35	123.31	709.66	2051-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
311	1	311	588.55	121.11	709.66	2051-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
312	1	312	590.75	118.91	709.66	2052-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
313	1	313	592.97	116.69	709.66	2052-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
314	1	314	595.19	114.47	709.66	2052-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
315	1	315	597.42	112.24	709.66	2052-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
316	1	316	599.66	110.00	709.66	2052-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
317	1	317	601.91	107.75	709.66	2052-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
318	1	318	604.17	105.49	709.66	2052-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
319	1	319	606.44	103.22	709.66	2052-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
320	1	320	608.71	100.95	709.66	2052-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
321	1	321	610.99	98.67	709.66	2052-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
322	1	322	613.28	96.38	709.66	2052-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
323	1	323	615.58	94.08	709.66	2052-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
324	1	324	617.89	91.77	709.66	2053-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
325	1	325	620.21	89.45	709.66	2053-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
326	1	326	622.53	87.13	709.66	2053-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
327	1	327	624.87	84.79	709.66	2053-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
328	1	328	627.21	82.45	709.66	2053-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
329	1	329	629.56	80.10	709.66	2053-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
330	1	330	631.92	77.74	709.66	2053-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
331	1	331	634.29	75.37	709.66	2053-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
332	1	332	636.67	72.99	709.66	2053-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
333	1	333	639.06	70.60	709.66	2053-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
334	1	334	641.46	68.20	709.66	2053-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
335	1	335	643.86	65.80	709.66	2053-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
336	1	336	646.28	63.38	709.66	2054-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
337	1	337	648.70	60.96	709.66	2054-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
338	1	338	651.13	58.53	709.66	2054-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
339	1	339	653.57	56.09	709.66	2054-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
340	1	340	656.03	53.63	709.66	2054-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
341	1	341	658.49	51.17	709.66	2054-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
342	1	342	660.96	48.70	709.66	2054-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
343	1	343	663.43	46.23	709.66	2054-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
344	1	344	665.92	43.74	709.66	2054-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
345	1	345	668.42	41.24	709.66	2054-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
346	1	346	670.93	38.73	709.66	2054-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
347	1	347	673.44	36.22	709.66	2054-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
348	1	348	675.97	33.69	709.66	2055-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
349	1	349	678.50	31.16	709.66	2055-02-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
350	1	350	681.05	28.61	709.66	2055-03-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
351	1	351	683.60	26.06	709.66	2055-04-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
352	1	352	686.16	23.50	709.66	2055-05-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
353	1	353	688.74	20.92	709.66	2055-06-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
354	1	354	691.32	18.34	709.66	2055-07-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
355	1	355	693.91	15.75	709.66	2055-08-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
356	1	356	696.51	13.15	709.66	2055-09-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
357	1	357	699.13	10.53	709.66	2055-10-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
358	1	358	701.75	7.91	709.66	2055-11-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
359	1	359	704.38	5.28	709.66	2055-12-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
360	1	360	707.02	2.64	709.66	2056-01-10	f	\N	\N	\N	\N	\N	\N	1	2026-02-13 19:03:48.334+00	2026-02-13 19:03:48.334+00
2	1	2	185.13	524.53	709.66	2026-03-10	t	2026-03-11	1818.52	1290530.90	1405.00	918.53	75	1	2026-02-13 19:03:48.334+00	2026-03-11 14:29:40.23+00
\.


--
-- Data for Name: mortgage_loans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mortgage_loans (id, name, total_uva, paid_uva, total_installments, paid_installments, annual_rate, start_date, status, user_id, created_at, updated_at) FROM stdin;
1	Pr├⌐stamo Hipotecario UVA	140058.48	1629.41	360	2	4.50	2026-02-10	Activo	1	2026-02-13 19:03:48.326+00	2026-03-11 14:29:40.238+00
\.


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_methods (id, name, type, user_id, created_at, updated_at) FROM stdin;
13	Transferencia Bancaria	Transferencia	1	2026-01-30 14:41:53+00	2026-01-30 14:41:53+00
1	Efectivo	Efectivo	1	2026-02-09 11:38:52.668+00	2026-02-09 11:38:52.668+00
2	Tarjeta D├⌐bito	Tarjeta	1	2026-02-09 11:39:06.786+00	2026-02-09 11:39:06.786+00
3	Visa Dami├ín - BBVA	Tarjeta	1	2026-02-09 11:53:08.478+00	2026-02-09 11:53:08.478+00
4	MasterCard Dami├ín - BBVA	Tarjeta	1	2026-02-10 12:48:53.268+00	2026-02-10 12:48:53.268+00
5	Visa ADICIONAL Luz - BBVA	Tarjeta	3	2026-02-23 15:50:07.818+00	2026-02-23 15:50:07.818+00
6	MasterCard Adicional Luz - BBVA	Tarjeta	3	2026-02-23 15:50:44.788+00	2026-02-23 15:50:44.788+00
7	Visa Luz - Galicia	Tarjeta	3	2026-02-23 15:54:30.142+00	2026-02-23 15:54:30.142+00
8	Mastercard Luz - Galicia	Tarjeta	3	2026-02-23 16:31:14.338+00	2026-02-23 16:31:14.338+00
9	MasterCard Adicional Luz - BBVA	Tarjeta	1	2026-03-10 12:14:01.94+00	2026-03-10 12:14:01.94+00
10	Visa BNA Luz - Banco Nacion	Tarjeta	3	2026-03-10 15:24:22.788+00	2026-03-10 15:24:22.788+00
11	Visa BNA Luz - Banco Nacion	Tarjeta	1	2026-03-31 11:35:50.345+00	2026-03-31 11:35:50.345+00
12	Visa ADICIONAL Luz - BBVA	Tarjeta	1	2026-03-31 11:41:06.568+00	2026-03-31 11:41:06.568+00
\.


--
-- Data for Name: pending_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pending_transactions (id, "rawMessage", amount, currency, type, "suggestedCategory", description, "transactionDate", status, "userId", "processedTransactionId", "telegramMessageId", "telegramChatId", "createdAt", "updatedAt") FROM stdin;
1	Supermercado 5000	5000.00	ARS	Egreso	Supermercado	Supermercado	2026-02-11 17:36:04.182+00	discarded	1	\N	294	-4715347460	2026-02-11 17:36:04.186+00	2026-02-11 17:36:20.529+00
3	Regalo Diego 69900	69900.00	ARS	Egreso	\N	Regalo Diego	2026-02-11 22:08:30.812+00	discarded	1	\N	298	-4715347460	2026-02-11 22:08:30.812+00	2026-02-12 12:29:12.139+00
2	Verduleria 6500	6500.00	ARS	Egreso	\N	Verduleria	2026-02-11 22:08:17.445+00	discarded	1	\N	296	-4715347460	2026-02-11 22:08:17.445+00	2026-02-12 23:13:51.521+00
4	Nafta 70000. Mastercard 1 pago	70000.00	ARS	Egreso	Transporte	Nafta. Mastercard pago	2026-02-13 10:27:31.913+00	discarded	1	\N	300	-4715347460	2026-02-13 10:27:31.914+00	2026-02-13 16:14:13.459+00
5	Verdulera 11000	11000.00	ARS	Egreso	\N	Verdulera	2026-02-18 23:06:01.219+00	processed	1	39	302	-4715347460	2026-02-18 23:06:01.219+00	2026-02-20 11:27:30.662+00
6	Nafta 42000 efectivo	42000.00	ARS	Egreso	Transporte	Nafta efectivo	2026-02-22 10:39:31.4+00	processed	1	46	304	-4715347460	2026-02-22 10:39:31.4+00	2026-02-23 16:39:59.658+00
7	Nafta 32000 tarjeta cr├⌐dito	32000.00	ARS	Egreso	Transporte	Nafta tarjeta cr├⌐dito	2026-02-22 10:39:49.483+00	processed	1	\N	306	-4715347460	2026-02-22 10:39:49.484+00	2026-02-23 16:39:48.386+00
8	19500 ferreter├¡a	19500.00	ARS	Egreso	\N	ferreter├¡a	2026-02-23 22:40:44.936+00	processed	1	47	308	-4715347460	2026-02-23 22:40:44.936+00	2026-02-24 17:48:44.529+00
9	140.000 cochera	140000.00	ARS	Egreso	\N	cochera	2026-03-02 20:36:24.039+00	processed	1	49	310	-4715347460	2026-03-02 20:36:24.04+00	2026-03-02 21:28:32.802+00
10	Regalo Seba, 64,000 pesos d├⌐bito	64000.00	ARS	Egreso	\N	Regalo Seba,  d├⌐bito	2026-03-06 18:02:45.326+00	processed	1	68	312	-4715347460	2026-03-06 18:02:45.326+00	2026-03-09 11:56:26.512+00
15	Nafta cr├⌐dito Dami $57.000	57000.00	ARS	Egreso	Transporte	Nafta cr├⌐dito Dami	2026-03-09 15:37:43.304+00	discarded	1	\N	322	-4715347460	2026-03-09 15:37:43.304+00	2026-03-10 12:14:14.548+00
14	Nafta d├⌐bito luz $44.671	44671.00	ARS	Egreso	Transporte	Nafta d├⌐bito luz	2026-03-09 15:37:26.364+00	processed	1	71	320	-4715347460	2026-03-09 15:37:26.364+00	2026-03-10 12:14:31.078+00
13	Supermercado productos limpieza Silvia $16.500	16500.00	ARS	Egreso	Supermercado	Supermercado productos limpieza Silvia	2026-03-09 15:36:02.077+00	processed	1	72	318	-4715347460	2026-03-09 15:36:02.077+00	2026-03-10 12:15:22.546+00
12	Supermercado $23.100	23100.00	ARS	Egreso	Supermercado	Supermercado	2026-03-09 15:35:27.486+00	processed	1	73	316	-4715347460	2026-03-09 15:35:27.486+00	2026-03-10 12:15:59.998+00
11	Limpieza $33.500	33500.00	ARS	Egreso	\N	Limpieza	2026-03-09 15:35:16.834+00	processed	1	74	314	-4715347460	2026-03-09 15:35:16.834+00	2026-03-10 12:16:30.83+00
16	Verduleria $15750	15750.00	ARS	Egreso	\N	Verduleria	2026-03-11 21:12:02.483+00	processed	1	76	324	-4715347460	2026-03-11 21:12:02.484+00	2026-03-12 12:14:37.682+00
17	Nafta $52000 m├íster	52000.00	ARS	Egreso	Transporte	Nafta  m├íster	2026-03-12 10:38:48.272+00	discarded	1	\N	326	-4715347460	2026-03-12 10:38:48.272+00	2026-03-12 12:14:54.302+00
28	46900 supermercado tarjeta de cr├⌐dito BNA Luz	46900.00	ARS	Egreso	Supermercado	supermercado tarjeta de cr├⌐dito BNA Luz	2026-03-27 19:05:41.886+00	discarded	1	\N	349	-4715347460	2026-03-27 19:05:41.886+00	2026-03-31 11:35:17.947+00
27	106828 vacuna tarjeta de cr├⌐dito BBVA adicional luz	106828.00	ARS	Egreso	Servicios	vacuna tarjeta de cr├⌐dito BBVA adicional luz	2026-03-27 19:05:14.962+00	discarded	1	\N	347	-4715347460	2026-03-27 19:05:14.963+00	2026-03-31 11:36:10.214+00
26	Farmacia 125000 1 cuota visa BBVA	125000.00	ARS	Egreso	Salud	Farmacia cuota visa BBVA	2026-03-21 22:11:32.596+00	discarded	1	\N	345	-4715347460	2026-03-21 22:11:32.596+00	2026-03-31 11:37:04.44+00
25	$13.870 supermercado	13870.00	ARS	Egreso	Supermercado	supermercado	2026-03-21 16:01:10.703+00	processed	1	79	343	-4715347460	2026-03-21 16:01:10.703+00	2026-03-31 11:38:15.672+00
24	Regalos $95.997 en 3 cuotas con Visa BBVA adicional Luz	95997.00	ARS	Egreso	Servicios	Regalos  en cuotas con Visa BBVA adicional Luz	2026-03-21 16:00:42.065+00	discarded	1	\N	341	-4715347460	2026-03-21 16:00:42.066+00	2026-03-31 11:38:52.848+00
23	Carnicer├¡a $70.476	70476.00	ARS	Egreso	\N	Carnicer├¡a	2026-03-21 15:59:54.027+00	processed	1	80	339	-4715347460	2026-03-21 15:59:54.027+00	2026-03-31 11:39:53.332+00
22	$55.762 farmacia vacuna tarjeta de cr├⌐dito visa bbva luz	55762.00	ARS	Egreso	Salud	farmacia vacuna tarjeta de cr├⌐dito visa bbva luz	2026-03-20 20:49:54.832+00	discarded	1	\N	337	-4715347460	2026-03-20 20:49:54.832+00	2026-03-31 11:40:20.047+00
21	Gas $52508,52	52508.52	ARS	Egreso	Servicios	Gas	2026-03-17 16:41:24.264+00	processed	1	81	335	-4715347460	2026-03-17 16:41:24.264+00	2026-03-31 11:41:32.66+00
20	Carnicer├¡a $100.000	100000.00	ARS	Egreso	\N	Carnicer├¡a	2026-03-17 12:04:42.299+00	processed	1	82	333	-4715347460	2026-03-17 12:04:42.299+00	2026-03-31 11:42:43.24+00
19	Carnicer├¡a 70,000 pesos	70000.00	ARS	Egreso	\N	Carnicer├¡a	2026-03-15 15:22:52.903+00	discarded	1	\N	331	-4715347460	2026-03-15 15:22:52.903+00	2026-03-31 11:43:02.924+00
18	Verduler├¡a 12,000 pesos	12000.00	ARS	Egreso	\N	Verduler├¡a	2026-03-15 15:22:26.83+00	discarded	1	\N	329	-4715347460	2026-03-15 15:22:26.83+00	2026-03-31 11:43:06.068+00
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transactions (id, amount, date, description, type, currency, category_id, payment_method_id, user_id, created_at, updated_at) FROM stdin;
360	500.00	2025-07-01	Rendimiento Plazo Fijo - Vincent	Ingreso	USD	237	\N	1	2026-01-30 14:44:26+00	2026-01-30 14:44:26+00
361	500.00	2025-08-01	Rendimiento Plazo Fijo - Vincent	Ingreso	USD	237	\N	1	2026-01-30 14:45:06+00	2026-01-30 14:45:06+00
362	500.00	2025-09-01	Rendimiento Plazo Fijo - Vincent	Ingreso	USD	237	\N	1	2026-01-30 14:45:18+00	2026-01-30 14:45:18+00
363	500.00	2025-10-01	Rendimiento Plazo Fijo - Vincent	Ingreso	USD	237	\N	1	2026-01-30 14:45:29+00	2026-01-30 14:45:29+00
364	500.00	2025-08-01	Rendimiento Plazo Fijo - Vincent	Ingreso	USD	237	\N	1	2026-01-30 14:47:12+00	2026-01-30 14:47:12+00
365	500.00	2025-11-01	Rendimiento Plazo Fijo - Vincent	Ingreso	USD	237	\N	1	2026-01-30 14:47:32+00	2026-01-30 14:47:32+00
366	500.00	2025-12-01	Rendimiento Plazo Fijo - Vincent	Ingreso	USD	237	\N	1	2026-01-30 14:47:44+00	2026-01-30 14:47:44+00
367	500.00	2026-01-01	Rendimiento Plazo Fijo - Vincent	Ingreso	USD	237	\N	1	2026-01-30 14:47:52+00	2026-01-30 14:47:52+00
1	4700000.00	2026-02-02	Sueldo Dami├ín Enero 26	Ingreso	ARS	235	13	1	2026-02-02 16:59:17.577+00	2026-02-02 16:59:17.577+00
5	63712.00	2026-02-02	\N	Egreso	ARS	149	13	3	2026-02-02 23:04:50.414+00	2026-02-02 23:05:17.958+00
6	6903.00	2026-02-02	\N	Egreso	ARS	148	13	3	2026-02-02 23:06:37.469+00	2026-02-02 23:06:37.469+00
7	900000.00	2026-02-02	\N	Ingreso	ARS	237	\N	3	2026-02-02 23:11:55.152+00	2026-02-02 23:11:55.152+00
8	28285.00	2026-02-02	\N	Egreso	ARS	158	13	3	2026-02-02 23:12:58.241+00	2026-02-02 23:12:58.241+00
2	84000.00	2026-02-02	Compra Caf├⌐	Egreso	ARS	156	13	1	2026-02-02 16:59:44.226+00	2026-02-02 23:13:30.222+00
9	445250.00	2026-02-04	Expensas Detpo Congreso	Egreso	ARS	147	13	1	2026-02-04 15:47:40.702+00	2026-02-04 15:47:40.702+00
10	7750.00	2026-02-04	\N	Egreso	ARS	157	13	1	2026-02-04 17:02:42.933+00	2026-02-04 17:02:42.933+00
11	5700.00	2026-02-04	\N	Egreso	ARS	157	13	1	2026-02-04 17:03:15.525+00	2026-02-04 17:03:15.525+00
12	54000.00	2026-02-09	Pago Running Team	Egreso	ARS	169	13	1	2026-02-09 11:36:57.4+00	2026-02-09 11:36:57.4+00
13	2560.00	2026-02-09	Verduleria	Egreso	ARS	157	13	1	2026-02-09 11:37:25.713+00	2026-02-09 11:37:25.713+00
14	400000.00	2026-02-09	Gastos personales febrero	Egreso	ARS	2	1	1	2026-02-09 11:39:46.338+00	2026-02-09 11:39:46.338+00
15	400000.00	2026-02-09	Gastos personales Febrero	Egreso	ARS	3	1	1	2026-02-09 11:40:14.018+00	2026-02-09 11:40:14.018+00
4	277095.00	2026-02-02	Expensas Olazabal	Egreso	ARS	147	13	3	2026-02-02 23:04:12.484+00	2026-02-10 18:00:54.614+00
23	33500.00	2026-02-10	Silvita	Egreso	ARS	153	1	1	2026-02-10 18:01:23.028+00	2026-02-10 18:01:23.028+00
24	1626715.84	2026-02-10	Cuota 1 de 360	Egreso	ARS	146	13	1	2026-02-10 18:03:05.15+00	2026-02-10 18:03:05.15+00
25	1399591.61	2026-02-04	Pago MasterCard Dami├ín (BBVA)	Egreso	ARS	8	13	1	2026-02-10 18:05:06.572+00	2026-02-10 18:05:06.572+00
26	1153511.02	2026-02-04	Pago Visa Dami├ín (BBVA)	Egreso	ARS	8	13	1	2026-02-10 18:05:49.353+00	2026-02-10 18:05:49.353+00
27	2330000.00	2026-02-11	Sueldo Luz Enero 26	Ingreso	ARS	236	13	1	2026-02-11 17:15:53.185+00	2026-02-11 17:15:53.185+00
28	6500.00	2026-02-12	\N	Egreso	ARS	157	1	1	2026-02-12 23:14:11.76+00	2026-02-12 23:14:11.76+00
32	700.00	2026-02-12	Pago de pr├⌐stamo - Prestamo Personal DEPTO - Pago Voluntario	Egreso	USD	13	\N	1	2026-02-12 23:40:07.134+00	2026-02-12 23:40:07.134+00
53	148852.00	2026-03-02	Paella	Egreso	ARS	156	2	3	2026-03-02 21:38:35.084+00	2026-03-03 18:16:22.565+00
34	224430.00	2026-02-12	Pago Mastercard Luz (Galicia)	Egreso	ARS	8	13	1	2026-02-12 23:46:25.729+00	2026-02-12 23:46:25.729+00
35	120508.00	2026-02-12	Pago Visa Luz (Galicia)	Egreso	ARS	8	13	1	2026-02-12 23:47:42.631+00	2026-02-12 23:47:42.631+00
36	28667.00	2026-02-12	Pago Visa BNA Luz (Banco Nacion)	Egreso	ARS	8	1	1	2026-02-12 23:49:12.833+00	2026-02-12 23:49:12.833+00
38	700.00	2026-02-12	Freelance	Ingreso	USD	237	1	1	2026-02-12 23:59:32.543+00	2026-02-12 23:59:32.543+00
39	11000.00	2026-02-18	Verdulera	Egreso	ARS	157	1	1	2026-02-20 11:27:30.654+00	2026-02-20 11:27:42.684+00
40	33500.00	2026-02-23	Silvita	Egreso	ARS	153	1	3	2026-02-23 16:14:46.919+00	2026-02-23 16:14:56.512+00
41	9957.00	2026-02-22	\N	Egreso	ARS	156	2	3	2026-02-23 16:16:21.528+00	2026-02-23 16:16:21.528+00
42	27113.26	2026-02-22	\N	Egreso	ARS	158	2	3	2026-02-23 16:16:53.159+00	2026-02-23 16:16:53.159+00
43	18000.00	2026-02-22	\N	Egreso	ARS	156	2	3	2026-02-23 16:17:23.902+00	2026-02-23 16:17:23.902+00
44	54300.00	2026-02-23	La Barata	Egreso	ARS	156	1	3	2026-02-23 16:29:27.801+00	2026-02-23 16:29:27.801+00
46	42000.00	2026-02-22	Nafta efectivo	Egreso	ARS	161	1	1	2026-02-23 16:39:59.655+00	2026-02-23 16:40:13.021+00
47	19500.00	2026-02-23	ferreter├¡a	Egreso	ARS	154	\N	1	2026-02-24 17:48:44.525+00	2026-02-24 17:48:55.465+00
48	501000.00	2026-02-24	Pago Anual 2026	Egreso	ARS	165	2	1	2026-02-24 17:49:17.23+00	2026-02-24 17:49:17.23+00
50	2376075.00	2026-03-02	\N	Ingreso	ARS	236	\N	3	2026-03-02 21:29:16.506+00	2026-03-02 21:29:16.506+00
51	117000.00	2026-03-02	Pago mensual Mastercard Galicia	Egreso	ARS	8	13	3	2026-03-02 21:35:24.714+00	2026-03-02 21:35:24.714+00
52	190120.28	2026-03-02	Pago mensual VISA Galicia	Egreso	ARS	8	13	3	2026-03-02 21:35:55.839+00	2026-03-02 21:35:55.839+00
54	700.00	2026-02-28	Pago de pr├⌐stamo - Prestamo Personal DEPTO - Freelance redes	Egreso	USD	13	\N	1	2026-03-03 13:50:19.898+00	2026-03-03 13:50:19.898+00
55	1000.00	2026-03-03	Pago de pr├⌐stamo - Prestamo Personal DEPTO - Pago Vol	Egreso	USD	13	\N	1	2026-03-03 13:50:35.42+00	2026-03-03 13:50:35.42+00
56	4750000.00	2026-03-03	Sueldo Dami Feb	Ingreso	ARS	235	13	1	2026-03-03 15:43:43.911+00	2026-03-03 15:43:43.911+00
57	500.00	2026-03-03	Rendimiento Plazo Fijo - Vincent - Rendimiento Marzo	Ingreso	USD	14	\N	1	2026-03-03 15:44:18.665+00	2026-03-03 15:44:18.665+00
58	700.00	2026-03-03	Freelance Redes	Ingreso	USD	14	1	1	2026-03-03 15:44:55.657+00	2026-03-03 15:44:55.657+00
59	960000.00	2026-03-03	Rescate FCI	Ingreso	ARS	237	13	1	2026-03-03 15:49:31.713+00	2026-03-03 15:49:31.713+00
49	140000.00	2026-03-02	Cochera	Egreso	ARS	163	13	3	2026-03-02 21:28:32.797+00	2026-03-03 17:26:30.192+00
62	1975552.42	2026-03-04	Pago Visa Dami├ín (BBVA)	Egreso	ARS	8	13	1	2026-03-04 13:43:47.562+00	2026-03-04 13:43:47.562+00
63	1332279.65	2026-03-04	Pago MasterCard Dami├ín (BBVA)	Egreso	ARS	8	13	1	2026-03-04 13:45:29.357+00	2026-03-04 13:45:29.357+00
64	51217.68	2026-03-04	\N	Egreso	ARS	149	13	3	2026-03-04 15:17:46.827+00	2026-03-04 15:17:46.827+00
65	317963.13	2026-03-04	Febrero	Egreso	ARS	147	13	3	2026-03-04 15:18:54.346+00	2026-03-04 15:19:06.184+00
66	35843.45	2026-03-04	Febrero	Egreso	ARS	148	13	3	2026-03-04 16:02:29.453+00	2026-03-04 16:02:29.453+00
67	27558.35	2026-03-04	Febrero	Egreso	ARS	150	13	3	2026-03-04 16:10:03.773+00	2026-03-04 16:10:03.773+00
68	64000.00	2026-03-06	Regalo Seba	Egreso	ARS	225	2	1	2026-03-09 11:56:26.506+00	2026-03-09 11:56:26.506+00
69	60000.00	2026-03-09	Pago Running Team Marzo	Egreso	ARS	169	13	1	2026-03-09 11:57:01.058+00	2026-03-09 11:57:01.058+00
70	90000.00	2026-03-09	Pago Contadora Marzo	Egreso	ARS	230	13	1	2026-03-09 12:00:28.865+00	2026-03-09 12:00:28.865+00
71	44671.00	2026-03-09	Nafta d├⌐bito luz	Egreso	ARS	161	2	1	2026-03-10 12:14:31.074+00	2026-03-10 12:14:41.687+00
72	16500.00	2026-03-09	Supermercado productos limpieza Silvia	Egreso	ARS	156	2	1	2026-03-10 12:15:22.532+00	2026-03-10 12:15:34.219+00
74	33500.00	2026-03-09	Limpieza	Egreso	ARS	156	2	1	2026-03-10 12:16:30.826+00	2026-03-10 12:16:40.603+00
73	23100.00	2026-03-09	Supermercado	Egreso	ARS	156	2	1	2026-03-10 12:15:59.994+00	2026-03-10 12:16:48.83+00
75	1290530.90	2026-03-11	Cuota 2/360 - Hipotecario (709.66 UVAs ├ù $1818.52)	Egreso	ARS	15	\N	1	2026-03-11 14:29:40.226+00	2026-03-11 14:29:40.226+00
76	15750.00	2026-03-11	Verduleria	Egreso	ARS	157	\N	1	2026-03-12 12:14:37.676+00	2026-03-12 12:14:48.231+00
77	400000.00	2026-03-12	\N	Egreso	ARS	2	1	1	2026-03-12 12:16:07.219+00	2026-03-12 12:16:07.219+00
78	400000.00	2026-03-12	\N	Egreso	ARS	3	1	1	2026-03-12 12:16:23.883+00	2026-03-12 12:16:23.883+00
79	13870.00	2026-03-21	supermercado	Egreso	ARS	156	1	1	2026-03-31 11:38:15.666+00	2026-03-31 11:38:34.05+00
80	70476.00	2026-03-21	Carnicer├¡a	Egreso	ARS	158	2	1	2026-03-31 11:39:53.324+00	2026-03-31 11:40:02.31+00
81	52508.52	2026-03-17	Gas	Egreso	ARS	149	13	1	2026-03-31 11:41:32.651+00	2026-03-31 11:41:45.459+00
82	100000.00	2026-03-17	Carnicer├¡a	Egreso	ARS	155	2	1	2026-03-31 11:42:43.232+00	2026-03-31 11:42:43.232+00
83	700.00	2026-04-06	Pago de pr├⌐stamo - Prestamo Personal DEPTO - Redes Apart	Egreso	USD	13	\N	1	2026-04-06 15:28:48.55+00	2026-04-06 15:28:48.55+00
84	700.00	2026-04-06	Gesti├│n Redes Marzo	Ingreso	USD	237	1	1	2026-04-06 15:49:10.838+00	2026-04-06 15:49:10.838+00
85	5000000.00	2026-04-06	Sueldo Damian	Ingreso	ARS	235	13	1	2026-04-06 15:49:35.19+00	2026-04-06 15:49:35.19+00
86	2376075.00	2026-04-06	Sueldo Luz	Ingreso	ARS	236	13	1	2026-04-06 15:50:49.16+00	2026-04-06 15:50:49.16+00
87	1581051.64	2026-04-06	Pago Visa Dami├ín (BBVA)	Egreso	ARS	8	13	1	2026-04-06 16:03:13.735+00	2026-04-06 16:03:13.735+00
88	1036760.58	2026-04-06	Pago MasterCard Dami├ín (BBVA)	Egreso	ARS	8	13	1	2026-04-06 16:04:48.645+00	2026-04-06 16:04:48.645+00
89	375455.13	2026-04-06	\N	Egreso	ARS	147	13	1	2026-04-06 16:10:43.671+00	2026-04-06 16:10:43.671+00
\.


--
-- Data for Name: user_telegram_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_telegram_links (id, "userId", "telegramChatId", "telegramUsername", "isActive", "createdAt", "updatedAt") FROM stdin;
1	1	-4715347460	\N	t	2026-02-11 17:35:40.734+00	2026-02-11 17:35:40.734+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, password_hash, role, is_active, created_at, updated_at) FROM stdin;
1	Damian Caglieris	damiancaglieris@gmail.com	$2b$10$3q4Xwx23UYanj/nJS.Q/bOvlGMw.CwNmRZSG8/63QPodQrX.xnvqe	Admin	t	2025-11-19 14:35:09+00	2025-12-01 14:25:08+00
3	Luz Ballesteros	ballesterosluzmaria@gmail.com	$2b$10$p9F0QIyA5DbAFwfmFV2kHOGCPE3Uy/CB2BEmDGBH0GVWdjbZr929.	Admin	t	2025-11-20 12:05:04+00	2025-11-29 23:49:39+00
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 15, true);


--
-- Name: credit_card_expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.credit_card_expenses_id_seq', 60, true);


--
-- Name: credit_card_installments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.credit_card_installments_id_seq', 168, true);


--
-- Name: credit_card_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.credit_card_payments_id_seq', 9, true);


--
-- Name: credit_card_recurring_charges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.credit_card_recurring_charges_id_seq', 13, true);


--
-- Name: credit_cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.credit_cards_id_seq', 7, true);


--
-- Name: exchange_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.exchange_rates_id_seq', 1, false);


--
-- Name: investment_earnings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.investment_earnings_id_seq', 1, true);


--
-- Name: investments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.investments_id_seq', 1, true);


--
-- Name: loan_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.loan_payments_id_seq', 7, true);


--
-- Name: loans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.loans_id_seq', 1, false);


--
-- Name: mortgage_installments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mortgage_installments_id_seq', 360, true);


--
-- Name: mortgage_loans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mortgage_loans_id_seq', 1, true);


--
-- Name: payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_methods_id_seq', 12, true);


--
-- Name: pending_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pending_transactions_id_seq', 28, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.transactions_id_seq', 89, true);


--
-- Name: user_telegram_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_telegram_links_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: credit_card_expenses credit_card_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_expenses
    ADD CONSTRAINT credit_card_expenses_pkey PRIMARY KEY (id);


--
-- Name: credit_card_installments credit_card_installments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_installments
    ADD CONSTRAINT credit_card_installments_pkey PRIMARY KEY (id);


--
-- Name: credit_card_payments credit_card_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_payments
    ADD CONSTRAINT credit_card_payments_pkey PRIMARY KEY (id);


--
-- Name: credit_card_recurring_charges credit_card_recurring_charges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_recurring_charges
    ADD CONSTRAINT credit_card_recurring_charges_pkey PRIMARY KEY (id);


--
-- Name: credit_cards credit_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_cards
    ADD CONSTRAINT credit_cards_pkey PRIMARY KEY (id);


--
-- Name: exchange_rates exchange_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_rates
    ADD CONSTRAINT exchange_rates_pkey PRIMARY KEY (id);


--
-- Name: investment_earnings investment_earnings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_earnings
    ADD CONSTRAINT investment_earnings_pkey PRIMARY KEY (id);


--
-- Name: investments investments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investments
    ADD CONSTRAINT investments_pkey PRIMARY KEY (id);


--
-- Name: loan_payments loan_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_payments
    ADD CONSTRAINT loan_payments_pkey PRIMARY KEY (id);


--
-- Name: loans loans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_pkey PRIMARY KEY (id);


--
-- Name: mortgage_installments mortgage_installments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mortgage_installments
    ADD CONSTRAINT mortgage_installments_pkey PRIMARY KEY (id);


--
-- Name: mortgage_loans mortgage_loans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mortgage_loans
    ADD CONSTRAINT mortgage_loans_pkey PRIMARY KEY (id);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: pending_transactions pending_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_transactions
    ADD CONSTRAINT pending_transactions_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: user_telegram_links user_telegram_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_telegram_links
    ADD CONSTRAINT user_telegram_links_pkey PRIMARY KEY (id);


--
-- Name: user_telegram_links user_telegram_links_telegramChatId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_telegram_links
    ADD CONSTRAINT "user_telegram_links_telegramChatId_key" UNIQUE ("telegramChatId");


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
-- Name: pending_transactions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pending_transactions_status ON public.pending_transactions USING btree (status);


--
-- Name: pending_transactions_transaction_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pending_transactions_transaction_date ON public.pending_transactions USING btree ("transactionDate");


--
-- Name: pending_transactions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pending_transactions_user_id ON public.pending_transactions USING btree ("userId");


--
-- Name: pending_transactions_user_id_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pending_transactions_user_id_status ON public.pending_transactions USING btree ("userId", status);


--
-- Name: user_telegram_links_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_telegram_links_is_active ON public.user_telegram_links USING btree ("isActive");


--
-- Name: user_telegram_links_telegram_chat_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_telegram_links_telegram_chat_id ON public.user_telegram_links USING btree ("telegramChatId");


--
-- Name: user_telegram_links_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_telegram_links_user_id ON public.user_telegram_links USING btree ("userId");


--
-- Name: categories categories_parent_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_category_id_fkey FOREIGN KEY (parent_category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: categories categories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: credit_card_expenses credit_card_expenses_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_expenses
    ADD CONSTRAINT credit_card_expenses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: credit_card_expenses credit_card_expenses_credit_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_expenses
    ADD CONSTRAINT credit_card_expenses_credit_card_id_fkey FOREIGN KEY (credit_card_id) REFERENCES public.credit_cards(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: credit_card_expenses credit_card_expenses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_expenses
    ADD CONSTRAINT credit_card_expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: credit_card_installments credit_card_installments_expense_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_installments
    ADD CONSTRAINT credit_card_installments_expense_id_fkey FOREIGN KEY (expense_id) REFERENCES public.credit_card_expenses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: credit_card_payments credit_card_payments_credit_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_payments
    ADD CONSTRAINT credit_card_payments_credit_card_id_fkey FOREIGN KEY (credit_card_id) REFERENCES public.credit_cards(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: credit_card_payments credit_card_payments_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_payments
    ADD CONSTRAINT credit_card_payments_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: credit_card_payments credit_card_payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_payments
    ADD CONSTRAINT credit_card_payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: credit_card_recurring_charges credit_card_recurring_charges_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_recurring_charges
    ADD CONSTRAINT credit_card_recurring_charges_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: credit_card_recurring_charges credit_card_recurring_charges_credit_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_recurring_charges
    ADD CONSTRAINT credit_card_recurring_charges_credit_card_id_fkey FOREIGN KEY (credit_card_id) REFERENCES public.credit_cards(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: credit_card_recurring_charges credit_card_recurring_charges_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_card_recurring_charges
    ADD CONSTRAINT credit_card_recurring_charges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: credit_cards credit_cards_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_cards
    ADD CONSTRAINT credit_cards_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: exchange_rates exchange_rates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_rates
    ADD CONSTRAINT exchange_rates_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: investment_earnings investment_earnings_investment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_earnings
    ADD CONSTRAINT investment_earnings_investment_id_fkey FOREIGN KEY (investment_id) REFERENCES public.investments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: investment_earnings investment_earnings_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_earnings
    ADD CONSTRAINT investment_earnings_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: investment_earnings investment_earnings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_earnings
    ADD CONSTRAINT investment_earnings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: investments investments_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investments
    ADD CONSTRAINT "investments_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: loan_payments loan_payments_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_payments
    ADD CONSTRAINT loan_payments_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: loan_payments loan_payments_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_payments
    ADD CONSTRAINT loan_payments_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: loan_payments loan_payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_payments
    ADD CONSTRAINT loan_payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: loans loans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mortgage_installments mortgage_installments_mortgage_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mortgage_installments
    ADD CONSTRAINT mortgage_installments_mortgage_loan_id_fkey FOREIGN KEY (mortgage_loan_id) REFERENCES public.mortgage_loans(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mortgage_installments mortgage_installments_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mortgage_installments
    ADD CONSTRAINT mortgage_installments_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: mortgage_installments mortgage_installments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mortgage_installments
    ADD CONSTRAINT mortgage_installments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mortgage_loans mortgage_loans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mortgage_loans
    ADD CONSTRAINT mortgage_loans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment_methods payment_methods_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pending_transactions pending_transactions_processedTransactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_transactions
    ADD CONSTRAINT "pending_transactions_processedTransactionId_fkey" FOREIGN KEY ("processedTransactionId") REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: pending_transactions pending_transactions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_transactions
    ADD CONSTRAINT "pending_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: transactions transactions_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_telegram_links user_telegram_links_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_telegram_links
    ADD CONSTRAINT "user_telegram_links_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict DIYbpmG2Rn1HArQVaBKTfLKoWdz1UIQ9RELDTzQzTY2eLpIqo5avSmTG6tQeiJI

