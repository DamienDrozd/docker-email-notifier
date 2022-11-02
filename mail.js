const {promisify} = require('util');
var nodemailer = require('nodemailer');



class MailClient {
  constructor(defaults) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_SENDER_PASSWORD,
      }
    });
      
  }

  send(message) {
    this.mailOptions = {
      from: process.env.EMAIL_SENDER ,
      to: process.env.EMAIL_TO,
      subject: 'Docker Alert',
      text: message
    };
    console.log("message : ", message)
    this.transporter.sendMail(this.mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          console.log("Email send to :" + process.env.EMAIL_TO )
        }
      });
  }

  async sendError(e) {
    await this.send(`Error: ${e}`);
  }
}

module.exports = MailClient;
