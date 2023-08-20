import passport from "passport";
import { Strategy } from "passport-local";
import bcrypt from "bcryptjs";

import User from "../models/user.js";

passport.use(
   new Strategy({ usernameField: "email" }, async (email, password, done) => {
      try {
         const user = await User.findOne({ email });
         if (!user) {
            return done(null, false, { message: "کاربری با ایمیل یافت نشد!" });
         }
         const isMatch = await bcrypt.compare(password, user.password);
         if (isMatch) {
            return done(null, email);
         }
         return done(null, false, { message: "نام کاربری یا کلمه عبور صحیح نمی باشد!" });
      } catch (error) {
         console.log(error);
      }
   })
);

passport.serializeUser((user, done) => {
   done(null, user);
});

passport.deserializeUser(async (email, done) => {
   try {
      const user = await User.findOne({ email });
      done(null, user);
   } catch (error) {
      done(error);
   }
});
