// js/cart.js
function renderCart() {
  const list = document.getElementById('cart-items');
  const totalEl = document.getElementById('total-price');
  if (!list || !totalEl) return;

  // LẤY USER ĐỂ ĐỌC GIỎ HÀNG RIÊNG
  const userName = localStorage.getItem("userName");
  if (!userName) {
    list.innerHTML = '<p class="cart-empty">Vui lòng đăng nhập để xem giỏ hàng.</p>';
    totalEl.textContent = '0 VNĐ';
    return;
  }

  const cartKey = `cart_${userName}`;
  const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');

  list.innerHTML = cart.length === 0 ? '<p class="cart-empty">Giỏ hàng trống.</p>' : '';
  let total = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    const html = `
      <div class="cart-row">
        <div class="qty-control">
          <button class="qty-btn decrease">-</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn increase">+</button>
        </div>
        <div class="item-name">${item.name}</div>
        <div class="item-price">${item.price.toLocaleString()} VNĐ</div>
        <button class="remove-btn">×</button>
      </div>`;
    list.insertAdjacentHTML('beforeend', html);
  });

  totalEl.textContent = total.toLocaleString() + ' VNĐ';
  attachCartEvents();
}

function attachCartEvents() {
  const userName = localStorage.getItem("userName");
  if (!userName) return;
  const cartKey = `cart_${userName}`;

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.onclick = () => {
      const row = btn.closest('.cart-row');
      const name = row.querySelector('.item-name').textContent;
      let cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
      cart = cart.filter(i => i.name !== name);
      localStorage.setItem(cartKey, JSON.stringify(cart));
      renderCart();
    };
  });

  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.onclick = () => {
      const row = btn.closest('.cart-row');
      const name = row.querySelector('.item-name').textContent;
      const isInc = btn.classList.contains('increase');
      let cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
      const item = cart.find(i => i.name === name);
      if (item) {
        item.qty = isInc ? item.qty + 1 : (item.qty > 1 ? item.qty - 1 : 1);
        localStorage.setItem(cartKey, JSON.stringify(cart));
        renderCart();
      }
    };
  });
  // ✅ Nút "Tiến hành thanh toán"
  document.querySelector(".btn-checkout").onclick = function () {
    const userName = localStorage.getItem("userName");
    if (!userName) {
      alert("Vui lòng đăng nhập để thanh toán!");
      switchPage(document.querySelector('[data-page="account"]'), "account");
      return;
    }

    const cartKey = `cart_${userName}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");

    if (cart.length === 0) {
      alert("Giỏ hàng trống!");
      return;
    }

    document.querySelector(".cart-page").style.display = "none";
    document.querySelector(".checkout-page").style.display = "flex";
    updateDefaultAddress();
    renderCheckoutSummary();
  };

}


function loadCart() {
  renderCart();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cart-items')) loadCart();
  document.querySelector('.btn-continue')?.addEventListener('click', () => {
    switchPage(document.querySelector('[data-page="products"]'), 'products');
  });
});