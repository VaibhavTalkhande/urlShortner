const express = require('express');
const { connectToMongoDB } = require('./connect');
const app = express();
const Path = require('path');
const port = 3000;
const URL = require('./models/url');
const urlRoute = require('./routes/url');
 const { auth, requiresAuth } = require('express-openid-connect');
connectToMongoDB("mongodb+srv://vaibhavtalkhande41:WrRaWwdE7o0KpGmT@cluster0.nekfshl.mongodb.net/?retryWrites=true&w=majority").then(
    () => console.log("Mongodb connected")
);
const config = {
     authRequired: false,
     auth0Logout: true,
     baseURL: 'http://localhost:3000',
     clientID: 'qvvE7UYj9mlqCaT8OHeOUvnY9wwyZMqa',
     issuerBaseURL: 'https://dev-xrelja8soy47ptjo.us.auth0.com',
     secret: 'LONG_RANDOM_STRING'
 };
  
  // The `auth` router attaches /login, /logout
  // and /callback routes to the baseURL
app.use(auth(config));
  app.set('view engine', 'ejs'); //set view engine to ejs
  app.set('views', Path.join(__dirname, 'views')); //set views directory
  //convert form data to json
  app.use(express.urlencoded({ extended: false }));///extended false means we are not sending any nested object
   
  app.use(express.json());
  
  // req.oidc.isAuthenticated is provided from the auth router
 app.get('/', (req, res) => {
     res.send(
       req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out'
     )
  
   });
  
//   // The /profile route will show the user profile as JSON
app.get('/profile', requiresAuth(), (req, res) => {
     res.send(JSON.stringify(req.oidc.user, null, 2));
   });
app.get('/test',requiresAuth(),async(req, res) => {
    const allUrls = await URL.find({ createdBy: req.oidc.user.name});
    const user = req.oidc.user;
    
    res.render("home", { urls: allUrls ,user:user});
});

app.use('/url', urlRoute);

app.get('/url/:shortId', async (req, res) => {
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