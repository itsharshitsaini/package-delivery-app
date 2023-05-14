
const User = require('../models/user');
const db = require('../util/database');
const jwt = require('jsonwebtoken');
const Product = require('../models/products');
const Driver = require('../models/drivers');
const Coupon = require('../models/coupons');
const { LOADIPHLPAPI } = require('dns');
let plivo = require('plivo');
let client = new plivo.Client();
let  SK = "sk_test_51MXNOPSCt2duW6ZAJkbJ42iyqrhZbj7gIvQyjN2pVLh7gvbAXXyigOungR0fHwSstjNKTY83Xpi8IJNxT5DbGtsk00x8m9VWh9"
const stripe = require('stripe')(SK);




exports.getAllProductsList = (req,res)=>{
    let token = req.headers.authorization;
    token = token.split(' ')[1];
 // console.log(token);
    let decodedToken;
    try{
       
       decodedToken = jwt.verify(token,'secret');
    }
       catch (err){
             res.statusCode = 400;
             res.send(`unable to decode token or ${err}`);
          }
//  console.log(decodedToken);
       let phone_number = decodedToken.PhoneNumber;
    //    console.log(phone_number);
 
       User.getRecordByPhoneNumber(phone_number)
              .then(([data,metaData])=>{
                 data = data[data.length-1]; // getting object 
                 if (data.Designation === 'VERIFIED ADMIN'){
 
         // if admin is verified get all orders list from products table 

 
         Product.fetchAll()
         .then(([details,metaData])=>{
          res.statusCode = 200;
                res.send(details);
         })
         .catch(err=>{
          res.statusCode = 400;
                res.send(err);
                /// cant get orders list 
         })
 
                 }
                 else {
                  res.send('NOT A VERIFIED ADMIN')
                 }
              })
              .catch(err=>{
                res.statusCode = 400;
                res.send('UNABLE TO GET Your RECORD');
              });
 

}

/// works assuming user data is stored as a json 
function getDistance(x1, y1, x2, y2){
   let y = x2 - x1;
   let x = y2 - y1;
   console.log(Math.sqrt(x * x + y * y));
   return Math.sqrt(x * x + y * y);
}


////// accept and reject possible

///// SET COST 

/// send token in body also 


exports.modifyProductStatus = (req,res)=>{

   let token = req.body.token;
// console.log(token);
   let decodedToken;
   try{
      
      decodedToken = jwt.verify(token,'secret');
   }
      catch (err){
            res.statusCode = 400;
            res.send(`unable to decode token or ${err}`);
         }
// console.log(decodedToken);
      let phone_number = decodedToken.PhoneNumber;
      // console.log(phone_number);
// log
  
   User.getRecordByPhoneNumber(phone_number)
   .then(  ([data,metaData])=>{
      data = data[data.length-1]; // getting object 
      // console.log(data);
      if (data.Designation === 'VERIFIED ADMIN'){


    let c_status = req.body.c_status;
    let order_id = req.body.order_id;

    //// reject case
    if (c_status === 'reject'){
        Product.setStatus(c_status ,order_id )
        .then(()=>{
         console.log("status updated")
         res.status(200).send('order rejected');
      })
        .catch(err => console.log(err))

    }

    // if "status is not reject "  ===> accept

    if (c_status === 'accept'){
      // check if free  deivers 
      Driver.getFreeDrivers()
      .then( ([driverData,md])=>{
         // console.log(driverData);

         if (driverData.length === 0){
            res.status(400).send('No free Drivers');
         }
            /// if free drivers are available 
         else {
            // get products current location 

            let product_location = "30.72464358264908,76.84676889895219";
            // console.log(product_location);

            x1 = product_location.split(',')[0];
            y1 = product_location.split(',')[1];

            // console.log(x1,y1);

            let driver_id ;
            let distance =Number.MAX_VALUE;


//          

             // assigning driver 
            driverData.forEach(element => {
      

         //  console.log(element.location);

          let c = JSON.parse(element.location);
         //  console.log(c.lat);
               let  x2 = c.lat;
               let y2 = c.long;
               // console.log(x2,y2);
               ////// let distance - 
               if (distance > getDistance(x1,y1,x2,y2) ){
                  distance = getDistance(x1,y1,x2,y2);
                  driver_id = element.id;
               }
             });
            // console.log(driver_id);

           

//       // generate tracking id 
      let tracking_id = Math.floor(Math.random() * 1000000000);


//  /// set in product table 
           Product.setIds(tracking_id,driver_id,order_id)
           .then(()=>console.log("product table update"))
           .catch(err=>res.send(`unable to update products db${err}`));

// //// set in driver table 
            
             Driver.setTrackingId(tracking_id,driver_id)
             .then(()=>{
               // console.log('1');
               Driver.setStatus ('OUT',driver_id)
               .then(([a,b])=>{ 
                  // console.log(a);
                  // console.log('2');
                  Product.setStatus ('OUT',order_id)
                  .then(()=>{
                     Product.getRecordByOrderId(order_id)
                     .then(([detail,md])=>{
                        
                        detail = detail[0];
                        console.log(detail);
                        let cost = 100+ Number(detail.weight)*(Number(detail.length)+Number(detail.breadth));
                       if (detail.coupon != null){ 
                        Coupon.getCoupon(detail.coupon)
                        .then(([coupon_detail,mm])=>{
                           // console.log(coupon_detail[0].discount);
                           // console.log(100 - Number(coupon_detail[0].discount));
                           cost = (cost * (100 - Number(coupon_detail[0].discount)))/100;
                        //   console.log(cost);
                           Product.setCost(cost,order_id)
                           .then(()=>{
                              res.status(200).send("ORDER PLACED coupon used")
                           })
                           .catch(()=>{res.status(400).send('UNABLE TO SET COST to db')})
                          
                           // console.log('cost :', cost);
                        })
                        .catch((err) => {res.send('coupon doesnt exist or',err)})
                  
                       }
                    
                     else {
                        Product.setCost(cost,order_id)
                        .then(()=>{res.status(200).send("ORDER PLACED")})
                        .catch(()=>{res.status(400).send('UNABLE TO SET COST to db')})
                       }

                       client.messages.create({
                        src: '+919877319473',
                        dst: "+91"+`${detail.alternate_phone_number}`,
                        text: `Hello  your tracking id is ${detail.tracking_id} status has been updated please check order status using this`
                     })
                     .then(function(message_created) {
                    console.log(message_created)
                    
                })
                .catch(err=>console.log(err));


                     })
                 
                     
               })
                  .catch(err=>console.log(err))
            }
               )
               .catch(err=>res.send(`unable to update drivers status db${err}`))
            
            })
             .catch(err=>res.send(`unable to update drivers db${err}`));

      // update order status and driver status 


    

         }

      })
      .catch((err)=>{
         console.log('unable to reach dB  or not entered drivers location add manually');
         res.status(400).send("unable to reach dB  or not entered drivers location add manually");
      })
    }
   
      }
      else {
         res.status(400).send('admin not verified');
      }
   })
      .catch((err)=>{res.status(400).send(`UNABLE TO FIND RECORD IN DB${err}`)
   // console.log(err);
   })
 
}

