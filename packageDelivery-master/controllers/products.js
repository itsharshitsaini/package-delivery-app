const jwt = require('jsonwebtoken');
const Users = require('../models/user');
const Product = require('../models/products');
const Driver = require('../models/drivers');
let plivo = require('plivo');
let client = new plivo.Client();

exports.addProduct = async (req, res) => {
   try {
      const token = req.body.token;
      const decodedToken = jwt.verify(token, 'secret');
      const phoneNumber = decodedToken.PhoneNumber;
      const [userData, metaData] = await Users.getRecordByPhoneNumber(phoneNumber);
      const user = userData[data.length - 1];

      if (user.Designation === 'VERIFIED USER') {
         const status = "pending";
         const customerId = user.id;
         const product = new Product(
            null,
            req.body.type,
            req.body.weight,
            req.body.length,
            req.body.breadth,
            req.body.picture,
            req.body.pickup_address,
            req.body.drop_address,
            req.body.alternate_phone_number,
            status,
            customerId,
            req.body.coupon
         );
         await product.save();
         res.status(200).send('ORDER PLACED');
      } else {
         res.status(400).send('USER NOT VERIFIED');
      }
   } catch (error) {
      console.error("Error in addProduct:", error);
      res.status(400).send('UNABLE TO ADD PARCEL');
   }
};

exports.getOrdersList = async (req, res) => {
   try {
      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(token, 'secret');
      const phoneNumber = decodedToken.PhoneNumber;
      const [userData, metaData] = await Users.getRecordByPhoneNumber(phoneNumber);
      const user = userData[data.length - 1];
      if (user.Designation === 'VERIFIED USER') {
         const customerId = user.id;
         const [customerOrders, customerOrdersMetaData] = await Product.getRecordByCustomerId(customerId);
         res.status(200).send(customerOrders);
      } else {
         res.status(400).send('USER NOT VERIFIED');
      }
   } catch (error) {
      console.error("Error in getOrdersList:", error);
      res.status(400).send('UNABLE TO GET DETAILS');
   }
};

exports.getLocation = async (req, res) => {
   try {
      const trackingId = req.body.tracking_id;
      const [driverData, metaData] = await Driver.getRecordByTrackingId(trackingId);
      res.status(200).send(driverData);
   } catch (error) {
      console.error("Error in getLocation:", error);
      res.status(500).send("Internal server error");
   }
};

exports.postFeedback = async (req, res) => {
   try {
      const trackingId = req.body.tracking_id;
      const points = req.body.points;
      const [productData, metaData] = await Product.getRecordByTrackingId(trackingId);
      const product = productData[productData.length - 1];

      if (product.c_status === 'completed') {
         await Product.setPoints(trackingId, points);
         const phone = product.alternate_phone_number;
         await client.messages.create({
            src: '+919877319473',
            dst: "+91" + phone,
            text: `THANKS FOR USING OUR SERVICE`
         });
         res.status(200).send('Feedback done');
      }
      else {
         res.status(400).send("Order not completed");
      }
   } catch (error) {
      console.error("Error in postFeedback:", error);
      res.status(500).send("Internal server error");
   }
};