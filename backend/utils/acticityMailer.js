const nodeMailer = require("nodemailer");

const activityMail = async(options) => {
    const transporter = nodeMailer.createTransport({
        host: process.env.SMPT_HOST,
        port: process.env.SMPT_PORT,
        service: process.env.SMPT_SERVICE,
        auth: {
            user: process.env.SMPT_MAIL, 
            pass: process.env.SMPT_PASS
        }
    })
    const mailOption = {
        from : process.env.SMPT_MAIL,
        to : process.env.PRCTRMAIL,
        subject: "Suspicious Activity",
        html : options.message
    }
    await transporter.sendMail(mailOption)
}

module.exports = activityMail;