import React, { useState } from 'react';
import './foodmart.css'; // Your CSS file

const INITIAL_FOODS = [
  { id: 1, name: "Jollof Rice", desc: "Party-style smoky jollof rice with rich tomato base", price: 1800, oldPrice: 2200, discount: 18, cat: "rice", hot: true, img: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&q=80" },
  { id: 2, name: "Fried Rice & Chicken", desc: "Nigerian fried rice with grilled chicken and coleslaw", price: 2500, oldPrice: 3000, discount: 17, cat: "rice", hot: false, img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80" },
  { id: 3, name: "Egusi Soup", desc: "Rich egusi soup with stockfish and assorted meat", price: 3200, oldPrice: null, discount: null, cat: "soup", hot: true, img: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&q=80" },
  { id: 4, name: "Puff Puff (10pcs)", desc: "Fresh, hot and fluffy Nigerian puff puff snack", price: 600, oldPrice: 800, discount: 25, cat: "snack", hot: false, img: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80" },
  { id: 5, name: "Chapman Drink", desc: "Chilled Nigerian Chapman mocktail with fruit garnish", price: 900, oldPrice: 1100, discount: 18, cat: "drink", hot: false, img: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80" },
  { id: 6, name: "Grilled Chicken", desc: "Juicy suya-spiced grilled chicken with pepper sauce", price: 3500, oldPrice: null, discount: null, cat: "protein", hot: true, img: "https://images.unsplash.com/photo-1598103442097-8b74394b95c1?w=400&q=80" },
  { id: 7, name: "Amala & Ewedu", desc: "Smooth amala served with ewedu and gbegiri soup", price: 1500, oldPrice: 1800, discount: 17, cat: "swallow", hot: false, img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80" },
  { id: 8, name: "Meat Pie", desc: "Golden flaky pastry filled with spiced minced meat", price: 500, oldPrice: 650, discount: 23, cat: "snack", hot: false, img: "https://images.unsplash.com/photo-1621510456681-2330135e5871?w=400&q=80" },
  { id: 9, name: "Ofe Onugbu", desc: "Bitter leaf soup with ofe akwu and assorted protein", price: 2800, oldPrice: null, discount: null, cat: "soup", hot: false, img: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80" },
  { id: 10, name: "Zobo Drink", desc: "Hibiscus zobo drink chilled with ginger & pineapple", price: 700, oldPrice: 900, discount: 22, cat: "drink", hot: true, img: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&q=80" },
  { id: 11, name: "Turkey Laps", desc: "Roasted turkey laps marinated in Nigerian spices", price: 4500, oldPrice: 5000, discount: 10, cat: "protein", hot: true, img: "https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=400&q=80" },
  { id: 12, name: "Eba & Okra", desc: "Fresh okra soup served with hot eba swallow", price: 1200, oldPrice: null, discount: null, cat: "swallow", hot: false, img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80" },
];

const API_BASE_URL = "http://127.0.0.1:8000";

function App() {
  const [foods] = useState(INITIAL_FOODS);
  const [cart, setCart] = useState([]);
  const [currentCat, setCurrentCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // AI Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your FoodMart assistant. Ask me anything about prices, menu items, or our store locations!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const fmt = (n) => '₦' + n.toLocaleString();

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const addToCart = (food) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === food.id);
      if (existing) {
        return prev.map(item => item.id === food.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...food, qty: 1 }];
    });
    showToast(`✅ ${food.name} added to cart`);
  };

  const changeQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalCartPrice = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
  const totalCartCount = cart.reduce((acc, curr) => acc + curr.qty, 0);

  const filteredFoods = foods.filter(f => {
    const matchCat = currentCat === 'all' || f.cat === currentCat;
    const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handlePlaceOrder = () => {
    if (!fullName || !phone || !address) {
      showToast('⚠️ Please fill all fields!');
      return;
    }

    const orderLines = cart.map(c => `${c.name} x${c.qty} = ${fmt(c.price * c.qty)}`).join('\n');
    const emailBody = `New Order from FoodMart!\n\nCustomer: ${fullName}\nPhone: ${phone}\nAddress: ${address}\n\nOrder:\n${orderLines}\n\nTotal: ${fmt(totalCartPrice)}`;

    window.location.href = `mailto:olajide@gmail.com?subject=New FoodMart Order&body=${encodeURIComponent(emailBody)}`;

    setIsSuccess(true);
    setCart([]);
  };

  // AI Chat Assistant Handler
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });

      const data = await response.json();
      setChatMessages(prev => [...prev, { sender: 'ai', text: data.reply || "Sorry, I couldn't process that request." }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: "⚠️ Unable to connect to FoodMart AI assistant." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <header>
        <div className="header-inner">
          <div className="logo">Food<span>Mart</span></div>
          <div className="search">
            <input
              type="text"
              placeholder="Search for food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button>🔍</button>
          </div>
          <button className="cart-toggle" onClick={() => setIsCartOpen(!isCartOpen)}>
            🛒 Cart <span className="cart-count">{totalCartCount}</span>
          </button>
        </div>
      </header>

      {/* HERO */}
      <div className="hero">
        <div className="hero-inner">
          <h1>Delicious Food,<br /><em>Delivered Fresh</em></h1>
          <p>Order from our wide selection of meals and groceries</p>
          <div className="hero-pill">🚀 Free delivery on orders over ₦5,000</div>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="categories">
        {['all', 'rice', 'soup', 'snack', 'drink', 'protein', 'swallow'].map(cat => (
          <button
            key={cat}
            className={`cat-btn ${currentCat === cat ? 'active' : ''}`}
            onClick={() => setCurrentCat(cat)}
          >
            {cat === 'all' && 'All'}
            {cat === 'rice' && '🍚 Rice'}
            {cat === 'soup' && '🍲 Soups'}
            {cat === 'snack' && '🥪 Snacks'}
            {cat === 'drink' && '🥤 Drinks'}
            {cat === 'protein' && '🍗 Protein'}
            {cat === 'swallow' && '🫓 Swallow'}
          </button>
        ))}
      </div>

      {/* MAIN FOOD GRID */}
      <div className="main">
        <div className="section-label">Today's Menu</div>
        {filteredFoods.length === 0 ? (
          <p style={{ color: 'var(--gray)', textAlign: 'center', padding: '40px 0' }}>No items found.</p>
        ) : (
          <div className="grid">
            {filteredFoods.map(f => (
              <div key={f.id} className="card" onClick={() => addToCart(f)}>
                <div className="card-img">
                  <img src={f.img} alt={f.name} loading="lazy" />
                  {f.discount && <div className="badge-discount">-{f.discount}%</div>}
                  {f.hot && <div className="badge-hot">🔥 HOT</div>}
                </div>
                <div className="card-body">
                  <div className="card-name">{f.name}</div>
                  <div className="card-desc">{f.desc}</div>
                  <div className="price-row">
                    <span className="price">{fmt(f.price)}</span>
                    {f.oldPrice && <span className="price-old">{fmt(f.oldPrice)}</span>}
                  </div>
                  <button
                    className="add-btn"
                    onClick={(e) => { e.stopPropagation(); addToCart(f); }}
                  >
                    + Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SIDEBAR CART */}
      <div className={`overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="sidebar-head">
          <h2>🛒 Your Cart</h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>✕</button>
        </div>
        <div className="cart-list">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="icon">🛍️</div>
              <p>Your cart is empty.<br />Add some delicious food!</p>
            </div>
          ) : (
            cart.map(c => (
              <div key={c.id} className="cart-item">
                <img src={c.img} alt={c.name} />
                <div className="item-info">
                  <div className="item-name">{c.name}</div>
                  <div className="item-price">{fmt(c.price)}</div>
                  <div className="qty-row">
                    <button className="qty-btn" onClick={() => changeQty(c.id, -1)}>−</button>
                    <span className="qty-num">{c.qty}</span>
                    <button className="qty-btn" onClick={() => changeQty(c.id, 1)}>+</button>
                  </div>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(c.id)}>🗑</button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="total-row">
              <span className="total-label">Total</span>
              <span className="total-price">{fmt(totalCartPrice)}</span>
            </div>
            <button className="checkout-btn" onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); setIsSuccess(false); }}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>

      {/* CHECKOUT MODAL */}
      <div className={`modal-overlay ${isCheckoutOpen ? 'open' : ''}`}>
        <div className="modal">
          {!isSuccess ? (
            <div>
              <h2>Complete Order</h2>
              <p className="modal-sub">Fill in your delivery details below</p>
              <div className="order-summary">
                <h3>Order Summary</h3>
                {cart.map(c => (
                  <div key={c.id} className="summary-item">
                    <span>{c.name} x{c.qty}</span>
                    <span>{fmt(c.price * c.qty)}</span>
                  </div>
                ))}
                <div className="summary-total">
                  <span>Total</span>
                  <span>{fmt(totalCartPrice)}</span>
                </div>
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="e.g. Adebayo Johnson" value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="e.g. 08012345678" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Delivery Address</label>
                <textarea placeholder="Enter your full delivery address..." value={address} onChange={e => setAddress(e.target.value)}></textarea>
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setIsCheckoutOpen(false)}>Cancel</button>
                <button className="place-btn" onClick={handlePlaceOrder}>🎉 Place Order</button>
              </div>
            </div>
          ) : (
            <div className="success-screen">
              <div className="success-icon">🎉</div>
              <h2>Order Placed!</h2>
              <p>Your order has been received and a confirmation has been sent. We'll deliver shortly!</p>
              <button className="success-btn" onClick={() => setIsCheckoutOpen(false)}>Continue Shopping</button>
            </div>
          )}
        </div>
      </div>

      {/* AI CHATBOT WIDGET */}
      <button
        style={{
          position: 'fixed', bottom: '20px', right: '20px',
          backgroundColor: 'var(--orange)', color: '#fff', border: 'none',
          borderRadius: '50%', width: '56px', height: '56px', fontSize: '1.5rem',
          cursor: 'pointer', zIndex: 150, boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        💬
      </button>

      {isChatOpen && (
        <div style={{
          position: 'fixed', bottom: '85px', right: '20px', width: '320px', height: '400px',
          backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column', zIndex: 150, border: '1px solid var(--border)'
        }}>
          <div style={{ backgroundColor: 'var(--charcoal)', color: '#fff', padding: '12px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', fontWeight: 'bold' }}>
            🤖 FoodMart AI Assistant
          </div>
          <div style={{ flex: 1, padding: '10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.sender === 'user' ? 'var(--orange)' : '#f0f0f0',
                color: msg.sender === 'user' ? '#fff' : '#333',
                padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', maxWidth: '80%'
              }}>
                {msg.text}
              </div>
            ))}
            {chatLoading && <div style={{ fontSize: '0.8rem', color: '#888' }}>AI is thinking...</div>}
          </div>
          <form onSubmit={handleSendChatMessage} style={{ display: 'flex', padding: '8px', borderTop: '1px solid var(--border)' }}>
            <input
              type="text"
              placeholder="Ask prices, location..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{ flex: 1, padding: '6px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none' }}
            />
            <button type="submit" style={{ backgroundColor: 'var(--orange)', color: '#fff', border: 'none', padding: '6px 12px', marginLeft: '6px', borderRadius: '4px', cursor: 'pointer' }}>Send</button>
          </form>
        </div>
      )}

      {/* TOAST */}
      <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
    </div>
  );
}

export default App;

