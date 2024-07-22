# Movie_api Database

A server-side component of "movies" web application. The web application will provide users with access to information about different movies, directors, and genres. Users will be able to sign up, update their personal information, and create a list of their favourite movies.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [License](#license)

## Key Features

- **Movies API**: Access movie details including description, genre, director information.
- **User Management**: Manage users and their favorite movies.
- **Authentication**: JWT-based security.
- **Swagger Documentation**: Interactive API docs.
- **Data Validation**: Ensures data integrity.

## Technologies
This application is built using the following technologies:

- **Express.js**: Node.js web framework.
- **MongoDB**: NoSQL database.
- **Mongoose**: MongoDB ODM.
- **Passport.js**: Authentication middleware.
- **Swagger**: API documentation tool.
- **Cors**: Cross-Origin Resource Sharing middleware.
- **Bcrypt**: Password hashing.


## API Endpoints
Movies
- Get all movies: GET /movies
- Get a movie by title: GET /movies/:title
- Get movies by genre: GET /movies/Genre/:GenreName
- Get a director by name: GET /Director/:DirectorName

Users
- Create a user: POST /users
- Update user info: PUT /users/:Username
- Add movie to favorites: POST /users/:Username/movies/:MovieID
- Remove movie from favorites: DELETE /users/:Username/movies/:MovieID
- Delete a user: DELETE /users/:Username


