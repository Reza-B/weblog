const get404 = (req, res) =>
	res.render("errors/404", { pageTitle: "صفحه پیدا نشد | 404", path: "/404" });

const get500 = (req, res) =>
	res.render("errors/500", { pageTitle: "خطای سمت سرور | 500", path: "/500" });

export { get404, get500 };
