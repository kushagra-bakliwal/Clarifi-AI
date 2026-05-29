# Quick Start - Testing Your Backend

## Option 1: Download Sample CSV

Copy this data and save as `sample_reviews.csv`:

```csv
Review Text,Rating,Date,Customer Name,Source
"Amazing product! Best I've used",5,2024-02-20,Alice Johnson,App Store
"Login broken - can't access my account!",1,2024-02-19,Bob Smith,Support
"Good but expensive for startups",3,2024-02-18,Carol White,Website
"Crashes on Android constantly",1,2024-02-21,David Lee,Google Play
"Love the export feature!",5,2024-02-17,Emma Davis,App Store
"Too slow to load",2,2024-02-22,Frank Miller,Twitter
"Need API integration",4,2024-02-16,Grace Chen,Email
"App freezes with large files",2,2024-02-23,Henry Kim,Support
"Best feedback tool ever!",5,2024-02-15,Isabel Garcia,G2
"Would love offline mode",4,2024-02-14,Jack Wilson,Feature Request
"Report bug - missing data",2,2024-02-24,Karen Brown,Support
"Beautiful UI design",5,2024-02-13,Leo Martinez,App Store
"Need team collaboration",3,2024-02-25,Maria Lopez,Email
"AI is incredibly accurate",5,2024-02-12,Nathan Taylor,LinkedIn
"Error messages unclear",3,2024-02-11,Olivia Moore,Support
"Slow on old devices",2,2024-02-10,Paul Anderson,Google Play
"Keyword extraction works great!",5,2024-02-09,Quinn Thomas,App Store
"Too expensive for small teams",3,2024-02-08,Rachel Hill,Email
"Critical: duplicate data in export",1,2024-02-07,Sam Wright,Support
"Excellent support team!",5,2024-02-06,Tina Scott,Trustpilot
```

## Option 2: Create Your Own

Your CSV needs these columns (flexible names):
- **Review Text** (or text, review, comment)
- **Rating** (1-5 stars)
- **Date** (YYYY-MM-DD format)
- **Customer Name** (optional)
- **Source** (App Store, Support, etc.)

## Upload Steps

1. **Open your dashboard**
2. **Click the "+" button** (top right)
3. **Upload your CSV**
4. **Wait 2-5 seconds** for processing
5. **Watch the magic!** 🎉

## What You'll See

After upload:
- ✅ KPI cards update with real numbers
- ✅ Sentiment pie chart shows distribution
- ✅ Review table with AI summaries
- ✅ Word cloud of negative keywords
- ✅ AI recommendations generated
- ✅ Feature requests extracted

## Test the Chat Feature

Try asking:
- "How many reviews do we have?"
- "What's the overall sentiment?"
- "Show me critical issues"
- "What are customers requesting?"
- "Summarize negative feedback"

## Backend Endpoints

Your backend is live at:
```
https://[your-project-id].supabase.co/functions/v1/make-server-77f42fb8/
```

Available endpoints:
- `POST /upload-csv` - Upload and process CSV
- `GET /reviews` - Get all reviews
- `GET /kpis` - Get calculated metrics
- `GET /feature-requests` - Get extracted requests
- `GET /recommendations` - Get AI recommendations
- `POST /chat` - Query data with natural language
- `DELETE /data` - Clear all data (for testing)

## Need Help?

Check the browser console (F12) for detailed logs of:
- Upload progress
- API responses
- Error messages
- Data processing steps

## What the Backend Does

1. **Parses CSV** rows and columns
2. **Analyzes sentiment** for each review
3. **Extracts keywords** from text
4. **Generates summaries** (TL;DR)
5. **Detects urgency** (critical/high/medium/low)
6. **Identifies feature requests** automatically
7. **Calculates KPIs** (avg rating, sentiment, etc.)
8. **Creates recommendations** based on data
9. **Powers chat** with intelligent responses

Ready to test? Upload your CSV and see the results! 🚀
