const jwt = require('jsonwebtoken');

module.exports = (req,res,next) =>{
    const token = req.body.token;
    let decodedToken; 
    try{
        decodedToken = jwt.verify(token,'secret');
    }
    catch (err){
        err.statusCode = 500;
        throw err;
    }

    if (!decodedToken){
        res.send(400).json('unable to decode token')
        }
        req.myToken = decodedToken
};