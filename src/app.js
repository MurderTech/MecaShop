const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const connectDb = require('./mongoose');
const { User } = require('./models');

const port = 3000;

// Enabling JSON bodyParser
app.use(bodyParser());

app.get('/', async (req, res) => {
  res.json({ estudiantes: await User.find() });
});

app.get('/:id', async (req, res) => {
  res.json(await User.findById(req.params.id));
});

app.get('/', async (req, res) => {
  res.json({ estudiantes: await User.find() });
});

app.post('/', async (req, res) => {
  const { name, age } = req.body;
  await User.create({ name, age });
  res.json({name, age});
});

app.put('/:id', async (req, res) => {
  const { age } = req.body;
  const estudiante = await User.findById(req.params.id);
  estudiante.age = age;
  estudiante.save();
  res.json({age});
});

app.delete('/:id', async (req, res) => {
  const estudiante = await User.findById(req.params.id);
  estudiante.remove();
  res.json({});
});

connectDb().then(() => {
  app.listen(port, () => {
    console.log(`Listening on ${port}`);
  });
});
