# node-twitter-clone
Repository related to twitter clone platform.

## Description
node-twitter-clone is a social media platform that allows users to create, read, update, and delete tweets, follow/unfollow other users, and view their tweet feed.

## Technologies Used
Node.js
Express.js
MongoDB
Mongoose
JSON Web Tokens (JWT)

## Requirements
To run this application locally, you need to have the following software installed on your system:

Node.js (v14 or higher)
MongoDB
Installation

## Installation and Setup

# Installation
1. Clone the repository:

```bash https://github.com/AshwiniSC/node-twitter-clone

2. Install dependencies 
```bash cd node-twitter-clone
npm install

## API Endpoints
# User Authentication
POST /signup: Register a new user. Request body should contain "username" and "password".
POST /login: Log in an existing user. Request body should contain "username" and "password".
POST /logout: Log out the current user.

# Tweet Functionality
POST /tweets: Create a new tweet. Request body should contain "content".
GET /tweets: Get all tweets.
GET /tweets/:tweetId: Get a specific tweet by its ID.
PUT /tweets/:tweetId: Update a specific tweet by its ID. Request body should contain "content".
DELETE /tweets/:tweetId: Delete a specific tweet by its ID.

# Follow/Unfollow Functionality
POST /follow/:userId: Follow a user. Replace :userId with the target user's ID.
POST /unfollow/:userId: Unfollow a user. Replace :userId with the target user's ID.
# Tweet Feed
GET /tweet-feed: Fetch and display a user's tweet feed. Requires a valid JWT token.

##Authentication and Authorization
This application uses JSON Web Tokens (JWT) for user authentication. When a user registers or logs in, a JWT token is generated and returned in the response. This token is required for accessing protected routes, such as creating tweets, following/unfollowing users, and fetching the tweet feed.

To access protected routes, include the JWT token in the "Authorization" header of your requests:
```bash Authorization: Bearer YOUR_JWT_TOKEN_HERE
