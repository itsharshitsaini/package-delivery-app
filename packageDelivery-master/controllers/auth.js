
let plivo = require('plivo');
let client = new plivo.Client();
const User = require('../models/user');
const db = require('../util/database');
const jwt = require('jsonwebtoken');
const Driver = require('../models/drivers');

exports.postSignup = async (req, res) => {
    try {
        const { PhoneNumber, Name, Email, Country, State, City, ZipCode, Designation } = req.body;
        // Check if the user is registered
        const existingUser = await User.findByPhoneNumber(PhoneNumber);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: "Phone number already in use" });
        }
        const code = Math.floor(100000 + Math.random() * 900000);
        await sendOTP(PhoneNumber, Name, code);
        await saveUser(Name, Email, PhoneNumber, Country, State, City, ZipCode, code, Designation);
        // Create Token
        const token = generateToken(PhoneNumber);
        res.status(200).json({ token, email: Email, PhoneNumber });
    } catch (error) {
        console.error("Error in postSignup:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

async function sendOTP(PhoneNumber, Name, code) {
    try {
        const message = `Hello ${Name}, your 6 digit otp verification code is ${code}`;
        await client.messages.create({
            src: '+919877319473',
            dst: "+91" + PhoneNumber,
            text: message
        });
        console.log("OTP sent successfully");
    } catch (error) {
        console.error("Error sending OTP:", error);
        throw error;
    }
}

async function saveUser(Name, Email, PhoneNumber, Country, State, City, ZipCode, code, Designation) {
    try {
        const user = new User(null, Name, Email, PhoneNumber, Country, State, City, ZipCode, code, Designation);
        await user.save();
        console.log("User added successfully");
    } catch (error) {
        console.error("Error saving user:", error);
        throw error;
    }
}

function generateToken(PhoneNumber) {
    const token = jwt.sign({ PhoneNumber }, 'secret', { expiresIn: '9h' });
    return token;
}


exports.postVerify = async (req, res) => {
    try {
        const { Token, OTP } = req.body;
        const decodedToken = await verifyToken(Token);
        const PhoneNumber = decodedToken.PhoneNumber;
        const userData = await getUserRecordByPhoneNumber(PhoneNumber);
        // get OTP and Designation from user data
        const dbOTP = userData[userData.length - 1].OTP;
        const Designation = userData[userData.length - 1].Designation;
        const userId = userData[userData.length - 1].id;

        if (dbOTP === OTP) {
            await updateUserVerification(PhoneNumber, Designation);
            res.status(200).send(`VERIFIED ${Designation}`);
            // If user is a driver, add to driver table
            if (Designation === 'DRIVER' || Designation === 'VERIFIED DRIVER') {
                const driver = new Driver(userId);
                await driver.save();
                console.log("Driver added");
            }
        } else {
            res.status(400).send("WRONG OTP");
            console.log("Unable to verify");
        }
    } catch (error) {
        console.error("Error in postVerify:", error);
        res.status(500).send("Internal server error");
    }
};

async function verifyToken(Token) {
    try {
        return jwt.verify(Token, 'secret');
    } catch (error) {
        error.statusCode = 500;
        throw error;
    }
}

async function getUserRecordByPhoneNumber(PhoneNumber) {
    try {
        const [data, meta] = await User.getRecordByPhoneNumber(PhoneNumber);
        return data;
    } catch (error) {
        throw error;
    }
}

async function updateUserVerification(PhoneNumber, Designation) {
    try {
        await User.update_verify(PhoneNumber, Designation);
    } catch (error) {
        throw error;
    }
}


exports.postLogin = async (req, res) => {
    try {
        const phoneNumber = req.body.phoneNumber;
        // Generate a random 6-digit OTP
        const code = Math.floor(100000 + Math.random() * 900000);
        // Send OTP to the user
        await client.messages.create({
            src: '+919877319473',
            dst: "+91" + phoneNumber,
            text: `Hello, your 6 digit otp verification code for login is ${code}`
        });
        // Update OTP in the database
        await User.updateOtp(phoneNumber, code);
        res.status(200).send({ otp_sent: code });
    } catch (error) {
        console.error("Error in postLogin:", error);
        res.status(500).send("Internal server error");
    }
};
exports.postLoginVerify = async (req, res) => {
    try {
        const phoneNumber = req.body.phoneNumber;
        const otp = req.body.otp;
        const [data, md] = await User.getRecordByPhoneNumber(phoneNumber);
        if (!data.length) {
            return res.status(400).send('User not found');
        }
        const user = data[0];
        if (!user.Designation.includes('VERIFIED')) {
            return res.status(400).send('User not verified');
        }
        if (user.OTP !== otp) {
            return res.status(400).send('OTP does not match');
        }
        const token = jwt.sign({ PhoneNumber: phoneNumber }, 'secret', { expiresIn: '9h' });
        res.status(200).send({ token });
    } catch (error) {
        console.error("Error in postLoginVerify:", error);
        res.status(500).send("Internal server error");
    }
};
