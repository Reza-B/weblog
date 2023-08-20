import Bcrypt from "bcryptjs";
import passport from "passport";
import fetch from "node-fetch";

import User from "../models/user.js";

export default class userController {
	// Login page GET controller -- Render page
	static login = (req, res) => {
		res.render("login", {
			pageTitle: "ورود به بخش مدیریت",
			path: "/login",
			message: req.flash("success_msg"),
			error: req.flash("error"),
		});
	};

	// Login page POST controller -- login User
	static handleLogin = async (req, res, next) => {
		if (!req.body["g-recaptcha-response"]) {
			req.flash(
				"error",
				"تو رباتی؟ اگه نستی تیک من ربات نیستم را بزن و ثابتش کن!",
			);
			return res.redirect("/users/login");
		}

		const secretKey = process.env.CAPTCHA_SECRET;
		const verifyUrl = `
         https://google.com/recaptcha/api/siteverify?secret=${secretKey}
         &response=${req.body["g-recaptcha-response"]}
         &remoteip=${req.connection.remoteAddress}
      `;

		const response = await fetch(verifyUrl, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/x-www-urlencoded; charset=utf-8",
			},
		});

		const responseJSON = await response.json();
		console.log(responseJSON);

		if (responseJSON.success) {
			passport.authenticate("local", {
				failureRedirect: "/users/login",
				failureFlash: true,
			})(req, res, next);
		} else {
			req.flash("error", "مشکلی در اعتبار سنجی پیش آمد!");
			res.redirect("/users/login");
		}
	};

	// Remember Me
	static remember = (req, res) => {
		if (req.body.remember) {
			req.session.cookie.originalMaxAge = 24 * 60 * 6000;
		} else {
			req.session.cookie.expire = null;
		}
		res.redirect("/dashboard");
	};

	// Logout controller
	static logout = (req, res) => {
		req.session = null;
		req.logout((err) => {
			if (err) {
				console.log(err);
			}
			// req.flash("success_msg", "خروج موفقیت آمیز بود");
			res.redirect("/users/login");
		});
	};

	// Register page GET controller -- Render page
	static register = (req, res) => {
		res.render("register", {
			pageTitle: "ثبت نام کاربر جدید",
			path: "/register",
		});
	};

	// Register page POST controller -- Create User
	static createUser = async (req, res) => {
		const errors = [];
		try {
			// User validation
			await User.userValidation(req.body);
			const { fullname, email, password } = req.body;

			// User email validation
			const user = await User.findOne({ email });
			if (user) {
				errors.push({ message: "کاربری با این ایمیل موجود است!" });
				return res.render("register", {
					pageTitle: "ثبت نام کاربر",
					path: "/register",
					errors,
				});
			}
			//Generate password hash
			const passHash = await Bcrypt.hash(password, 10);

			//Create User and redirect to login page
			await User.create({
				fullname,
				email,
				password: passHash,
			});

			req.flash("success_msg", "ثبت نام موفقیت آمیز بود.");
			res.redirect("/users/login");
		} catch (err) {
			// Push errors
			err.inner.forEach((e) => {
				errors.push({
					name: e.path,
					message: e.message,
				});
			});

			// Re-render register page with errors
			return res.render("register", {
				pageTitle: "ثبت نام کاربر",
				path: "/register",
				errors,
			});
		}
	};
}
