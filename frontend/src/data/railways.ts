// Indian Railways-style demo/sample data for ODAYA v1.
// Everything here is SAMPLE DATA only - not live IRCTC data.

export type TrainClass = "1A" | "2A" | "3A" | "SL" | "CC" | "2S";

export interface Train {
  number: string;
  name: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departure: string;
  arrival: string;
  duration: string;
  classes: TrainClass[];
  days: string;
}

export const TRAINS: Train[] = [
  {
    number: "12951",
    name: "Mumbai Rajdhani Express",
    from: "Mumbai Central",
    fromCode: "MMCT",
    to: "New Delhi",
    toCode: "NDLS",
    departure: "17:00",
    arrival: "08:35",
    duration: "15h 35m",
    classes: ["1A", "2A", "3A"],
    days: "Daily",
  },
  {
    number: "12002",
    name: "Bhopal Shatabdi Express",
    from: "New Delhi",
    fromCode: "NDLS",
    to: "Bhopal Jn",
    toCode: "BPL",
    departure: "06:00",
    arrival: "14:00",
    duration: "08h 00m",
    classes: ["CC", "1A"],
    days: "Daily (except Fri)",
  },
  {
    number: "12259",
    name: "Sealdah Duronto Express",
    from: "Sealdah",
    fromCode: "SDAH",
    to: "New Delhi",
    toCode: "NDLS",
    departure: "20:05",
    arrival: "12:40",
    duration: "16h 35m",
    classes: ["1A", "2A", "3A"],
    days: "Tue, Thu, Sun",
  },
  {
    number: "22691",
    name: "KSR Bengaluru Rajdhani",
    from: "KSR Bengaluru",
    fromCode: "SBC",
    to: "H Nizamuddin",
    toCode: "NZM",
    departure: "20:00",
    arrival: "05:55",
    duration: "33h 55m",
    classes: ["1A", "2A", "3A"],
    days: "Daily",
  },
  {
    number: "12309",
    name: "Rajendra Nagar Rajdhani",
    from: "Rajendra Nagar",
    fromCode: "RJPB",
    to: "New Delhi",
    toCode: "NDLS",
    departure: "19:10",
    arrival: "07:40",
    duration: "12h 30m",
    classes: ["1A", "2A", "3A"],
    days: "Daily",
  },
  {
    number: "12049",
    name: "Gatimaan Express",
    from: "H Nizamuddin",
    fromCode: "NZM",
    to: "Jhansi Jn",
    toCode: "JHS",
    departure: "08:10",
    arrival: "12:40",
    duration: "04h 30m",
    classes: ["CC", "1A"],
    days: "Daily (except Fri)",
  },
  {
    number: "12723",
    name: "Telangana Express",
    from: "Hyderabad",
    fromCode: "HYB",
    to: "New Delhi",
    toCode: "NDLS",
    departure: "06:50",
    arrival: "11:45",
    duration: "28h 55m",
    classes: ["1A", "2A", "3A", "SL"],
    days: "Daily",
  },
  {
    number: "12621",
    name: "Tamil Nadu Express",
    from: "MGR Chennai Ctr",
    fromCode: "MAS",
    to: "New Delhi",
    toCode: "NDLS",
    departure: "22:30",
    arrival: "07:10",
    duration: "32h 40m",
    classes: ["1A", "2A", "3A", "SL"],
    days: "Daily",
  },
];

export const STATIONS = [
  { code: "NDLS", name: "New Delhi" },
  { code: "MMCT", name: "Mumbai Central" },
  { code: "SDAH", name: "Sealdah" },
  { code: "SBC", name: "KSR Bengaluru" },
  { code: "MAS", name: "MGR Chennai Ctr" },
  { code: "HYB", name: "Hyderabad" },
  { code: "BPL", name: "Bhopal Jn" },
  { code: "JHS", name: "Jhansi Jn" },
  { code: "NZM", name: "H Nizamuddin" },
  { code: "RJPB", name: "Rajendra Nagar" },
  { code: "LKO", name: "Lucknow" },
  { code: "PUNE", name: "Pune Jn" },
];

export interface RouteStop {
  station: string;
  code: string;
  arrival: string;
  departure: string;
  haltMin: number;
  distanceKm: number;
  dayOffset: number;
}

export const TRAIN_ROUTE: Record<string, RouteStop[]> = {
  "12951": [
    { station: "Mumbai Central", code: "MMCT", arrival: "--", departure: "17:00", haltMin: 0, distanceKm: 0, dayOffset: 1 },
    { station: "Borivali", code: "BVI", arrival: "17:21", departure: "17:24", haltMin: 3, distanceKm: 30, dayOffset: 1 },
    { station: "Surat", code: "ST", arrival: "20:00", departure: "20:05", haltMin: 5, distanceKm: 263, dayOffset: 1 },
    { station: "Vadodara Jn", code: "BRC", arrival: "22:10", departure: "22:15", haltMin: 5, distanceKm: 392, dayOffset: 1 },
    { station: "Ratlam Jn", code: "RTM", arrival: "01:40", departure: "01:50", haltMin: 10, distanceKm: 653, dayOffset: 2 },
    { station: "Kota Jn", code: "KOTA", arrival: "04:50", departure: "04:55", haltMin: 5, distanceKm: 918, dayOffset: 2 },
    { station: "New Delhi", code: "NDLS", arrival: "08:35", departure: "--", haltMin: 0, distanceKm: 1384, dayOffset: 2 },
  ],
  "12002": [
    { station: "New Delhi", code: "NDLS", arrival: "--", departure: "06:00", haltMin: 0, distanceKm: 0, dayOffset: 1 },
    { station: "Agra Cantt", code: "AGC", arrival: "07:47", departure: "07:49", haltMin: 2, distanceKm: 199, dayOffset: 1 },
    { station: "Gwalior Jn", code: "GWL", arrival: "09:04", departure: "09:06", haltMin: 2, distanceKm: 317, dayOffset: 1 },
    { station: "Jhansi Jn", code: "JHS", arrival: "09:48", departure: "09:53", haltMin: 5, distanceKm: 414, dayOffset: 1 },
    { station: "Bhopal Jn", code: "BPL", arrival: "14:00", departure: "--", haltMin: 0, distanceKm: 707, dayOffset: 1 },
  ],
};

