const db = require('../util/database');
const jwt = require('jsonwebtoken');
const Users = require('../models/user');
const Product = require('../models/products');
const Driver = require('../models/drivers');



let plivo = require('plivo');
let client = new plivo.Client();

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJQaG9uZU51bWJlciI6OTQxNzAwODUzOCwiaWF0IjoxNjc1MTYwMjQ0LCJleHAiOjE2NzUxOTI2NDR9.QMRrGi2Oimkf-B5K350Lb4a02n0kHXcivoBLHc6sbWU

exports.addProduct= (req,res)=>{
    //////// check user is verified by getting phone number and then checking if "verified user"
    let token = req.body.token;
    let decodedToken;
    try{
            decodedToken = jwt.verify(token,'secret');
            }
            catch (err){
               res.statusCode = 400;
               res.send('UNable to verify');
            }
            // console.log(decodedToken);

            let phone_number = decodedToken.PhoneNumber;

             Users.getRecordByPhoneNumber(phone_number)
             .then(([data,metaData])=>{
                data = data[data.length-1]; // getting object 
                if (data.Designation === 'VERIFIED USER'){

        // if user is verified store sent data to product table
        
   let status = "pending";
   let customer_id = data.id;

   // console.log("value of coupon is ", req.body.coupon);
// console.log(null,req.body.type,req.body.weight,req.body.length,req.body.breadth,req.body.picture,req.body.pickup_address,req.body.drop_address,req.body.alternate_phone_number,status,customer_id);
   const product = new Product(null,req.body.type,req.body.weight,req.body.length,req.body.breadth,req.body.picture,req.body.pickup_address,req.body.drop_address,req.body.alternate_phone_number,status,customer_id,req.body.coupon);
product.save()
.then(()=>{result => console.log(result)
   res.statusCode = 200;
   res.send('ORDER PLACED');
})
.catch(err=>console.log(err));

                }
                else {
                  res.statusCode = 400;
                  res.send('USER NOT VERIFIED');
                }
             })
             .catch(err=>{
               res.statusCode = 400;
               res.send('UNABLE TO ADD PARCEL');
             });

}

//// gets list of all orders placed by user 

exports.getOrdersList = (req,res)=>{

   let token = req.headers.authorization;
   token = token.split(' ')[1];
// console.log(token);
   let decodedToken;
   try{
      
      decodedToken = jwt.verify(token,'secret');
   }
      catch (err){
            res.statusCode = 400;
            res.send(err);
         }

      let phone_number = decodedToken.PhoneNumber;
      // console.log(phone_number);

      Users.getRecordByPhoneNumber(phone_number)
             .then(([data,metaData])=>{
                data = data[data.length-1]; // getting object 
                if (data.Designation === 'VERIFIED USER'){

        // if user is verified get orders list from products table 
        let customer_id = data.id;

        Product.getRecordByCustomerId(customer_id)
        .then(([data,metaData])=>{
         res.statusCode = 200;
               res.send(data);
        })
        .catch(err=>{
         res.statusCode = 400;
               res.send('UNABLE TO FETCH DETAILS');
        })

                }
                else {
                  res.status(200).send('not a verified user or expired')
                }
             })
             .catch(err=>{
               res.statusCode = 400;
               res.send('UNABLE TO GET DETAILS');
             });

}

//:::::::::DO

exports.getLocation = (req,res)=>{
   let tracking_id = req.body.tracking_id;
   // console.log(req.body.tracking_id);
   Driver.getRecordByTrackingId(tracking_id)
   .then(([data,md])=>{res.status(200).send(data);})
   .catch(err=>log(err));
}

/// user enters tracking id and the feedback points 
// get a thankyou message 
exports.postFeedback = (req,res)=>{
   let tracking_id = req.body.tracking_id;
   let points = req.body.points;

   // check if order c_staus - > completed

   Product.getRecordByTrackingId(tracking_id).then(([Pdata,md])=>{
   
      Pdata = Pdata[Pdata.length-1]
      let phone = Pdata.alternate_phone_number;
      // console.log(Pdata);
      if(Pdata.c_status === 'completed'){
         Product.setPoints(tracking_id,points)
         .then(([data,md])=>{

            client.messages.create({
               src: '+919877319473',
               dst: "+91"+`${phone}`,
               text: `THANKS FOR USING OUR SERVICE`
           }
         ).then(function(message_created) {
           console.log(message_created)
           
         })
         .catch(err=>console.log(err));
            
            res.status(200).send('Feedback done');})
         .catch(err=>log(err));
      } 
      else{
         res.send("order not completed")
      }
   }).catch((err)=>res.status(400).send(`order staus should be completed {err}`))

 
   

}


