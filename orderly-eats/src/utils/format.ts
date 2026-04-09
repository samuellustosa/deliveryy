// orderly-eats/src/utils/format.ts

/**
 * Formata um número ou string para o padrão de moeda brasileiro (R$)
 */
export const formatCurrency = (value: number | string): string => {
  const amount = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount || 0);
};

/**
 * Converte uma string de moeda (ex: "1.250,50") para número (1250.50)
 * Útil para processar inputs de valor.
 */
export const parseCurrencyToNumber = (value: string): number => {
  return Number(value.replace(/\D/g, "")) / 100;
};

/**
 * Formata uma string de números para o padrão de telefone (86) 99999-9999
 */
export const formatPhoneNumber = (value: string): string => {
  if (!value) return "";
  
  // Remove tudo que não for número
  const phoneNumber = value.replace(/\D/g, "");
  
  if (phoneNumber.length <= 10) {
    // Formato (00) 0000-0000
    return phoneNumber.replace(/^(\d{2})(\d{4})(\d{4}).*/, "($1) $2-$3");
  }
  
  // Formato (00) 00000-0000
  return phoneNumber.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
};