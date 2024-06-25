const puppeteer = require('puppeteer');
const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');


async function scrapeIndeed(keyword, location) {
    puppeteerExtra.use(pluginStealth());
    const browser = await puppeteerExtra.launch();
    const page = await browser.newPage();
    const IndeedUrl = `https://ng.indeed.com/jobs?q=${keyword || 'developer'}&l=${location || 'lagos'}`;

    try {
         page.setDefaultNavigationTimeout(0);
        await page.goto(IndeedUrl);
        const jobs = await page.evaluate(() =>
            Array.from(document.querySelectorAll('.job_seen_beacon'), (e) => ({
                title: e.querySelector('.jobTitle')?.innerText || 'N/A',
                companyName: e.querySelector('[data-testid=company-name]')?.innerText || 'N/A',
                companyURL: e.querySelector('.base-search-card__subtitle a')?.href || 'N/A',
                jobLocation: e.querySelector('[data-testid=text-location]')?.innerText || 'N/A',
                jobDuration: e.querySelector('[data-testid=myJobsStateDate]')?.innerText || 'N/A',
                jobURL: e.querySelector('a')?.href || 'N/A',
            }))
        );
        return jobs;
    } catch (error) {
        console.error(error);
        throw new Error('Error scraping Indeed' + error);
    } finally {
        await browser.close();
    }
}
async function scrapeLinkedIn(keyword, location) {
    puppeteerExtra.use(pluginStealth());
    const browser = await puppeteerExtra.launch();
    const page = await browser.newPage();
    const linkedinUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${keyword || 'developer'}&location=${location || 'lagos'}`;

    try {
        page.setDefaultNavigationTimeout(0);
        await page.goto(linkedinUrl);
        const jobs = await page.evaluate(() =>
            Array.from(document.querySelectorAll('li'), (e) => ({
                title: e.querySelector('.base-search-card__title')?.innerText || 'N/A',
                companyName: e.querySelector('.base-search-card__subtitle a')?.innerText || 'N/A',
                companyURL: e.querySelector('.base-search-card__subtitle a')?.href || 'N/A',
                jobLocation: e.querySelector('.job-search-card__location')?.innerText || 'N/A',
                jobDuration: e.querySelector('time')?.innerText || 'N/A',
                jobURL: e.querySelector('a.base-card__full-link')?.href || 'N/A',
            }))
        );
        return jobs;
    } catch (error) {
        console.error(error);
        throw new Error('Error scraping LinkedIn');
    } finally {
        await browser.close();
    }
}

async function scrapeJobberman(keyword, location) {
    puppeteerExtra.use(pluginStealth());
    const browser = await puppeteerExtra.launch();
    const page = await browser.newPage();
    const jobbermanUrl = `https://www.jobberman.com/jobs?q=${keyword || 'developer'}&l=${location || 'lagos'}`;

    try {
        page.setDefaultNavigationTimeout(0);
        await page.goto(jobbermanUrl);
        const jobs = await page.evaluate(() =>
            Array.from(document.querySelectorAll('[data-cy=listing-cards-components]'), (e) => ({
                title: e.querySelector('[data-cy=listing-title-link]').innerText || 'N/A',
                companyName: e.querySelector('.text-loading-animate-link').innerText || 'N/A',
                companyURL: e.querySelector('.text-loading-animate-link').href || 'N/A',
                jobLocation: e.querySelector('.text-loading-hide').innerText || 'N/A',
                jobDuration: e.querySelector('p .text-loading-animate').innerText || 'N/A',
                jobURL: e.querySelector('[data-cy=listing-title-link]').href || 'N/A',
       }))
        );
        return jobs;
    } catch (error) {
        console.error(error);
        throw new Error('Error scraping Jobberman');
    } finally {
        await browser.close();
    }
}

async function scrapeAllPlatforms(keyword, location) {
    try {
        const [indeedJobs, linkedInJobs, jobbermanJobs] = await Promise.all([
            scrapeIndeed(keyword, location),
            scrapeLinkedIn(keyword, location),
            scrapeJobberman(keyword, location)
        ]);
        return [...indeedJobs, ...linkedInJobs, ...jobbermanJobs];
    } catch (error) {
        console.error(error);
        throw new Error('Error scraping all platforms');
    }
}

module.exports = {
    scrapeIndeed,
    scrapeLinkedIn,
    scrapeJobberman,
    scrapeAllPlatforms,
};
