const express = require('express');
const app = express();
const port = 8001;
const { connectToMongoDB } = require('./connect');
const urlRoute = require('./routes/url');
const URL = require('./models/url');

connectToMongoDB("mongodb+srv://vaibhavtalkhande41:WrRaWwdE7o0KpGmT@cluster0.nekfshl.mongodb.net/?retryWrites=true&w=majority").then(
    () => console.log("Mongodb connected")
);


app.use(express.json());

app.use('/url', urlRoute);

app.get('/:shortId', async (req, res) => {
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