document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. ORIGINAL UI LOGIC (Nav & Scroll Reveals)
    // ==========================================
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        document.querySelectorAll('.nav-links li a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    const navbar = document.getElementById('navbar');
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    const fadeElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
    const appearOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const delay = entry.target.getAttribute('data-delay');
            if (delay) {
                setTimeout(() => entry.target.classList.add('is-visible'), parseInt(delay));
            } else {
                entry.target.classList.add('is-visible');
            }
            observer.unobserve(entry.target);
        });
    }, appearOptions);
    fadeElements.forEach(el => appearOnScroll.observe(el));

    // ==========================================
    // 2. REAL-TIME MENU & CART LOGIC
    // ==========================================
    let cart = [];
    const cartCountEl = document.getElementById('cart-count');
    const cartItemsWrapper = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('checkout-btn');
    const cartOverlay = document.getElementById('cart-overlay');
    
    // Dynamically inject Add to Cart buttons
    document.querySelectorAll('.menu-list li').forEach(li => {
        const itemName = li.textContent.trim();
        li.innerHTML = `<span>${itemName}</span> <button class="add-cart-btn" data-item="${itemName}">+</button>`;
    });

    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-cart-btn')) {
            const item = e.target.getAttribute('data-item');
            cart.push(item);
            updateCartUI();
        }
    });

    function updateCartUI() {
        cartCountEl.textContent = cart.length;
        if (cart.length === 0) {
            cartItemsWrapper.innerHTML = '<p>Your cart is empty.</p>';
            checkoutBtn.disabled = true;
        } else {
            const counts = {};
            cart.forEach(x => counts[x] = (counts[x] || 0) + 1);
            
            cartItemsWrapper.innerHTML = '';
            for (let item in counts) {
                cartItemsWrapper.innerHTML += `
                    <div class="cart-item">
                        <span>${item}</span>
                        <span>x${counts[item]}</span>
                    </div>
                `;
            }
            
            if(!window.Backend.user) {
                checkoutBtn.textContent = 'Login to Place Order';
                checkoutBtn.disabled = false;
            } else {
                checkoutBtn.textContent = 'Place Order (Real-time)';
                checkoutBtn.disabled = false;
            }
        }
    }

    // Modal / Drawer interactions
    const cartDrawer = document.getElementById('cart-drawer');
    document.getElementById('cart-icon').addEventListener('click', () => {
        updateCartUI();
        cartDrawer.classList.add('active');
        cartOverlay.classList.add('active');
    });
    
    const closeDrawers = () => {
        cartDrawer.classList.remove('active');
        document.getElementById('profile-drawer').classList.remove('active');
        cartOverlay.classList.remove('active');
    };
    document.getElementById('close-cart').addEventListener('click', closeDrawers);
    document.getElementById('close-profile').addEventListener('click', closeDrawers);
    cartOverlay.addEventListener('click', closeDrawers);

    // ==========================================
    // 3. AUTHENTICATION & PROFILE LOGIC
    // ==========================================
    const loginModal = document.getElementById('login-modal');
    const userIcon = document.getElementById('user-icon');
    const nameDisplay = document.getElementById('user-name-display');
    const profileDrawer = document.getElementById('profile-drawer');

    userIcon.addEventListener('click', () => {
        if(!window.Backend.user) {
            loginModal.classList.add('active');
        } else {
            populateProfile();
            profileDrawer.classList.add('active');
            cartOverlay.classList.add('active');
        }
    });

    document.getElementById('close-login').addEventListener('click', () => loginModal.classList.remove('active'));

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        const status = document.getElementById('login-status');
        
        status.textContent = 'Authenticating...';
        
        window.Backend.login(email, pass, (res) => {
            if(res.success) {
                status.textContent = 'Success!';
                nameDisplay.textContent = res.user.name;
                setTimeout(() => {
                    loginModal.classList.remove('active');
                    updateCartUI();
                    status.textContent = '';
                }, 500);
            } else {
                status.textContent = 'Login failed.';
            }
        });
    });

    // Profile Tabs Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-' + btn.getAttribute('data-tab')).classList.add('active');
        });
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        window.Backend.logout(() => {
            nameDisplay.textContent = '';
            closeDrawers();
            updateCartUI();
        });
    });

    // Profile Edit forms
    let tempPhotoData = "";
    document.getElementById('photo-upload').addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            tempPhotoData = URL.createObjectURL(file);
            document.getElementById('profile-avatar-img').src = tempPhotoData;
        }
    });

    document.getElementById('profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const details = {
            name: document.getElementById('profile-name').value,
            age: document.getElementById('profile-age').value,
            gender: document.getElementById('profile-gender').value,
            address: document.getElementById('profile-address').value,
            photo: tempPhotoData
        };
        const status = document.getElementById('profile-status');
        status.textContent = "Saving...";
        
        window.Backend.updateProfile(details, (res) => {
            if(res.success) {
                status.textContent = "Profile Saved!";
                nameDisplay.textContent = res.user.name; // update nav bar
                setTimeout(() => { status.textContent = ""; }, 2000);
            }
        });
    });

    function populateProfile() {
        const u = window.Backend.user;
        if(!u) return;
        
        // Form details
        document.getElementById('profile-name').value = u.name || '';
        document.getElementById('profile-age').value = u.age || '';
        document.getElementById('profile-gender').value = u.gender || '';
        document.getElementById('profile-address').value = u.address || '';
        if(u.photo) {
            document.getElementById('profile-avatar-img').src = u.photo;
            tempPhotoData = u.photo;
        }
        
        // Order History
        const orderList = document.getElementById('order-history-list');
        if (u.userOrders.length === 0) {
            orderList.innerHTML = '<p style="text-align:center; color:#999; margin-top: 2rem;">No previous orders found.</p>';
        } else {
            orderList.innerHTML = '';
            u.userOrders.forEach(o => {
                const counts = {};
                o.items.forEach(x => counts[x] = (counts[x] || 0) + 1);
                let itemsText = Object.entries(counts).map(([k,v]) => `${k} x${v}`).join(', ');
                
                orderList.innerHTML += `
                    <div class="order-history-card">
                        <div class="order-history-header">
                            <span>${o.id}</span>
                            <span class="order-history-badge">${o.status}</span>
                        </div>
                        <div style="font-size:0.8rem; color:#888;">${o.date}</div>
                        <div class="order-history-items">${itemsText}</div>
                    </div>
                `;
            });
        }
    }

    // ==========================================
    // 4. REAL-TIME DELIVERY TRACKER
    // ==========================================
    const trackerModal = document.getElementById('tracker-modal');
    const trackerFill = document.getElementById('tracker-fill');
    const trackerText = document.getElementById('tracker-status-text');
    const trackerOrderId = document.getElementById('tracker-order-id');

    document.getElementById('close-tracker').addEventListener('click', () => trackerModal.classList.remove('active'));

    checkoutBtn.addEventListener('click', () => {
        if(!window.Backend.user) {
            closeDrawers();
            loginModal.classList.add('active');
            return;
        }

        if(cart.length === 0) return;

        checkoutBtn.textContent = 'Processing...';
        checkoutBtn.disabled = true;

        window.Backend.placeOrder([...cart], (statusUpdate) => {
            trackerOrderId.textContent = `Order ID: ${statusUpdate.id}`;
            trackerText.textContent = statusUpdate.status;
            trackerFill.style.width = statusUpdate.progress + '%';
            
            if(statusUpdate.progress >= 100) {
                trackerText.classList.remove('status-pulse');
                trackerText.textContent = "Delivered! Enjoy your meal.";
            } else {
                trackerText.classList.add('status-pulse');
            }
        });

        setTimeout(() => {
            cart = [];
            updateCartUI();
            closeDrawers();
            trackerModal.classList.add('active');
        }, 1000);
    });

});
