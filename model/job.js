const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: String,
    companyName: String,
    companyURL: String,
    jobLocation: String,
    jobDuration: String,
    jobURL: String,
    keyword: String,
    location: String,
    scrapedAt: { type: Date, default: Date.now }
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
