export type BloodGroup = "O-" | "O+" | "A-" | "A+" | "B-" | "B+" | "AB-" | "AB+";

export const BLOOD_GROUPS: BloodGroup[] = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

export const COOLDOWN_DAYS = 90;

/** Who can donate red cells TO a given recipient group. */
export const COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": BLOOD_GROUPS,
};

export type Urgency = "critical" | "urgent" | "routine";

export const URGENCY_META: Record<Urgency, { label: string; window: string }> = {
  critical: { label: "Critical", window: "Needed within 2 hours" },
  urgent: { label: "Urgent", window: "Needed within 24 hours" },
  routine: { label: "Routine", window: "Needed within 7 days" },
};

export type Donor = {
  id: string;
  name: string;
  group: BloodGroup;
  area: string;
  distanceKm: number;
  lastDonationDays: number;
  donations: number;
  phone: string;
  responseRate: number;
};

export const DONORS: Donor[] = [
  { id: "D-1042", name: "Aarav Menon", group: "O-", area: "Fort Kochi", distanceKm: 2.4, lastDonationDays: 128, donations: 9, phone: "+91 98470 11204", responseRate: 92 },
  { id: "D-1088", name: "Nadia Rahman", group: "O+", area: "Kaloor", distanceKm: 4.1, lastDonationDays: 96, donations: 6, phone: "+91 98470 55118", responseRate: 87 },
  { id: "D-1123", name: "Joel Fernandes", group: "A+", area: "Edappally", distanceKm: 6.8, lastDonationDays: 41, donations: 4, phone: "+91 98470 90233", responseRate: 74 },
  { id: "D-1190", name: "Sruthi Nair", group: "B-", area: "Vyttila", distanceKm: 3.2, lastDonationDays: 210, donations: 12, phone: "+91 98470 71902", responseRate: 96 },
  { id: "D-1204", name: "Imran Sheikh", group: "AB+", area: "Panampilly", distanceKm: 5.5, lastDonationDays: 305, donations: 3, phone: "+91 98470 34477", responseRate: 68 },
  { id: "D-1233", name: "Divya Krishnan", group: "O-", area: "Aluva", distanceKm: 14.2, lastDonationDays: 74, donations: 8, phone: "+91 98470 20981", responseRate: 90 },
  { id: "D-1261", name: "Peter Varghese", group: "B+", area: "Tripunithura", distanceKm: 9.6, lastDonationDays: 154, donations: 15, phone: "+91 98470 66710", responseRate: 81 },
  { id: "D-1299", name: "Hana Thomas", group: "A-", area: "Marine Drive", distanceKm: 1.8, lastDonationDays: 112, donations: 5, phone: "+91 98470 45520", responseRate: 88 },
];

export type BloodRequest = {
  id: string;
  hospital: string;
  area: string;
  group: BloodGroup;
  units: number;
  unitsPledged: number;
  urgency: Urgency;
  postedAgo: string;
  note: string;
};

export const REQUESTS: BloodRequest[] = [
  { id: "REQ-8841", hospital: "Amrita Trauma Centre", area: "Edappally", group: "O-", units: 6, unitsPledged: 4, urgency: "critical", postedAgo: "12 min ago", note: "Multi-vehicle collision, two patients in theatre." },
  { id: "REQ-8837", hospital: "Lisie Heart Institute", area: "Kaloor", group: "A+", units: 3, unitsPledged: 3, urgency: "urgent", postedAgo: "48 min ago", note: "Scheduled CABG tomorrow 07:00." },
  { id: "REQ-8830", hospital: "Ernakulam General", area: "Marine Drive", group: "B-", units: 2, unitsPledged: 0, urgency: "critical", postedAgo: "1 hr ago", note: "Post-partum haemorrhage, rare group." },
  { id: "REQ-8822", hospital: "Renai Medicity", area: "Palarivattom", group: "O+", units: 8, unitsPledged: 5, urgency: "urgent", postedAgo: "3 hrs ago", note: "Dengue ward platelet & packed cell demand." },
  { id: "REQ-8814", hospital: "Aster Medcity", area: "Cheranalloor", group: "AB+", units: 2, unitsPledged: 1, urgency: "routine", postedAgo: "yesterday", note: "Thalassaemia transfusion cycle." },
];

export type MatchStatus = "pending" | "accepted" | "declined";

