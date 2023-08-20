import moment from "jalali-moment";

const formatDate = (date) => moment(date).locale("fa").format("YYYY/MM/DD");

const truncate = (str, len) => {
	if (len > 0 && str.length > len) {
		let newStr = str.substr(0, len);
		newStr = str.substr(0, newStr.lastIndexOf(" "));
		newStr = newStr.length > 0 ? newStr : str.substr(0, len);
		return newStr + " ...";
	}
	return str;
};

export { truncate, formatDate };
