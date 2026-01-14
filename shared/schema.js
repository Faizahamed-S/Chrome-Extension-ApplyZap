export function buildApplicationPayload(input) {
  const payload = {
    companyName: input.companyName || "",
    roleName: input.roleName || "",
    dateOfApplication: normalizeDate(input.dateOfApplication),
    jobLink: input.jobLink || "",
    tailored: !!input.tailored,
    jobDescription: input.jobDescription || "",
    referral: !!input.referral,
    status: normalizeStatus(input.status)
  };
  return payload;
}

function normalizeDate(value) {
  // If value is empty/null/undefined, use today's date in user's local timezone
  if (!value) {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  
  // Convert to string and trim whitespace
  const str = String(value).trim();
  
  // If it's already a valid YYYY-MM-DD string, append timezone offset to prevent backend UTC conversion
  // Format: YYYY-MM-DDTHH:mm:ss+offset (e.g., "2026-01-14T00:00:00-08:00" for PST)
  // This tells the backend to use local midnight, not UTC midnight
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    // Get timezone offset: getTimezoneOffset() returns minutes, negative means ahead of UTC
    // For PST (UTC-8): getTimezoneOffset() returns 480 (8 hours * 60 minutes)
    // We need to invert the sign for ISO 8601 format
    const offsetMinutes = new Date().getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
    const offsetMins = Math.abs(offsetMinutes) % 60;
    // Invert sign: if offsetMinutes is positive (behind UTC), we need negative offset
    const offsetSign = offsetMinutes > 0 ? '-' : '+';
    const offsetStr = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMins).padStart(2, '0')}`;
    return `${str}T00:00:00${offsetStr}`;
  }
  
  // If it's not in YYYY-MM-DD format, try to extract date parts and format it
  // But avoid creating Date objects that could cause timezone issues
  if (str.includes('-') || str.includes('/')) {
    const separator = str.includes('-') ? '-' : '/';
    const parts = str.split(separator);
    if (parts.length >= 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      
      // Validate the parts are numbers
      if (!isNaN(year) && !isNaN(month) && !isNaN(day) && 
          year >= 1000 && year <= 9999 && 
          month >= 1 && month <= 12 && 
          day >= 1 && day <= 31) {
        // Format directly without Date object - use exactly what user provided
        const yyyy = String(year).padStart(4, "0");
        const mm = String(month).padStart(2, "0");
        const dd = String(day).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      }
    }
  }
  
  // Final fallback: if we can't parse it, use today's date
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeStatus(value) {
  const allowed = [
    "APPLIED",
    "REJECTED",
    "ONLINE_ASSESSMENT",
    "INTERVIEW",
    "OFFER"
  ];
  if (allowed.includes(value)) return value;
  return "APPLIED";
}
