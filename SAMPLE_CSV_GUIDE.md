# Sample CSV Data for Testing

Create a file named `sample_reviews.csv` with the following content:

```csv
Review Text,Rating,Date,Customer Name,Source
"The app is amazing! I love the new dark mode feature. It's exactly what I needed.",5,2024-02-20,John Smith,App Store
"Login keeps failing. This is really frustrating and I can't access my account.",1,2024-02-19,Jane Doe,Support
"Good product overall but the pricing seems a bit high for small businesses.",3,2024-02-18,Mike Johnson,Website
"The mobile app crashes constantly on my Android device. Please fix this urgent bug!",1,2024-02-21,Sarah Williams,Google Play
"Love the export feature! Super helpful and saves me tons of time.",5,2024-02-17,David Brown,App Store
"The loading time is too slow. Takes forever to open the dashboard.",2,2024-02-22,Emily Davis,Twitter
"Great analytics features but I wish there was an API for integration.",4,2024-02-16,Robert Miller,Email
"App freezes when uploading large files. Very annoying issue.",2,2024-02-23,Lisa Anderson,Support
"Best customer feedback tool I've used! The AI insights are incredibly helpful.",5,2024-02-15,Michael Wilson,G2
"Would love to see offline support added. That would be perfect!",4,2024-02-14,Jennifer Taylor,Feature Request
"Bug in the report generation. It doesn't include all data.",2,2024-02-24,James Martinez,Support
"Excellent UI design. Very intuitive and easy to use.",5,2024-02-13,Patricia Garcia,App Store
"Need team collaboration features. Current single-user limitation is problematic.",3,2024-02-25,Christopher Lee,Email
"The sentiment analysis is spot on. Really impressive AI technology.",5,2024-02-12,Mary Rodriguez,LinkedIn
"Error messages are confusing. Better documentation would help.",3,2024-02-11,Daniel Hernandez,Support
"Performance issues on older devices. App is very slow.",2,2024-02-10,Barbara Lopez,Google Play
"Love the keyword extraction feature. Saves so much manual work!",5,2024-02-09,Thomas Gonzalez,App Store
"Pricing tier for startups would be great. Current plans are expensive.",3,2024-02-08,Jessica Perez,Email
"Critical bug: data export includes duplicate entries.",1,2024-02-07,Matthew Turner,Support
"Amazing product! Customer support is also very responsive.",5,2024-02-06,Ashley Phillips,Trustpilot
```

## How to Test:

1. Copy the CSV content above
2. Create a new file `sample_reviews.csv`
3. Paste the content
4. Click the "+" button in your dashboard
5. Upload the CSV file
6. Watch the AI analyze and generate insights!

## What the Backend Does:

✅ **Parses CSV** - Reads Review Text, Rating, Date, Customer Name, Source columns
✅ **Sentiment Analysis** - Analyzes each review for positive/negative/neutral sentiment
✅ **Keyword Extraction** - Identifies important keywords and themes
✅ **TL;DR Summaries** - Generates concise summaries of reviews
✅ **Urgency Detection** - Flags critical issues that need immediate attention
✅ **Feature Requests** - Automatically identifies feature suggestions
✅ **KPI Calculation** - Computes metrics like avg rating, sentiment scores, etc.
✅ **AI Recommendations** - Generates actionable insights based on the data
✅ **Word Cloud** - Creates visualization of negative keywords
✅ **Priority Scoring** - Assigns urgency levels (critical, high, medium, low)

## Advanced Testing:

You can add more columns to test different scenarios:
- Different ratings (1-5 stars)
- Various sources (App Store, Google Play, Twitter, Support, etc.)
- Mix of positive, negative, and neutral feedback
- Feature requests vs bug reports
- Urgent vs non-urgent issues
