require('dotenv').config();
const express = require('express');
const Web3 = require('web3');
const { getIphoneLayout } = require('./src/getIphoneLayout.js');
const Devices = require('./src/contracts/Devices.json');

const PORT = process.env.PORT || 5000;

const app = express().set('port', PORT);

app.get('/', function (req, res) {
  res.send('Get ready for OpenSea!');
});

app.get('/:token_id', async function (req, res) {
  const tokenId = parseInt(req.params.token_id).toString();
  web3 = new Web3(
    new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${process.env.INFURA_ID}`)
  );
  const devicesInstance = new web3.eth.Contract(Devices.abi, process.env.ADDRESS_DEVICE_CONTRACT);
  try {
    let deviceInfo = await devicesInstance.methods.getSpecsById(tokenId).call();
    const data = {
      name: deviceInfo.model + ' - ' + deviceInfo.color,
      attributes: [
        {
          trait_type: 'id',
          value: tokenId
        },
        {
          trait_type: 'model',
          value: deviceInfo.model
        },
        {
          trait_type: 'color',
          value: deviceInfo.color
        },
        {
          trait_type: 'price',
          value: deviceInfo.price / 10e18
        },
        {
          trait_type: 'unit',
          value: 'IPHONE'
        },
        {
          trait_type: 'others',
          value: deviceInfo.others
        }
      ],
      image: `${process.env.DOMAIN}/image/${deviceInfo.model}/${deviceInfo.color}`,
      external_link: 'https://phonefarm.finance'
    };
    return res.send(data);
  } catch (error) {
    const data = {
      name: '',
      attributes: [
        {
          trait_type: 'id',
          value: ''
        },
        {
          trait_type: 'model',
          value: ''
        },
        {
          trait_type: 'color',
          value: ''
        },
        {
          trait_type: 'price',
          value: ''
        },
        {
          trait_type: 'unit',
          value: ''
        },
        {
          trait_type: 'others',
          value: ''
        }
      ],
      image: '',
      external_link: 'https://phonefarm.finance'
    };
    return res.send(data);
  }
});

app.get('/image/:model/:color', function (req, res) {
  const model = req.params.model;
  const color = req.params.color;
  try {
    const phone = getIphoneLayout(model, color);
    res.sendFile(__dirname + '/' + phone.img);
  } catch (error) {
    res.status(404);
    return res.send('Not Found');
  }
});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
