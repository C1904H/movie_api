// Require express
const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

// Initialize express
const app = express();

// Require Mongoose package and models.js
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/moviesDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Initialize body-parser
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Invoke middeware function (Morgan)
app.use(morgan('common'));

// express.static to serve documentation.html file from public folder
app.use(
  '/documentation',
  express.static('public', { index: 'documentation.html' })
);

// CREATE new user registration
app.post('/users', async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// UPDATE user info, by username
app.put('/users/:Username', async (req, res) => {
  await Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true }
  ) //ensures updated document returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $push: { FavoriteMovies: req.params.MovieID }
    },
    { new: true }
  ) //updated doc returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// DELETE movie from user favourites
app.delete('/users/:Username/Movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $pull: { FavoriteMovies: req.params.MovieID }
    },
    { new: true }
  ) //updated doc returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// DELETE user by username
app.delete('/users/:Username', async (req, res) => {
  await Users.findOneAndDelete({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my Movies App!');
});

// READ ALL users
app.get('/users', async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ a user by username
app.get('/users/:Username', async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ ALL movies
app.get('/movies', async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ movie data by TITLE
app.get('/movies/:title', async (req, res) => {
  await Movies.findOne({ Title: req.params.title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ movie by GENRE
app.get('/movies/Genre/:GenreName', async (req, res) => {
  try {
    const genreName = req.params.GenreName;
    const movie = await Movies.findOne({ 'Genre.Name': genreName });

    if (movie) {
      res.status(200).json(movie.Genre);
    } else {
      res.status(400).send('No such genre');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

// READ movie director by name
app.get('/movies/Director/:DirectorName', async (req, res) => {
  try {
    const directorName = req.params.DirectorName;
    const movie = await Movies.findOne({ 'Director.Name': directorName });

    if (movie) {
      res.status(200).json(movie.Director);
    } else {
      res.status(400).send('No such director');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
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
