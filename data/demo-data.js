// js/demo-account.js
// TỰ ĐỘNG TẠO TÀI KHOẢN + ĐƠN HÀNG MẪU (CÓ TRẠNG THÁI)

(function createDemoAccount() {
  const demoUser = "demo";
  const demoPass = "123456";

  const userKey = `user_${demoUser}`;

  if (localStorage.getItem(userKey)) {
    console.log("Tài khoản demo đã tồn tại!");
    return;
  }

  const userData = {
    password: demoPass,
    name: "Nguyễn Văn Demo",
    phone: "0901234567",
    DOB: "1995-05-20",
    userName: "demoUser",
    email: "demo@example.com",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    orders: []
  };

  // === TẠO 2 ĐƠN HÀNG MẪU VỚI TRẠNG THÁI ===
  userData.orders = [
    {
      date: "2025-11-01 14:30",
      payment: "Thanh toán khi nhận hàng",
      address: userData.address,
      status: "Đang giao", // THÊM TRẠNG THÁI
      items: [
        { name: "Trà Đào", price: 35000, qty: 2 },
        { name: "Cold Brew", price: 38000, qty: 1 },
        { name: "Coca-Cola", price: 10000, qty: 3 }
      ]
    },
    {
      date: "2025-10-28 09:15",
      payment: "Chuyển khoản ngân hàng",
      address: "456 Đường XYZ, Quận 3, TP.HCM",
      status: "Hoàn thành", // THÊM TRẠNG THÁI
      items: [
        { name: "Strawberry Smoothie", price: 45000, qty: 1 },
        { name: "Trà Sữa Trân Châu", price: 30000, qty: 2 }
      ]
    },
    {
      date: "2025-10-20 18:00",
      payment: "Thanh toán khi nhận hàng",
      address: userData.address,
      status: "Đã hủy", // THÊM TRẠNG THÁI
      items: [
        { name: "Red Bull", price: 15000, qty: 4 }
      ]
    }
  ];

  localStorage.setItem(userKey, JSON.stringify(userData));
  console.log(`Tài khoản demo + 3 đơn hàng (có trạng thái) đã được tạo!`);
  console.log(`→ Đăng nhập: demo / 123456`);
})();