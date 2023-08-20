import path from "path";

import express from "express";
import expressLayout from "express-ejs-layouts";
import dotenv from "dotenv";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import flash from "connect-flash";
import passport from "passport";
import debug from "debug";
import fileupload from "express-fileupload";

import connectDB from "./config/db.js";
import blogRoutes from "./routes/blog.js";
import dashRoutes from "./routes/dashboard.js";
import userRoutes from "./routes/user.js";
import winston from "./config/winston.js";
import { get404 } from "./controllers/errorController.js";

const __dirname = path.resolve();
const logger = debug("weblog-project");

//* Load config
dotenv.config({ path: "./config/config.env" });

//* Database connection
connectDB();
logger("connected to database");

//* Passport Configuration
import "./config/passport.js";

const app = express();

//* View Engine
app.use(expressLayout);
app.set("view engine", "ejs");
app.set("layout", "./layouts/mainLayout");
app.set("views", "views");

//* BodyParser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//* File Upload middleware
app.use(fileupload());

//* session
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		unset: "destroy",
		store: MongoStore.create({
			mongoUrl: "mongodb://127.0.0.1:27017/blog_db",
		}),
	}),
);

//* passport
app.use(passport.initialize());
app.use(passport.session());

//* connect flash
app.use(flash());

//* Static Folder
app.use(express.static(path.join(__dirname, "public")));

//* Routes
app.use(blogRoutes);
app.use("/dashboard", dashRoutes);
app.use("/users", userRoutes);

//* 404
app.use(get404);

//* Logging
if (process.env.NODE_ENV === "development") {
	logger("Morgan Enable");
	app.use(morgan("combined", { stream: winston.stream }));
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`,
	);
});
