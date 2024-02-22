const db = require('../util/database');

module.exports = class Product {
    constructor(id, type, weight, length, breadth, picture, pickup_address, drop_address, alternate_phone_number, c_status, customer_id, coupon) {
        this.id = id;
        this.type = type;
        this.weight = weight;
        this.length = length;
        this.breadth = breadth;
        this.picture = picture;
        this.pickup_address = pickup_address;
        this.drop_address = drop_address;
        this.alternate_phone_number = alternate_phone_number;
        this.c_status = c_status;
        this.customer_id = customer_id;
        this.coupon = coupon;
    }

    static async fetchAll() {
        try {
            return await db.execute('SELECT * FROM products');
        } catch (error) {
            throw new Error(`Error fetching all products: ${error.message}`);
        }
    }
    async save() {
        try {
            await db.execute('INSERT INTO products (type, weight, length, breadth, picture, pickup_address, drop_address, alternate_phone_number, c_status, customer_id, coupon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [this.type, this.weight, this.length, this.breadth, this.picture, this.pickup_address, this.drop_address, this.alternate_phone_number, this.c_status, this.customer_id, this.coupon]);
        } catch (error) {
            throw new Error(`Error saving product: ${error.message}`);
        }
    }

    static async getRecordByCustomerId(id) {
        try {
            return await db.execute('SELECT * FROM products WHERE customer_id = ?', [id]);
        } catch (error) {
            throw new Error(`Error fetching products by customer ID: ${error.message}`);
        }
    }
    static async setStatus(c_status, order_id) {
        try {
            await db.execute('UPDATE products SET c_status = ? WHERE id = ?', [c_status, order_id]);
        } catch (error) {
            throw new Error(`Error setting status: ${error.message}`);
        }
    }

    static async setIds(tracking_id, driver_id, order_id) {
        try {
            await db.execute('UPDATE products SET tracking_id = ?, driver_id = ? WHERE id = ?', [tracking_id, driver_id, order_id]);
        } catch (error) {
            throw new Error(`Error setting IDs: ${error.message}`);
        }
    }


    static async setStatusById(c_status, driver_id) {
        try {
            await db.execute('UPDATE products SET c_status = ? WHERE driver_id = ? AND c_status = ?', [c_status, driver_id, 'OUT']);
        } catch (error) {
            throw new Error(`Error setting status by driver ID: ${error.message}`);
        }
    }

    static async setCost(cost, order_id) {
        try {
            await db.execute('UPDATE products SET cost = ? WHERE id = ?', [cost, order_id]);
        } catch (error) {
            throw new Error(`Error setting cost: ${error.message}`);
        }
    }

    static async setPoints(tracking_id, points) {
        try {
            await db.execute('UPDATE products SET review = ? WHERE tracking_id = ?', [points, tracking_id]);
        } catch (error) {
            throw new Error(`Error setting points: ${error.message}`);
        }
    }

    static async getRecordByTrackingId(tracking_id) {
        try {
            return await db.execute('SELECT * FROM products WHERE tracking_id = ?', [tracking_id]);
        } catch (error) {
            throw new Error(`Error fetching record by tracking ID: ${error.message}`);
        }
    }

    static async getRecordByOrderId(order_id) {
        try {
            return await db.execute('SELECT * FROM products WHERE id = ?', [order_id]);
        } catch (error) {
            throw new Error(`Error fetching record by order ID: ${error.message}`);
        }
    }

    static async getRecordByDriverId(driver_id) {
        try {
            return await db.execute('SELECT * FROM products WHERE driver_id = ? AND c_status = ?', [driver_id, 'OUT']);
        } catch (error) {
            throw new Error(`Error fetching record by driver ID: ${error.message}`);
        }
    }

    static async setStatusByTrackingId(tracking_id) {
        try {
            await db.execute('UPDATE products SET c_status = ? WHERE tracking_id = ?', ['completed', tracking_id]);
        } catch (error) {
            throw new Error(`Error setting status by tracking ID: ${error.message}`);
        }
    }
}