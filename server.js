const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
require("dotenv").config();

const app = express();
const port = process.env.PORT;

const mongoUri = process.env.MONGO_CONNECTION;
let db, potCollection, ledsCollection;

MongoClient.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error('Error conectando a MongoDB:', err);
    return;
  }
  db = client.db('DB_ESP32');
  potCollection = db.collection('potentiometer');
  ledsCollection = db.collection('leds');
  console.log('Conectado a MongoDB');
});

app.use(cors());
app.use(bodyParser.json());

app.get('/', async (req, res) => {
  try {
    const data = await ledsCollection.findOne({}, { sort: { _id: -1 } });
    res.json({ led1: data ? data.led1 : false, led2: data ? data.led2 : false });
  }
  catch (error) {
    console.error('Error leyendo el estado de los LEDs:', error);
    res.status(500).send('Error leyendo el estado de los LEDs');
  }
});

app.post('/', async (req, res) => {
  try {
    const led1 = false;
    const led2 = false;
    await ledsCollection.updateOne({}, { $set: { led1, led2, timestamp: new Date() } }, { upsert: true });
    res.status(200).send('LED status updated');
  }
  catch (error) {
    console.error('Error guardando el estado de los LEDs:', error);
    res.status(500).send('Error guardando el estado de los LEDs');
  }
});

app.get('/pot', async (req, res) => {
  try {
    const data = await potCollection.findOne({}, { sort: { _id: -1 } });
    res.json({ potentiometerValue: data ? data.value : 0 });
  }
  catch (error) {
    console.error('Error leyendo el valor del potenciómetro:', error);
    res.status(500).send('Error leyendo el valor del potenciómetro');
  }
});

app.post('/pot', async (req, res) => {
  try {
    const potentiometerValue = req.body.potentiometerValue;
    await potCollection.insertOne({ value: potentiometerValue, timestamp: new Date() });
    res.status(200).send('Potentiometer value updated');
  }
  catch (error) {
    console.error('Error guardando el valor del potenciómetro:', error);
    res.status(500).send('Error guardando el valor del potenciómetro');
  }
});

app.get('/leds', async (req, res) => {
  try {
    const data = await ledsCollection.findOne({}, { sort: { _id: -1 } });
    res.json({ led1: data ? data.led1 : false, led2: data ? data.led2 : false });
  }
  catch (error) {
    console.error('Error leyendo el estado de los LEDs:', error);
    res.status(500).send('Error leyendo el estado de los LEDs');
  }
});

app.post('/leds', async (req, res) => {
  try {
    const { led1, led2 } = req.body;
    await ledsCollection.updateOne({}, { $set: { led1, led2, timestamp: new Date() } }, { upsert: true });
    res.status(200).send('LED status updated');
  }
  catch (error) {
    console.error('Error guardando el estado de los LEDs:', error);
    res.status(500).send('Error guardando el estado de los LEDs');
  }
});

app.listen( process.env.PORT, () => {
  console.log( 'Listening at Port ' + process.env.PORT );
});