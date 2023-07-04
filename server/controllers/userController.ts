import bcrypt from "bcryptjs";
import db from "../models/dbModel";
import { Response, NextFunction } from "express";
import UserRequest from "../backendTypes";

/*
Create user table with the following
CREATE TABLE users (
  user_id   SERIAL PRIMARY KEY,
  email     VARCHAR(50),
  firstName VARCHAR(50),
  lastName  VARCHAR(50),
  address   VARCHAR(50),
  username  VARCHAR(50),
  password  VARCHAR(100)
);
*/

const userController = {
  createUser: async (req: UserRequest, res: Response, next: NextFunction) => {
    console.log("createUser called");
    const { email, firstName, lastName, address, username, password } =
      req.body;
    // if all fields are passed in, check if username already exists, if so return 'Username exists'
    if (email && firstName && lastName && address && username && password) {
      try {
        let queryString = "SELECT user_id FROM users WHERE username=($1)";
        let result = await db.query(queryString, [username]);
        if (result.rows[0]) {
          console.log("Username already exists");
          return res
            .status(401)
            .json("Username already exists, please select another");
        } else {
          // if username does not exist, hash the password, then add fields with hashed password to users table, assign user_id to res.locals.id,  finally return next
          const hashed = await bcrypt.hash(password, 10);
          queryString =
            "INSERT INTO users (email, firstName, lastName, address, username, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id";
          result = await db.query(queryString, [
            email,
            firstName,
            lastName,
            address,
            username,
            hashed,
          ]);
          res.locals.id = result.rows[0].user_id;
          console.log("new user created", result.rows[0]);
          return next();
        }
      } catch (err) {
        return next({
          log: `Error in userController.createUser: ${err}`,
          status: 500,
          message: "unable to create account",
        });
      }
    }
    console.log("Signup field missing");
    return res.status(400).json("Please fill out all fields");
  },
  verifyUser: async (req: UserRequest, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    console.log("verifyUser called", username, password);
    // if username and password are passed in, select user_id, username, and password from DB where username matches input username
    if (username && password) {
      try {
        const queryString =
          "SELECT user_id, username, password FROM users WHERE username = $1";
        const result = await db.query(queryString, [username]);
        console.log("query result", result.rows[0]);
        // check if stored hashed password matches input password, if so assign user_id to res.locals.id and return next, else response with invalid username or password
        const compare = await bcrypt.compare(password, result.rows[0].password);
        console.log("compare", compare);
        if (compare) {
          res.locals.id = result.rows[0].user_id;
          return next();
        } else {
          return res.status(401).json("Invalid username or password");
        }
      } catch (err) {
        return next({
          log: `Error in verifyUser: ${err}`,
          status: 500,
          message: "Error verifying account",
        });
      }
    }
    console.log("username or password not entered");
    return res.status(400).json("Please enter a username and password");
  },
};

export default userController;
