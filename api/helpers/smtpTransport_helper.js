var settings = require('../config/secrets').email;
var nodemailer = require('nodemailer');
module.exports = nodemailer.createTransport('SMTP',{
    service: 'Gmail',
    auth: {
        user: settings.username,
        pass: settings.password
    }
});