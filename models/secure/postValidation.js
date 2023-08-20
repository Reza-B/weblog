import { mixed, number, object, string } from "yup";

const schema = object().shape({
	title: string()
		.required("عنوان پست الزامی میباشد.")
		.min(5, "طول عنوان پست باید بیشتر از 5 کاراکتر باشد.")
		.max(100, "طول عنوان پست باید کمتر از 100 کاراکتر باشد."),
	body: string().required("متن اصلی پست الزامی میباشد."),
	status: mixed().oneOf(
		["public", "private"],
		"یکی از 2 وضعیت عمومی یا خصوصی را انتخاب کنید.",
	),
	thumbnail: object().shape({
		name: string().required("عکس بند انگشتی عنوان الزامی می باشد"),
		size: number().max(2000000, "حجم عکس نباید بیشتر از 2 مگابایت باشد"),
		mimetype: mixed().oneOf(
			["image/jpeg", "image/png"],
			"تنها پسوند های png و jpeg پشتیبانی میشود",
		),
	}),
});

export default schema;
