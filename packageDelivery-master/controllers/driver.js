const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Product = require('../models/products');
const Driver = require('../models/drivers');

exports.modifyStatus = async (req, res) => {
   try {
      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(token, 'secret');
      const phoneNumber = decodedToken.PhoneNumber;
      const [userData, metaData] = await User.getRecordByPhoneNumber(phoneNumber);
      const user = userData[data.length - 1]; 
      if (user.Designation === 'VERIFIED DRIVER') {
         const driverId = user.id;
         const orderStatus = req.body.update;
         await Product.setStatusById(orderStatus, driverId);
         await Driver.setStatus('free', driverId);
         res.status(200).send('ORDER COMPLETED, PAYMENT PENDING');
      } else {
         res.status(400).send('DRIVER NOT VERIFIED');
      }
   } catch (error) {
      console.error("Error in modifyStatus:", error);
      res.status(500).send("Internal server error");
   }
};

exports.getOrder = async (req, res) => {
   try {
      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(token, 'secret');
      const phoneNumber = decodedToken.PhoneNumber;
      const [userData, metaData] = await User.getRecordByPhoneNumber(phoneNumber);
      const user = userData[data.length - 1];
      if (user.Designation === 'VERIFIED DRIVER') {
         // Retrieve orders associated with the driver
         const [driverOrders, driverOrdersMetaData] = await Product.getRecordByDriverId(user.id);
         res.send(driverOrders);
      } else {
         res.status(400).send('DRIVER NOT VERIFIED');
      }
   } catch (error) {
      console.error("Error in getOrder:", error);
      res.status(500).send("Internal server error");
   }
};
