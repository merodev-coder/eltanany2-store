import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import Product from './models/admin/Product.model.js';

// Load environment variables from .env file in the project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Debug: Check if environment variables are loaded
console.log('🔍 Environment check:');
console.log('   ADMIN_DB_URI:', process.env.ADMIN_DB_URI ? '✅ Set' : '❌ Not set');
console.log('   USER_DB_URI:', process.env.USER_DB_URI ? '✅ Set' : '❌ Not set');

// Create direct mongoose connection for seeding
const MONGO_URI = process.env.ADMIN_DB_URI as string;
if (!MONGO_URI) {
  console.error('❌ ADMIN_DB_URI is not set in environment');
  process.exit(1);
}

// laptopsToSeed - Production-ready dataset with Wikimedia Commons image URLs
const laptopsToSeed = [
  {
    name: "HP PAVILION DV6",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "Intel Core i3", gpu: "Intel", ram: "8 GB", storage: "256 GB" },
    price: 3850,
    sellingPrice: 3850,
    stock: 5,
    description: "لاب توب اتش بي بافليون بحالة ممتازة، شاشة 15.6 بوصة، معالج كور i3 جيل أول، مناسب للأعمال المكتبية والدراسة.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_Pavilion_dv6000_laptop.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_Pavilion_dv6_%285345578709%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_Pavilion_dv3000.jpg"
    ]
  },
  {
    name: "DELL INSPIRON 5010",
    category: "laptop",
    brand: "Dell",
    specs: { cpu: "Intel Core i3", gpu: "Intel", ram: "8 GB", storage: "512 GB" },
    price: 4000,
    sellingPrice: 4000,
    stock: 5,
    description: "لاب توب ديل 5010، معالج كور i3 جيل ثاني، شاشة 15.6 بوصة، أداء مستقر واعتمادية عالية للدراسة والتصفح.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Inspiron_6000_and_Latitude_D610.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_D600_DSC00010.JPG",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_CPx_.jpg"
    ]
  },
  {
    name: "LENOVO THINKPAD X230 TOUCH X360",
    category: "laptop",
    brand: "Lenovo",
    specs: { cpu: "Intel Core i7", gpu: "Intel", ram: "8 GB", storage: "256 GB" },
    price: 4750,
    sellingPrice: 4750,
    stock: 5,
    description: "لاب توب لينوفو شاشة تعمل باللمس وتتحول 360 درجة، معالج كور i7 جيل ثالث، حجم شاشة 14.1 بوصة خفيف الوزن وعملي جداً.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Lenovo_ThinkPad_X1_Ultrabook.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Lenovo_ThinkPad_X1_Carbon_Ultrabook.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Lenovo_X100e_mini10_shifttilt.jpg"
    ]
  },
  {
    name: "HP ELITEBOOK 6475",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "Intel Core i5", gpu: "Intel", ram: "8 GB", storage: "256 GB" },
    price: 4950,
    sellingPrice: 4950,
    stock: 5,
    description: "لاب توب اتش بي إيليت بوك هيكل معدني قوي، معالج كور i5 جيل ثاني، شاشة 14.1 بوصة، مثالي للاستخدام الشاق اليومي.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_840_G4.png",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_6930p_%286762036117%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_8440p_Notebook_%285122679728%29.jpg"
    ]
  },
  {
    name: "HP PROBOOK 6565 AMD",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "AMD Ryzen", gpu: "AMD", ram: "8 GB", storage: "256 GB" },
    price: 5000,
    sellingPrice: 5000,
    stock: 5,
    description: "لاب توب اتش بي معالج AMD A6 جيل رابع، شاشة 15.6 بوصة، كارت شاشة AMD يمنح أداءً ممتازاً في الجرافيك الخفيف والألعاب.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_ProBook_6560b.png",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_8460p_bottom.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_8760w_%281%29.jpg"
    ]
  },
  {
    name: "TOSHIBA SATELLITE C50",
    category: "laptop",
    brand: "Lenovo",
    specs: { cpu: "Intel Core i3", gpu: "Intel", ram: "8 GB", storage: "256 GB" },
    price: 5000,
    sellingPrice: 5000,
    stock: 5,
    description: "لاب توب توشيبا ستالايت C50، معالج كور i3 جيل رابع، شاشة 15.6 بوصة، يتميز بالاعتمادية اليابانية وجودة الشاشة العالية.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Toshiba_Satellite_M305D-S4829_laptop.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Toshiba_Satellite_S40t_laptop.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Toshiba_Satellite_L55B.jpg"
    ]
  },
  {
    name: "TOSHIBA SATELLITE C850",
    category: "laptop",
    brand: "Lenovo",
    specs: { cpu: "Intel Core i5", gpu: "Intel", ram: "8 GB", storage: "256 GB" },
    price: 5000,
    sellingPrice: 5000,
    stock: 5,
    description: "لاب توب توشيبا C850، معالج كور i5 جيل رابع، أداء قوي وسريع للمهام المتعددة وشاشة مريحة بحجم 15.6 بوصة.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Toshiba_Satellite_S40t_laptop_-_10087025595.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Toshiba_Satellite_A105_%282%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Toshiba_Satellite_M305D-S4829_laptop.jpg"
    ]
  },
  {
    name: "DELL PRECISION M4700 WORKSTATION",
    category: "laptop",
    brand: "Dell",
    specs: { cpu: "Intel Core i7", gpu: "NVIDIA", ram: "8 GB", storage: "512 GB" },
    price: 6750,
    sellingPrice: 6750,
    stock: 5,
    description: "ورك ستيشن ديل بريسيزن M4700 القوي جداً، معالج كور i7 جيل ثالث، هارد سريع ونظام تبريد ثنائي مخصص للجرافيك والمونتاج الشاق.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Precision_7510_and_NEC_SmartScan.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_precision_m4600_frontcorner2_%2825478620053%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_D400_%26_D410.jpg"
    ]
  },
  {
    name: "HP ELITEBOOK 840 G2 TOUCH",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "Intel Core i5", gpu: "AMD", ram: "8 GB", storage: "512 GB" },
    price: 6750,
    sellingPrice: 6750,
    stock: 5,
    description: "لاب توب اتش بي الترا سليم بشاشة تاتش (Touch)، معالج كور i5 جيل خامس، كارت شاشة خارجي AMD وهارد سريع، مزيج من الأناقة والأداء.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_x360_1020_G2.png",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_840_G8.png",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_Folio_8490m_%281%29.jpg"
    ]
  },
  {
    name: "DELL LATITUDE 3330",
    category: "laptop",
    brand: "Dell",
    specs: { cpu: "Intel Core i3", gpu: "Intel", ram: "8 GB", storage: "256 GB" },
    price: 6900,
    sellingPrice: 6900,
    stock: 5,
    description: "لاب توب ديل لاتيتيود رامات DDR4، معالج كور i3 جيل سابع، شاشة 14.1 بوصة، خفيف ونحيف وعمر بطارية ممتاز.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_D600_DSC00010.JPG",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_CPx_.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_D400_%26_D410.jpg"
    ]
  },
  {
    name: "LENOVO THINKPAD X360 TOUCH",
    category: "laptop",
    brand: "Lenovo",
    specs: { cpu: "Intel Core i3", gpu: "Intel", ram: "8 GB", storage: "256 GB" },
    price: 6950,
    sellingPrice: 6950,
    stock: 5,
    description: "لاب توب لينوفو بشاشة تاتش متحولة 360 درجة، معالج كور i3 جيل خامس، هارد SSD فائق السرعة وتصميم مرن وعصري.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Lenovo_ThinkPad_X1_Carbon_Ultrabook.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Lenovo_X100e_mini10_shifttilt.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Thinkpad_X100e_vs._X30_vs._X200.jpg"
    ]
  },
  {
    name: "HP ELITEBOOK 725 G2 ULTRA SLIM",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "AMD Ryzen", gpu: "AMD", ram: "8 GB", storage: "128 GB" },
    price: 7000,
    sellingPrice: 7000,
    stock: 5,
    description: "لاب توب اتش بي الترا سليم نحيف جداً وخفيف، معالج AMD A10 جيل سابع، شاشة 14.1 بوصة وهارد SSD، مثالي للتنقل المستمر.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_6930p_%286762036117%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_x360_1020_G2.png",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_840_G4.png"
    ]
  },
  {
    name: "DELL LATITUDE 6540 HIGH PERFORMANCE",
    category: "laptop",
    brand: "Dell",
    specs: { cpu: "Intel Core i7", gpu: "Intel", ram: "8 GB", storage: "512 GB" },
    price: 7500,
    sellingPrice: 7500,
    stock: 5,
    description: "لاب توب ديل قوي، معالج كور i7 جيل رابع، شاشة 15.6 بوصة وكارت شاشة قوي للألعاب الخفيفة والتصميم وتصفح المواقع.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_D400_%26_D410.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Inspiron_6000_and_Latitude_D610.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_3340_%281%29.jpg"
    ]
  },
  {
    name: "HP 15B SILVER AMD",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "AMD Ryzen", gpu: "AMD", ram: "8 GB", storage: "512 GB" },
    price: 8000,
    sellingPrice: 8000,
    stock: 5,
    description: "لاب توب اتش بي لون فضي مميز، معالج AMD A6 جيل تاسع حديث، رامات DDR4، شاشة كبيرة 15.6 بوصة مساحة تخزين ضخمة وسريعة.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_Pavilion_dv6_%285345578709%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_Pavilion_dv3000.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_Pavilion_dv6000_laptop.jpg"
    ]
  },
  {
    name: "DELL LATITUDE 5480",
    category: "laptop",
    brand: "Dell",
    specs: { cpu: "Intel Core i5", gpu: "Intel", ram: "8 GB", storage: "256 GB" },
    price: 8450,
    sellingPrice: 8450,
    stock: 5,
    description: "لاب توب ديل فئة رجال الأعمال، معالج كور i5 جيل سابع، رامات DDR4 حديثة وهارد M.2 SSD فائق السرعة، شاشة 14.1 بوصة.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_CPx_.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_D400_%26_D410.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_U3415W_monitor_and_Latitude_laptop_%281%29.jpg"
    ]
  },
  {
    name: "HP PROBOOK 430 G4/G5",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "Intel Core i5", gpu: "Intel", ram: "8 GB", storage: "512 GB" },
    price: 8500,
    sellingPrice: 8500,
    stock: 5,
    description: "لاب توب اتش بي بروبوك الموثوق، معالج كور i5 جيل سابع، رامات DDR4، مساحة تخزينية مزدوجة وسريعة وحجم شاشة 14.1 بوصة.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_8440p_Notebook_%285122679728%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_8760w_%281%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_8460p_bottom.jpg"
    ]
  },
  {
    name: "HP PROBOOK 430 G5",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "Intel Core i5", gpu: "Intel", ram: "8 GB", storage: "512 GB" },
    price: 8500,
    sellingPrice: 8500,
    stock: 5,
    description: "لاب توب اتش بي بروبوك G5 المطور، معالج كور i5 جيل ثامن رباعي النواة، أداء سريع جداً وهارد M.2 SSD فائق السرعة للدراسة والعمل.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_8460p_bottom.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_ProBook_6560b.png",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_Folio_8490m_%281%29.jpg"
    ]
  },
  {
    name: "DELL LATITUDE 7470 ULTRA SLIM",
    category: "laptop",
    brand: "Dell",
    specs: { cpu: "Intel Core i7", gpu: "Intel", ram: "8 GB", storage: "256 GB" },
    price: 9000,
    sellingPrice: 9000,
    stock: 5,
    description: "لاب توب ديل الفئة السابعة الفاخرة الترا سليم، معالج كور i7 جيل سادس، رامات DDR4 وهارد M.2 SSD، شاشة 14.1 بوصة عالية الدقة.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_with_Ubuntu.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_U3415W_monitor_and_Latitude_laptop_%281%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_D600_DSC00010.JPG"
    ]
  },
  {
    name: "HP ELITEBOOK 840 G3 SILVER",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "Intel Core i7", gpu: "Intel", ram: "8 GB", storage: "256 GB" },
    price: 9000,
    sellingPrice: 9000,
    stock: 5,
    description: "لاب توب اتش بي إيليت بوك الفضي بالكامل الترا سليم، معالج كور i7 جيل سادس، أداء راقٍ جداً، رامات DDR4 وشاشة مريحة 14.1 بوصة.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_840_G4.png",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_840_G8.png",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_x360_1020_G2.png"
    ]
  },
  {
    name: "HP PROBOOK 650 G2 BUSINESS",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "Intel Core i5", gpu: "AMD", ram: "8 GB", storage: "512 GB" },
    price: 9000,
    sellingPrice: 9000,
    stock: 5,
    description: "لاب توب اتش بي بروبوك شاشة كبيرة 15.6 بوصة، معالج كور i5 جيل سادس، كارت شاشة خارجي AMD R7 بحجم 2 جيجا لبرامج التصميم.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_6930p_%286762036117%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_8440p_Notebook_%285122679728%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_ProBook_6560b.png"
    ]
  },
  {
    name: "HP PROBOOK 430 G6 ULTRA SLIM",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "Intel Core i5", gpu: "Intel", ram: "8 GB", storage: "512 GB" },
    price: 9500,
    sellingPrice: 9500,
    stock: 5,
    description: "لاب توب اتش بي فضي عصري للغاية ونحيف جداً، معالج كور i5 جيل ثامن، أداء قوي وسريع بفضل هارد M.2 ورامات DDR4 المتطورة.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_x360_1020_G2.png",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_Folio_8490m_%281%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_840_G8.png"
    ]
  },
  {
    name: "HP PROBOOK 450 G5 BIG SCREEN",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "Intel Core i5", gpu: "Intel", ram: "8 GB", storage: "256 GB" },
    price: 9900,
    sellingPrice: 9900,
    stock: 5,
    description: "لاب توب اتش بي بروبوك شاشة 15.6 بوصة كاملة، معالج كور i5 جيل ثامن ممتاز للمهام اليومية والبرمجة والتصفح السريع وهارد SSD.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_840_G8.png",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_840_G4.png",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_6930p_%286762036117%29.jpg"
    ]
  },
  {
    name: "DELL LATITUDE 3500 LATEST",
    category: "laptop",
    brand: "Dell",
    specs: { cpu: "Intel Core i5", gpu: "Intel", ram: "8 GB", storage: "256 GB" },
    price: 9950,
    sellingPrice: 9950,
    stock: 5,
    description: "لاب توب ديل لاتيتيود شاشة كبيرة 15.6 بوصة، معالج كور i5 جيل ثامن، رامات DDR4 وهارد سريع M.2، تصميم حديث ومقاوم للصدمات.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_3340_%281%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_with_Ubuntu.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Inspiron_6000_and_Latitude_D610.jpg"
    ]
  },
  {
    name: "DELL VOSTRO 3590",
    category: "laptop",
    brand: "Dell",
    specs: { cpu: "Intel Core i5", gpu: "Intel", ram: "8 GB", storage: "256 GB" },
    price: 10000,
    sellingPrice: 10000,
    stock: 5,
    description: "لاب توب ديل فوسترو ذو التصميم العصري، معالج كور i5 جيل ثامن، أداء سريع وسلس مع رامات DDR4 وهارد SSD وشاشة 15.6 بوصة مريحة للعين.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Inspiron_6000_and_Latitude_D610.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_U3415W_monitor_and_Latitude_laptop_%281%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_CPx_.jpg"
    ]
  },
  {
    name: "HP PROBOOK 450 G6 MODERN",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "Intel Core i5", gpu: "Intel", ram: "8 GB", storage: "256 GB" },
    price: 10500,
    sellingPrice: 10500,
    stock: 5,
    description: "لاب توب اتش بي بروبوك الجيل السادس، معالج كور i5 جيل ثامن، تصميم معدني جذاب وأنيق، شاشة 15.6 بوصة وهارد M.2 سريع.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_Folio_8490m_%281%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_x360_1020_G2.png",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_ProBook_6560b.png"
    ]
  },
  {
    name: "HP ELITEBOOK 850 G4 PREMIUM",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "Intel Core i5", gpu: "Intel", ram: "8 GB", storage: "256 GB" },
    price: 10500,
    sellingPrice: 10500,
    stock: 5,
    description: "لاب توب اتش بي الفئة الثامنة العليا الفاخرة، معالج كور i5 جيل سابع، شاشة كبيرة 15.6 بوصة، رامات DDR4 وهيكل قوي ونحيف.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_8760w_%281%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_6930p_%286762036117%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_840_G4.png"
    ]
  },
  {
    name: "HP PROBOOK 650 G4/G5 SILVER",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "Intel Core i5", gpu: "Intel", ram: "8 GB", storage: "256 GB" },
    price: 10500,
    sellingPrice: 10500,
    stock: 5,
    description: "لاب توب اتش بي فضي فاخر شاشة 15.6 بوصة، معالج كور i5 جيل ثامن متطور، رامات DDR4 وسرعة استجابة مذهلة مع هارد SSD الحديث.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_Pavilion_dv3000.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_Pavilion_dv6000_laptop.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_Pavilion_dv6_%285345578709%29.jpg"
    ]
  },
  {
    name: "HP ZBOOK 15 G3 WORKSTATION",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "Intel Core i7", gpu: "AMD", ram: "16 GB", storage: "256 GB" },
    price: 13500,
    sellingPrice: 13500,
    stock: 5,
    description: "ورك ستيشن المونتاج الشهير ZBook G3، معالج كور i7 فئة HQ للأداء العالي جداً جيل سادس، رامات 16 جيجا، كارت شاشة AMD مخصص للتصميم والهندسة.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_ZBook_15_G3_with_AKiTiO_Node_%2835030980124%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_840_G8.png",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_x360_1020_G2.png"
    ]
  },
  {
    name: "DELL LATITUDE 3510 MODERN",
    category: "laptop",
    brand: "Dell",
    specs: { cpu: "Intel Core i5", gpu: "Intel", ram: "8 GB", storage: "256 GB" },
    price: 15000,
    sellingPrice: 15000,
    stock: 5,
    description: "لاب توب ديل لاتيتيود موديل حديث جداً، معالج كور i5 جيل عاشر قوي وموفر للطاقة، رامات DDR4 وشاشة كاملة 15.6 بوصة، كسر زيرو بحالة المصنع.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_D400_%26_D410.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_D600_DSC00010.JPG",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_U3415W_monitor_and_Latitude_laptop_%281%29.jpg"
    ]
  },
  {
    name: "RAZER BLADE STEALTH BLK",
    category: "laptop",
    brand: "Lenovo",
    specs: { cpu: "Intel Core i5", gpu: "Intel", ram: "8 GB", storage: "256 GB" },
    price: 16000,
    sellingPrice: 16000,
    stock: 5,
    description: "لاب توب ريزر بليد الشهير المصنوع في أمريكا، موديل حديث كسر زيرو تماماً، معالج كور i5 جيل حادي عشر، شاشة 14.1 بوصة وتصميم معدني فخم.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Lenovo_X100e_mini10_shifttilt.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Thinkpad_X100e_vs._X30_vs._X200.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Lenovo_ThinkPad_X1_Ultrabook.jpg"
    ]
  },
  {
    name: "ASUS VIVOBOOK MODERN",
    category: "laptop",
    brand: "Lenovo",
    specs: { cpu: "Intel Core i5", gpu: "Intel", ram: "8 GB", storage: "256 GB" },
    price: 16000,
    sellingPrice: 16000,
    stock: 5,
    description: "لاب توب أسوس فيفوبوك كسر زيرو تماماً وموديل حديث جداً، معالج كور i5 جيل ثاني عشر خارق الأداء، رامات DDR4 وهارد سريع شاشة 15.6 بوصة.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Asus_vivobook.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Asus_vivobook_pro_15_N580vd.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/2007Computex_BestChoice_ASUSTeK_U1F.jpg"
    ]
  },
  {
    name: "HP ELITEBOOK DRAGON TOUCH X360",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "Intel Core i7", gpu: "Intel", ram: "16 GB", storage: "256 GB" },
    price: 17500,
    sellingPrice: 17500,
    stock: 5,
    description: "النسخة التنين النادرة من اتش بي، الترا سليم شاشة تعمل باللمس وتتحول 360 درجة 13.3 بوصة، معالج كور i7 جيل حادي عشر ورامات 16 جيجا.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_840_G8.png",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_x360_1020_G2.png",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_Folio_8490m_%281%29.jpg"
    ]
  },
  {
    name: "DELL PRECISION 7520 WORKSTATION",
    category: "laptop",
    brand: "Dell",
    specs: { cpu: "Intel Core i7", gpu: "NVIDIA", ram: "16 GB", storage: "512 GB" },
    price: 17500,
    sellingPrice: 17500,
    stock: 5,
    description: "العملاق ديل بريسيزن 7520 للرندرة والجرافيك ثنائي المروحة، معالج كور i7 HQ جيل سادس، رامات 16 جيجا وكارت شاشة نيفيديا Quadro M2200M 4G.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_precision_m4600_frontcorner2_%2825478620053%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Precision_7510_and_NEC_SmartScan.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_CPx_.jpg"
    ]
  },
  {
    name: "DELL PRECISION 7720 WORKSTATION BIG",
    category: "laptop",
    brand: "Dell",
    specs: { cpu: "Intel Core i7", gpu: "NVIDIA", ram: "16 GB", storage: "512 GB" },
    price: 17500,
    sellingPrice: 17500,
    stock: 5,
    description: "أضخم ورك ستيشن من ديل شاشة عملاقة 17.3 بوصة مريحة للتصميم والمونتاج، معالج كور i7 HQ جيل سادس، كارت نيفيديا قوي Quadro P3000 6G.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Precision_7510_and_NEC_SmartScan.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_D400_%26_D410.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_precision_m4600_frontcorner2_%2825478620053%29.jpg"
    ]
  },
  {
    name: "APPLE MACBOOK PRO 2019 16-INCH",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "Intel Core i7", gpu: "AMD", ram: "16 GB", storage: "512 GB" },
    price: 26000,
    sellingPrice: 26000,
    stock: 5,
    description: "ماك بوك برو 2019 شاشة ريتنا عملاقة 16.1 بوصة بدقة 4K، معالج كور i7 رامات 16 جيجا، كارت شاشة خارجي AMD 5500M 4G، لعشاق الفخامة والأداء.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/MacBook_Pro_16_%28M1_Pro%2C_2021%29_-_Wikipedia.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Macbook_Pro_2020_color_photography.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Apple_MacBook_Pro%2C_model_A1278-8112.jpg"
    ]
  },
  {
    name: "HP OMEN GAMING BEAST",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "Intel Core i7", gpu: "NVIDIA", ram: "16 GB", storage: "512 GB" },
    price: 26500,
    sellingPrice: 26500,
    stock: 5,
    description: "لاب توب الجيمنج الخارق HP OMEN بحالة كسر الزيرو تماماً (Open Box)، معالج كور i7 جيل تاسع فئة H، رامات 16 جيجا وكارت شاشة GTX 1650 4G.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_ZBook_15_G3_with_AKiTiO_Node_%2835030980124%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_840_G4.png",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_Folio_8490m_%281%29.jpg"
    ]
  },
  {
    name: "DELL PRECISION XPS ULTRA PREMIUM",
    category: "laptop",
    brand: "Dell",
    specs: { cpu: "Intel Core i7", gpu: "NVIDIA", ram: "16 GB", storage: "512 GB" },
    price: 26000,
    sellingPrice: 26000,
    stock: 5,
    description: "تحفة ديل XPS الفاخرة، أنحف شاشة وأقوى تصميم ألومنيوم وكاربون فايبر، معالج كور i7 جيل تاسع H، كارت شاشة نيفيديا GTX 1650 شاشة فائقة الدقة.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_precision_m4600_frontcorner2_%2825478620053%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Inspiron_6000_and_Latitude_D610.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Precision_7510_and_NEC_SmartScan.jpg"
    ]
  },
  {
    name: "HP ZBOOK POWER G7 WORKSTATION",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "Intel Core i7", gpu: "NVIDIA", ram: "16 GB", storage: "512 GB" },
    price: 26900,
    sellingPrice: 26900,
    stock: 5,
    description: "ورك ستيشن زد بوك باور الجيل السابع الحديث، معالج كور i7 جيل عاشر فئة H الخارقة، كارت شاشة نيفيديا Quadro T1000 DDR6 رامات 16 وهارد سريع.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_840_G8.png",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_ZBook_15_G3_with_AKiTiO_Node_%2835030980124%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_6930p_%286762036117%29.jpg"
    ]
  },
  {
    name: "DELL PRECISION 7560 MODERN WORKSTATION",
    category: "laptop",
    brand: "Dell",
    specs: { cpu: "Intel Core i7", gpu: "NVIDIA", ram: "16 GB", storage: "512 GB" },
    price: 26900,
    sellingPrice: 26900,
    stock: 5,
    description: "العملاق الحديث ديل بريسيزن 7560، معالج كور i7 جيل حادي عشر فئة H للأداء الفائق، كارت شاشة متطور نيفيديا Quadro T1200 DDR6 وهارد سريع جداً.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Precision_7510_and_NEC_SmartScan.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_3340_%281%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_precision_m4600_frontcorner2_%2825478620053%29.jpg"
    ]
  },
  {
    name: "HP ZBOOK FURY G7 WORKSTATION",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "Intel Core i7", gpu: "NVIDIA", ram: "16 GB", storage: "512 GB" },
    price: 26900,
    sellingPrice: 26900,
    stock: 5,
    description: "ورك ستيشن اتش بي زد بوك فيوري الفئة العليا الفاخرة، معالج كور i7 جيل عاشر H، نظام تبريد خارق وكارت شاشة نيفيديا T1000 DDR6 مخصص للرندرة.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_x360_1020_G2.png",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_Folio_8490m_%281%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_ZBook_15_G3_with_AKiTiO_Node_%2835030980124%29.jpg"
    ]
  },
  {
    name: "APPLE MACBOOK PRO 2019 2TB BEAST",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "Intel Core i7", gpu: "AMD", ram: "16 GB", storage: "512 GB" },
    price: 28500,
    sellingPrice: 28500,
    stock: 5,
    description: "ماك بوك برو 2019 بمساحة تخزين هائلة جداً وسريعة، شاشة 16.1 بوصة ريتنا 4K، معالج كور i7 وكارت جرافيك AMD خارق مناسب للمصممين والمطورين.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/MacBook_Pro_%2816-inch%2C_M4_Pro%2C_Silver%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/MacBook_Pro_%2814-inch%2C_M5%2C_Space_Black%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Macbook_Pro_2020_color_photography.jpg"
    ]
  },
  {
    name: "DELL G3 GAMING OPEN BOX",
    category: "laptop",
    brand: "Dell",
    specs: { cpu: "Intel Core i7", gpu: "NVIDIA", ram: "16 GB", storage: "512 GB" },
    price: 28500,
    sellingPrice: 28500,
    stock: 5,
    description: "لاب توب جيمنج ديل G3 بحالة زيرو أوبن بوكس تماماً، معالج كور i7 جيل عاشر فئة H، رامات 16 جيجا وكارت شاشة ألعاب قوي نيفيديا GTX 1650 4G.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_precision_m4600_frontcorner2_%2825478620053%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_with_Ubuntu.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Precision_7510_and_NEC_SmartScan.jpg"
    ]
  },
  {
    name: "HP ZBOOK FURY G8 LATEST",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "Intel Core i7", gpu: "NVIDIA", ram: "16 GB", storage: "512 GB" },
    price: 28500,
    sellingPrice: 28500,
    stock: 5,
    description: "الجيل الثامن الخارق من زد بوك فيوري، معالج كور i7 جيل حادي عشر فئة H، كارت شاشة نيفيديا Quadro T1200 DDR6 الحديث، رامات 16 جيجا وشاشة 15.6.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_Folio_8490m_%281%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_x360_1020_G2.png",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_840_G8.png"
    ]
  },
  {
    name: "DELL PRECISION 5550 TOUCH SCREEN",
    category: "laptop",
    brand: "Dell",
    specs: { cpu: "Intel Core i7", gpu: "NVIDIA", ram: "16 GB", storage: "512 GB" },
    price: 29500,
    sellingPrice: 29500,
    stock: 5,
    description: "لاب توب ديل بريسيزن الترا سليم شاشة بالكامل بدون حواف تعمل باللمس بدقة 4K، معالج كور i7 جيل عاشر H، كارت شاشة نيفيديا T1200 DDR6 فخم جداً.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Precision_7510_and_NEC_SmartScan.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_D600_DSC00010.JPG",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_precision_m4600_frontcorner2_%2825478620053%29.jpg"
    ]
  },
  {
    name: "DELL PRECISION 7550 XEON WORKSTATION",
    category: "laptop",
    brand: "Dell",
    specs: { cpu: "Intel Core i7", gpu: "NVIDIA", ram: "16 GB", storage: "512 GB" },
    price: 30000,
    sellingPrice: 30000,
    stock: 5,
    description: "العملاق ديل بريسيزن بمعالج السيرفرات والأعمال الشاقة Xeon W.10855M جيل عاشر، كارت شاشة خارق نيفيديا RTX A3000 DDR6 6G، مصمم للرندرة ثلاثية الأبعاد.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_precision_m4600_frontcorner2_%2825478620053%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Inspiron_6000_and_Latitude_D610.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_U3415W_monitor_and_Latitude_laptop_%281%29.jpg"
    ]
  },
  {
    name: "DELL G3 GAMING RTX POWER",
    category: "laptop",
    brand: "Dell",
    specs: { cpu: "Intel Core i7", gpu: "NVIDIA", ram: "16 GB", storage: "512 GB" },
    price: 31000,
    sellingPrice: 31000,
    stock: 5,
    description: "نسخة ألعاب خارقة ديل G3 أوبن بوكس كسر زيرو، معالج كور i7 جيل عاشر فئة H، كارت شاشة متطور يدعم تتبع الأشعة نيفيديا RTX 2060 DDR6 6G رائع للألعاب الثقيلة.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Precision_7510_and_NEC_SmartScan.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Inspiron_6000_and_Latitude_D610.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_3340_%281%29.jpg"
    ]
  },
  {
    name: "HP ZBOOK 17 G6 CORE I9 EXTRA BIG",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "Intel Core i9", gpu: "NVIDIA", ram: "16 GB", storage: "512 GB" },
    price: 32000,
    sellingPrice: 32000,
    stock: 5,
    description: "الوحش الكاسر من اتش بي بمشغل كور i9 جيل تاسع فئة H، شاشة ضخمة 17.3 بوصة، كارت شاشة نيفيديا RTX 3000 DDR6 6G، للمحترفين والاستوديوهات.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_840_G4.png",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_840_G8.png",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_ZBook_15_G3_with_AKiTiO_Node_%2835030980124%29.jpg"
    ]
  },
  {
    name: "DELL PRECISION 7760 XEON BEAST",
    category: "laptop",
    brand: "Dell",
    specs: { cpu: "Intel Core i7", gpu: "NVIDIA", ram: "16 GB", storage: "512 GB" },
    price: 32500,
    sellingPrice: 32500,
    stock: 5,
    description: "من أقوى أجهزة ديل في السوق، معالج Xeon W.11855M جيل حادي عشر، شاشة عملاقة 17.3 بوصة، كارت شاشة نيفيديا RTX A3000 DDR6 6G سريع ومثالي للذكاء الاصطناعي والمونتاج وضغط العمل العالي.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_U3415W_monitor_and_Latitude_laptop_%281%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_precision_m4600_frontcorner2_%2825478620053%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Precision_7510_and_NEC_SmartScan.jpg"
    ]
  },
  {
    name: "HP ZBOOK FURY G8 1TB MASSIVE",
    category: "laptop",
    brand: "HP",
    specs: { cpu: "Intel Core i7", gpu: "NVIDIA", ram: "16 GB", storage: "512 GB" },
    price: 32500,
    sellingPrice: 32500,
    stock: 5,
    description: "نسخة مطورة من زد بوك فيوري G8 معالج كور i7 جيل حادي عشر H، مساحة تخزينية ضخمة جداً وهارد فائق السرعة، كارت شاشة نيفيديا T1200 DDR6 وشاشة مريحة للغاية.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_840_G8.png",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_ZBook_15_G3_with_AKiTiO_Node_%2835030980124%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/HP_EliteBook_x360_1020_G2.png"
    ]
  },
  {
    name: "DELL G5 GAMING OPEN BOX RTX",
    category: "laptop",
    brand: "Dell",
    specs: { cpu: "Intel Core i7", gpu: "NVIDIA", ram: "16 GB", storage: "512 GB" },
    price: 33500,
    sellingPrice: 33500,
    stock: 5,
    description: "لاب توب ألعاب ديل G5 الراقي كسر زيرو تماماً، معالج كور i7 جيل عاشر فئة H، كارت شاشة نيفيديا القوي RTX 2060 6G لتشغيل أحدث الألعاب وأعلى الإعدادات سلاسة.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Precision_7510_and_NEC_SmartScan.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_3340_%281%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_precision_m4600_frontcorner2_%2825478620053%29.jpg"
    ]
  },
  {
    name: "DELL PRECISION 5760 XEON SCREEN",
    category: "laptop",
    brand: "Dell",
    specs: { cpu: "Intel Core i7", gpu: "NVIDIA", ram: "16 GB", storage: "512 GB" },
    price: 36500,
    sellingPrice: 36500,
    stock: 5,
    description: "لاب توب ديل بريسيزن الفاخر الموديل الحديث جداً بشاشة 17.3 بوصة خالية الحواف، معالج Xeon W.11855M جيل حادي عشر، كارت نيفيديا RTX A3000 6G تصميم انسيابي وقوي.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_precision_m4600_frontcorner2_%2825478620053%29.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_D600_DSC00010.JPG",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Precision_7510_and_NEC_SmartScan.jpg"
    ]
  },
  {
    name: "DELL G15 GAMING RTX 3060 ULTIMATE",
    category: "laptop",
    brand: "Dell",
    specs: { cpu: "Intel Core i7", gpu: "NVIDIA", ram: "16 GB", storage: "512 GB" },
    price: 40000,
    sellingPrice: 40000,
    stock: 5,
    description: "ملك الألعاب والأعلى سعراً بالجدول ديل G15 كسر زيرو بالكرونة، معالج كور i7 جيل حادي عشر H، كارت شاشة خارق نيفيديا RTX 3060 DDR6 6G لتجربة ألعاب وجرافيكس لا مثيل لها.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Precision_7510_and_NEC_SmartScan.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_Latitude_with_Ubuntu.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_precision_m4600_frontcorner2_%2825478620053%29.jpg"
    ]
  }
];

