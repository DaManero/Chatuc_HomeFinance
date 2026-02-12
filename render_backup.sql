--
-- PostgreSQL database dump
--

\restrict mPwhrS1Hg9bpC81wAX9QnQsX4JHBCNO28VRsu1SB86Ph6Lj0LoAFfHvMyDh6a5Y

-- Dumped from database version 18.1 (Debian 18.1-1.pgdg12+2)
-- Dumped by pg_dump version 18.1

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

COMMENT ON COLUMN public.categories.is_recurring IS 'Indica si es una categoría de gasto/ingreso fijo mensual';


--
-- Name: COLUMN categories.parent_category_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.categories.parent_category_id IS 'ID de la categoría padre (null si es categoría principal)';


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

COMMENT ON COLUMN public.credit_card_expenses.description IS 'Descripción del gasto';


--
-- Name: COLUMN credit_card_expenses.total_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_expenses.total_amount IS 'Monto total del gasto (ya incluye interés si aplica)';


--
-- Name: COLUMN credit_card_expenses.installments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_expenses.installments IS 'Cantidad de cuotas (1 = pago único)';


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

COMMENT ON COLUMN public.credit_card_installments.installment_number IS 'Número de cuota (1, 2, 3...)';


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

COMMENT ON COLUMN public.credit_card_installments.paid_date IS 'Fecha en que se pagó la cuota';


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

COMMENT ON COLUMN public.credit_card_payments.payment_date IS 'Fecha en que se realizó el pago';


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

COMMENT ON COLUMN public.credit_card_payments.transaction_id IS 'Transacción de egreso asociada al pago (afecta el balance)';


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

COMMENT ON COLUMN public.credit_card_recurring_charges.description IS 'Descripción del débito (ej: Netflix, Spotify)';


--
-- Name: COLUMN credit_card_recurring_charges.amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_recurring_charges.amount IS 'Monto mensual del débito';


--
-- Name: COLUMN credit_card_recurring_charges.charge_day; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_recurring_charges.charge_day IS 'Día del mes en que se carga (1-31)';


--
-- Name: COLUMN credit_card_recurring_charges.is_active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_recurring_charges.is_active IS 'Indica si el débito está activo';


--
-- Name: COLUMN credit_card_recurring_charges.currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_card_recurring_charges.currency IS 'Moneda del débito (ARS, USD)';


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

COMMENT ON COLUMN public.credit_cards.last_four_digits IS 'Últimos 4 dígitos de la tarjeta';


--
-- Name: COLUMN credit_cards.expiration_month; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_cards.expiration_month IS 'Mes de vencimiento (1-12)';


--
-- Name: COLUMN credit_cards.expiration_year; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_cards.expiration_year IS 'Año de vencimiento (YYYY)';


--
-- Name: COLUMN credit_cards.due_day; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.credit_cards.due_day IS 'Día del mes de vencimiento del pago (1-31)';


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

COMMENT ON COLUMN public.exchange_rates.source IS 'Origen de la cotización';


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

COMMENT ON COLUMN public.investments.type IS 'Tipo de inversión';


--
-- Name: COLUMN investments.amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.investments.amount IS 'Monto de la inversión';


--
-- Name: COLUMN investments.currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.investments.currency IS 'Moneda de la inversión';


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

COMMENT ON COLUMN public.investments."interestRate" IS 'Tasa de interés anual';


--
-- Name: COLUMN investments.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.investments.status IS 'Estado de la inversión';


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

COMMENT ON COLUMN public.loan_payments.transaction_id IS 'Transacción asociada al pago';


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

COMMENT ON COLUMN public.loans.entity IS 'Banco/Entidad/Persona que otorgó el préstamo';


--
-- Name: COLUMN loans.total_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loans.total_amount IS 'Monto total del préstamo';


--
-- Name: COLUMN loans.pending_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loans.pending_amount IS 'Monto pendiente por pagar';


--
-- Name: COLUMN loans.currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loans.currency IS 'Moneda del préstamo (ARS, USD)';


--
-- Name: COLUMN loans.interest_rate; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loans.interest_rate IS 'Tasa de interés (%)';


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

COMMENT ON COLUMN public.pending_transactions.amount IS 'Monto detectado automáticamente';


--
-- Name: COLUMN pending_transactions.currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_transactions.currency IS 'Moneda detectada';


--
-- Name: COLUMN pending_transactions.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_transactions.type IS 'Tipo de transacción detectado';


--
-- Name: COLUMN pending_transactions."suggestedCategory"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_transactions."suggestedCategory" IS 'Categoría sugerida por el parser';


--
-- Name: COLUMN pending_transactions.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_transactions.description IS 'Descripción extraída del mensaje';


--
-- Name: COLUMN pending_transactions."transactionDate"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_transactions."transactionDate" IS 'Fecha/hora del mensaje';


--
-- Name: COLUMN pending_transactions.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_transactions.status IS 'Estado de la transacción pendiente';


