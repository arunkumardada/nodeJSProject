const asyncHandler = require("express-async-handler");
const userModel = require("../models/userModel");
const brcypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//@desc Register a User
//@route POST api/users/register
//@access Public

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }
  const userAvailable = await userModel.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error("User Already Registered");
  }
  // Hash the Password since cannot directly store password
  const hashedPassword = await brcypt.hash(password, 10);
  console.log("Hashed Password", hashedPassword);
  const user = await userModel.create({
    username,
    email,
    password: hashedPassword,
  });
  console.log("User Created Successfully", user);
  if (user) {
    res.status(201).json({ _id: user.id, email: user.email });
  } else {
    res.status(400);
    throw new Error("Invalid User Data");
  }
  res.json({ message: "Register user" });
});

//@desc Login a User
//@route POST api/users/login
//@access Public

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }
  const user = await userModel.findOne({ email }); // To check if user exists in db or not
  // Compare Password with Hashed Password
  if (user && (await brcypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          username: user.username,
          email: user.email,
          id: user._id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).json({ accessToken });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }

  res.json({ message: "Login user" });
});

//@desc Current User
//@route POST api/users/current
//@access Private

const currentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});
module.exports = { registerUser, loginUser, currentUser };
