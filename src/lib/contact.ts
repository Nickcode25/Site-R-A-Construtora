export const whatsappNumber = "5531980405294";
export const whatsappDisplay = "(31) 98040-5294";

export function whatsappUrl(message?: string) {
  const baseUrl = `https://wa.me/${whatsappNumber}`;
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
}
