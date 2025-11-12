// js/data/products.js
// DỮ LIỆU MẶC ĐỊNH (chỉ dùng khi localStorage rỗng)
const DEFAULT_PRODUCTS = [
  { id: 1, name: "Strawberry Smoothie", category: "Sinh tố", price: 45000, image: "img/product/smoothie-strawberry.png", description: "Sinh tố dâu tây tươi mát, kết hợp sữa chua và đá xay mịn.", volume: "400ml", brand: "Tự làm", quantity: 30 },
  { id: 2, name: "Cold Brew", category: "Cà phê", price: 38000, image: "img/product/cafe-coldbrew.png", description: "Cà phê ủ lạnh 12 tiếng, đậm đà, ít chua.", volume: "350ml", brand: "Tự pha", quantity: 25 },
  { id: 3, name: "mi amor", category: "Cà phê", price: 32000, image: "img/product/cafe-espresso.png", description: "Espresso nguyên chất, đậm vị, lớp crema vàng óng.", volume: "30ml", brand: "Tự pha", quantity: 40 },
  { id: 4, name: "Trà Đào", category: "Trà", price: 35000, image: "img/product/tea-peachtea.png", description: "Trà đen kết hợp đào tươi và thạch đào dai giòn.", volume: "500ml", brand: "Tự pha", quantity: 35 },
  { id: 5, name: "Coca-Cola", category: "Có ga", price: 10000, image: "img/product/product5.jpg", description: "Nước ngọt có ga Coca-Cola, dung tích 330ml.", volume: "330ml", brand: "Coca-Cola", quantity: 100 },
  { id: 6, name: "Pepsi", category: "Có ga", price: 10000, image: "img/product/product6.jpg", description: "Nước ngọt có ga Pepsi, dung tích 330ml.", volume: "330ml", brand: "PepsiCo", quantity: 95 },
  { id: 7, name: "Sprite", category: "Có ga", price: 10000, image: "img/product/product7.jpg", description: "Nước ngọt có ga Sprite, vị chanh, dung tích 330ml.", volume: "330ml", brand: "Coca-Cola", quantity: 90 },
  { id: 8, name: "Trà xanh C2", category: "Trà", price: 8000, image: "img/product/product8.jpg", description: "Trà xanh C2, dung tích 500ml.", volume: "500ml", brand: "ULV", quantity: 120 },
  { id: 9, name: "Red Bull", category: "Nước tăng lực", price: 15000, image: "img/product/product9.jpg", description: "Red Bull, dung tích 250ml.", volume: "250ml", brand: "Red Bull", quantity: 60 },
  { id: 10, name: "Aquafina", category: "Không ga", price: 7000, image: "img/product/product10.jpg", description: "Nước tinh khiết Aquafina, dung tích 500ml.", volume: "500ml", brand: "PepsiCo", quantity: 150 },
  { id: 11, name: "Fanta", category: "Có ga", price: 10000, image: "img/product/product11.jpg", description: "Nước ngọt có ga Fanta, vị cam, dung tích 330ml.", volume: "330ml", brand: "Coca-Cola", quantity: 85 },
  { id: 12, name: "Trà Ô Long", category: "Trà", price: 12000, image: "img/product/product12.jpg", description: "Trà Ô Long thơm ngon, dung tích 450ml.", volume: "450ml", brand: "THP", quantity: 70 },

  { id: 13, name: "Mango Smoothie", category: "Sinh tố", price: 48000, image: "img/product/product13.jpg", description: "Sinh tố xoài chín ngọt, xay với sữa đặc và đá.", volume: "400ml", brand: "Tự làm", quantity: 28 },
  { id: 14, name: "Latte", category: "Cà phê", price: 35000, image: "img/product/product14.jpg", description: "Cà phê sữa nóng, lớp bọt sữa mịn.", volume: "300ml", brand: "Tự pha", quantity: 32 },
  { id: 15, name: "Trà Sữa Trân Châu", category: "Trà sữa", price: 30000, image: "img/product/product15.jpg", description: "Trà đen pha sữa, thêm trân châu dai giòn.", volume: "500ml", brand: "Tự pha", quantity: 45 },
  { id: 16, name: "7Up", category: "Có ga", price: 10000, image: "img/product/product16.jpg", description: "Nước ngọt có ga vị chanh 7Up, dung tích 330ml.", volume: "330ml", brand: "PepsiCo", quantity: 88 },
  { id: 17, name: "Sting Dâu", category: "Nước tăng lực", price: 12000, image: "img/product/product17.jpg", description: "Nước tăng lực vị dâu, dung tích 330ml.", volume: "330ml", brand: "PepsiCo", quantity: 55 },
  { id: 18, name: "Dasani", category: "Không ga", price: 6000, image: "img/product/product18.jpg", description: "Nước tinh khiết Dasani, dung tích 500ml.", volume: "500ml", brand: "Coca-Cola", quantity: 130 },
  { id: 19, name: "Avocado Smoothie", category: "Sinh tố", price: 50000, image: "img/product/product19.jpg", description: "Sinh tố bơ béo ngậy, thêm sữa đặc.", volume: "400ml", brand: "Tự làm", quantity: 20 },
  { id: 20, name: "Cappuccino", category: "Cà phê", price: 38000, image: "img/product/product20.jpg", description: "Cà phê sữa Ý với lớp bọt sữa dày.", volume: "250ml", brand: "Tự pha", quantity: 30 },

  { id: 21, name: "Trà Chanh", category: "Trà", price: 15000, image: "img/product/product21.jpg", description: "Trà chanh tươi mát, thêm mật ong.", volume: "500ml", brand: "Tự pha", quantity: 60 },
  { id: 22, name: "Mirinda Cam", category: "Có ga", price: 10000, image: "img/product/product22.jpg", description: "Nước ngọt có ga vị cam Mirinda, 330ml.", volume: "330ml", brand: "PepsiCo", quantity: 75 },
  { id: 23, name: "Number 1", category: "Nước tăng lực", price: 10000, image: "img/product/product23.jpg", description: "Nước tăng lực Number 1, 310ml.", volume: "310ml", brand: "Tân Hiệp Phát", quantity: 80 },
  { id: 24, name: "Lavie", category: "Không ga", price: 8000, image: "img/product/product24.jpg", description: "Nước khoáng thiên nhiên Lavie, 500ml.", volume: "500ml", brand: "Lavie", quantity: 110 },
  { id: 25, name: "Banana Smoothie", category: "Sinh tố", price: 40000, image: "img/product/product25.jpg", description: "Sinh tố chuối ngọt, xay với sữa tươi.", volume: "400ml", brand: "Tự làm", quantity: 35 },
  { id: 26, name: "Americano", category: "Cà phê", price: 30000, image: "img/product/product26.jpg", description: "Espresso pha nước nóng, đậm vị.", volume: "300ml", brand: "Tự pha", quantity: 38 },
  { id: 27, name: "Trà Sữa Matcha", category: "Trà sữa", price: 35000, image: "img/product/product27.jpg", description: "Trà sữa matcha Nhật Bản, thêm trân châu.", volume: "500ml", brand: "Tự pha", quantity: 40 },
  { id: 28, name: "Twist Cam", category: "Có ga", price: 10000, image: "img/product/product28.jpg", description: "Nước ngọt vị cam có ga, 330ml.", volume: "330ml", brand: "Coca-Cola", quantity: 70 },
  { id: 29, name: "Monster Energy", category: "Nước tăng lực", price: 25000, image: "img/product/product29.jpg", description: "Nước tăng lực Monster, 355ml.", volume: "355ml", brand: "Monster", quantity: 45 },
  { id: 30, name: "Evian", category: "Không ga", price: 35000, image: "img/product/product30.jpg", description: "Nước khoáng cao cấp Evian, 500ml.", volume: "500ml", brand: "Evian", quantity: 25 },
  { id: 31, name: "Blueberry Smoothie", category: "Sinh tố", price: 52000, image: "img/product/product31.jpg", description: "Sinh tố việt quất nhập khẩu, giàu vitamin.", volume: "400ml", brand: "Tự làm", quantity: 22 },
  { id: 32, name: "Mocha", category: "Cà phê", price: 42000, image: "img/product/product32.jpg", description: "Cà phê kết hợp chocolate và sữa.", volume: "300ml", brand: "Tự pha", quantity: 28 },
  { id: 33, name: "Trà Táo", category: "Trà", price: 28000, image: "img/product/product33.jpg", description: "Trà đen pha táo tươi, thơm ngọt.", volume: "500ml", brand: "Tự pha", quantity: 50 },
  { id: 34, name: "Dr. Thanh", category: "Trà", price: 9000, image: "img/product/product34.jpg", description: "Trà thảo mộc Dr. Thanh, 350ml.", volume: "350ml", brand: "Tân Hiệp Phát", quantity: 100 },
  { id: 35, name: "Sữa Tươi TH True Milk", category: "Sữa", price: 8000, image: "img/product/product35.jpg", description: "Sữa tươi tiệt trùng không đường, 180ml.", volume: "180ml", brand: "TH True Milk", quantity: 90 },
  { id: 36, name: "Nước Dừa Tươi", category: "Nước trái cây", price: 20000, image: "img/product/product36.jpg", description: "Nước dừa tươi nguyên quả, ngọt thanh.", volume: "350ml", brand: "Tự nhiên", quantity: 40 },
  { id: 37, name: "Nước Ép Cam", category: "Nước ép", price: 30000, image: "img/product/product37.jpg", description: "Nước ép cam tươi 100%, không đường.", volume: "300ml", brand: "Tự ép", quantity: 35 },
  { id: 38, name: "Sữa Đậu Nành Fami", category: "Sữa", price: 6000, image: "img/product/product38.jpg", description: "Sữa đậu nành nguyên chất, 200ml.", volume: "200ml", brand: "Vinasoy", quantity: 110 },
  { id: 39, name: "Nước Ép Táo", category: "Nước ép", price: 28000, image: "img/product/product39.jpg", description: "Nước ép táo nguyên chất, giàu chất xơ.", volume: "300ml", brand: "Tự ép", quantity: 38 },
  { id: 40, name: "Kem Trà Xanh", category: "Trà", price: 25000, image: "img/product/product40.jpg", description: "Trà xanh pha kem béo ngậy.", volume: "500ml", brand: "Tự pha", quantity: 45 },

  { id: 41, name: "Nước Ép Dưa Hấu", category: "Nước ép", price: 25000, image: "img/product/product41.jpg", description: "Nước ép dưa hấu tươi mát, giải nhiệt.", volume: "400ml", brand: "Tự ép", quantity: 42 },
  { id: 42, name: "Sữa Chua Uống Yakult", category: "Sữa chua", price: 8000, image: "img/product/product42.jpg", description: "Sữa chua uống Yakult, 65ml.", volume: "65ml", brand: "Yakult", quantity: 200 },
  { id: 43, name: "Trà Atiso", category: "Trà", price: 15000, image: "img/product/product43.jpg", description: "Trà atiso thanh nhiệt, giải độc.", volume: "500ml", brand: "Đà Lạt", quantity: 55 },
  { id: 44, name: "Nước Ép Ổi", category: "Nước ép", price: 22000, image: "img/product/product44.jpg", description: "Nước ép ổi hồng, giàu vitamin C.", volume: "300ml", brand: "Tự ép", quantity: 48 },
  { id: 45, name: "Sữa Hạnh Nhân", category: "Sữa", price: 35000, image: "img/product/product45.jpg", description: "Sữa hạnh nhân không đường, 250ml.", volume: "250ml", brand: "Almond Breeze", quantity: 30 },
  { id: 46, name: "Trà Gừng Mật Ong", category: "Trà", price: 20000, image: "img/product/product46.jpg", description: "Trà gừng ấm nóng, thêm mật ong.", volume: "400ml", brand: "Tự pha", quantity: 50 },
  { id: 47, name: "Nước Ép Cà Rốt", category: "Nước ép", price: 25000, image: "img/product/product47.jpg", description: "Nước ép cà rốt tươi, tốt cho mắt.", volume: "300ml", brand: "Tự ép", quantity: 40 },
  { id: 48, name: "Sữa Tươi Vinamilk", category: "Sữa", price: 7000, image: "img/product/product48.jpg", description: "Sữa tươi Vinamilk có đường, 180ml.", volume: "180ml", brand: "Vinamilk", quantity: 120 },
  { id: 49, name: "Nước Ép Thơm", category: "Nước ép", price: 28000, image: "img/product/product49.jpg", description: "Nước ép thơm (dứa) tươi, thơm ngon.", volume: "300ml", brand: "Tự ép", quantity: 36 },
  { id: 50, name: "Trà Sữa Khoai Môn", category: "Trà sữa", price: 38000, image: "img/product/product50.jpg", description: "Trà sữa khoai môn béo ngậy, thêm pudding.", volume: "500ml", brand: "Tự pha", quantity: 32 }
];

/**
 * LẤY SẢN PHẨM TỪ localStorage
 * Nếu chưa có → dùng DEFAULT_PRODUCTS
 */
window.getProducts = () => {
  const saved = localStorage.getItem('products');
  return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
};

/**
 * CẬP NHẬT LẠI UI KHI localStorage THAY ĐỔI
 */
window.refreshProducts = () => {
  window.products = window.getProducts();
  if (typeof initProductsPage === 'function') initProductsPage();
};

// Khởi tạo localStorage 'products' nếu chưa tồn tại
if (!localStorage.getItem('products')) {
  localStorage.setItem('products', JSON.stringify(DEFAULT_PRODUCTS));
  console.log("Đã khởi tạo localStorage 'products' với dữ liệu mặc định.");
}

// Sau đó tải lên UI
window.refreshProducts();
