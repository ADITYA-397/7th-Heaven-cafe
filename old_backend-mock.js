/**
 * Mock Backend Service to simulate Firebase/Real-time DB functionality
 */

const Backend = {
    user: null,

    // Authentication Simulation
    login: function(email, password, callback) {
        setTimeout(() => {
            if(email && password) {
                this.user = { 
                    email: email, 
                    name: email.split('@')[0], 
                    id: Date.now(),
                    age: '',
                    gender: '',
                    address: '',
                    photo: '',
                    userOrders: []
                };
                callback({ success: true, user: this.user });
            } else {
                callback({ success: false, error: 'Invalid credentials' });
            }
        }, 800);
    },

    logout: function(callback) {
        setTimeout(() => {
            this.user = null;
            callback({ success: true });
        }, 400);
    },

    // Profile Management
    updateProfile: function(details, callback) {
        setTimeout(() => {
            if(this.user) {
                this.user = { ...this.user, ...details };
                callback({ success: true, user: this.user });
            } else {
                callback({ success: false, error: 'Not logged in' });
            }
        }, 500);
    },

    // Real-time Delivery Simulation
    placeOrder: function(cartItems, onStatusChange) {
        const orderId = 'ORD-' + Math.floor(Math.random() * 90000 + 10000);
        let statusStages = ['Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];
        let currentStage = 0;
        
        let orderObj = {
            id: orderId,
            date: new Date().toLocaleDateString(),
            items: cartItems,
            status: statusStages[currentStage]
        };
        
        if (this.user) {
            this.user.userOrders.unshift(orderObj); // Add to local history
        }

        // Initial broadcast
        onStatusChange({ id: orderId, status: statusStages[currentStage], items: cartItems, progress: 25 });

        // Simulate real-time updates every 5 seconds
        const interval = setInterval(() => {
            currentStage++;
            if (currentStage >= statusStages.length) {
                clearInterval(interval);
            } else {
                if(this.user) {
                    let o = this.user.userOrders.find(x => x.id === orderId);
                    if(o) o.status = statusStages[currentStage];
                }
                let progress = (currentStage + 1) * 25;
                onStatusChange({ id: orderId, status: statusStages[currentStage], items: cartItems, progress: progress });
            }
        }, 5000);
        
        return orderId;
    }
};

window.Backend = Backend;
