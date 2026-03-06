const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', (req, res) => {
    let rawData = fs.readFileSync('database.json');
    let users = JSON.parse(rawData);
    
    let rows = users.map(u => `
        <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px;">${u.shopId}</td>
            <td style="padding: 10px;">${u.name}</td>
            <td style="padding: 10px;">${u.phone}</td>
            <td style="padding: 10px; color: ${u.status === 'PAID' ? 'green' : 'red'}; font-weight: bold;">${u.status}</td>
        </tr>`).join('');

    res.send(`
        <html>
            <body style="font-family: 'Segoe UI', sans-serif; background-color: #f0f2f5; text-align: center; padding: 40px;">
                <div style="background: white; display: inline-block; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <h1 style="color: #1a73e8;">Revenue-Link Admin Portal</h1>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <thead>
                            <tr style="background-color: #1a73e8; color: white;">
                                <th style="padding: 12px;">Shop ID</th><th style="padding: 12px;">Merchant</th>
                                <th style="padding: 12px;">Phone</th><th style="padding: 12px;">Status</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                    <p style="margin-top: 20px; color: #555;">Dial <b>*384*5914#</b> on the simulator to interact.</p>
                </div>
            </body>
        </html>
    `);
});


app.post('/ussd', (req, res) => {
    let { phoneNumber, text } = req.body;
    let response = '';

    let users = JSON.parse(fs.readFileSync('database.json'));
    let user = users.find(u => u.phone === phoneNumber);

    if (text == '') {
        response = `CON Revenue-Link System\n1. Check My Tax Status\n2. Register Shop`;
    } else if (text == '1') {
        if (user) {
            response = `END Hello ${user.name},\nShop ID: ${user.shopId}\nStatus: ${user.status}`;
        } else {
            response = `END Number ${phoneNumber} is not registered.`;
        }
    } else if (text == '2') {
        response = `END Please visit the local council office to register Shop ID.`;
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});