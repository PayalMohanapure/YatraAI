const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup");
};

module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash("success", "Welcome to YatraAI!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
};

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back to YatraAI!");
    res.redirect("/listings");
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Goodbye! See you soon.");
        res.redirect("/listings");
    });
};

module.exports.renderProfile = async (req, res) => {
    // Populate or just render since we have req.user
    const user = await User.findById(req.user._id);
    res.render("users/profile", { user });
};

module.exports.updateProfile = async (req, res) => {
    const { firstName, lastName } = req.body;
    const user = await User.findById(req.user._id);
    
    user.firstName = firstName;
    user.lastName = lastName;

    if (req.file) {
        user.profileImage = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await user.save();
    res.redirect("/profile");
};
