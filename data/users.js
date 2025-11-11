// data/users.js - User Management Data

const defaultUsers = [
  {
    username: 'admin',
    password: 'admin123',
    email: 'admin@drinkshop.com',
    name: 'Administrator',
    phone: '0123456789',
    isAdmin: true,
    isLocked: false,
    orders: [],
    joinDate: '2025-01-01T00:00:00.000Z'
  },
  {
    username: 'user1',
    password: '123456',
    email: 'user1@example.com',
    name: 'Nguyễn Văn A',
    phone: '0987654321',
    isAdmin: false,
    isLocked: false,
    orders: [
      {
        code: 'DH1001',
        orderTime: '2025-11-08T10:30:00.000Z',
        infoUser: {
          name: 'Nguyễn Văn A',
          phone: '0987654321',
          address: '123 Nguyễn Huệ, Quận 1, TP.HCM'
        },
        paymentMethod: 'Tiền mặt',
        note: 'Giao hàng buổi chiều',
        products: [
          {
            id: 1,
            name: 'Strawberry Smoothie',
            image: 'img/product/smoothie-strawberry.png',
            category: 'Sinh tố',
            price: 45000,
            qty: 2,
            volume: '400ml'
          },
          {
            id: 2,
            name: 'Cold Brew',
            image: 'img/product/cafe-coldbrew.png',
            category: 'Cà phê',
            price: 38000,
            qty: 1,
            volume: '350ml'
          }
        ],
        totalPrice: 128000,
        isVerify: 0 // 0: pending, 1: confirmed, -1: cancelled
      }
    ],
    joinDate: '2025-10-01T00:00:00.000Z'
  },
  {
    username: 'user2',
    password: '123456',
    email: 'user2@example.com',
    name: 'Trần Thị B',
    phone: '0912345678',
    isAdmin: false,
    isLocked: false,
    orders: [],
    joinDate: '2025-10-15T00:00:00.000Z'
  }
];