--
-- Name: COLUMN pending_transactions."processedTransactionId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pending_transactions."processedTransactionId" IS 'ID de la transacción creada al procesar';


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

COMMENT ON COLUMN public.transactions.currency IS 'Moneda de la transacción (ARS, USD)';


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
235	Sueldo Damián	Ingreso	t	234	1	2026-01-30 14:39:01+00	2026-02-04 17:52:59.082+00
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
5	Pasajes aéreos	Egreso	f	4	1	2026-02-10 12:48:10.761+00	2026-02-10 12:48:10.761+00
6	Cuota Club	Egreso	t	176	1	2026-02-10 17:35:08.25+00	2026-02-10 17:35:08.25+00
7	Canva	Egreso	t	176	1	2026-02-10 17:50:32.763+00	2026-02-10 17:50:32.763+00
145	Gastos del Departamento	Egreso	f	\N	1	2026-01-28 13:07:44+00	2026-02-04 17:13:25.799+00
180	Git Copilot	Egreso	t	176	1	2026-01-28 13:07:44+00	2026-02-10 17:50:42.688+00
177	Netflix	Egreso	t	176	1	2026-01-28 13:07:44+00	2026-02-10 17:50:43.561+00
163	Estacionamiento	Egreso	t	160	1	2026-01-28 13:07:44+00	2026-02-04 17:14:07.43+00
178	Spotify	Egreso	t	176	1	2026-01-28 13:07:44+00	2026-02-10 17:50:45.149+00
179	Apple	Egreso	t	176	1	2026-01-28 13:07:44+00	2026-02-10 17:50:46.455+00
160	Auto	Egreso	f	\N	1	2026-01-28 13:07:44+00	2026-02-04 17:14:12.181+00
161	Combustible	Egreso	t	160	1	2026-01-28 13:07:44+00	2026-02-04 17:19:00.036+00
8	Tarjetas de credito	Egreso	f	\N	1	2026-02-10 18:05:06.448+00	2026-02-10 18:05:06.448+00
230	Servicios profesionales	Egreso	t	229	3	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
159	Otros	Egreso	f	155	1	2026-01-28 13:07:44+00	2026-02-04 17:52:11.861+00
162	Mantenimiento	Egreso	f	160	1	2026-01-28 13:07:44+00	2026-02-04 17:52:17.248+00
167	Consultas medicas	Egreso	f	166	1	2026-01-28 13:07:44+00	2026-02-04 17:52:22.362+00
150	Agua	Egreso	t	145	1	2026-01-28 13:07:44+00	2026-02-04 17:52:35.409+00
154	Mantenimiento	Egreso	f	145	1	2026-01-28 13:07:44+00	2026-02-04 17:52:39.004+00
155	Alimentación	Egreso	f	\N	1	2026-01-28 13:07:44+00	2026-01-28 13:15:02+00
165	Patente	Egreso	f	160	1	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
166	Deporte y Salud	Egreso	f	\N	1	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
168	Farmacia	Egreso	f	166	1	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
170	Peluquería	Egreso	f	166	1	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
176	Suscripciones	Egreso	f	\N	1	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
215	Educación	Egreso	f	\N	3	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
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
232	Trámites	Egreso	f	229	3	2026-01-28 13:07:44+00	2026-01-28 13:07:44+00
234	Sueldos	Ingreso	f	\N	1	2026-01-30 14:38:13+00	2026-01-30 14:48:48+00
236	Sueldo Luz	Ingreso	t	234	1	2026-01-30 14:39:21+00	2026-01-30 14:42:51+00
237	Inversiones	Ingreso	f	\N	1	2026-01-30 14:44:26+00	2026-01-30 14:44:26+00
158	Carnicería	Egreso	t	155	1	2026-01-28 13:07:44+00	2026-02-04 16:57:54.711+00
156	Supermercado	Egreso	t	155	1	2026-01-28 13:07:44+00	2026-02-04 16:58:21.736+00
157	Verdulería	Egreso	t	155	1	2026-01-28 13:07:44+00	2026-02-04 16:58:24.162+00
164	Seguros del auto	Egreso	f	160	1	2026-01-28 13:07:44+00	2026-02-04 16:58:32.66+00
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
\.


--
-- Data for Name: credit_card_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.credit_card_payments (id, amount, payment_date, currency, notes, credit_card_id, transaction_id, user_id, created_at, updated_at) FROM stdin;
1	1399591.61	2026-02-04	ARS	Pago Mastercard Febrero	2	25	1	2026-02-10 18:05:06.696+00	2026-02-10 18:05:06.696+00
2	1153511.02	2026-02-04	ARS	Pago Visa Febrero	1	26	1	2026-02-10 18:05:49.482+00	2026-02-10 18:05:49.482+00
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
\.


