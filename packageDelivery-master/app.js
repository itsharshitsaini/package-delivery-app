const express = require('express');
// let  SK = "sk_test_51MXNOPSCt2duW6ZAJkbJ42iyqrhZbj7gIvQyjN2pVLh7gvbAXXyigOungR0fHwSstjNKTY83Xpi8IJNxT5DbGtsk00x8m9VWh9"
// const stripe = require('stripe')(SK);

require('dotenv').config();
// const bodyParser = require('body-parser');
const port = process.env.PORT||3000;

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const driverRoutes = require('./routes/driver');
const Product = require('./models/products');

const app = express();

app.use(express.json());


app.use ('/admin',adminRoutes);
app.use(authRoutes);
app.use (productRoutes);
app.use ('/driver',driverRoutes);


app.use('/s/:id',(req,res)=>{
    let tracking_id = req.params.id;
    Product.setStatusByTrackingId(tracking_id)
    .then(console.log('done'))
    .catch(err=>{console.log(err);})

})

// app.post('/hooks',async(req,res)=>{
//     // console.log("Afnwi.................................................................");
//     let signingsecert = "whsec_92e241a0373f1c55e97d9c3267046804c0d11f35a3aa55cfd3396e7566663663";
//     const payload = req.body;
//     const  sig = req.headers['stripe-signature']
//     // matching webhooks is from stripe 

//     let event 
//     try{
//         event = stripe.webhooks.constructEvent(payload,sig,signingsecert);
//     }
//     catch(error){
//         console.log(error.message);
//         res.status(400).json({success:false})
//     }
//     // successfull

//     console.log(payload);
//     // console.log(payload.type);

// })





// sequelize.sync().then(res =>{
//     console.log(res);

// })
// .catch(err=>{
//     console.log(err);
// })

app.listen(port,()=>{console.log(`listening at port ${port}`);});
