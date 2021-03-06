require('dotenv').config();

const express = require('express');
const cors = require('cors');
const CalculatorPlugin = require('./plugins/calculator');
const DialogflowPlugin = require('./plugins/dialogflow');
const NlpPlugin = require('./plugins/semantic-similarity');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const api = express.Router();

api.all('/ping', (req, res) => res.json({message: 'pong'}));

api.post('/webhook/calculator', (req, res) => {
  console.log('Webhook event:', req.body);

  const {event, payload} = req.body;

  switch (event) {
    case 'message:created':
      return CalculatorPlugin.handleMessageCreated(res, payload);
    case 'webhook:verify':
    default:
      return res.send(req.body.payload);
  }
});

api.post('/webhook/dialogflow', (req, res) => {
  console.log('Webhook event:', req.body);

  const {event, payload} = req.body;

  switch (event) {
    case 'message:created':
      return DialogflowPlugin.handleMessageCreated(res, payload);
    case 'webhook:verify':
    default:
      return res.send(req.body.payload);
  }
});

api.post('/webhook/nlp', (req, res) => {
  console.log('Webhook event:', req.body);

  const {event, payload} = req.body;

  switch (event) {
    case 'message:created':
      return NlpPlugin.handleMessageCreated(res, payload);
    case 'webhook:verify':
    default:
      return res.send(req.body.payload);
  }
});

// This endpoint handles the chatbot demo at https://app.papercups.io/bot/demo
api.post('/demo/nlp', async (req, res) => {
  console.log('Demo payload:', req.body);
  const {message, faqs = []} = req.body;
  const result = await NlpPlugin.demo(message, faqs);
  console.log('NLP demo result:', result);

  return res.json({ok: true});
});

app.use('/api', api);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀  Server listening on port ${port}`);
});
