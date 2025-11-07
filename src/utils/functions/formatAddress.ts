// Function to format address properly
export const formatAddress = (address: string): string => {
  if (!address) return "Unknown address";
  
  const parts = address.split(',').map(part => part.trim()).filter(part => part.length > 0);
  
  const processedParts: string[] = [];
  
  for (const part of parts) {
    let subParts = part;
    
    // Split by common patterns: Road, Street, Avenue, etc. followed by a city name
    subParts = subParts.replace(/(Road|Street|Avenue|Lane|Drive|Boulevard|Circle)([A-Z][a-z]+)/g, '$1, $2');
    
    // Split city name from postal code (pattern: CityName 6digits)
    subParts = subParts.replace(/([A-Z][a-z]+)\s+(\d{6})/g, '$1-$2');
    
    // Split by postal code patterns (6 digits) followed by state
    subParts = subParts.replace(/(\d{6})([A-Z][a-z]+)/g, '$1, $2');
    
    // Split by state names followed by country
    subParts = subParts.replace(/(Gujarat|Maharashtra|Delhi|Karnataka|Tamil Nadu|Kerala|Andhra Pradesh|Telangana|Rajasthan|Madhya Pradesh|Uttar Pradesh|Bihar|West Bengal|Odisha|Assam|Punjab|Haryana|Himachal Pradesh|Uttarakhand|Jharkhand|Chhattisgarh|Goa|Manipur|Meghalaya|Nagaland|Tripura|Arunachal Pradesh|Mizoram|Sikkim)([A-Z][a-z]+)/g, '$1, $2');
    
    // Split the processed part
    const splitSubParts = subParts.split(',').map(subPart => subPart.trim()).filter(subPart => subPart.length > 0);
    processedParts.push(...splitSubParts);
  }
  
  // Additional processing to handle malformed combinations like "Ambika NiketanSurat-395007"
  const finalParts: string[] = [];
  
  for (const part of processedParts) {
    // Check if this part contains a malformed combination (location name stuck to city-postal)
    const cityPostalMatch = part.match(/([A-Z][a-z]+)-(\d{6})/);
    if (cityPostalMatch) {
      const cityName = cityPostalMatch[1];
      const postalCode = cityPostalMatch[2];
      const beforeCity = part.substring(0, part.indexOf(cityName)).trim();
      
      if (beforeCity) {
        // This is a malformed combination, split it
        if (beforeCity) finalParts.push(beforeCity);
        finalParts.push(`${cityName}-${postalCode}`);
      } else {
        finalParts.push(part);
      }
    } else {
      finalParts.push(part);
    }
  }
  
  // Remove duplicates while preserving order and handling combined parts
  const uniqueParts: string[] = [];
  const seen = new Set<string>();
  const combinedCityPostal = new Set<string>();
  
  // First pass: collect combined city-postal codes
  for (const part of finalParts) {
    if (part.includes('-') && /\d{6}/.test(part)) {
      const cityName = part.split('-')[0];
      combinedCityPostal.add(cityName.toLowerCase());
    }
  }
  
  // Second pass: add parts, skipping individual city/postal if we have combined version
  for (const part of finalParts) {
    const normalizedPart = part.toLowerCase().replace(/\s+/g, ' ').trim();
    
    // Skip if we already have this part
    if (seen.has(normalizedPart)) continue;
    
    // Skip individual city name if we have combined city-postal code
    if (combinedCityPostal.has(normalizedPart) && !part.includes('-')) continue;
    
    // Skip individual postal code if we have combined city-postal code
    if (/^\d{6}$/.test(part) && combinedCityPostal.size > 0) continue;
    
    seen.add(normalizedPart);
    uniqueParts.push(part.trim());
  }
  
  // Join the unique parts with proper formatting
  return uniqueParts.join(', ');
}; 