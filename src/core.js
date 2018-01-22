var PORT = process.env.PORT || 8080;        // set our port

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

var NRP = require('node-redis-pubsub');

var config = {
  port: 6379                        , // Port of your remote Redis server
  host: '192.168.1.138' , // Redis server host, defaults to 127.0.0.1
  auth: 'potato'                  , // Password
  scope: 'swamphacks'                       // Use a scope to prevent two NRPs from sharing messages
};

var nrp = new NRP(config); // This is the NRP client

let balance = 0;

// configure app to use bodyParser()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// Send json
// router.get('/', (req, res) => {
//     res.json({ message: 'Test' });
// });

var cardAuthenticated = false;
var imageAuthenticated = false;
var fingerprintAuthenticated = false;

var sellBitcoin = false;
var sellBitcoinValue = 0;

var buyETH = false;
var buyETHValue = 0;

router.put('/setBalance', (req, res) => {
    console.log('/setBalance');
    if (!req.body) return res.sendStatus(400)
    balance = req.body.amount;
    console.log('$:', balance);
    nrp.emit('start-set-balance',{})
    res.send();
});

router.get('/getBalance', (req, res) => {
    // reset();
    console.log('/getBalance', balance);
    const body = {
        amount: balance
    };
    res.send(JSON.stringify(body));
});

router.put('/payBill', (req, res) => {
    console.log('/payBill');
    if (!req.body) return res.sendStatus(400)
    bill = req.body.bill;
    console.log('$bill', bill);
    switch (bill) {
        case 'power':
            balance -= 100;
            break;
        case 'water':
            balance -= 40;
            break;
        case 'rent':
            balance -= 200;
            break;
        default:
            console.log('bill not found');
    }
    const body = {
        amount: balance
    };
    if(balance < 200) {
        nrp.emit('',);
    }
    console.log('$: ' + balance);
    res.send(JSON.stringify(body));
});

router.put('/buy', (req, res) => {
    console.log('/buy');
    if (!req.body) return res.sendStatus(400)
    item = req.body.item;
    console.log('$item', item);
    
    nrp.emit('start-buy',item)
    res.send();
});
router.put('/convertcrypto', (req, res) => {
    console.log('/convertcrypto');
    balance = 0;
    nrp.emit('twilio-crypto',{});
    res.send();
});

// router.put('/sellbtc', (req, res) => {
//     reset();
//     console.log('/sellbtc');
//     if (!req.body) return res.sendStatus(400)
//     sellBitcoinValue = req.body.amount;
//     console.log('BTC:', sellBitcoinValue);
//     sellBitcoin = true;
//     res.send();
// });

// router.put('/buyeth', (req, res) => {
//     reset();
//     console.log('/buyeth');
//     if (!req.body) return res.sendStatus(400)
//     buyETHValue = req.body.amount;
//     console.log('ETH:', buyETHValue);
//     buyETH = true;
//     res.send();
// });

// router.put('/cardscan', (req, res) => {
//     console.log('/cardScan');
//     cardAuthenticated = true;
//     tryTransaction();
//     res.send();
// });

// router.put('/fingerprint', (req, res) => {
//     console.log('/fingerprint');
//     fingerprintAuthenticated = true;
//     tryTransaction();
//     res.send();
// });

// router.put('/image', (req, res) => {
//     console.log('/image');
//     imageAuthenticated = true;
//     tryTransaction();
//     res.send();
// });

app.use('/api', router);

app.use(function (req, res) {
    res.send(404);
});

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});

function tryTransaction() {
    if (!cardAuthenticated) return;
    if (!imageAuthenticated) return;
    if (!fingerprintAuthenticated) return;
    // Good to go
    if (!sellBitcoin) {
        console.log('Bitcoin sold')
        BTCBalance -= sellBitcoinValue;
        if (BTCBalance < 0) BTCBalance = 0;
        reset();
    }
    if (!buyETH) {
        console.log('ETH buy')
        ETHBalance += buyETHValue;
        if (ETHBalance < 0) ETHBalance = 0;
        reset();
    }
}

function reset() {
    console.log('transaction reset');
    cardAuthenticated = false;
    imageAuthenticated = false;
    fingerprintAuthenticated = false;
    sellBitcoinValue = 0;
    sellBitcoin = false;
    buyETH = false;
    buyETHValue = 0;
}