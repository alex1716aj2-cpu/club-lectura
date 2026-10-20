export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
