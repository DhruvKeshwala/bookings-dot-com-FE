import axios from 'axios';

export function generateFlightBookingId(): string {
  const prefix = "FB"; // 2 characters
  const now = new Date();

  // Encode date: Year (last digit), Month (A-L), Day (1-9, A-V)
  const year = now.getFullYear().toString().slice(-1); // e.g., "5" for 2025
  const month = String.fromCharCode(65 + now.getMonth()); // A = Jan, B = Feb, ..., L = Dec
  const day =
    now.getDate() <= 9
      ? now.getDate().toString()
      : String.fromCharCode(55 + now.getDate()); // 10 = 'A', 11 = 'B', ..., 31 = 'V'
  const dateCode = year + month + day; // 3 chars

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomPart = "";
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return prefix + dateCode + randomPart; // Total: 2 + 3 + 5 = 10 chars
}


export async function fetchIP(): Promise<string | null> {
  try {
    const res = await axios.get('https://api.ipify.org?format=json');
    return res.data.ip || null;
  } catch (err) {
    console.error('Failed to fetch IP:', err);
    return null;
  }
}

export function generateHotelBookingId(): string {
  const prefix = "FB"; 
  const now = new Date();

  const year = now.getFullYear().toString().slice(-1); 
  const month = String.fromCharCode(65 + now.getMonth());
  const day =
    now.getDate() <= 9
      ? now.getDate().toString()
      : String.fromCharCode(55 + now.getDate()); 
  const dateCode = year + month + day;

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomPart = "";
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return prefix + dateCode + randomPart;
}

