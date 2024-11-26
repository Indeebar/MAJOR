const User = require("../models/user");
const passport = require("passport");

// Controller for rendering the signup form
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

// Controller for handling signup logic
module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

// Controller for rendering the login form
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

// Controller for handling login logic
module.exports.login = (req, res) => {
    delete req.session.redirectUrl; // Clear the session value
    req.flash("success", "Welcome back!");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

// Controller for handling logout
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};
