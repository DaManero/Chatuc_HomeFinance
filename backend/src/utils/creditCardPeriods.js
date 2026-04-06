export function normalizePeriod(month, year) {
  const normalizedMonth = parseInt(month, 10);
  const normalizedYear = parseInt(year, 10);

  if (
    !Number.isInteger(normalizedMonth) ||
    normalizedMonth < 1 ||
    normalizedMonth > 12
  ) {
    throw new Error("Mes inválido para el período de tarjeta");
  }

  if (!Number.isInteger(normalizedYear) || normalizedYear < 2000) {
    throw new Error("Año inválido para el período de tarjeta");
  }

  return { month: normalizedMonth, year: normalizedYear };
}

export function addMonthsToPeriod(month, year, monthsToAdd) {
  const { month: normalizedMonth, year: normalizedYear } = normalizePeriod(
    month,
    year,
  );

  const date = new Date(normalizedYear, normalizedMonth - 1 + monthsToAdd, 1);

  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export function derivePaymentPeriodFromDueDate(dueDate) {
  const date = new Date(`${dueDate}T00:00:00`);

  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export function deriveStatementPeriodFromDueDate(dueDate) {
  const paymentPeriod = derivePaymentPeriodFromDueDate(dueDate);
  return addMonthsToPeriod(paymentPeriod.month, paymentPeriod.year, -1);
}

export function getInstallmentPeriods(
  firstStatementMonth,
  firstStatementYear,
  installmentNumber,
) {
  const statementPeriod = addMonthsToPeriod(
    firstStatementMonth,
    firstStatementYear,
    installmentNumber - 1,
  );

  const paymentPeriod = addMonthsToPeriod(
    firstStatementMonth,
    firstStatementYear,
    installmentNumber,
  );

  return { statementPeriod, paymentPeriod };
}

export function buildDueDateFromPaymentPeriod(
  paymentMonth,
  paymentYear,
  dueDay,
) {
  const { month, year } = normalizePeriod(paymentMonth, paymentYear);
  const safeDueDay = Math.max(1, parseInt(dueDay, 10) || 1);

  let dueDate = new Date(year, month - 1, safeDueDay);

  if (dueDate.getMonth() !== month - 1) {
    dueDate = new Date(year, month, 0);
  }

  return dueDate.toISOString().split("T")[0];
}

export function getPaymentPeriodForInstallment(installment) {
  if (installment.paymentMonth && installment.paymentYear) {
    return {
      month: installment.paymentMonth,
      year: installment.paymentYear,
    };
  }

  return derivePaymentPeriodFromDueDate(installment.dueDate);
}

export function getStatementPeriodForInstallment(installment) {
  if (installment.statementMonth && installment.statementYear) {
    return {
      month: installment.statementMonth,
      year: installment.statementYear,
    };
  }

  return deriveStatementPeriodFromDueDate(installment.dueDate);
}

export function getPeriodKey(month, year) {
  const { month: normalizedMonth, year: normalizedYear } = normalizePeriod(
    month,
    year,
  );

  return `${normalizedYear}-${String(normalizedMonth).padStart(2, "0")}`;
}
