// src/utils/foodSuggestions.ts

// Định nghĩa kiểu dữ liệu cho Food Info (Gợi ý)
export interface FoodInfo {
  name: string;
  unit: string;
  category: string;
}

// Dữ liệu mẫu gợi ý (Mock Data)
// === THỰC PHẨM TƯƠI ===
export const FOOD_SUGGESTIONS: FoodInfo[] = [
  // Thịt – cá
  { name: "Thịt heo", unit: "kg", category: "Thịt cá" },
  { name: "Ba chỉ heo", unit: "kg", category: "Thịt cá" },
  { name: "Sườn heo", unit: "kg", category: "Thịt cá" },
  { name: "Thịt bò", unit: "kg", category: "Thịt cá" },
  { name: "Bắp bò", unit: "kg", category: "Thịt cá" },
  { name: "Thịt gà", unit: "kg", category: "Thịt cá" },
  { name: "Ức gà", unit: "kg", category: "Thịt cá" },
  { name: "Cánh gà", unit: "kg", category: "Thịt cá" },
  { name: "Cá hồi", unit: "kg", category: "Thịt cá" },
  { name: "Cá thu", unit: "kg", category: "Thịt cá" },
  { name: "Cá basa", unit: "kg", category: "Thịt cá" },
  { name: "Cá rô phi", unit: "kg", category: "Thịt cá" },

  // Hải sản tươi
  { name: "Tôm tươi", unit: "kg", category: "Thịt cá" },
  { name: "Tôm sú", unit: "kg", category: "Thịt cá" },
  { name: "Cua biển", unit: "kg", category: "Thịt cá" },
  { name: "Ghẹ", unit: "kg", category: "Thịt cá" },
  { name: "Mực tươi", unit: "kg", category: "Thịt cá" },
  { name: "Nghêu", unit: "kg", category: "Thịt cá" },
  { name: "Sò điệp", unit: "kg", category: "Thịt cá" },

  // Rau – củ
  { name: "Cà chua", unit: "kg", category: "Rau củ" },
  { name: "Cà pháo", unit: "kg", category: "Rau củ" },
  { name: "Cà rốt", unit: "kg", category: "Rau củ" },
  { name: "Khoai tây", unit: "kg", category: "Rau củ" },
  { name: "Khoai lang", unit: "kg", category: "Rau củ" },
  { name: "Hành tây", unit: "kg", category: "Rau củ" },
  { name: "Rau muống", unit: "bó", category: "Rau củ" },
  { name: "Cải xanh", unit: "bó", category: "Rau củ" },
  { name: "Cải thìa", unit: "bó", category: "Rau củ" },
  { name: "Xà lách", unit: "cây", category: "Rau củ" },
  { name: "Bắp cải", unit: "cái", category: "Rau củ" },
  { name: "Bí đỏ", unit: "kg", category: "Rau củ" },
  { name: "Bí xanh", unit: "kg", category: "Rau củ" },
  { name: "Mướp", unit: "kg", category: "Rau củ" },
  { name: "Dưa leo", unit: "kg", category: "Rau củ" },

  // === GIA VỊ ===

  // Gia vị tươi
  { name: "Hành tím", unit: "kg", category: "Gia vị" },
  { name: "Hành lá", unit: "bó", category: "Gia vị" },
  { name: "Tỏi tươi", unit: "kg", category: "Gia vị" },
  { name: "Gừng tươi", unit: "kg", category: "Gia vị" },
  { name: "Sả", unit: "cây", category: "Gia vị" },
  { name: "Ớt tươi", unit: "kg", category: "Gia vị" },
  { name: "Rau răm", unit: "bó", category: "Gia vị" },
  { name: "Ngò rí", unit: "bó", category: "Gia vị" },
  { name: "Ngò gai", unit: "bó", category: "Gia vị" },
  { name: "Lá chanh", unit: "g", category: "Gia vị" },
  { name: "Húng quế", unit: "bó", category: "Gia vị" },
  { name: "Thì là", unit: "bó", category: "Gia vị" },

  // Gia vị khô – cơ bản
  { name: "Muối", unit: "kg", category: "Gia vị" },
  { name: "Đường", unit: "kg", category: "Gia vị" },
  { name: "Tiêu đen", unit: "g", category: "Gia vị" },
  { name: "Tiêu trắng", unit: "g", category: "Gia vị" },
  { name: "Bột ngọt", unit: "gói", category: "Gia vị" },
  { name: "Hạt nêm", unit: "gói", category: "Gia vị" },

  // Gia vị truyền thống Việt
  { name: "Nước mắm", unit: "chai", category: "Gia vị" },
  { name: "Nước tương", unit: "chai", category: "Gia vị" },
  { name: "Mắm tôm", unit: "hũ", category: "Gia vị" },
  { name: "Mắm ruốc", unit: "hũ", category: "Gia vị" },
  { name: "Tương ớt", unit: "chai", category: "Gia vị" },
  { name: "Tương cà", unit: "chai", category: "Gia vị" },

  // Gia vị nấu nướng
  { name: "Dầu ăn", unit: "chai", category: "Gia vị" },
  { name: "Dầu mè", unit: "chai", category: "Gia vị" },
  { name: "Giấm", unit: "chai", category: "Gia vị" },
  { name: "Sa tế", unit: "hũ", category: "Gia vị" },
  { name: "Bột nghệ", unit: "gói", category: "Gia vị" },
  { name: "Bột ớt", unit: "gói", category: "Gia vị" },
  { name: "Bột tiêu", unit: "gói", category: "Gia vị" },

  // Trái cây
  { name: "Chuối", unit: "nải", category: "Trái cây" },
  { name: "Táo", unit: "kg", category: "Trái cây" },
  { name: "Cam", unit: "kg", category: "Trái cây" },
  { name: "Quýt", unit: "kg", category: "Trái cây" },
  { name: "Xoài", unit: "kg", category: "Trái cây" },
  { name: "Dưa hấu", unit: "quả", category: "Trái cây" },
  { name: "Thanh long", unit: "kg", category: "Trái cây" },
  { name: "Nho", unit: "kg", category: "Trái cây" },

  // Trứng – sữa tươi
  { name: "Trứng gà", unit: "quả", category: "Sữa & trứng" },
  { name: "Trứng vịt", unit: "quả", category: "Sữa & trứng" },
  { name: "Sữa tươi", unit: "lít", category: "Sữa & trứng" },

  // === THỰC PHẨM KHÔ – ĐỒ KHÔ ===

  // Gạo – ngũ cốc
  { name: "Gạo tẻ", unit: "kg", category: "Đồ khô" },
  { name: "Gạo thơm", unit: "kg", category: "Đồ khô" },
  { name: "Gạo nếp", unit: "kg", category: "Đồ khô" },
  { name: "Gạo lứt", unit: "kg", category: "Đồ khô" },
  { name: "Yến mạch", unit: "gói", category: "Đồ khô" },
  { name: "Bắp khô", unit: "kg", category: "Đồ khô" },
  { name: "Hạt kê", unit: "kg", category: "Đồ khô" },

  // Mì – bún – phở khô
  { name: "Mì gói", unit: "gói", category: "Đồ khô" },
  { name: "Mì trứng khô", unit: "vắt", category: "Đồ khô" },
  { name: "Mì udon khô", unit: "gói", category: "Đồ khô" },
  { name: "Mì soba khô", unit: "gói", category: "Đồ khô" },
  { name: "Bún khô", unit: "gói", category: "Đồ khô" },
  { name: "Phở khô", unit: "gói", category: "Đồ khô" },
  { name: "Miến dong", unit: "gói", category: "Đồ khô" },
  { name: "Miến khoai", unit: "gói", category: "Đồ khô" },
  { name: "Hủ tiếu khô", unit: "gói", category: "Đồ khô" },

  // Đậu – hạt khô
  { name: "Đậu xanh", unit: "kg", category: "Đồ khô" },
  { name: "Đậu đen", unit: "kg", category: "Đồ khô" },
  { name: "Đậu đỏ", unit: "kg", category: "Đồ khô" },
  { name: "Đậu nành", unit: "kg", category: "Đồ khô" },
  { name: "Đậu phộng khô", unit: "kg", category: "Đồ khô" },
  { name: "Hạt điều khô", unit: "kg", category: "Đồ khô" },
  { name: "Hạt mè trắng", unit: "g", category: "Đồ khô" },
  { name: "Hạt mè đen", unit: "g", category: "Đồ khô" },

  // Hải sản khô
  { name: "Tôm khô", unit: "g", category: "Đồ khô" },
  { name: "Cá khô", unit: "kg", category: "Đồ khô" },
  { name: "Mực khô", unit: "con", category: "Đồ khô" },
  { name: "Cá cơm khô", unit: "kg", category: "Đồ khô" },

  // Thực phẩm sấy – khô
  { name: "Nấm hương khô", unit: "g", category: "Đồ khô" },
  { name: "Nấm mèo khô", unit: "g", category: "Đồ khô" },
  { name: "Măng khô", unit: "kg", category: "Đồ khô" },
  { name: "Rong biển khô", unit: "gói", category: "Đồ khô" },

  // Đồ hộp (nguyên liệu)
  { name: "Cá hộp", unit: "lon", category: "Đồ khô" },
  { name: "Thịt hộp", unit: "lon", category: "Đồ khô" },
  { name: "Đậu hộp", unit: "lon", category: "Đồ khô" },
  { name: "Bắp hộp", unit: "lon", category: "Đồ khô" },

  // Bột – nguyên liệu khô
  { name: "Bột mì", unit: "kg", category: "Đồ khô" },
  { name: "Bột năng", unit: "kg", category: "Đồ khô" },
  { name: "Bột bắp", unit: "kg", category: "Đồ khô" },
  { name: "Bột gạo", unit: "kg", category: "Đồ khô" },
  { name: "Bột chiên giòn", unit: "gói", category: "Đồ khô" },
  { name: "Bột chiên xù", unit: "gói", category: "Đồ khô" },

  // Đường – chất tạo ngọt khô
  { name: "Đường phèn", unit: "kg", category: "Đồ khô" },
  { name: "Đường nâu", unit: "kg", category: "Đồ khô" },
  { name: "Mật ong", unit: "chai", category: "Đồ khô" },

  // Thực phẩm đông khô / bảo quản lâu
  { name: "Đậu hũ khô", unit: "miếng", category: "Đồ khô" },
  { name: "Tàu hũ ky", unit: "gói", category: "Đồ khô" },
];
