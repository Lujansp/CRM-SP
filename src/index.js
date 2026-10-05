require('dotenv').config();
const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api/crm', require('./routes'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno' });
});

const port = process.env.PORT || 3000;
db.init()
  .then(() => app.listen(port, () => console.log(`CRM-SP API en :${port}`)))
  .catch((e) => {
    console.error('No se pudo iniciar el pool Oracle:', e.message);
    process.exit(1);
  });
process.on('SIGINT', () => db.close().then(() => process.exit(0)));
