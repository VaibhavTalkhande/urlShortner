const express = require('express');
const { connectToMongoDB } = require('./connect');
const users = require('./models/user');
const app = express();
const Path = require('path');
const port = 3000;
const URL = require('./models/url');
const urlRoute = require('./routes/url');
const dotenv = require('dotenv');
const jwt =require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const secret_key="secret_key";
connectToMongoDB("mongodb+srv://vaibhavtalkhande41:WrRaWwdE7o0KpGmT@cluster0.nekfshl.mongodb.net/?retryWrites=true&w=majority").then(
    () => console.log("Mongodb connected")
);
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use(express.static(Path.join(__dirname, 'views')));
app.use(cookieParser());//
app.use(express.json());
function requiresAuth() {
    return function (req, res, next) {
        const token = req.cookies.token;
        if (!token) {
            return res.redirect('/login');
        }
        try {
            const data = jwt.verify(token, secret_key);
            req.user = data;
            next();
        } catch {
            res.redirect('/login');
        }
    };
}
app.get('/login', (req, res) => {
    res.render('login');
});
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.redirect('/login');
    }
    const user = await users.findOne({ username: username });
    if (!user) {
        console.log("User not found");
        return res.redirect('/signup');
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        console.log("Invalid Password");
        return res.redirect('/signup');
    }
    const token = jwt.sign({ username: user.username }, secret_key);
    res.cookie('token', token);
    res.redirect('/test');

});
app.get('/signup', (req, res) => {

    res.render('signup');
});
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        console.log("Invalid Username or Password");
        return res.redirect('/signup');
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await users.create({
        username: username,
        password: hashedPassword,
    });
    const token = jwt.sign({ username: user.username ,password:user.password ,id: user._id}, secret_key);
    res.cookie('token', token);
    res.redirect('/test');
});
app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

app.get('/test',requiresAuth(),async(req, res) => {
    const user = await users.findOne({ username: req.user.username });
    const allUrls = await URL.find({ createdBy: user.username});

    res.render("home", { urls: allUrls ,user:user.username});
});

app.use('/url',requiresAuth(), urlRoute);

app.get('/url/:shortId',requiresAuth(), async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
        {
            shortId,
        },

        {
            $push: {
                visitHistory: {
                    timestamp: Date.now(),
                },

            },
        }

    );
    res.redirect(entry.redirectURL);
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}` 
    );
    console.log(`http://localhost:${port}`);
    }
);