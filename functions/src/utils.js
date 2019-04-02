const nodemailer = require("nodemailer");
const twilio = require("twilio");
const CONSTANTS = require("./constants");

const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "khoa@medmentoring.com",
    pass: "GBVDILEZ"
  }
});

function sendWelcomeEmail(email, displayName, text, subject) {
  const mailOptions = {
    from: `${CONSTANTS.APP_NAME} <noreply@firebase.com>`,
    to: email,
    subject: subject,
    text: text
  };

  return mailTransport
    .sendMail(mailOptions)
    .then(() => {
      console.log("New welcome email sent to:", email);
      return email;
      //console.log('New welcome email sent to:', email);
    })
    .catch(error => {
      console.log("Error sending email", error);
      return email;
    });
}

function sendSMS(no, text) {
  var client = new twilio(CONSTANTS.ACCOUNT_SID, CONSTANTS.AUTH_TOKEN); //send SMS to customer
  client.messages
    .create({
      body: text,
      to: no,
      from: "+15108769215"
    })
    .then(message => console.log(message.sid))
    .catch(error => console.log(error));
}

exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendSMS = sendSMS;
