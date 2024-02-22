const db = require('../util/database');

module.exports = class Coupons {
    constructor(id) {
        this.id = id;
    }

    static async getCoupon(coupon) {
        try {
            const result = await db.execute(`SELECT discount FROM coupons WHERE coupon = ?`, [coupon]);
            return result;
        } catch (error) {
            throw new Error(`Error fetching coupon: ${error.message}`);
        }
    }
};