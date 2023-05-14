
let plivo = require('plivo');
let client = new plivo.Client();
const User = require('../models/user');
const db = require('../util/database');
const jwt = require('jsonwebtoken');
const Driver = require('../models/drivers');

exports.postSignup= (req,res)=>{

////// checking if user is verified  

let PhoneNumber = req.body.PhoneNumber;  

    User.findByPhoneNumber(PhoneNumber)
    .then(([data,meta]) => {
        
        if (data.length > 0) {
            // console.log();
            // res.send("PhoneNumber in use");
            console.log("user in use");
            res.send("number in use");
        }

        else {            
    //////  sending otp to user 
let code = Math.floor(100000 + Math.random() * 900000); // otp 
client.messages.create({
        src: '+919877319473',
        dst: "+91"+`${req.body.PhoneNumber}`,
        text: `Hello ${req.body.Name}, your 6 digit otp verification code is ${code}`
    }
).then(function(message_created) {
    console.log(message_created)
    
})
.catch(err=>console.log(err));

            //////// storing user data in db 
const user = new User(null,req.body.Name,req.body.Email,req.body.PhoneNumber,req.body.Country,req.body.State,req.body.City,req.body.ZipCode,code,req.body.Designation);
user.save().then(()=>{console.log(" user added")}).catch(err=>console.log(err))

// creating json web token 

// since phone number is unique  we can send it in token 
  const token = jwt.sign({PhoneNumber:req.body.PhoneNumber},
    'secret',{expiresIn:'9h'}
    );
    res.status(200).json({token:token,email:req.body.Email,PhoneNumber:req.body.PhoneNumber}) 
        }
    });



}


exports.postVerify= (req,res)=>{
// console.log(req.body);
// console.log("bevbek");
// console.log("herer");
    const Token = req.body.Token;
    let OTP = req.body.OTP;
    // console.log(token);
    // console.log(otp);

    // decodedToken =
    // decodedToken =
    // decodedToken = jwt.verify(Token,'secret');
    // console.log(Token);
    let decodedToken;
    try{
            decodedToken = jwt.verify(Token,'secret');
            }
            catch (err){
                err.statusCode = 500;
                res.send (err);
            }
            // console.log(decodedToken);

    
    let PhoneNumber = decodedToken.PhoneNumber;
    // User.findByPhoneNumber(PhoneNumber);
    // console.log(PhoneNumber);

    User.getRecordByPhoneNumber(PhoneNumber)
    .then(([data,meta]) => {
        // console.log("data fetched from db")
///   multiple login are possible by user fetch the latest one 

        
        let db_otp = data[data.length-1].OTP;
        // console.log(data);
        let Designation = data[data.length-1].Designation;
        
        let user_id=data[data.length-1].id;

        if (db_otp === OTP ){
            // console.log("user correct");
            User.update_verify(PhoneNumber,Designation)
            .then(()=>{
                res.status(200).send(`VERIFIED ${Designation} `);

                if (  Designation === 'DRIVER' || Designation === 'VERIFIED DRIVER'){
                    const driver = new Driver(user_id);
                    // console.log('hereigdwv');
                    driver.save()
                    .then(()=>{console.log("driver added");})
                    .catch(err=>console.log(err))
                    // dont send second res
                }
            })
            .catch(err =>res.send(err));

            //// if driver add in driver table

          

        }
        else {
            res.status(400).send("WRONG OTP")
            console.log("unable to verify");
            // can make multiple attempts 
            // or delete record 
        }

    });


}


/// designation verified user 

exports.postLogin = (req , res)=>{
    let phoneNumber = req.body.phoneNumber;

    let code = Math.floor(100000 + Math.random() * 900000); // otp 
    client.messages.create({
            src: '+919877319473',
            dst: "+91"+`${req.body.phoneNumber}`,
            text: `Hello, your 6 digit otp verification code for login is ${code}`
        }
    ).then(function(message_created) {
        console.log(message_created)
        
    })
    .catch(err=>console.log(err));

    User.updateOtp(phoneNumber,code)
    .then(()=>{
        // console.log(code);
        res.status(200).send({'otp_sent':code})})
    .catch(err=>{res.send(err)})
    
}

exports.postLoginVerify = (req , res)=>{
//    console.log("boilbfcbdolrbrolbv");
let phoneNumber = req.body.phoneNumber;
let otp = req.body.otp;
        User.getRecordByPhoneNumber(phoneNumber)
        .then(([data,md])=>{
            // console.log(data);

         if (data[0].Designation.includes('VERIFIED')){  
            
            
            if (data[0].OTP == otp){
                const token = jwt.sign({PhoneNumber:phoneNumber},
                'secret',{expiresIn:'9h'});
                res.status(200).send({token:token});
            }

            else {
                res.status(400).send('otp didnt match');
            }

            }
                else {
                    res.status(400).send('user not verified');
                }

        })
        .catch(err => console.log(err))
    }