import Blog from "../models/blog.js";
import { formatDate, truncate } from "../utils/helpers.js";

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
}
