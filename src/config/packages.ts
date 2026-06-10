export type PackageCode = "offer_95" | "offer_150" | "royal_vip_300";
export type SalonPackage = {
  code: PackageCode;
  ar: string;
  en: string;
  price: number;
  limit: number;
  fixedServiceIds?: string[];
  availableServiceIds: string[];
  exampleServiceIds: string[];
};

const sharedServiceIds = [
  "body_scrub", "haircut", "beard_shave", "hair_blow_dry", "collagen_face_mask",
  "face_scrub", "nose_wax", "ear_wax", "face_wax", "face_threading", "hot_towel",
  "cold_towel", "hair_oil_bath", "shoulder_massage", "head_massage", "hand_pedicure",
  "foot_pedicure", "foot_scrub", "foot_massage", "hair_mask", "facial_steam",
];

export const packages: SalonPackage[] = [
  {
    code: "offer_95",
    ar: "عرض 95 درهم",
    en: "AED 95 OFFER",
    price: 95,
    limit: 5,
    fixedServiceIds: ["haircut", "beard_shave", "hand_pedicure", "foot_pedicure", "hair_wash"],
    availableServiceIds: ["haircut", "beard_shave", "hand_pedicure", "foot_pedicure", "hair_wash"],
    exampleServiceIds: ["haircut", "beard_shave", "hand_pedicure", "foot_pedicure", "hair_wash"],
  },
  {
    code: "offer_150",
    ar: "عرض 150 درهم",
    en: "AED 150 OFFER",
    price: 150,
    limit: 7,
    availableServiceIds: ["moroccan_bath", "facial_session", ...sharedServiceIds],
    exampleServiceIds: ["moroccan_bath", "facial_session", "body_scrub", "haircut", "beard_shave", "hair_blow_dry"],
  },
  {
    code: "royal_vip_300",
    ar: "العرض الملكي VIP",
    en: "ROYAL VIP AED 300",
    price: 300,
    limit: 10,
    availableServiceIds: ["moroccan_bath", "facial_session", ...sharedServiceIds],
    exampleServiceIds: ["moroccan_bath", "facial_session", "body_scrub", "haircut", "beard_shave", "hair_blow_dry"],
  },
];
