var express = require('express');
var router = express.Router();
let axios = require('axios');
let nodemailer = require('nodemailer');
let mysql = require('mysql');
let config = require('./config');

class Database {
    constructor(config) {
        this.connection = mysql.createConnection(config);
    }

    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err)
                    return reject(err);
                resolve(rows);
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
}

/* GET home page. */
router.get('/', function (req, res, next) {
    let employees = {};
    let database = new Database(config.getConfig());
    let transporter = nodemailer.createTransport({
        host: 'mail.byu.edu',
        auth: config.getAuth()
    });

    let mailOptions = {
        from: 'reled_support@byu.edu', // sender address
        to: 'mckay.court@gmail.com', // list of receivers
        subject: 'Religious Education Yearly Inventory', // Subject line
    };

    let queryDatabase = async () => {
        try {
            let employees = await database.query('SELECT * FROM Employee');
            await database.close();
            return employees;
        }
        catch (err) {
            console.log(err);
        }
    };

    let sendEmail = async () => {

        employees = await queryDatabase();
        for (let employee of employees) {
            try {
                const response = await axios.get(`http://127.0.0.1:3000/email?EmployeeID=${employee.EmployeeID}`);
                const data = await response.data;
                if (!employee.Email) {
                    employee.EmailStatus = employee.FirstName + ' ' + employee.LastName + ' is missing an email.';
                }
                mailOptions.html = data;
                if (!employee.Email) {
                    employee.Email = 'reled_support@byu.edu';
                }
                // mailOptions.to = employee.Email;
                transporter.sendMail(mailOptions, function (err, info) {
                    if (err)
                        console.log(err);
                    else
                        employee.EmailStatus = 'Email successfully sent to ' + employee.FirstName + ' ' + employee.LastName;
                });

            }
            catch (err) {
                if (!employee.Email) {
                    employee.EmailStatus = employee.FirstName + ' ' + employee.LastName + ' is missing an email.';
                }
                // console.log(err.response);
                if(!employee.EmailStatus){
                    employee.EmailStatus = employee.FirstName + ' ' + employee.LastName + '\'s items have all been inventoried.';
                }
            }
        }
    };

    sendEmail()
        .then(() => {
            res.render('index', {title: 'Express', employees});
        });
});

module.exports = router;