export type Match = {
  id: string;
  requestId: string;
  hospital: string;
  group: BloodGroup;
  urgency: Urgency;
  distanceKm: number;
  score: number;
  reason: string;
  status: MatchStatus;
  notifiedAgo: string;
};

export const MATCHES: Match[] = [
  { id: "M-3301", requestId: "REQ-8841", hospital: "Amrita Trauma Centre", group: "O-", urgency: "critical", distanceKm: 2.4, score: 98, reason: "Exact group · eligible 38 days past cooldown", status: "pending", notifiedAgo: "4 min ago" },
  { id: "M-3298", requestId: "REQ-8830", hospital: "Ernakulam General", group: "B-", urgency: "critical", distanceKm: 3.2, score: 91, reason: "Universal-for-B- donor · 3.2 km", status: "pending", notifiedAgo: "22 min ago" },
  { id: "M-3290", requestId: "REQ-8822", hospital: "Renai Medicity", group: "O+", urgency: "urgent", distanceKm: 5.1, score: 84, reason: "Compatible group · high response history", status: "accepted", notifiedAgo: "2 hrs ago" },
  { id: "M-3281", requestId: "REQ-8814", hospital: "Aster Medcity", group: "AB+", urgency: "routine", distanceKm: 11.4, score: 62, reason: "Compatible · distance beyond preferred radius", status: "declined", notifiedAgo: "yesterday" },
];

export type StockRow = {
  hospital: string;
  area: string;
  updatedAgo: string;
  units: Record<BloodGroup, number>;
};

const stock = (v: number[]) =>
  Object.fromEntries(BLOOD_GROUPS.map((g, i) => [g, v[i] ?? 0])) as Record<BloodGroup, number>;

export const NETWORK_STOCK: StockRow[] = [
  { hospital: "Amrita Trauma Centre", area: "Edappally", updatedAgo: "8 min ago", units: stock([2, 14, 5, 18, 3, 9, 1, 4]) },
  { hospital: "Lisie Heart Institute", area: "Kaloor", updatedAgo: "26 min ago", units: stock([0, 9, 2, 11, 1, 6, 0, 3]) },
  { hospital: "Ernakulam General", area: "Marine Drive", updatedAgo: "1 hr ago", units: stock([1, 21, 4, 16, 0, 12, 2, 5]) },
  { hospital: "Renai Medicity", area: "Palarivattom", updatedAgo: "2 hrs ago", units: stock([3, 6, 1, 8, 2, 4, 1, 2]) },
  { hospital: "Aster Medcity", area: "Cheranalloor", updatedAgo: "35 min ago", units: stock([4, 17, 7, 20, 5, 10, 2, 6]) },
];

export type Drive = {
  id: string;
  title: string;
  host: string;
  date: string;
  time: string;
  venue: string;
  registered: number;
  capacity: number;
  focus: string;
};

export const DRIVES: Drive[] = [
  { id: "DRV-210", title: "Monsoon Reserve Drive", host: "Ernakulam General", date: "Aug 09", time: "09:00 – 16:00", venue: "Marine Drive Hall", registered: 148, capacity: 200, focus: "O- and B- priority" },
  { id: "DRV-214", title: "Campus Pint Day", host: "Amrita Trauma Centre", date: "Aug 16", time: "10:00 – 15:00", venue: "Amrita Campus, Edappally", registered: 92, capacity: 180, focus: "First-time donors welcome" },
  { id: "DRV-219", title: "Corporate Corridor Drive", host: "Lisie Heart Institute", date: "Aug 23", time: "08:30 – 14:00", venue: "Infopark Phase I Atrium", registered: 61, capacity: 120, focus: "Platelet apheresis screening" },
];

export const NETWORK_STATS = [
  { label: "Registered donors", value: "12,480" },
  { label: "Median match time", value: "6m 12s" },
  { label: "Partner hospitals", value: "38" },
  { label: "Units coordinated", value: "9,102" },
];

export function eligible(donor: Donor) {
  return donor.lastDonationDays >= COOLDOWN_DAYS;
}

export function matchDonors(group: BloodGroup, radiusKm: number) {
  const allowed = COMPATIBILITY[group];
  return DONORS.filter(
    (d) => allowed.includes(d.group) && d.distanceKm <= radiusKm && eligible(d),
  ).sort((a, b) => a.distanceKm - b.distanceKm);
}
