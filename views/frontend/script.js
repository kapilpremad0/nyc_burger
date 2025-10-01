
function showSuccessToast(message) {

    Toastify({
        text: message,
        className: "success",
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        }
    }).showToast();

}

function showErrorToast(message) {

    Toastify({
        text: message,
        className: "success",
        style: {
            background: "linear-gradient(to right, #b73b3c, #b73b3c)",
        }
    }).showToast();

}

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("active");
}

function toggleCart() {
    document.getElementById("cartPanel").classList.toggle("active");
}


const mobileInput = document.getElementById('customerMobile');
const nameInput = document.getElementById('customerName');

mobileInput.addEventListener('input', () => {
    // Remove non-digit characters
    mobileInput.value = mobileInput.value.replace(/\D/g, '');

    // Limit to 10 digits
    if (mobileInput.value.length > 10) {
        mobileInput.value = mobileInput.value.slice(0, 10);
    }

    // If 10 digits, fetch customer name
    if (mobileInput.value.length === 10) {
        const mobile = mobileInput.value;

        fetch(`/customers/search?mobile=${mobile}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.name) {
                    nameInput.value = data.name;
                } else {
                    nameInput.value = '';
                }
            })
            .catch(err => console.error(err));
    } else {
        nameInput.value = '';
    }
});


    let MENU = [];
    let cart = {};
    let appliedCoupon = null; // store applied coupon info


    async function fetchMenu() {
      try {
        const res = await fetch("/menu"); // 👈 Your backend route
        MENU = await res.json();
        renderCategories();
        renderProducts();
        renderCart();
      } catch (err) {
        console.error("Error fetching menu:", err);
      }
    }

    fetchMenu();




    // DOM refs
    const categoriesList = document.getElementById('categoriesList');
    const productsArea = document.getElementById('productsArea');
    const catSearch = document.getElementById('catSearch');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartBtn = document.getElementById('cartBtn');


    // render categories
    function renderCategories(filter = '') {
      categoriesList.innerHTML = '';
      MENU.filter(c => c.title.toLowerCase().includes(filter.toLowerCase()))
        .forEach((cat, idx) => {
          const el = document.createElement('div');
          el.className = 'category' + (idx === 0 ? ' active' : '');
          el.dataset.id = cat.id;
          el.innerHTML = `<img src="/uploads/${cat.img}"/><div><h4>${cat.title}</h4><p>${cat.subtitle}</p></div>`;
          el.onclick = () => {
            scrollToCategory(cat.id);
            setActiveCategory(cat.id);
          }
          categoriesList.appendChild(el);
        });
    }

    // render products
    function renderProducts() {
      productsArea.innerHTML = '';
      MENU.forEach(cat => {
        const sec = document.createElement('section');
        sec.className = 'category-section';
        sec.id = 'section-' + cat.id;
        sec.innerHTML = `<div class="category-title"><h3>${cat.title}</h3></div>`;
        const grid = document.createElement('div');
        grid.className = 'grid';
        cat.items.forEach(item => {
          const card = document.createElement('article');
          card.className = 'card';
          card.innerHTML = `
        <img src="/uploads/${item.img}">
        <div class="info"><h4>${item.name}</h4><div style="font-size:13px;color:var(--muted)">${item.desc}</div></div>
        <div class="actions"><div class="price">₹${item.price}</div>
        <button class="btn" onclick='addToCart("${item.id}")'>Add</button></div>`;
          grid.appendChild(card);
        });
        sec.appendChild(grid);
        productsArea.appendChild(sec);
      });
    }

    // cart functions
    function addToCart(id) {
      let item;
      MENU.forEach(cat => {
        cat.items.forEach(i => {
          if (i.id === id) item = i
        })
      });
      if (!item) return;
      if (cart[id]) cart[id].qty++;
      else cart[id] = {
        ...item,
        qty: 1
      };
      renderCart();
    }

    function changeQty(id, delta) {
      if (cart[id]) {
        cart[id].qty += delta;
        if (cart[id].qty <= 0) delete cart[id];
      }
      renderCart();
    }

    function renderCart() {
      cartItems.innerHTML = '';
      let total = 0,
        count = 0;

      Object.values(cart).forEach(it => {
        total += it.price * it.qty;
        count += it.qty;
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
      <div class="cart-item-name">${it.name}</div>
      <div class="cart-item-qty">
        <button onclick='changeQty("${it.id}",-1)'>-</button>
        <span>${it.qty}</span>
        <button onclick='changeQty("${it.id}",1)'>+</button>
      </div>
      <div>₹${it.price * it.qty}</div>`;
        cartItems.appendChild(row);
      });

      let finalTotal = total;

      if (appliedCoupon) {
        finalTotal = total - appliedCoupon.discount;
        const couponRow = document.createElement('div');
        couponRow.style.fontSize = "14px";
        couponRow.style.color = "green";
        couponRow.style.marginTop = "6px";
        couponRow.innerHTML = `
      Coupon (${appliedCoupon.code}) applied: -₹${appliedCoupon.discount} 
      <button style="margin-left:10px;padding:2px 6px;font-size:12px;" onclick="removeCoupon()">Remove</button>
    `;
        cartItems.appendChild(couponRow);
      }

      cartTotal.textContent = 'Total: ₹' + finalTotal;
      cartBtn.textContent = 'View Cart (' + count + ')';
    }



    // helpers
    function setActiveCategory(id) {
      document.querySelectorAll('.category').forEach(el => el.classList.toggle('active', el.dataset.id === id));
    }

    function scrollToCategory(id) {
      document.getElementById('section-' + id)?.scrollIntoView({
        behavior: 'smooth'
      });
    }

    catSearch.oninput = e => renderCategories(e.target.value);

    // init
    renderCategories();
    renderProducts();
    renderCart();
  
    function removeCoupon() {
      appliedCoupon = null;
      couponInput.value = "";
      renderCart();
      // alert("Coupon removed");
    }



    const couponInput = document.getElementById("couponInput");

    async function applyCoupon() {
      const code = couponInput.value.trim();
      if (!code) return alert("Please enter a coupon code");

      const cartTotalValue = Object.values(cart).reduce((sum, item) => sum + item.price * item.qty, 0);

      try {
        const res = await fetch("/apply-coupon", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            code,
            cartTotal: cartTotalValue
          })
        });
        const data = await res.json();

        if (data.success) {
          appliedCoupon = {
            code: code,
            discount: data.discount
          };
          renderCart(); // re-render cart to show coupon
          // alert(`Coupon applied! Discount: ₹${data.discount}`);
        } else {
          alert(data.message || "Invalid coupon");
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong while applying coupon");
      }
    }
 
    async function checkout() {
      if (Object.keys(cart).length === 0) return showErrorToast('Your cart is empty');

      const customerName = document.querySelector('[name="customer_name"]').value.trim();
      const customerMobile = document.querySelector('[name="customer_mobile"]').value.trim();
      const orderType = document.getElementById("orderType").value;
      const paymentMethod = document.getElementById("paymentMethod").value;

      if (!customerName) return showErrorToast('Please enter customer name');

      // Prepare order data
      const orderData = {
        cart: Object.values(cart),
        customerName,
        customerMobile,
        orderType,
        paymentMethod,
        coupon: appliedCoupon ? appliedCoupon.code : null
      };

      try {
        $('#form-loader').show();
        const res = await fetch("/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(orderData)
        });

        const data = await res.json();

        if (data.success) {
          // alert("Order placed successfully! Order ID: " + data.orderId);
          cart = {};
          appliedCoupon = null;
          couponInput.value = "";
          renderCart();

          const order = data.order;
          let orderId = order.orderId;
          
          if (order.paymentMethod == 'online') {
            payOnline(order.orderId, order.totalAmount, order.customerName, order.customerMobile);
          }else{
             window.location.href = `/invoice/${orderId}`;
             $('#form-loader').hide();
          }
         

        } else {
          $('#form-loader').hide();
          showErrorToast("Checkout failed: " + data.message)
        }
      } catch (err) {
        console.error(err);
         showErrorToast("Something went wrong during checkout")
      }
    }
