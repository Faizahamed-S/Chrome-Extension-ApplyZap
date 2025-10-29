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
  if (!value) {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  // accept YYYY-MM-DD or any Date-compatible string
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
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
