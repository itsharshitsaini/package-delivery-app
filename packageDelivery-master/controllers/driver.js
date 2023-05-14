// confirm if verifed driver
// product table c_status update ==> payment pending 
// driver status status =>free 
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Product = require('../models/products');
const Driver = require('../models/drivers');

//// either payment pending or failed
exports.modifyStatus = (req,res)=>{
    let token = req.headers.authorization;
    token = token.split(' ')[1];
 // console.log(token);
    let decodedToken;
    try{
       
       decodedToken = jwt.verify(token,'secret');
    }
       catch (err){
             res.statusCode = 400;
             res.send(`UNABLE TO DECODE TOKEN or ${err}`);
          }
//  console.log(decodedToken);
       let phone_number = decodedToken.PhoneNumber;

    //    console.log(phone_number);
 
       User.getRecordByPhoneNumber(phone_number)
              .then(([data,metaData])=>{
                 data = data[data.length-1]; // getting object 
                 if (data.Designation === 'VERIFIED DRIVER'){
                    let driver_id = data.id;

                    let order_status = req.body.update;
                        Product.setStatusById(order_status,driver_id)
                        .then(()=>{

                        Driver.setStatus('free',driver_id)
                        .then(()=>res.status(200).send('ORDER COMPLETED PAYMENT PENDING'))
                        .catch((err)=>{res.status(400).send(err);})    
                    })
                        .catch((err)=>{res.status(400).send(err);})

                 }
                 else{
                    res.status(400).send('DRIVER NOT VERIFIED');
                 }
                })
                .catch((err)=>res.send(err))


}

/// 
exports.getOrder = (req,res)=>{
   let token = req.headers.authorization;
   token = token.split(' ')[1];
// console.log(token);
   let decodedToken;
   try{
      
      decodedToken = jwt.verify(token,'secret');
   }
      catch (err){
            res.statusCode = 400;
            res.send(`UNABLE TO DECODE TOKEN or ${err}`);
         }
//  console.log(decodedToken);
      let phone_number = decodedToken.PhoneNumber;

   //    console.log(phone_number);

      User.getRecordByPhoneNumber(phone_number)
             .then(([data,metaData])=>{
                data = data[data.length-1]; // getting object 
                if (data.Designation === 'VERIFIED DRIVER'){
                  // console.log(data);
                  let driver_id = data.id;
                  Product.getRecordByDriverId(driver_id)
                  .then(([info,mf])=>{
                     res.send(info)
                  })
                  .catch((err)=>{res.send(`cant reach db or ${err}`)})
                }
                else {
                  res.status(400).send('DRIVER NOT VERIFIED')
                }
               })
               .catch((err)=>{
                  res.send(`cant get record from user DB or ${err}`)
               })
}