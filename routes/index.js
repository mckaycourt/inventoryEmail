var express = require('express');
var router = express.Router();
let axios = require('axios');
let nodemailer = require('nodemailer');
/* GET home page. */
router.get('/', function (req, res, next) {

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'mckay.court@gmail.com',
            pass: 'Mlhlt2200!!'
        }
    });

    let mailOptions = {
        from: 'mckay.court@gmail.com', // sender address
        to: 'reled_support@byu.edu', // list of receivers
        subject: 'Inventory Test', // Subject line
    };

    axios.get('http://127.0.0.1:3000/email?EmployeeID=1')
        .then(result => {
            console.log(result.data);
            mailOptions.html = result.data;
            transporter.sendMail(mailOptions, function (err, info) {
                if(err)
                    console.log(err)
                else
                    console.log(info);
            });
        })
        .catch(err => {
            console.log(err);
        })
    res.render('index', {title: 'Express'});
});

module.exports = router;
