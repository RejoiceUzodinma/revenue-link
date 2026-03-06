const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.post('/ussd', (req, res) => {
    let { sessionId, serviceCode, phoneNumber, text } = req.body;
    let response = '';

    if (text == '') {
        response = `CON Welcome to Revenue-Link
1. Pay Tax
2. Check Status`;
    } else if (text == '1') {
        response = `CON Enter your Shop ID:`;
    } else if (text == '2') {
        response = `CON Enter your Shop ID to check status:`;
    } else if (text.startsWith('1*')) {
        let parts = text.split('*');
        let shopId = parts[1];
        
        let db = JSON.parse(fs.readFileSync('database.json'));
        let trader = db.find(t => t.shopId === shopId);

        if (trader) {
            response = `END Processing ₦${trader.amount} for ${trader.name}.
Please wait for the payment prompt on your phone.`;
            trader.status = "PAID";
            fs.writeFileSync('database.json', JSON.stringify(db));
        } else {
            response = `END Shop ID ${shopId} not found.`;
        }
    } else if (text.startsWith('2*')) {
        let parts = text.split('*');
        let shopId = parts[1];
        
        let db = JSON.parse(fs.readFileSync('database.json'));
        let trader = db.find(t => t.shopId === shopId);

        if (trader) {
            response = `END Trader: ${trader.name}\nStatus: ${trader.status}`;
        } else {
            response = `END Shop ID not found.`;
        }
    } else {
        response = `END Invalid option.`;
    }

    res.header('Content-Type', 'text/plain');
    res.send(response);
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});