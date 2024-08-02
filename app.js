const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { randomInt } = require('crypto');
const app = express();
const port = 3000;
let nextId = randomInt(5000);

app.set('view engine', 'ejs');
app.set('views', path.join('.\\', 'views'));

app.use(express.static(path.join('.\\', 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Custom Middleware 1: Log Request Details
app.use((req, res, next) => {
    console.log(`${req.method} request made to ${req.url} Headers: ${req}`);
    next();
});

// Custom Middleware 2: Check Content-Type
// app.use((req, res, next) => {
//     if (req.headers['content-type'] !== 'application/json') {
//         return res.status(400).send('Content-Type must be application/json');
//     }
//     next();
// });

// Error-Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Routes
app.get('/', (req, res) => {
    res.render('index', { parrots: require('./data/parrots.json') });
});

app.get('/parrots/:id', (req, res) => {
    const parrots = require('./data/parrots.json');
    const parrot = parrots.find(p => p.id === parseInt(req.params.id));
    if (parrot) {
        res.render('parrot-details', { parrot });
    } else {
        res.status(404).send('Parrot not found');
    }
});

// app.post('/parrots', (req, res) => {
//     let parrots = require('./data/parrots.json');
//     const newParrot = req.body;
//     parrots.push(newParrot);
//     require('fs').writeFileSync('./data/parrots.json', JSON.stringify(parrots, null, 2));
//     res.status(201).send(newParrot);
// });
app.post('/parrots', (req, res) => {
    let parrots = require('./data/parrots.json');
    const { name, image, description } = req.body;
    const newParrot = {
      id: nextId++,
      name,
      image,
      description
    };
    parrots.push(newParrot);
    require('fs').writeFileSync('./data/parrots.json', JSON.stringify(parrots, null, 2));
    res.redirect('/');
  });

app.patch('/parrots/:id', (req, res) => {
    let parrots = require('./data/parrots.json');
    const parrot = parrots.find(p => p.id === parseInt(req.params.id));
    if (parrot) {
        Object.assign(parrot, req.body);
        require('fs').writeFileSync('./data/parrots.json', JSON.stringify(parrots, null, 2));
        res.send(parrot);
    } else {
        res.status(404).send('Parrot not found');
    }
});

app.delete('/parrots/:id', (req, res) => {
    let parrots = require('./data/parrots.json');
    parrots = parrots.filter(p => p.id !== parseInt(req.params.id));
    require('fs').writeFileSync('./data/parrots.json', JSON.stringify(parrots, null, 2));
    res.status(204).send();
});
app.get('/add-parrot', (req, res) => {
    res.render('add-parrot');
  });
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
