const puppeteer = require('puppeteer');

async function scrapeIndeed(keyword, location) {

    const browser = await puppeteer.launch();
    const page = await browser.newPage()
    const linkedinUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${keyword}&location=${location}`;
    try {
         await page.goto(linkedinUrl);

    
    const jobs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('li'), (e) => ({
            title: e.querySelector('.base-search-card__title').innerText,
            companyName: e.querySelector('.base-search-card__subtitle a').innerText,
            companyURL: e.querySelector('.base-search-card__subtitle a').href,
            jobLocation: e.querySelector('.job-search-card__location').innerText,
            jobDuration: e.querySelector('time').innerText,
            jobURL: e.querySelector('a.base-card__full-link').href,
       }))
        );
    return jobs;
    } catch (error) {
        console.error(error)
        res.status(500).send('Error site');
    } finally {
        await browser.close();

    }

}

module.exports = {
    scrapeIndeed,
};
