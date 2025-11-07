export default function dateTimeformatter(isoString: string): string {
    if (!isoString) return 'N/A';
  
    const date = new Date(isoString);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
  