const db = require('../util/database');

module.exports = class Driver {
    constructor(id){
        this.id = id;
    }
    // return db.execute('INSERT INTO products (type,weight,length,breadth,picture,pickup_address,drop_address,alternate_phone_number,c_status,customer_id) VALUES (?, ?, ?, ? , ? ,? ,? ,?,?,?)',

    save(){
        // console.log('herer');
        return db.execute(`INSERT INTO drivers (id) VALUES ('${this.id}')`)
    }

    static getFreeDrivers(){
        return db.execute(`SELECT * FROM drivers WHERE status="free"`);
    }
    // UPDATE products ,driver_id = "${driver_id}" WHERE id=${order_id}
    static setTrackingId(tracking_id,driver_id){
        return db.execute(`UPDATE drivers SET  tracking_id = "${tracking_id}" WHERE id=${driver_id}`)
    }

    static setStatus (c_status,driver_id){
        console.log(driver_id);
        // console.log(`UPDATE drivers SET status = "${c_status}" WHERE id=${tracking_id}`);
        return db.execute(`UPDATE drivers SET status = "${c_status}" WHERE id=${driver_id}`)
    }

    static getRecordByTrackingId(tracking_id){
        return db.execute(`SELECT * FROM drivers WHERE tracking_id=${tracking_id}`)
    }
    }