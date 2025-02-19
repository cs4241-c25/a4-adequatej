# Anime Rating System

A web application that allows users to track and rate anime series. Users can add, edit, and delete anime entries, with each entry containing a title, rating, and number of episodes. The system automatically calculates a popularity score based on these metrics.

Vercel link: https://a4-adequatej-git-main-jed-geoghegans-projects.vercel.app

## Changes from Assignment 3:
- Migrated from vanilla JavaScript to TypeScript for better type safety and developer experience (also just want to get better at TypeScript)
- Rebuilt with React and Next.js framework
- Added user authentication using NextAuth.js
- Implemented MongoDB database for persistent storage
- Added dark mode support using Tailwind CSS
- Improved UI/UX with responsive design and form validation
- Added server-side data validation and error handling through Next.js API routes
- Implemented protected routes and user-specific data
- Added real-time updates when modifying anime entries


## Initial Issues:
I had two problems with my Next.js app. First, my DELETE route wasn't working because Next.js 15.1.7 is picky about route parameters being Promises. Instead of messing with DELETE, I switched to using GET with a query parameter (_method=DELETE) since GET routes work better in this version. Second, I had my authOptions in the wrong place. Next.js 15.1.7 only wants route files to handle HTTP stuff (GET, POST, etc.), not store configuration. So I moved authOptions to its own config file and imported it where needed. Once I made these two changes, it started working!