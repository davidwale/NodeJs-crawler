const express = require('express');
const cors = require('cors');
const { scrapeAllPlatforms } = require('./crawler');

const app = express();
const PORT = 4000;

app.use(cors());

app.get('/api/jobs', async (req, res) => {
    const { keyword, location } = req.query;

    try {
        const Jobs = await scrapeAllPlatforms(keyword, location);
        res.json({ jobs: Jobs });
    } catch (error) {
        console.error('Error scraping job board:', error);
        res.status(500).send('Error scraping job listings');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
