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

const keywords = ['developer', 'engineer', 'software', 'frontend', 'fullstack', 'backend', 'data', 'scientist', 'designer']; 
const locations = ['nigeria']; 

// Cron Function for scraping jobs daily
cron.schedule('0 0 * * *', async () => {
    console.log('Daily scraping cron job started');
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
    console.log('Daily scraping cron job completed');
});

// Cron function for deleting jobs older than a week from DB
cron.schedule('0 0 * * 0', async () => {
    console.log('Weekly deletion cron job started');
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    try {
        const result = await Job.deleteMany({ scrapedAt: { $lt: oneWeekAgo } });
        console.log(`Deleted ${result.deletedCount} jobs older than a week.`);
    } catch (error) {
        console.error('Error deleting old jobs:', error);
    }
    console.log('Weekly deletion cron job completed');
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
