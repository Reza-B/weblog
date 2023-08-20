import { unlink } from "fs";

import multer from "multer";
import sharp from "sharp";
import shortId from "short-unique-id";
import appRoot from "app-root-path";

import Blog from "../models/blog.js";
import { formatDate } from "../utils/helpers.js";
import { get500 } from "./errorController.js";

export default class adminController {
	// Dashboard page GET controller -- Render page
	static getDashboard = async (req, res) => {
		const page = +req.query.page || 1;
		const postPerPage = 2;
		try {
			const numberOfPosts = await Blog.find({
				user: req.user.id,
			}).countDocuments();

			const blogs = await Blog.find({ user: req.user.id })
				.skip((page - 1) * postPerPage)
				.limit(postPerPage);

			res.render("private/blogs", {
				pageTitle: "بخش مدیریت | داشبورد",
				path: "/dashboard",
				layout: "./layouts/dashLayout",
				fullname: req.user.fullname,
				blogs,
				formatDate,
				currentPage: page,
				nextPage: page + 1,
				previousPage: page - 1,
				hasNextPage: postPerPage * page < numberOfPosts,
				hasPreviousPage: page > 1,
				lastPage: Math.ceil(numberOfPosts / postPerPage),
			});
		} catch (error) {
			console.log(error);
			get500(req, res);
		}
	};

	// Add post page GET controller -- Render page
	static getAddPost = (req, res) => {
		res.render("private/addPost", {
			pageTitle: "بخش مدیریت | ساخت پست جدید",
			path: "/dashboard/add-post",
			layout: "./layouts/dashLayout",
			fullname: req.user.fullname,
		});
	};

	// Edit post page GET controller -- Render page
	static getEditPost = async (req, res) => {
		try {
			const post = await Blog.findById(req.params.id);

			//? Access validation
			if (!post) {
				return res.redirect("/errors/404");
			}
			if (post.user.toString() != req.user._id) {
				return res.redirect("/dashboard");
			}

			res.render("private/editPost", {
				pageTitle: "بخش مدیریت | ویزایش پست",
				path: "/dashboard/edit-post",
				layout: "./layouts/dashLayout",
				fullname: req.user.fullname,
				post,
			});
		} catch (error) {
			console.log(error);
		}
	};

	// delete post page GET controller -- Render page
	static deletePost = async (req, res) => {
		try {
			const post = await Blog.findById(req.params.id);

			//? Access validation
			if (!post) {
				return res.redirect("/errors/404");
			}
			if (post.user.toString() != req.user._id) {
				return res.redirect("/dashboard");
			}
			// await Blog.findByIdAndRemove(req.params.id);
			post.deleteOne();

			res.redirect("/dashboard");
		} catch (error) {
			res.render("errors/500");
		}
	};

	// Add post page POST controller -- Create Post
	static createPost = async (req, res) => {
		const uid = new shortId({
			length: 7,
		});

		const thumbnail = req.files ? req.files.thumbnail : {};
		const fileName = `${uid()}_${thumbnail.name}`;
		const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;
		const errors = [];

		try {
			req.body = { ...req.body, thumbnail };
			await Blog.postValidation(req.body);

			await sharp(req.files.thumbnail.data)
				.jpeg({ quality: 60 })
				.toFile(uploadPath);

			await Blog.create({
				...req.body,
				user: req.user.id,
				thumbnail: fileName,
			});

			res.redirect("/dashboard");
		} catch (err) {
			err.inner.forEach((e) => {
				errors.push({
					name: e.path,
					message: e.message,
				});
			});

			res.render("private/addPost", {
				pageTitle: "بخش مدیریت | ساخت پست جدید",
				path: "/dashboard/add-post",
				layout: "./layouts/dashLayout",
				fullname: req.user.fullname,
				errors,
			});
		}
	};

	// Edit post page POST controller -- Edit Post
	static editPost = async (req, res) => {
		const uid = new shortId({
			length: 7,
		});

		const thumbnail = req.files ? req.files.thumbnail : {};
		const fileName = `${uid()}_${thumbnail.name}`;
		const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;

		const errors = [];
		const post = await Blog.findById(req.params.id);
		try {
			if (thumbnail.name) {
				await Blog.postValidation({ ...req.body, thumbnail });
			} else {
				await Blog.postValidation({
					...req.body,
					thumbnail: { name: "placeholder", size: 0, mimetype: "image/jpeg" },
				});
			}

			//? Access validation
			if (!post) {
				return res.redirect("/errors/404");
			}
			if (post.user.toString() != req.user._id) {
				return res.redirect("/dashboard");
			} else {
				if (thumbnail.name) {
					unlink(
						`${appRoot}/public/uploads/tumbnails/${post.thumbnail}`,
						async (err) => {
							if (err) {
								console.log(err);
							} else {
								await sharp(req.files.thumbnail.data)
									.jpeg({ quality: 60 })
									.toFile(uploadPath);
							}
						},
					);
				}

				//? Edit parameters
				const { title, status, body } = req.body;
				post.title = title;
				post.status = status;
				post.body = body;
				post.thumbnail = thumbnail.name ? fileName : post.thumbnail;

				await post.save();
			}
			return res.redirect("/dashboard");
		} catch (err) {
			err.inner.forEach((e) => {
				errors.push({
					name: e.path,
					message: e.message,
				});
			});

			res.render("private/editPost", {
				pageTitle: "بخش مدیریت | ویرایش پست",
				path: "/dashboard/edit-post",
				layout: "./layouts/dashLayout",
				fullname: req.user.fullname,
				errors,
				post,
			});
		}
	};

	// Edit post controller
	static uploadImage = (req, res) => {
		const fileFilter = (req, file, cb) => {
			if (file.mimetype === "image/jpeg") {
				cb(null, true);
			} else {
				cb("تنها پسوند JPEG پشتیبانی میشود", false);
			}
		};
		const upload = multer({
			limits: { fileSize: 2000000 },
			fileFilter: fileFilter,
		}).single("image");

		upload(req, res, async (err) => {
			if (err) {
				if (err.code === "LIMIT_FILE_SIZE") {
					return res
						.status(400)
						.send("حجم عکس ارسالی نباید بیشتر از 2 مگابایت باشد!");
				}
				res.status(400).send(err);
			} else {
				if (req.file) {
					const uid = new shortId({
						length: 7,
					});
					const fileName = `${uid()}_${req.file.originalname}`;
					try {
						await sharp(req.file.buffer)
							.jpeg({
								quality: 60,
							})
							.toFile(`./public/uploads/${fileName}`);
						res.status(200).send(`http://localhost:3000/uploads/${fileName}`);
					} catch (error) {
						console.log(error);
						res.status(500).send("در هنگام آپلود عکس خطایی رخ داد.");
					}
				} else {
					res.send("برای آپلود باید ابتدا یک عکس انتخاب کنید.");
				}
			}
		});
	};
}
