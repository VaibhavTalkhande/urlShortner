const express = require('express');
const Path = require('path');
const app = express();
const port = 8001;
const { connectToMongoDB } = require('./connect');
const urlRoute = require('./routes/url');
const URL = require('./models/url');


connectToMongoDB("mongodb+srv://vaibhavtalkhande41:WrRaWwdE7o0KpGmT@cluster0.nekfshl.mongodb.net/?retryWrites=true&w=majority").then(
    () => console.log("Mongodb connected")
);
app.set('view engine', 'ejs'); //set view engine to ejs
app.set('views', Path.join(__dirname, 'views')); //set views directory
//convert form data to json
app.use(express.urlencoded({ extended: false }));///extended false means we are not sending any nested object
 
app.use(express.json());
app.get('/test', async(req, res) => {
    const allUrls = await URL.find({});
    
    res.render("home", { urls: allUrls });
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