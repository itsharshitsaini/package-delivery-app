module.exports = class Driver {
    constructor(id) {
        this.id = id;
    }

    async save(db) {
        try {
            const result = await db.execute(`INSERT INTO drivers (id) VALUES (?)`, [this.id]);
            return result;
        } catch (error) {
            throw new Error(`Error saving driver: ${error.message}`);
        }
    }

    static async getFreeDrivers(db) {
        try {
            const result = await db.execute(`SELECT * FROM drivers WHERE status="free"`);
            return result;
        } catch (error) {
            throw new Error(`Error fetching free drivers: ${error.message}`);
        }
    }

    static async setTrackingId(db, tracking_id, driver_id) {
        try {
            const result = await db.execute(`UPDATE drivers SET tracking_id = ? WHERE id = ?`, [tracking_id, driver_id]);
            return result;
        } catch (error) {
            throw new Error(`Error setting tracking ID: ${error.message}`);
        }
    }

    static async setStatus(db, c_status, driver_id) {
        try {
            const result = await db.execute(`UPDATE drivers SET status = ? WHERE id = ?`, [c_status, driver_id]);
            return result;
        } catch (error) {
            throw new Error(`Error setting status: ${error.message}`);
        }
    }

    static async getRecordByTrackingId(db, tracking_id) {
        try {
            const result = await db.execute(`SELECT * FROM drivers WHERE tracking_id = ?`, [tracking_id]);
            return result;
        } catch (error) {
            throw new Error(`Error fetching driver record by tracking ID: ${error.message}`);
        }
    }
};
