const nodemailer = require('nodemailer');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Configure Nodemailer to use Brevo
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com', // Brevo SMTP server
  port: 587,
  secure: false, // If using port 465, set to true
  auth: {
    user: 'zaprenfro23@gmail.com', // Your email address
    pass: 'x2L0VbgM18TXcJEI' // Your Brevo API key
  }
});

// Use transporter.sendMail() to send emails


app.post('/send-email', async (req, res) => {
    const { novelList } = req.body;
    let content = novelList.map(novel => `${novel.title} ch${novel.chapter}`).join('\n');
    
    const mailOptions = {
        from: 'zaprenfro23@gmail.com',
        to: 'zaprenfro01@gmail.com',
        subject: 'Novel List Backup',
        text: 'Find your novel list attached.',
        attachments: [
            {
                filename: 'novelList.txt',
                content
            }
        ]
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        res.status(200).json({ message: 'Email sent' }); // Send a JSON response
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error sending email' }); // Send a JSON error
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