// Initialize users in localStorage
function initializeUsers() {
  const existingUsers = localStorage.getItem('users');
  
  if (!existingUsers) {
    // First time initialization - set default users with demo data
    localStorage.setItem('users', JSON.stringify(defaultUsers));
  } else {
    // Users already exist - only ensure admin account exists
    const users = JSON.parse(existingUsers);
    
    const adminIndex = users.findIndex(u => u.username === 'admin');
    if (adminIndex === -1) {
      // Admin doesn't exist, add it
      users.push(defaultUsers[0]);
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    // DON'T overwrite user1 and user2 to preserve their orders and changes
  }
}

// Initialize products from script.js
function initializeProducts() {
  const existingProducts = localStorage.getItem('products');
  
  if (!existingProducts && typeof products !== 'undefined') {
    // First time - save products to localStorage
    localStorage.setItem('products', JSON.stringify(products));
  } else if (typeof products !== 'undefined') {
    // Products exist - sync image URLs and other properties from script.js
    const storedProducts = JSON.parse(existingProducts);
    let hasChanges = false;
    
    storedProducts.forEach(storedProduct => {
      const sourceProduct = products.find(p => p.id === storedProduct.id);
      if (sourceProduct) {
        // Update image URL if changed
        if (storedProduct.image !== sourceProduct.image) {
          storedProduct.image = sourceProduct.image;
          hasChanges = true;
          console.log(`✅ Updated image for: ${storedProduct.name}`);
        }
        
        // Optionally sync other properties (price, description, etc.) if needed
        // But keep quantity and costPrice from localStorage
      }
    });
    
    if (hasChanges) {
      localStorage.setItem('products', JSON.stringify(storedProducts));
      console.log('✅ Product images synced from script.js!');
    }
  }
}

// Fix old orders without product IDs
function fixOrderProductIds() {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  
  if (users.length === 0 || products.length === 0) return;
  
  let hasChanges = false;
  
  users.forEach(user => {
    if (user.orders && Array.isArray(user.orders)) {
      user.orders.forEach(order => {
        if (order.products && Array.isArray(order.products)) {
          order.products.forEach(orderProduct => {
            // If product doesn't have ID, try to find it by name
            if (!orderProduct.id && !orderProduct.productId) {
              const matchingProduct = products.find(p => 
                p.name.toLowerCase().trim() === orderProduct.name.toLowerCase().trim()
              );
              if (matchingProduct) {
                orderProduct.id = matchingProduct.id;
                hasChanges = true;
                console.log(`✅ Fixed product ID: ${orderProduct.name} → ID: ${matchingProduct.id}`);
              } else {
                console.warn(`⚠️ Cannot find product: ${orderProduct.name}`);
              }
            }
          });
        }
      });
    }
  });
  
  if (hasChanges) {
    localStorage.setItem('users', JSON.stringify(users));
  }
}

// Sync end-user accounts to admin panel
function syncEndUserToAdmin() {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  let hasNewUsers = false;
  
  // Get all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    // Find keys like "user_nguyenvana"
    if (key && key.startsWith('user_') && key !== 'users') {
      const username = key.replace('user_', '');
      
      // Check if this user already exists in admin panel
      const existingUser = users.find(u => u.username === username);
      
      if (!existingUser) {
        // New user from end-user - add to admin panel
        const userData = JSON.parse(localStorage.getItem(key));
        
        const newUser = {
          username: username,
          password: userData.password || '',
          email: userData.email || 'N/A',
          name: userData.name || username,
          phone: userData.phone || 'N/A',
          address: userData.address || '',
          DOB: userData.DOB || '',
          isAdmin: false,
          isLocked: false,
          orders: userData.orders || [],
          joinDate: new Date().toISOString()
        };
        
        users.push(newUser);
        hasNewUsers = true;
      } else {
        // User exists - sync orders and profile data
        const userData = JSON.parse(localStorage.getItem(key));
        
        // Sync orders (merge new orders)
        if (userData.orders && Array.isArray(userData.orders)) {
          existingUser.orders = existingUser.orders || [];
          
          userData.orders.forEach(newOrder => {
            // Check if order already exists (by code or orderTime)
            const orderExists = existingUser.orders.some(existingOrder => {
              // Match by code if both have code
              if (newOrder.code && existingOrder.code) {
                return existingOrder.code === newOrder.code;
              }
              // Fallback: match by orderTime
              if (newOrder.orderTime && existingOrder.orderTime) {
                return existingOrder.orderTime === newOrder.orderTime;
              }
              return false;
            });
            
            if (!orderExists) {
              // Convert end-user order format to admin format
              const adminOrder = {
                code: newOrder.code || 'DH' + Math.floor(Math.random() * 90000 + 10000),
                orderTime: newOrder.orderTime || new Date().toISOString(),
                infoUser: {
                  name: userData.name || existingUser.name,
                  phone: userData.phone || existingUser.phone,
                  address: newOrder.address || userData.address || 'N/A'
                },
                paymentMethod: newOrder.payment || 'Tiền mặt',
                note: newOrder.note || '',
                products: newOrder.items ? newOrder.items.map(item => {
                  // Find product ID from products array
                  const products = JSON.parse(localStorage.getItem('products') || '[]');
                  const product = products.find(p => p.name === item.name);
                  
                  return {
                    id: product?.id || 0,
                    name: item.name,
                    image: product?.image || '',
                    category: product?.category || '',
                    price: item.price,
                    qty: item.qty || 1,
                    volume: product?.volume || ''
                  };
                }) : [],
                totalPrice: newOrder.items ? newOrder.items.reduce((sum, i) => sum + (i.price * (i.qty || 1)), 0) : 0,
                isVerify: newOrder.status === 'Đã xác nhận' ? 1 : newOrder.status === 'Đã hủy' ? -1 : 0
              };
              
              existingUser.orders.push(adminOrder);
              hasNewUsers = true;
              console.log(`✅ Synced new order for user: ${username}`);
            }
          });
        }
        
        // Sync profile data (if updated in end-user)
        if (userData.name && userData.name !== existingUser.name) {
          existingUser.name = userData.name;
          hasNewUsers = true;
        }
        if (userData.phone && userData.phone !== existingUser.phone) {
          existingUser.phone = userData.phone;
          hasNewUsers = true;
        }
        if (userData.email && userData.email !== existingUser.email) {
          existingUser.email = userData.email;
          hasNewUsers = true;
        }
        if (userData.address && userData.address !== existingUser.address) {
          existingUser.address = userData.address;
          hasNewUsers = true;
        }
      }
    }
  }
  
  if (hasNewUsers) {
    localStorage.setItem('users', JSON.stringify(users));
    console.log('✅ End-user accounts synced to admin panel!');
  }
}

// Fix orders with Invalid Date
function fixInvalidDateOrders() {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  let hasChanges = false;
  
  users.forEach(user => {
    if (user.orders && Array.isArray(user.orders)) {
      user.orders.forEach(order => {
        // Check if orderTime is invalid
        if (!order.orderTime || order.orderTime === 'Invalid Date' || isNaN(new Date(order.orderTime).getTime())) {
          // Try to parse from date field
          if (order.date) {
            try {
              // Convert Vietnamese date string to ISO
              const dateParts = order.date.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})[,\s]+(\d{1,2}):(\d{2}):(\d{2})/);
              if (dateParts) {
                const [, day, month, year, hour, minute, second] = dateParts;
                order.orderTime = new Date(year, month - 1, day, hour, minute, second).toISOString();
                hasChanges = true;
                console.log(`✅ Fixed Invalid Date for order ${order.code}: ${order.orderTime}`);
              } else {
                // Fallback to current time
                order.orderTime = new Date().toISOString();
                hasChanges = true;
                console.log(`⚠️ Set current time for order ${order.code}`);
              }
            } catch (e) {
              order.orderTime = new Date().toISOString();
              hasChanges = true;
              console.log(`⚠️ Error parsing date for order ${order.code}, using current time`);
            }
          } else {
            // No date field, use current time
            order.orderTime = new Date().toISOString();
            hasChanges = true;
            console.log(`⚠️ No date found for order ${order.code}, using current time`);
          }
        }
      });
    }
  });
  
  if (hasChanges) {
    localStorage.setItem('users', JSON.stringify(users));
    console.log('✅ Fixed all orders with Invalid Date!');
  }
}

// Run initialization
initializeUsers();
initializeProducts();
fixOrderProductIds();
fixInvalidDateOrders();
syncEndUserToAdmin();
