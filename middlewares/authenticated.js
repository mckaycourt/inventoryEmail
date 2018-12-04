let cas = require('byu-cas');
let config = require('../routes/config');
let location = config.getLocation();
let URL = config.getURL();
let cookiee = require('cookie-encryption');
let vault = cookiee('ciao', {
    maxAge: 43200000
});

function checkUser(user) {
    if (location === '/inventory') {
        for (let i in user.memberOf) {
            if (user.memberOf[i] === 'RICHARD_CROOKSTON--RBC9') {
                return true;
            }
        }
        return false;
    }
    else {
        let possiblities = ['mmcourt', 'bquinlan', 'rbc9', 'mr28'];
        for (let i in possiblities) {
            if (possiblities[i] === user.netId) {
                return true;
            }
        }
        return false;
    }

}

module.exports = function (req, res, next) {
    if (req.path === '/getTicket') {
        let ticket = req.query.ticket;
        let goTo = req.query.goTo;
        console.log(goTo);
        let service = URL + '/getTicket?goTo=' + goTo;
        let user = '';
        cas.validate(ticket, service)
            .then(function success(response) {
                console.log("Ticket valid! Hello, " + response.username);
                user = response.attributes;
            })
            .then(() => {
                if (checkUser(user)) {
                    let goTo = req.query.goTo;
                    let json = JSON.stringify(user);
                    vault.write(req, json);
                    res.redirect(URL + goTo);
                }
                else {
                    res.render('error',{message: 'You don\'t have access'});
                }
            })
            .catch(function error(e) {
                console.log("Invalid ticket. Error message was: " + e.message);
                // res.redirect(location + '/login');
            });
    }
    else {
        console.log('auto in');
        let cookie = vault.read(req);
        if (cookie === "") {
            let goTo = req.originalUrl;
            res.redirect('https://cas.byu.edu/cas/login?service=' + encodeURIComponent(URL + '/getTicket?goTo=' + goTo));
        }
        else {
            next();
        }
    }

};