--
-- Data for Name: credit_cards; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.credit_cards (id, name, bank, brand, last_four_digits, expiration_month, expiration_year, due_day, user_id, created_at, updated_at) FROM stdin;
1	Visa Damián	BBVA	Visa	7403	12	2027	1	1	2026-02-09 11:50:08.432+00	2026-02-09 11:50:08.432+00
2	MasterCard Damián	BBVA	Mastercard	1789	12	2027	1	1	2026-02-09 11:50:44.507+00	2026-02-09 11:50:44.507+00
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
\.


--
-- Data for Name: loans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loans (id, entity, total_amount, pending_amount, currency, interest_rate, loan_date, due_date, installments, installment_amount, status, description, user_id, created_at, updated_at) FROM stdin;
2	Prestamo Personal DEPTO	42000.00	40200.00	USD	\N	2025-09-01	\N	\N	\N	Activo	Préstamo personal para la compra de departamento	1	2025-11-27 14:45:59+00	2025-11-27 14:52:08+00
\.


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_methods (id, name, type, user_id, created_at, updated_at) FROM stdin;
13	Transferencia Bancaria	Transferencia	1	2026-01-30 14:41:53+00	2026-01-30 14:41:53+00
1	Efectivo	Efectivo	1	2026-02-09 11:38:52.668+00	2026-02-09 11:38:52.668+00
2	Tarjeta Débito	Tarjeta	1	2026-02-09 11:39:06.786+00	2026-02-09 11:39:06.786+00
3	Visa Damián - BBVA	Tarjeta	1	2026-02-09 11:53:08.478+00	2026-02-09 11:53:08.478+00
4	MasterCard Damián - BBVA	Tarjeta	1	2026-02-10 12:48:53.268+00	2026-02-10 12:48:53.268+00
\.


--
-- Data for Name: pending_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pending_transactions (id, "rawMessage", amount, currency, type, "suggestedCategory", description, "transactionDate", status, "userId", "processedTransactionId", "telegramMessageId", "telegramChatId", "createdAt", "updatedAt") FROM stdin;
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
1	4700000.00	2026-02-02	Sueldo Damián Enero 26	Ingreso	ARS	235	13	1	2026-02-02 16:59:17.577+00	2026-02-02 16:59:17.577+00
5	63712.00	2026-02-02	\N	Egreso	ARS	149	13	3	2026-02-02 23:04:50.414+00	2026-02-02 23:05:17.958+00
6	6903.00	2026-02-02	\N	Egreso	ARS	148	13	3	2026-02-02 23:06:37.469+00	2026-02-02 23:06:37.469+00
7	900000.00	2026-02-02	\N	Ingreso	ARS	237	\N	3	2026-02-02 23:11:55.152+00	2026-02-02 23:11:55.152+00
8	28285.00	2026-02-02	\N	Egreso	ARS	158	13	3	2026-02-02 23:12:58.241+00	2026-02-02 23:12:58.241+00
2	84000.00	2026-02-02	Compra Café	Egreso	ARS	156	13	1	2026-02-02 16:59:44.226+00	2026-02-02 23:13:30.222+00
3	2330000.00	2026-02-02	Sueldo Luz Enero 2026	Ingreso	ARS	236	13	3	2026-02-02 23:03:34.414+00	2026-02-02 23:15:29.409+00
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
25	1399591.61	2026-02-04	Pago MasterCard Damián (BBVA)	Egreso	ARS	8	13	1	2026-02-10 18:05:06.572+00	2026-02-10 18:05:06.572+00
26	1153511.02	2026-02-04	Pago Visa Damián (BBVA)	Egreso	ARS	8	13	1	2026-02-10 18:05:49.353+00	2026-02-10 18:05:49.353+00
\.


--
-- Data for Name: user_telegram_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_telegram_links (id, "userId", "telegramChatId", "telegramUsername", "isActive", "createdAt", "updatedAt") FROM stdin;
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

SELECT pg_catalog.setval('public.categories_id_seq', 8, true);


--
-- Name: credit_card_expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.credit_card_expenses_id_seq', 22, true);


--
-- Name: credit_card_installments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.credit_card_installments_id_seq', 95, true);


--
-- Name: credit_card_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.credit_card_payments_id_seq', 2, true);


--
-- Name: credit_card_recurring_charges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.credit_card_recurring_charges_id_seq', 11, true);


--
-- Name: credit_cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.credit_cards_id_seq', 2, true);


--
-- Name: exchange_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.exchange_rates_id_seq', 1, false);


--
-- Name: investment_earnings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.investment_earnings_id_seq', 1, false);


--
-- Name: investments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.investments_id_seq', 1, false);


--
-- Name: loan_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.loan_payments_id_seq', 1, false);


--
-- Name: loans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.loans_id_seq', 1, false);


--
-- Name: payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_methods_id_seq', 4, true);


--
-- Name: pending_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pending_transactions_id_seq', 1, false);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.transactions_id_seq', 26, true);


--
-- Name: user_telegram_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_telegram_links_id_seq', 1, false);


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

\unrestrict mPwhrS1Hg9bpC81wAX9QnQsX4JHBCNO28VRsu1SB86Ph6Lj0LoAFfHvMyDh6a5Y

