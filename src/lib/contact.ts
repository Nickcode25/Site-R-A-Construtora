export const whatsappNumber = "5531999495764";
export const whatsappDisplay = "(31) 99949-5764";

export function whatsappUrl(message?: string) {
  const baseUrl = `https://wa.me/${whatsappNumber}`;
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
}
