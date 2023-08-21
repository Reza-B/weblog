import { object, string } from "yup";
import captchapng from "captchapng";

import Blog from "../models/blog.js";
import { formatDate, truncate } from "../utils/helpers.js";

let CAPTCHA_NUM;

export class BlogController {
	// Index page GET controller -- Render page
	static getIndex = async (req, res) => {
		const page = +req.query.page || 1;
		const postPerPage = 2;
		try {
			const numberOfPosts = await Blog.find({
				status: "public",
			}).countDocuments();

			const posts = await Blog.find({ status: "public" })
				.sort({
					createdAt: "desc",
				})
				.skip((page - 1) * postPerPage)
				.limit(postPerPage);

			res.render("index", {
				pageTitle: "وبلاگ",
				path: "/",
				posts,
				formatDate,
				truncate,
				currentPage: page,
				nextPage: page + 1,
				previousPage: page - 1,
				hasNextPage: postPerPage * page < numberOfPosts,
				hasPreviousPage: page > 1,
				lastPage: Math.ceil(numberOfPosts / postPerPage),
			});
		} catch (error) {
			res.status(500).render("errors/500");
		}
	};

	static getPost = async (req, res) => {
		try {
			const post = await Blog.findById(req.params.id).populate("user");
			if (!post) return res.redirect("errors/404");

			res.render("post", {
				pageTitle: "وبلاگ",
				path: "/post",
				post,
				formatDate,
			});
		} catch (error) {
			res.status(500).render("errors/500");
		}
	};

	static getContact = (req, res) => {
		res.render("contact", {
			pageTitle: "تماس با ما",
			path: "/contact",
			message: req.flash("success_msg"),
			error: req.flash("error"),
			errors: [],
		});
	};
	static handleContact = async (req, res) => {
		const errors = [];

		//const { fullname, email, message, captcha } = req.body;

		const schema = object().shape({
			fullname: string().required("نام و نام خانوادگی الزامی می باشد"),
			email: string()
				.email("آدرس ایمیل معتبر نیست")
				.required("آدرس ایمیل الزامی می باشد"),
			message: string().required("پیام اصلی الزامی می باشد"),
		});

		try {
			await schema.validate(req.body, { abortEarly: false });

			//? captcha
			if (parseInt(req.body.captcha) === CAPTCHA_NUM) {
				console.log(
					`
					send email
					sendEmail(email,fullname,'پیام از طرف وبلاگ',message)
					${req.body.name}
					${req.body.email}
					${req.body.message}
					`,
				);
				req.flash("success_msg", " پیام شما با موفقیت ارسال شد");
				return res.render("contact", {
					pageTitle: "تماس با ما",
					path: "/contact",
					message: req.flash("success_msg"),
					error: req.flash("error"),
					errors,
				});
			}

			req.flash("error", "کد امنیتی صحیح نمی باشد");
			res.render("contact", {
				pageTitle: "تماس با ما",
				path: "/contact",
				message: req.flash("success_msg"),
				error: req.flash("error"),
				errors,
			});
		} catch (err) {
			err.inner.forEach((e) => {
				errors.push({
					name: e.path,
					message: e.message,
				});
			});

			res.render("contact", {
				pageTitle: "تماس با ما",
				path: "/contact",
				message: req.flash("success_msg"),
				error: req.flash("error"),
				errors,
			});
		}
	};
	static getCaptcha = (req, res) => {
		CAPTCHA_NUM = parseInt(Math.random() * 9000 + 1000);
		const c = new captchapng(80, 30, CAPTCHA_NUM);
		c.color(0, 0, 0, 0);
		c.color(80, 80, 80, 255);

		const img = c.getBase64();
		const imgBase64 = Buffer.from(img, "base64");

		res.send(imgBase64);
	};
}
