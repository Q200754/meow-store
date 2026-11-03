// 2nd Hand / Vintage Streetwear Catalog Data for MEOW STUDIO
// Pastel Pink & Minimal Aesthetic - 1-of-1 Secondhand Pieces (สินค้ามือสอง ชิ้นเดียวในโลก)

const DEFAULT_SHOP_SETTINGS = {
  shopName: "MEOW STUDIO",
  shopTagline: "VINTAGE & 2ND HAND PASTEL STREETWEAR",
  instagramHandle: "me_ws.t0re",
  instagramUrl: "https://www.instagram.com/me_ws.t0re?rpxt=MWQwdGFidnEyNGM1Nw%3D%3D&utm_source=qr",
  lineId: "@meowstudio",
  announcementText: "✨ เสื้อผ้าสตรีทแวร์มือสองของแท้ คัดเกรดพรีเมียม สภาพ ~90%+/100% ทุกชิ้นมีตัวเดียว สั่งซื้อง่ายๆ ทาง Instagram DM ✨",
  currency: "฿",
  adminPin: "8888"
};

const DEFAULT_PRODUCTS = [
  {
    id: "prod-1",
    code: "MW-2ND-01",
    name: "Vintage Stüssy Pastel Blush Boxy Hoodie",
    category: "hoodie",
    price: 1890,
    originalPrice: 3500,
    isNew: true,
    isBestSeller: true,
    isSale: false,
    color: "Pastel Blush Pink",
    colorHex: "#F3C5CE",
    size: "L (Oversized)",
    measurements: {
      chest: "46\"",
      length: "28\"",
      shoulder: "22\""
    },
    condition: "~95%/100% สภาพเหมือนใหม่ (Mint)",
    defect: "ไม่มีตำหนิ สกรีนแน่น ป้ายคอแท้ครบ",
    inStock: true,
    stockCount: 1, // Second hand is strictly 1-of-1
    description: "ฮู้ดดี้สตรีทแวร์วินเทจของแท้ โทนสีชมพูพาสเทลฟอกนุ่ม ทรง Boxy ไหล่ตกกำลังสวย เนื้อผ้า Heavyweight French Terry หนานุ่ม ใส่สบาย ผ่านการซักทำความสะอาด อบฆ่าเชื้อ และคลีนเรียบร้อยพร้อมใส่",
    details: [
      "สินค้ามือสองของแท้ 100% คัดสภาพ",
      "ขนาดรอบอก 46 นิ้ว | ความยาว 28 นิ้ว | ไหล่ 22 นิ้ว",
      "สภาพ ~95%/100% ไร้รู ไร้คราบ ปลายแขนไม่ย้วย",
      "ผ่านการซักอบฆ่าเชื้อมาตรฐานคลีนรูม พร้อมสวมใส่ทันที",
      "มีเพียงตัวเดียวเท่านั้น หมดแล้วหมดเลย"
    ],
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "prod-2",
    code: "MW-2ND-02",
    name: "90s Minimal Typography Heavy Cotton Tee",
    category: "tshirt",
    price: 790,
    originalPrice: 1590,
    isNew: true,
    isBestSeller: true,
    isSale: false,
    color: "Powder Pink",
    colorHex: "#FADADD",
    size: "XL (ทรงสตรีท)",
    measurements: {
      chest: "48\"",
      length: "29.5\"",
      shoulder: "23\""
    },
    condition: "~90%/100% วินเทจสวย คอฟิต",
    defect: "ไม่มีตำหนิขาดเย็บ คอชิดแน่น ไม่ม้วน",
    inStock: true,
    stockCount: 1,
    description: "เสื้อยืดวินเทจยุค 90s สไตล์สตรีทมินิมอล เนื้อผ้า Combed Cotton 100% หนาแน่น 260 GSM คอชิด 1.2 นิ้ว ทรงไหล่ตกสวย สกรีนคมชัด สีชมพูอ่อนละมุน ผ้านุ่มใส่สบายมาก",
    details: [
      "สินค้ามือสองของแท้ สไตล์ 90s Vintage",
      "ขนาดรอบอก 48 นิ้ว | ความยาว 29.5 นิ้ว | ไหล่ 23 นิ้ว",
      "สภาพ ~90%/100% คอชิด เนื้อผ้าหนานุ่มอยู่ทรง",
      "ผ่านการซักรีดฆ่าเชื้อเรียบร้อยแล้ว",
      "ชิ้นเดียวเท่านั้น (1-of-1)"
    ],
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "prod-3",
    code: "MW-2ND-03",
    name: "Korean Parachute Wide Cargo Pants",
    category: "pants",
    price: 1250,
    originalPrice: 2200,
    isNew: false,
    isBestSeller: true,
    isSale: true,
    color: "Ivory Cream / Off-White",
    colorHex: "#EFECE6",
    size: "FREE (เอว 28-34\")",
    measurements: {
      chest: "เอว 28-34\"",
      length: "40\"",
      shoulder: "สะโพก 46\""
    },
    condition: "~95%/100% สภาพเยี่ยม",
    defect: "ไม่มีรอยเปื้อน ยางยืดและเชือกรูดสมบูรณ์ 100%",
    inStock: true,
    stockCount: 1,
    description: "กางเกงพาราชูตมือสองนำเข้าจากเกาหลี สีครีมละมุน เนื้อผ้าแมทช์แห้งไว ขากว้างพร้อมเชือกรูดปรับทรงที่ปลายขา เอวยางยืดใส่สบาย ลุคสตรีทแวร์มินิมอลยอดนิยม",
    details: [
      "สินค้ามือสองคัดเกรด A+ จากเกาหลี",
      "เอวยางยืด 28-34 นิ้ว | ยาว 40 นิ้ว | สะโพก 46 นิ้ว",
      "ปรับจั๊มขาได้ 2 แบบ (ขากว้าง / ขาจั๊ม)",
      "สภาพ ~95%/100% สะอาด ไร้คราบเปื้อน",
      "มีตัวเดียวเท่านั้น"
    ],
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "prod-4",
    code: "MW-2ND-04",
    name: "Vintage Washed Cotton 'M' Street Cap",
    category: "cap",
    price: 490,
    originalPrice: 950,
    isNew: true,
    isBestSeller: false,
    isSale: false,
    color: "Dusty Pastel Rose",
    colorHex: "#D8A47F",
    size: "FREE SIZE (ปรับสายได้)",
    measurements: {
      chest: "รอบหัว 54-60 ซม.",
      length: "ปีกหมวก 7 ซม.",
      shoulder: "ลึก 12 ซม."
    },
    condition: "~90%/100% ทรงสวย ไม่หัก",
    defect: "รอยเฟดธรรมชาติเล็กน้อยสไตล์วินเทจ",
    inStock: true,
    stockCount: 1,
    description: "หมวกแก๊ปวินเทจมือสอง ปักตัวอักษร M ด้านหน้า ผ้ายีนส์ทวิลฟอกสีชมพูดัสตี้กุหลาบ สายปรับทองเหลืองรมดำด้านหลัง ทรงสวยมาก ไม่แบน",
    details: [
      "หมวกมือสองวินเทจแท้ ฟอกสีสวยเป็นธรรมชาติ",
      "สายปรับขนาดศีรษะ 54-60 ซม.",
      "สภาพ ~90%/100% ทรงหมวกสวย ไม่เสียทรง",
      "มีชิ้นเดียวเท่านั้น"
    ],
    images: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "prod-5",
    code: "MW-2ND-05",
    name: "Acid Wash Wave Art Graphic Tee",
    category: "tshirt",
    price: 850,
    originalPrice: 1600,
    isNew: true,
    isBestSeller: false,
    isSale: true,
    color: "Sakura Mist Wash",
    colorHex: "#FDE2E4",
    size: "L (อก 44\")",
    measurements: {
      chest: "44\"",
      length: "28\"",
      shoulder: "21\""
    },
    condition: "~95%/100% สภาพนางฟ้า",
    defect: "ไม่มีตำหนิ สกรีนคมไม่แตก",
    inStock: true,
    stockCount: 1,
    description: "เสื้อยืดสตรีทลายคลื่นสไตล์ฟิวเจอร์ริสมินิมอล สีชมพูซากุระฟอก Acid Wash ผ้าเนื้อหนาไร้ตะเข็บข้าง (Tubular) นุ่มสบาย ทรงสวยมาก",
    details: [
      "เสื้อยืดวินเทจมือสอง สภาพเหมือนใหม่",
      "อก 44 นิ้ว | ยาว 28 นิ้ว | ไหล่ 21 นิ้ว",
      "ไร้ตะเข็บข้าง สกรีนเนียนไม่ลอก",
      "มีเพียง 1 ตัว"
    ],
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "prod-6",
    code: "MW-2ND-06",
    name: "Minimalist Cloud Quilted Crossbody Bag",
    category: "accessories",
    price: 890,
    originalPrice: 1790,
    isNew: false,
    isBestSeller: true,
    isSale: false,
    color: "Pastel Marshmallow Pink",
    colorHex: "#FCE4EC",
    size: "ONE SIZE (26 x 18 ซม.)",
    measurements: {
      chest: "กว้าง 26 ซม.",
      length: "สูง 18 ซม.",
      shoulder: "หนา 9 ซม."
    },
    condition: "~95%/100% สะอาดกริ๊บ",
    defect: "ซิปรูดลื่นปกติ ไม่มีรอยขาด",
    inStock: true,
    stockCount: 1,
    description: "กระเป๋าสะพายข้างบุนวมทรงก้อนเมฆมือสอง สภาพดีมาก ผ้าไนลอนแมทช์กันละอองน้ำ สายสะพายนุ่มไม่เจ็บไหล่ จุของได้เยอะ",
    details: [
      "กระเป๋ามือสองสภาพคัดพิเศษ ~95%/100%",
      "ขนาด 26 x 18 x 9 ซม. สายปรับระดับได้",
      "ซิป YKK แท้ ภายในสะอาด ไม่มีกลิ่นอับ",
      "มีชิ้นเดียวเท่านั้น"
    ],
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "prod-7",
    code: "MW-2ND-07",
    name: "Retro Half-Zip Fleece Pullover",
    category: "hoodie",
    price: 1590,
    originalPrice: 2800,
    isNew: true,
    isBestSeller: false,
    isSale: true,
    color: "Soft Cream & Blush",
    colorHex: "#F3EDE2",
    size: "L (อก 48\")",
    measurements: {
      chest: "48\"",
      length: "27.5\"",
      shoulder: "22\""
    },
    condition: "~90%/100% ขนฟูนุ่ม อุ่นมาก",
    defect: "ไม่มีตำหนิ ซิปและป้ายสมบูรณ์",
    inStock: true,
    stockCount: 1,
    description: "เสื้อฟรีซซิปครึ่งตัวสไตล์เรโทรสตรีทแวร์ นำเข้าจากญี่ปุ่น ผ้า Micro Polar Fleece อุ่นเบา แต่งแถบสีกุ๊นพาสเทลสวยงาม คลีนทำความสะอาดแล้วเรียบร้อย",
    details: [
      "เสื้อกันหนาวมือสองญี่ปุ่นแท้ คัดสภาพ",
      "อก 48 นิ้ว | ยาว 27.5 นิ้ว | ไหล่ 22 นิ้ว",
      "ขนฟรีซนุ่ม ไม่ลีบแบน ซิปรูดปกติ",
      "มีตัวเดียวเท่านั้น"
    ],
    images: [
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "prod-8",
    code: "MW-2ND-08",
    name: "Pleated Wide Trouser Pants",
    category: "pants",
    price: 1190,
    originalPrice: 2100,
    isNew: false,
    isBestSeller: true,
    isSale: false,
    color: "Cloud Heather Grey",
    colorHex: "#E0E0E2",
    size: "M (เอว 30-32\")",
    measurements: {
      chest: "เอว 30-32\"",
      length: "39.5\"",
      shoulder: "สะโพก 44\""
    },
    condition: "~95%/100% ทรงสวยเป๊ะ",
    defect: "ไม่มีตำหนิ ตะขอและซิปเดิมครบ",
    inStock: false, // Example of SOLD OUT item
    stockCount: 0,
    description: "กางเกงสแล็คขากว้างจับจีบคู่ทรงวินเทจญี่ปุ่น ผ้าทิ้งตัวมีน้ำหนัก ใส่แล้วดูขายาว แมตช์กับเสื้อยืดโอเวอร์ไซซ์ได้ลุคสตรีทมินิมอลสุดเท่",
    details: [
      "กางเกงวินเทจมือสองแท้ คัดสภาพกริ๊บ",
      "เอว 30-32 นิ้ว | ยาว 39.5 นิ้ว | สะโพก 44 นิ้ว",
      "สภาพ ~95%/100% ไม่มีรอยด่าง ขอบเอวยังแน่น",
      "สินค้าขายแล้ว (SOLD OUT)"
    ],
    images: [
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1000&q=80"
    ]
  }
];

const CATEGORIES = [
  { id: "all", name: "All Items", thaiName: "สินค้าทั้งหมด", icon: "✨" },
  { id: "tshirt", name: "T-Shirt", thaiName: "เสื้อยืดวินเทจ", icon: "👕" },
  { id: "hoodie", name: "Hoodie & Fleece", thaiName: "ฮู้ดดี้ & ฟรีซ", icon: "🧥" },
  { id: "pants", name: "Pants", thaiName: "กางเกง", icon: "👖" },
  { id: "cap", name: "Cap", thaiName: "หมวก", icon: "🧢" },
  { id: "accessories", name: "Bags & Accessories", thaiName: "กระเป๋า & พร็อพ", icon: "👜" }
];