export function getRouteFor(trainNumber: string): RouteStop[] {
  return TRAIN_ROUTE[trainNumber] ?? [
    { station: "Origin", code: "ORG", arrival: "--", departure: "08:00", haltMin: 0, distanceKm: 0, dayOffset: 1 },
    { station: "Mid Station 1", code: "MD1", arrival: "11:30", departure: "11:35", haltMin: 5, distanceKm: 220, dayOffset: 1 },
    { station: "Mid Station 2", code: "MD2", arrival: "14:00", departure: "14:05", haltMin: 5, distanceKm: 430, dayOffset: 1 },
    { station: "Mid Station 3", code: "MD3", arrival: "17:10", departure: "17:15", haltMin: 5, distanceKm: 640, dayOffset: 1 },
    { station: "Destination", code: "DST", arrival: "20:30", departure: "--", haltMin: 0, distanceKm: 820, dayOffset: 1 },
  ];
}

export function pseudoRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0x7fffffff;
  }
  return hash;
}

export interface PnrSample {
  pnr: string;
  trainNumber: string;
  trainName: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  journeyDate: string;
  bookingStatus: string;
  currentStatus: string;
  coach: string;
  seat: string;
  classCode: TrainClass;
  passengerName: string;
}

export function generatePnrSample(pnr: string): PnrSample {
  const seed = pseudoRandom(pnr || "0000000000");
  const train = TRAINS[seed % TRAINS.length];
  const coachLetter = ["A", "B", "S"][seed % 3];
  const coachNum = (seed % 6) + 1;
  const seatNum = (seed % 72) + 1;
  const confirmed = seed % 3 !== 0;
  const classCode = train.classes[0];
  const names = ["RAVI KUMAR", "PRIYA SHARMA", "AMIT PATEL", "SNEHA REDDY", "ARJUN MEHTA"];
  return {
    pnr: pnr || "4521098763",
    trainNumber: train.number,
    trainName: train.name,
    from: train.from,
    fromCode: train.fromCode,
    to: train.to,
    toCode: train.toCode,
    journeyDate: "15 May 2026",
    bookingStatus: confirmed ? `CNF/${coachLetter}${coachNum}/${seatNum}` : `WL/${(seed % 20) + 1}`,
    currentStatus: confirmed ? `CNF/${coachLetter}${coachNum}/${seatNum}` : `RAC/${(seed % 15) + 1}`,
    coach: `${coachLetter}${coachNum}`,
    seat: `${seatNum}`,
    classCode,
    passengerName: names[seed % names.length],
  };
}

export interface LiveStatus {
  trainNumber: string;
  trainName: string;
  currentStation: string;
  nextStation: string;
  delayMin: number;
  expectedArrival: string;
  distanceCoveredKm: number;
  totalDistanceKm: number;
  lastUpdated: string;
}

export function generateLiveStatus(train: Train): LiveStatus {
  const seed = pseudoRandom(train.number);
  const route = getRouteFor(train.number);
  const idx = Math.min(route.length - 2, 1 + (seed % Math.max(1, route.length - 2)));
  const current = route[idx];
  const next = route[idx + 1] ?? current;
  const delay = (seed % 45) - 5;
  return {
    trainNumber: train.number,
    trainName: train.name,
    currentStation: current.station,
    nextStation: next.station,
    delayMin: Math.max(0, delay),
    expectedArrival: next.arrival,
    distanceCoveredKm: current.distanceKm,
    totalDistanceKm: route[route.length - 1].distanceKm,
    lastUpdated: "2 min ago",
  };
}

export interface Availability {
  classCode: TrainClass;
  status: string;
  tag: "AVL" | "WL" | "RAC";
}

export function generateAvailability(trainNumber: string, dateIso: string): Availability[] {
  const classes: TrainClass[] = ["SL", "3A", "2A"];
  return classes.map((cls) => {
    const seed = pseudoRandom(`${trainNumber}-${dateIso}-${cls}`);
    const kind = seed % 3;
    if (kind === 0) return { classCode: cls, status: `AVAILABLE ${(seed % 80) + 10}`, tag: "AVL" };
    if (kind === 1) return { classCode: cls, status: `RAC ${(seed % 20) + 1}`, tag: "RAC" };
    return { classCode: cls, status: `WL ${(seed % 60) + 1}`, tag: "WL" };
  });
}