async function seedProducts() {
  try {
    console.log('🌱 Starting product seeding...');
    console.log(`📦 Total products to seed: ${laptopsToSeed.length}`);

    // Connect directly to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Define product schema directly
    const productSchema = new mongoose.Schema({
      name: { type: String, required: true, trim: true },
      description: { type: String, trim: true },
      category: { type: String, required: true, trim: true },
      brand: { type: String, enum: ['HP', 'Dell', 'Lenovo'], required: true, trim: true },
      specs: {
        cpu: { type: String, enum: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen'], trim: true },
        gpu: { type: String, enum: ['Intel', 'NVIDIA', 'AMD'], trim: true },
        ram: { type: String, enum: ['8 GB', '16 GB', '32 GB', '64 GB'], trim: true },
        storage: { type: String, enum: ['128 GB', '256 GB', '512 GB'], trim: true },
      },
      price: { type: Number, min: 0 },
      sellingPrice: { type: Number, min: 0 },
      stock: { type: Number, required: true, min: 0, default: 0 },
      images: { type: [String], default: [] },
      isPublished: { type: Boolean, default: true },
      isFeatured: { type: Boolean, default: false },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
      governorate: { type: String, trim: true },
    }, { timestamps: true });

    const ProductModel = mongoose.model('Product', productSchema);

    // Clear existing products
    await ProductModel.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert all products
    const insertedProducts = await ProductModel.insertMany(laptopsToSeed);
    console.log(`✅ Successfully seeded ${insertedProducts.length} products`);

    // Log summary
    const brandCounts = insertedProducts.reduce((acc, product) => {
      acc[product.brand] = (acc[product.brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📊 Seeding Summary by Brand:');
    Object.entries(brandCounts).forEach(([brand, count]) => {
      console.log(`   ${brand}: ${count} products`);
    });

    console.log('\n🎉 Product seeding completed successfully!');
    
    // Close connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seeding function
seedProducts();
