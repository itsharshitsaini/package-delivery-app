
const User = require('../models/user');
const db = require('../util/database');
const jwt = require('jsonwebtoken');
const Product = require('../models/products');
const Driver = require('../models/drivers');
const Coupon = require('../models/coupons');
let plivo = require('plivo');
let client = new plivo.Client();
let SK = "sk_test_51MXNOPSCt2duW6ZAJkbJ42iyqrhZbj7gIvQyjN2pVLh7gvbAXXyigOungR0fHwSstjNKTY83Xpi8IJNxT5DbGtsk00x8m9VWh9"
const stripe = require('stripe')(SK);




exports.getAllProductsList = async (req, res) => {
   try {
      let token = req.headers.authorization;
      token = token.split(' ')[1];
      const decodedToken = jwt.verify(token, 'secret');
      const phone_number = decodedToken.PhoneNumber;
      const [userData] = await User.getRecordByPhoneNumber(phone_number);
      const user = userData[userData.length - 1];
      if (user.Designation === 'VERIFIED ADMIN') {
         const [details] = await Product.fetchAll();
         res.status(200).send(details);
      } else {
         res.send('NOT A VERIFIED ADMIN');
      }
   } catch (err) {
      // Handle errors
      res.status(400).send(`Unable to decode token or ${err}`);
   }
}

function calculateDistance(x1, y1, x2, y2) {
   let y = x2 - x1;
   let x = y2 - y1;
   return Math.sqrt(x * x + y * y);
}
///// SET COST 
exports.modifyProductStatus = async (req, res) => {
   try {
      let token = req.body.token;
      const decodedToken = jwt.verify(token, 'secret');
      const phone_number = decodedToken.PhoneNumber;

      const [userData] = await User.getRecordByPhoneNumber(phone_number);
      const user = userData[userData.length - 1];

      if (user.Designation !== 'VERIFIED ADMIN') {
         return res.status(403).send('Admin not verified');
      }
      const { c_status, order_id } = req.body;
      if (c_status === 'reject') {
         await Product.setStatus(c_status, order_id);
         console.log("Status updated");
         return res.status(200).send('Order rejected');
      }
      if (c_status === 'accept') {
         const [driverData] = await Driver.getFreeDrivers();
         if (driverData.length === 0) {
            return res.status(400).send('No free Drivers');
         }
         let product_location = "30.72464358264908,76.84676889895219";
         const [x1, y1] = product_location.split(',').map(parseFloat);
         let driver_id, distance = Number.MAX_VALUE;
         driverData.forEach(element => {
            const { lat, long } = JSON.parse(element.location);
            const dist = calculateDistance(x1, y1, lat, long);
            if (dist < distance) {
               distance = dist;
               driver_id = element.id;
            }
         });
         const tracking_id = Math.floor(Math.random() * 1000000000);
         await Promise.all([
            Product.setIds(tracking_id, driver_id, order_id),
            Driver.setTrackingId(tracking_id, driver_id),
            Driver.setStatus('OUT', driver_id),
            Product.setStatus('OUT', order_id)
         ]);
         const [productDetails] = await Product.getRecordByOrderId(order_id);
         const detail = productDetails[0];
         let cost = 100 + Number(detail.weight) * (Number(detail.length) + Number(detail.breadth));

         if (detail.coupon) {
            const [couponDetail] = await Coupon.getCoupon(detail.coupon);
            cost = (cost * (100 - Number(couponDetail[0].discount))) / 100;
         }
         await Product.setCost(cost, order_id);
         res.status(200).send(detail.coupon ? "ORDER PLACED coupon used" : "ORDER PLACED");

         client.messages.create({
            src: '+919877319473',
            dst: "+91" + detail.alternate_phone_number,
            text: `Hello, your tracking id is ${detail.tracking_id}. Status has been updated. Please check order status using this.`
         });
      }
   } catch (error) {
      console.log(error);
      res.status(400).send('Error processing the request');
   }
}


// verify if admin 
// check status - > payment pending 
// genrate link 

exports.generateLink = async (req, res) => {
   try {
      let token = req.body.token;
      let order_id = req.body.order_id;

      let decodedToken = jwt.verify(token, 'secret');
      let phone_number = decodedToken.PhoneNumber;

      const [info] = await User.getRecordByPhoneNumber(phone_number);
      const userInfo = info[info.length - 1];

      if (userInfo.Designation !== 'VERIFIED ADMIN') {
         return res.status(403).send('Admin not verified');
      }

      const [productData] = await Product.getRecordByOrderId(order_id);
      const product = productData[0];

      if (product.c_status !== 'payment pending') {
         return res.status(400).send('Order status not payment pending');
      }

      const session = await stripe.checkout.sessions.create({
         payment_method_types: ['card'],
         line_items: [{
            price_data: {
               currency: 'inr',
               product_data: {
                  name: `Tracking ID: ${product.tracking_id}`,
                  description: 'is the cost of Delivery.'
               },
               unit_amount: product.cost * 100,
            },
            quantity: 1
         }],
         phone_number_collection: {
            enabled: true
         },
         mode: 'payment',
         success_url: `http://localhost:3000/s/${product.tracking_id}`,
         cancel_url: 'http://localhost:3000'
      });

      res.status(200).json(session);

      client.messages.create({
         src: '+919877319473',
         dst: "+91" + product.alternate_phone_number,
         text: `Hello, your order with tracking id ${product.tracking_id} payment link is: ${session.url}`
      }).then(function (message_created) {
         console.log(message_created);
      }).catch(err => console.log(err));

   } catch (error) {
      console.log(error);
      res.status(400).send('Error generating payment link');
   }
}


