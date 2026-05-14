# Health-app

Here’s the full picture:

App Philosophy
Dad energy. Informative, direct, no moralizing, no gamification, no badges. A competent tool for a competent adult.

Core Features
Food & Nutrition
	•	Food logging with kcal, macros, GI, glycemic load per portion
	•	Recipe builder — combine ingredients, auto-calculate aggregate nutrition
	•	Portion units that resolve to actual grams
	•	Custom food entries
	•	GI flagging — high GI meals surfaced plainly
	•	Expiring pantry items prioritized in suggestions
Drink Logging
	•	Separate from food, modeled as metabolic disruptor not just calories
	•	Beverage type aware — beer, wine, spirits, cocktails treated differently
	•	Flags metabolic window — fat oxidation halted, gluconeogenesis suppressed, duration estimated
	•	BG crash risk flag for spirits
	•	Next day recovery impact factored into daily snapshot
Exercise
	•	Exercise logging from walking to weight training
	•	Duration and intensity based kcal burn estimates
	•	Cached locally on first launch from Wger
Pantry Management
	•	Ingredient stock tracking with quantities and expiry dates
	•	Auto-deduct on recipe logging with confirm/adjust prompt
	•	Expiring soon flagged visually and via notification
	•	Expired items prompt for removal
Meal Planning
	•	Weekly meal plan generation from stored recipes
	•	Matched against current pantry stock
	•	Three tiers — make it now, almost there, not this week
	•	Shopping list generated from plan delta against pantry
Recipe Suggestions
	•	Matched against pantry ingredients
	•	Sorted by match percentage
	•	Missing ingredients flagged explicitly
	•	Expiring ingredients 
Flags & Warnings
	•	Rule based, deterministic — not LLM generated
	•	Severity levels
	•	Short label + info blurb per flag
	•	Sensitive flags append “consider discussing with your healthcare provider”
	•	Never prescriptive, always informational
Daily & Trend Analysis
	•	DailySnapshot — kcal in/out, macro breakdown, GI load, alcohol impact, recovery capacity
	•	Rolling window — yesterday’s alcohol/sleep affecting today’s scores
	•	Optional weekly trend summary via LLM — one paragraph, plain English, on demand
Goal Modes
	•	Lose / maintain / gain
	•	Shifts what the app emphasizes accordingly
	•	Kcal target calculated or manual override

LLM Integration (may be left out)
	•	Bring your own API key — stored in Android Keystore / iOS Keychain
	•	Called only as last resort when scripted logic can’t handle it
	•	Use cases — ad hoc recipe from weird pantry leftovers, weekly trend narrative
	•	All LLM output clearly labeled as AI generated
	•	System prompt enforces no medical advice, informational only, redirect to professional
	•	Optional, app fully functional without it

APIs
	•	USDA FoodData Central — nutrition data, public domain, free, no restrictions
	•	Wger — exercise database, AGPL, cached locally on first launch
	•	Open Food Facts — branded/packaged foods, ODbL, attribute in about screen
	•	Anthropic / OpenAI — LLM fallback, user’s own key

Stack
	•	Flutter — cross platform Android/iOS
	•	sqflite — SQLite on device, primary data store
	•	Flask + Python — backend if needed, probably not for v1
	•	Pi 5 — self hosted backend if needed
	•	Cloudflare Tunnel — expose Pi safely if needed

Data Model Entities
users, food_items, portions, recipes, recipe_ingredients, food_log, drink_log, exercise_log, pantry, meal_plan, flags, daily_snapshot

Explicitly Out of Scope
	•	Medical advice of any kind
	•	Insulin or medication guidance
	•	Diagnosing anything
	•	Streaks, badges, gamification
	•	Moralizing tone