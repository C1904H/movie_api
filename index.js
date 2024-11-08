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

// mongoose.connect('mongodb://localhost:27017/moviesDB', {
//   useNewUrlParser: true, useUnifiedTopology: true
// });

mongoose.connect( process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Invoke CORS - cross-origin resource sharing
const cors = require('cors');
app.use(cors());

// Import auth.js file (and express available in auth.js)
let auth = require('./auth')(app);

// express.static to serve documentation.html file from public folder
app.use(
  '/documentation',
  express.static('public', { index: 'documentation.html' })
);

// require passport module and import passport.js file
const passport = require('passport');
require('./passport');

// Initialize body-parser
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Require express-validator
const { check, validationResult } = require('express-validator');

// Invoke middeware function (Morgan)
app.use(morgan('common'));

/**
 * @description Register a new user
 * @name POST /signup
 * @example
 * Request data format
 * {
 *  "Username": "",
 *  "Password": "",
 *  "Email": "",
 *  "Birthday:" ""
 * }
 * @example
 * Response data format
 * {
 *   "_id": ObjectID,
 *   "Username": "",
 *   "Password": "",
 *   "Email": "",
 *   "Birthday": "",
 * }
 */
app.post(
  '/users',
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  async (req, res) => {
    // check validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
            .then((user) => {
              res.status(201).json(user)
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
  }
);

/**
 * @description Update a user
 * @name PUT /users/:Username
 * @example
 * Authentication: Bearer token (JWT)
 * Request data format
 * {
 *  "Username": "",
 *  "Password": "",
 *  "Email": "",
 *  "Birthday:" ""
 * }
 * @example
 * Response data format
 * {
 *   "_id": ObjectID,
 *   "Username": "",
 *   "Password": "",
 *   "Email": "",
 *   "Birthday": "",
 * }
 */
app.put(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    // Condition to check added here
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }
    // Condition ends
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
  }
);

/**
 * @description Add a movie to user favorites
 * @name POST /users/:Username/movies/:MovieID
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * // Request data format
 * none
 * @example
 * // Response data format: A JSON object holding data of user including added favorite movie:
 * {
 *   "_id": ObjectID,
 *   "Username": "",
 *   "Password": "",
 *   "Email": ObjectID,
 *   "Birthday": [ObjectID],
 *   "FavoriteMovies": [ObjectID],
 * }
 */
app.post(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
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
  }
);

/**
 * @description Delete a movie from user favorites
 * @name DELETE /users/:Username/movies/:MovieID
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * // Request data format
 * none
 * @example
 * // Response data format: A JSON object holding data of user minus deleted movie
 *  {
 *     _id: ObjectID
 *     "Username": "",
 *     "Password": "",
 *     "Email": ObjectID,
 *     "Birthday": [ObjectID],
 *     "FavoriteMovies': [],
 *   }
 */
app.delete(
  '/users/:Username/Movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
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
  }
);

/**
 * @description Delete user 
 * @name DELETE /users/:Username
 * @example
 * Response data format: A text message indicating whether the user was successfully deleted
 */
app.delete(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
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
  }
);

  /**
  * @description Returns welcome message
  * @name GET / 
  * @example
  * Response data format: A text Welcome message
  */
app.get('/', (req, res) => {
  res.send('Welcome to my Movies App!');
});

/**
 * @description Read all users
 * @name GET /users
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Response data format: Array of JSON objects
 * [
 *  {
 *    "_id": ObjectID,
 *    "Username": "",
 *    "Password": "",
 *    "Email": "",
 *    "Birthday": "",
 *  }
 * ]
 */
app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * @description Get a user by username
 * @name GET /users/:Username
 * @example
 * Response data format:
 * {
 *   "_id": ObjectID,
 *   "Username": "",
 *   "Password": "",
 *   "Email": "",
 *   "Birthday": "",
 * }
 */
app.get(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);


/**
 * @description Get all movies
 * @name GET /movies
 * @example
 * // Request data format
 * none
 * @example
 * // Response data format: Array of JSON objects
 * [
 *  {
 *     _id: ObjectID
 *     "Title": "",
 *     "Description": "",
 *     "Genre": ObjectID,
 *     "Director": [ObjectID],
 *     "Actors": [ObjectID],
 *     "ImagePath": "",
 *     "Featured": Boolean,
 *   }
 * ]
 */
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * @description Get a movie by title
 * @name GET /movies/:Title
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 * none
 * @example
 * Response data format
 * {
 *   _id: ObjectID
 *   "Title": "",
 *   "Description": "",
 *   "Genre": ObjectID,
 *   "Director": [ObjectID],
 *   "ImagePath": "",
 *   "Featured": Boolean,
 * }
 */
app.get(
  '/movies/:title',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.findOne({ Title: req.params.title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * @description Get a movie by genre name
 * @name GET /movies/Genre/:GenreName
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 * none
 * @example
 * Response data format: A JSON object holding data about a movie genre, including name and description
 *  {
 *    "Name": "",
 *    "Description": "",
 *  }
 */
app.get(
  '/movies/Genre/:GenreName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
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
  }
);

/**
 * @description Get a movie director by name
 * @name GET /movies/Director/:DirectorName
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 * none
 * @example
 * Response data format :  A JSON object holding data about a director, containing name, bio and birth year
 * {
 *   "Name": "",
 *   "Bio": "",
 *   "Birth": "",
 * }
 */
app.get(
  '/movies/Director/:DirectorName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
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
  }
);

/**
 * This function will handle errors
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

 /**
 * Setting variable for port that will be listening for requests
 */
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});