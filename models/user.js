import mongoose from "mongoose";

import schema from "./secure/userValidation.js";

const userSchema = new mongoose.Schema({
	fullname: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		uniqe: true,
	},
	password: {
		type: String,
		required: true,
		minlength: 4,
		maxlength: 255,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

userSchema.statics.userValidation = function (body) {
	return schema.validate(body, { abortEarly: false });
};

const User = mongoose.model("User", userSchema);

export default User;
