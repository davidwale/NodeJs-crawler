const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
require('dotenv').config();
const { scrapeAllPlatforms } = require('./crawler'); 
const Job = require('./model/job'); 

const app = express();
const PORT = 4000;

app.use(cors());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Database Connection Successful');
    })
    .catch((e) => {
        console.error('Error connecting to MongoDB:', e.message);
    });

const keywords = ['developer', 'engineer', 'software developer', 'data scientist']; 
const locations = ['lagos', 'abuja', 'port harcourt', 'nigeria']; 

cron.schedule('0 */1 * * *', async () => {
    console.log('Cron job started');
    for (const keyword of keywords) {
        for (const location of locations) {
            try {
                await scrapeAllPlatforms(keyword, location);
                console.log(`Scraped data for ${keyword} in ${location} at ${new Date().toLocaleTimeString()}`);
            } catch (error) {
                console.error(`Failed to scrape data for ${keyword} in ${location}:`, error);
            }
        }
    }
    console.log('Cron job completed');
});

app.get('/api/jobs', async (req, res) => {
    let { keyword, location } = req.query;

    keyword = keyword || '';
    location = location || '';

    try {
        let jobs;

        const query = {};
        if (keyword) {
            query.keyword = { $regex: new RegExp(keyword, 'i') }; 
        }
        if (location) {
            query.location = { $regex: new RegExp(location, 'i') }; 
        }

        jobs = await Job.find(query).sort({ scrapedAt: -1 }).limit(20);

        if (jobs.length === 0 && keyword) {
            const similarJobs = await Job.find({
                keyword: { $regex: new RegExp(keyword, 'i') } 
            }).sort({ scrapedAt: -1 }).limit(20);

            if (similarJobs.length > 0) {
                jobs = similarJobs;
            }
        }

        res.json({ jobs });
    } catch (error) {
        console.error('Error fetching job data:', error);
        res.status(500).send('Error fetching job listings');
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
    console.log('Scheduling cron job');
});
