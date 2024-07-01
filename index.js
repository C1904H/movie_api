// Require express
const express = require('express'),
    morgan = require('morgan');

// Initialize express
const app = express();

// Top 10 Movies
let topMovies = [
  {
    title: 'The Shawshank Redemption',
    director: 'Frank Derabont'
  },
  {
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    director: 'Peter Jackson'
  },
  {
    title: 'Indiana Jones and the Temple of Doom',
    director: 'Steven Spielberg'
  },
  {
    title: 'Inception',
    director: 'Christopher Nolan'
  },
  {
    title: 'Spirited Away',
    director: 'Hayao Miyazaki'
  },
  {
    title: 'Eternal Sunshine of the Spotless Mind',
    director: 'Michel Gondry'
  },
  {
    title: 'It\'s a Wonderful Life',
    director: 'Frank Capra'
  },
  {
    title: 'The Goonies',
    director: 'Richard Donner'
  },
  {
    title: 'Amelie',
    director: 'Jean-Pierre Jeunet'
  },
  {
    title: 'The Grand Budapest Hotel',
    director: 'Wes Anderson'
  }
];

// Invoke middeware function (Morgan)
app.use(morgan('common'));

// express.static to serve documentation.html file from public folder
app.use('/documentation', express.static('public', {index: 'documentation.html'})); 

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my Movies API!');
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

// Error handling via middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });  

// Listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});