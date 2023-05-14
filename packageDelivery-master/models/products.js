const db = require('../util/database');

module.exports = class Product {
//     type, weight, length, breadth, picture, pickup_address,
// drop_address, alternate_phone_number.
    constructor(id,type,weight,length,breadth,picture,pickup_address,drop_address,alternate_phone_number,c_status,customer_id,coupon){
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

    static fetchAll(){
        return db.execute('SELECT * FROM products');
    }

    save(){
// console.log(this.type,this.weight,this.length,this.breadth,this.picture,this.pickup_address,this.drop_address,this.alternate_phone_number,this.c_status,this.customer_id);
// console.log();
        return db.execute('INSERT INTO products (type,weight,length,breadth,picture,pickup_address,drop_address,alternate_phone_number,c_status,customer_id,coupon) VALUES (?, ?, ?, ? , ? ,? ,? ,?,?,?,?)',
        [ this.type,
            this.weight,
            this.length,
            this.breadth,
            this.picture,
            this.pickup_address,
            this.drop_address,
            this.alternate_phone_number,
            this.c_status,
            this.customer_id,
            this.coupon 
        ]);
    }

    static getRecordByCustomerId( id ){
        return db.execute(`SELECT * FROM products WHERE customer_id = ${id}` )
        // number = number.toInt();
    }

//     UPDATE Customers
// SET ContactName = 'Alfred Schmidt', City= 'Frankfurt'
// WHERE CustomerID = 1;

    static setStatus (c_status,order_id){
        return db.execute(`UPDATE products SET c_status = "${c_status}" WHERE id=${order_id}`)
    }

    static setIds(tracking_id,driver_id,order_id){
        return db.execute(`UPDATE products SET  tracking_id = "${tracking_id}",driver_id = "${driver_id}" WHERE id=${order_id}`)
    }

    static setStatusById (c_status,driver_id){
        // console.log(`UPDATE products SET c_status = "${c_status}" WHERE id=${driver_id}`);
        return db.execute(`UPDATE products SET c_status = "${c_status}" WHERE driver_id=${driver_id} AND c_status = 'OUT'`);
    }

    static setCost (cost,order_id){
        return db.execute(`UPDATE products SET cost = ${cost} WHERE id=${order_id}`)
    }

    static setPoints(tracking_id,points){
        return db.execute(`UPDATE products SET review = ${points} WHERE tracking_id=${tracking_id}`)
    }
    static getRecordByTrackingId(tracking_id){
        return db.execute(`SELECT * FROM products WHERE tracking_id = ${tracking_id}`)
    }

    static getRecordByOrderId(order_id){
        return db.execute(`SELECT * FROM products WHERE id = ${order_id}`)
    }

    static getRecordByDriverId(driver_id){
        return db.execute(`SELECT * FROM products WHERE driver_id = ${driver_id} AND c_status = 'OUT'`)
    }

    static setStatusByTrackingId(tracking_id){
        return db.execute(`UPDATE products SET c_status = 'completed' WHERE tracking_id=${tracking_id}`)
    }
}