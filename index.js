// Require express
const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

// Initialize express
const app = express();

app.use(bodyParser.json());

let users = [
  {
    id: 1,
    name: "Corinne",
    favouriteMovie: ["The Grand Budapest Hotel"]
  },
  {
    id: 2,
    name: "Oscar",
    favouriteMovie: [" "]
  },
];

// Top Movies
let movies = [
  {
    "title":"The Shawshank Redemption",
    "description":"Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.",
    "genre":{ //1 detailed genre data for bonus task
      "name":"Drama",
      "description":"In film and television, drama is a category of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone."
    },
    "director":"Frank Derabont",
    "imageURL":"https://media.themoviedb.org/t/p/w300_and_h450_bestv2/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg"
  },
  {
    "title":"The Lord of the Rings: The Fellowship of the Ring",
    "description":"Young hobbit Frodo Baggins, after inheriting a mysterious ring from his uncle Bilbo, must leave his home in order to keep it from falling into the hands of its evil creator. Along the way, a fellowship is formed to protect the ringbearer and make sure that the ring arrives at its final destination: Mt. Doom, the only place where it can be destroyed.",
    "genre":"Adventure, Fantasy, Action",
    "director":"Peter Jackson",
    "imageURL":"https://www.themoviedb.org/movie/120-the-lord-of-the-rings-the-fellowship-of-the-ring?language=en-GB#"
  },
  {
    "title":"Indiana Jones and the Temple of Doom",
    "description":"After arriving in India, Indiana Jones is asked by a desperate village to find a mystical stone. He agrees and stumbles upon a secret cult plotting a terrible plan in the catacombs of an ancient palace.",
    "genre":"Adventure, Action",
    "director": { //1 detailed director data for bonus task
      "name":"Steven Spielberg",
      "Bio": "American film director, writer and producer. A major figure of the New Hollywood era and pioneer of the modern blockbuster, he is the most commercially successful director of all time. Spielberg is the recipient of various accolades, including three Academy Awards, a Kennedy Center honor, four Directors Guild of America Awards, two BAFTA Awards, a Cecil B. DeMille Award and an AFI Life Achievement Award.",
      "Birth": "1946"
    },
    "imageURL":"https://media.themoviedb.org/t/p/w300_and_h450_bestv2/om61eim8XwLfh6QXzh2r0Q4blBz.jpg"
  },
  {
    "title":"Inception",
    "description":"Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: 'inception', the implantation of another person's idea into a target's subconscious.",
    "genre":"Action, Science Fiction, Adventure",
    "director":"Christopher Nolan",
    "imageURL":"https://media.themoviedb.org/t/p/w300_and_h450_bestv2/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg"
  },
  {
    "title":"Spirited Away",
    "description":"A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.",
    "genre":"Animation, Family, Fantasty",
    "director":"Hayao Miyazaki",
    "imageURL":"https://media.themoviedb.org/t/p/w300_and_h450_bestv2/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg"
  },
  {
    "title":"Eternal Sunshine of the Spotless Mind",
    "description":"Joel Barish, heartbroken that his girlfriend underwent a procedure to erase him from her memory, decides to do the same. However, as he watches his memories of her fade away, he realises that he still loves her, and may be too late to correct his mistake.",
    "genre":"Science Fiction, Drama, Romance",
    "director":"Michel Gondry",
    "imageURL":"https://media.themoviedb.org/t/p/w300_and_h450_bestv2/5MwkWH9tYHv3mV9OdYTMR5qreIz.jpg"
  }
];

// Invoke middeware function (Morgan)
app.use(morgan('common'));

// express.static to serve documentation.html file from public folder
app.use('/documentation', express.static('public', {index: 'documentation.html'})); 

// CREATE new user registration
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send('users need names')
  }
})

// UPDATE user info
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id );

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('no such user')
  }
})

// CREATE user favourite movie
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    user.favouriteMovie.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }
})

// DELETE movie from user favourites
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    user.favouriteMovie = user.favouriteMovie.filter( title => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }
})

// DELETE user deregistration
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    users = users.filter( user => user.id != id);
    res.status(200).send(`user ${id} has been deleted`);
  } else {
    res.status(400).send('no such user')
  }
})

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my Movies App!');
})

// READ list of all movies to user
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
})

// READ movie data by title
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find( movie => movie.title === title );

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('no such movie')
  }
})

// READ movie genre
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.genre.name === genreName ).genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('no such genre')
  }
})

// READ movie director
app.get('/movies/director/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find( movie => movie.director.name === directorName ).director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('no such director')
  }
})

// Error handling via middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });  

// Listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});