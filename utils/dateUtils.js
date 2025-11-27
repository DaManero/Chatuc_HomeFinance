/**
 * Formatea una fecha al formato español (DD/MM/YYYY)
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDate = (date) => {
  if (!date) return "-";

  const d = new Date(date);

  // Verificar si es una fecha válida
  if (isNaN(d.getTime())) return "-";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Formatea una fecha con hora
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha y hora formateadas
 */
export const formatDateTime = (date) => {
  if (!date) return "-";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "-";

  const dateStr = formatDate(date);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${dateStr} ${hours}:${minutes}`;
};

/**
 * Convierte una fecha a formato YYYY-MM-DD para inputs de tipo date
 * @param {string|Date} date - Fecha a convertir
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const toInputDate = (date) => {
  if (!date) return "";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
