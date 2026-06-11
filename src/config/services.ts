
export type Service = {
  id: string;
  ar: string;
  en: string;
  icon: string;
  modifierIcon?: string;
};

export const services: Service[] = [
  { id: "moroccan_bath_or_facial", ar: "حمام مغربي أو جلسة فيشل", en: "Moroccan Bath OR Facial Session", icon: "hugeicons:bathtub-02" },
  { id: "moroccan_bath", ar: "حمام مغربي", en: "Moroccan Bath", icon: "mingcute:bath-line" },
  { id: "facial_session", ar: "جلسة فيشل", en: "Facial Session", icon: "solar:user-circle-bold" },
  { id: "body_scrub", ar: "سكراب للجسم", en: "Body Scrub", icon: "hugeicons:body-soap" },
  { id: "haircut", ar: "حلاقة شعر", en: "Haircut", icon: "lucide-lab:scissors-hair-comb" },
  { id: "beard_shave", ar: "حلاقة لحية", en: "Beard Shave", icon: "game-icons:beard" },
  { id: "hair_blow_dry", ar: "سيشوار شعر", en: "Hair Blow Dry", icon: "hugeicons:hair-dryer", modifierIcon: "solar:user-circle-bold" },
  { id: "collagen_face_mask", ar: "كولاجين للوجه", en: "Collagen Face Mask", icon: "icon-park-outline:facial-mask", modifierIcon: "solar:user-circle-bold" },
  { id: "face_scrub", ar: "سكراب وجه", en: "Face Scrub", icon: "icon-park-outline:facial-cleanser", modifierIcon: "solar:user-circle-bold" },
  { id: "nose_wax", ar: "واكس أنف", en: "Nose Wax", icon: "hugeicons:nose" },
  { id: "ear_wax", ar: "واكس أذن", en: "Ear Wax", icon: "hugeicons:ear" },
  { id: "face_wax", ar: "واكس وجه", en: "Face Wax", icon: "solar:user-circle-bold" },
  { id: "face_threading", ar: "خيط وجه", en: "Face Threading", icon: "hugeicons:thread", modifierIcon: "solar:user-circle-bold" },
  { id: "hot_towel", ar: "فوطة حارة", en: "Hot Towel", icon: "mingcute:flame-line", modifierIcon: "hugeicons:towels" },
  { id: "cold_towel", ar: "فوطة باردة", en: "Cold Towel", icon: "mingcute:snowflake-line", modifierIcon: "hugeicons:towels" },
  { id: "hair_oil_bath", ar: "حمام زيت للشعر", en: "Hair Oil Bath", icon: "solar:waterdrop-bold", modifierIcon: "solar:user-circle-bold" },
  { id: "shoulder_massage", ar: "مساج للكتف", en: "Shoulder Massage", icon: "hugeicons:shoulder", modifierIcon: "material-symbols:massage-outline" },
  { id: "head_massage", ar: "مساج للرأس", en: "Head Massage", icon: "solar:user-circle-bold", modifierIcon: "material-symbols:massage-outline" },
  { id: "hand_pedicure", ar: "بديكير يدين", en: "Hand Pedicure", icon: "mingcute:hand-line", modifierIcon: "icon-park-outline:nail-polish" },
  { id: "foot_pedicure", ar: "بديكير قدمين", en: "Foot Pedicure", icon: "mingcute:foot-line", modifierIcon: "icon-park-outline:nail-polish" },
  { id: "foot_scrub", ar: "سكراب قدمين", en: "Foot Scrub", icon: "material-symbols:footprint-outline", modifierIcon: "hugeicons:body-soap" },
  { id: "foot_massage", ar: "مساج قدمين", en: "Foot Massage", icon: "material-symbols:barefoot-outline", modifierIcon: "material-symbols:massage-outline" },
  { id: "hair_mask", ar: "ماسك للشعر", en: "Hair Mask", icon: "solar:user-circle-bold", modifierIcon: "icon-park-outline:facial-mask" },
  { id: "facial_steam", ar: "بخار للوجه", en: "Facial Steam", icon: "mingcute:steam-line", modifierIcon: "solar:user-circle-bold" },
  { id: "hair_wash", ar: "غسيل شعر", en: "Hair Wash", icon: "hugeicons:shampoo", modifierIcon: "solar:user-circle-bold" },
];

export const serviceById = Object.fromEntries(services.map((service) => [service.id, service]));

