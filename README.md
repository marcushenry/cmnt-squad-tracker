# CMNT Squad Tracker

A web app for tracking Canada Men’s National Team (CMNT) players and their current club form, built with a focus on clean UI, real data, and modern DevOps practices.

Live site:  
https://cmnt.marcushenry.ca

---

## Purpose

This project was created to:
- Track CMNT players and their most recent club appearances
- Surface meaningful indicators such as minutes played, goals, assists, and match results
- Practice building and deploying a production-style web application using modern cloud and DevOps tooling

Rather than a static roster, the goal is to show who is actively playing at club level ahead of international competitions.

---

## Features

- CMNT player roster with club and position details
- Last club game data per player (date, opponent, competition, minutes, goals, result)
- “Last updated” timestamp for data freshness
- Clean, responsive UI with hover-based detail views
- Deployed as a production static site with CDN caching

---

## Tech Stack

### Frontend
- Next.js (React)
- TypeScript
- CSS Modules

### Data
- JSON-based player data
- Update scripts for last match statistics

### Infrastructure / DevOps
- AWS S3 (static hosting)
- AWS CloudFront (CDN)
- AWS Route 53 (DNS)
- AWS ACM (TLS certificates)
- Infrastructure as Code (Terraform / OpenTofu)
- GitHub for version control and environment branching (main, dev)

---

## Project Structure
├── components/ # Reusable React components
├── data/ # Player and match data (players.json)
├── pages/ # Next.js pages
├── public/ # Static assets
├── styles/ # Global and module styles
├── tools/ # Data update and fetch scripts
└── infra/ # Infrastructure-as-code configuration


---

## Data Updates

## Data Updates

Player club data is populated using a combination of static player data and **live match data pulled from an external football API**.

The **Last Club Match** statistics shown in the table (date, opponent, competition, minutes, goals, assists, result) are retrieved via update scripts and written into the project’s data layer to keep the site current.

During development, data updates may be triggered manually. The project is designed to support future improvements such as:
- Fully automated data ingestion from external football APIs
- Scheduled or build-time data refreshes
- Clear separation of generated data from source-controlled configuration


---

## Disclaimer

This project is not affiliated with Canada Soccer.  
All data is for informational and personal project use only.