// verify if admin 
// check status - > payment pending 
// genrate link 

exports.generateLink = (req,res)=>{

   // console.log(req.body.order_id);
   // console.log(req.body.token);
   let token = req.body.token;
   let order_id = req.body.order_id;

   let decodedToken;
   try{
      
      decodedToken = jwt.verify(token,'secret');
   }
      catch (err){
            res.statusCode = 400;
            res.send(err);
         }

      let phone_number = decodedToken.PhoneNumber;
   //    console.log(phone_number);

      User.getRecordByPhoneNumber(phone_number)
             .then(([info,metaData])=>{
                info = info[info.length-1]; // getting object 
               //  console.log(info);
                if (info.Designation === 'VERIFIED ADMIN'){
                  // console.log("iberiov");
                  Product.getRecordByOrderId(order_id)
                  .then(([data,md])=>{
                     data = data[0];
                     console.log(data);
                     // console.log(data.c_status);
                     if (data.c_status == 'payment pending'){
                        // console.log('generating payment limk.....');

                        const session =  stripe.checkout.sessions.create({
                           payment_method_types: ['card'],
                           
                           line_items: [{
                           "price_data": {
                           "currency": "inr",
                           "product_data": {
                           "name": `Tracking ID : ${data.tracking_id}`,
                           "description": 'is the cost of Delivery.'
                           },
                           "unit_amount": data.cost * 100,
                           },
                           "quantity": 1
                           }],
                           phone_number_collection: {
                           enabled: true,
                           },
                           mode: 'payment',
                           success_url: `http://localhost:3000/s/${data.tracking_id}`,
                           cancel_url: `http://localhost:3000`
                           })
                           .then((result)=>{
                              res.status(200).json(result);
                              console.log(result.url);
                              client.messages.create({
                                 src: '+919877319473',
                                 dst: "+91"+`${data.alternate_phone_number}`,
                                 text: `Hello  your order with tracking id  ${data.tracking_id} payment link is:${result.url}`
                              })
                              .then(function(message_created) {
                             console.log(message_created)
                             
                         })
                         .catch(err=>console.log(err));
                           })
                           .catch((err)=>{res.send('unbale to make payment or',err)});
                           
                           ;

                     }
                     else {
                        res.status(400).send('check order status probably not in paymnet pending')
                     }

                  })
                  .catch((err)=>{
                     res.send(`unable to verify admin or ${err}`);
                  })
                }
               })
               .catch((err)=> res.send(`unable to verify admin or ${err}`));


}

