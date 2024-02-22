const express = require('express');
require('dotenv').config();
const port = process.env.PORT;
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


app.use('/s/:id', async (req, res) => {
    try {
        const tracking_id = req.params.id;
        await Product.setStatusByTrackingId(tracking_id);
        console.log('Status updated successfully');
        res.sendStatus(200);
    } catch (error) {
        console.error('Error updating status:', error);
        res.sendStatus(500);
    }
});

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
app.listen(port,()=>{console.log(`listening at port ${port}`);});
