# Job Scraper

## Overview

Job Scraper is a Node.js-based application designed to scrape job listings from various platforms such as Indeed, LinkedIn, and Jobberman. It stores the scraped job data in a MongoDB database and provides an API to fetch job listings. The application also includes a cron job to regularly update the job listings and delete outdated data.

## Features

- Scrape job listings from Indeed, LinkedIn, and Jobberman.
- Store job listings in a MongoDB database.
- Fetch job listings via an API.
- Regularly update job listings every day at midnight.
- Delete job listings older than a week every Sunday at midnight.

## Prerequisites

- Node.js
- MongoDB
- npm or yarn

## Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/davidwale/NodeJs-crawler.git
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

   or

   ```sh
   yarn install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory and add the following:

   ```sh
   MONGODB_URI=your_mongodb_connection_string
   ```

4. **Run the application:**

   ```sh
   npm start
   ```

   or

   ```sh
   yarn start
   ```

## API Endpoints

- **Fetch job listings:**

  ```
  GET /api/jobs?keyword={keyword}&location={location}
  ```

  - **Query Parameters:**

    - `keyword`: The job keyword to search for.
    - `location`: The job location to search for.

  - **Response:**
    ```json
    {
      "jobs": [
        {
          "_id": "60c72b2f9b1d4b2d88f0e4c7",
          "title": "Software Developer",
          "companyName": "Tech Company",
          "companyURL": "https://www.example.com",
          "jobLocation": "Lagos, Nigeria",
          "jobDuration": "Full-time",
          "jobURL": "https://www.example.com/job/1",
          "keyword": "developer",
          "location": "nigeria",
          "scrapedAt": "2024-06-25T12:34:56.789Z"
        }
      ]
    }
    ```

## How It Works

### Scraping Job Listings

The application uses `puppeteer-extra` and `puppeteer-extra-plugin-stealth` to scrape job listings from Indeed, LinkedIn, and Jobberman. The scraping functions are defined in the `crawler.js` file and are called by the cron job scheduled in the `index.js` file.

### Storing Job Listings

The scraped job listings are stored in a MongoDB database. The `Job` model is defined in the `model/job.js` file.

### Fetching Job Listings

The job listings can be fetched via the `/api/jobs` endpoint. The endpoint accepts `keyword` and `location` as query parameters and returns job listings that match the criteria. If no exact matches are found, it returns similar job listings based on the keyword.

### Cron Jobs

Two cron jobs are scheduled in the `index.js` file:

1. **Daily Scraping:** Runs every day at midnight to scrape job listings from all platforms.
2. **Weekly Deletion:** Runs every Sunday at midnight to delete job listings older than a week.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you have any improvements or bug fixes.

## License

This project is licensed under the MIT License.
