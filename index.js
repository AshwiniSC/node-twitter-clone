const express = require("express");
const mongoose = require("mongoose"); // 23281395
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User, Tweet } = require("./db"); // Replace with the actual path to your user schema file

const app = express();

// Add middleware for parsing JSON data
app.use(express.json());

// Add routes and other configurations here
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Connection URI.
const uri = "mongodb://localhost:27017/twitter_clone";

// Establish the MongoDB connection
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB database"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// JWT secret key.
const secretKey = "1234567890";

// Middleware to authenticate the token
function authenticateToken(req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token." });
    }

    req.user = user;
    next();
  });
}

// Start - Resgister and Login user APIs
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Hash the password before saving it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    // Save the user in the database
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error while registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username exists in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a JSON Web Token (JWT) for user authentication
    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error while logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API to get user information after login
app.get("/user", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user information:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API to logout a user
app.post("/logout", authenticateToken, async (req, res) => {
  try {
    // Create a new JWT token with a short expiration time (e.g., 1 second)
    const logoutToken = jwt.sign({}, secretKey, { expiresIn: "1s" });

    res
      .status(200)
      .json({ message: "User logged out successfully.", logoutToken });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//--------------END------------------//

//--------------START---------------//
// API to create a new tweet
app.post("/tweets", async (req, res) => {
  try {
    const { content, author } = req.body;

    // Create a new tweet
    const newTweet = new Tweet({
      content,
      author,
    });

    // Save the tweet in the database
    await newTweet.save();

    res.status(201).json(newTweet);
  } catch (error) {
    console.error("Error creating tweet:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API to get all tweets
app.get("/tweets", async (req, res) => {
  try {
    // Fetch all tweets from the database
    const tweets = await Tweet.find().populate("author", "username");

    res.status(200).json(tweets);
  } catch (error) {
    console.error("Error getting tweets:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API to update a tweet
app.put("/tweets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Find the tweet by its ID and update the content
    const updatedTweet = await Tweet.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );

    if (!updatedTweet) {
      return res.status(404).json({ message: "Tweet not found" });
    }

    res.status(200).json(updatedTweet);
  } catch (error) {
    console.error("Error updating tweet:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API to delete a tweet
app.delete("/tweets/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the tweet by its ID and delete it
    const deletedTweet = await Tweet.findByIdAndDelete(id);

    if (!deletedTweet) {
      return res.status(404).json({ message: "Tweet not found" });
    }

    res.status(200).json({ message: "Tweet deleted successfully" });
  } catch (error) {
    console.error("Error deleting tweet:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API to follow a user
app.post("/follow/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await User.findById(id);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    await currentUser.follow(id);
    res.status(200).json({ message: "User followed successfully." });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API to unfollow a user
app.post("/unfollow/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await User.findById(id);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    await currentUser.unfollow(userId);
    res.status(200).json({ message: "User unfollowed successfully." });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API to fetch tweet feed
app.get("/tweet-feed", authenticateToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId).populate(
      "following"
    );

    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Get an array of userIds that the currentUser follows, including their own userId
    const userIds = [
      currentUser._id,
      ...currentUser.following.map((user) => user._id),
    ];

    // Fetch tweets from the users in the userIds array
    const tweetFeed = await Tweet.find({ author: { $in: userIds } }).populate(
      "author",
      "username"
    );

    res.status(200).json(tweetFeed);
  } catch (error) {
    console.error("Error fetching tweet feed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
