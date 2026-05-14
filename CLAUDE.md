# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This project is in the **specification/planning phase**. The README.md is the source of truth for intended design. No implementation code exists yet — the first task will be initializing a Flutter project.

## Stack

- **Mobile**: Flutter (cross-platform Android/iOS)
- **Local database**: sqflite (SQLite on-device, primary data store)
- **Backend**: Flask + Python — optional, likely deferred past v1
- **Infrastructure**: Raspberry Pi 5 + Cloudflare Tunnel — only if backend is needed
- **External APIs**: USDA FoodData Central (nutrition), Wger (exercises, AGPL — cache locally on first launch), Open Food Facts (branded foods, ODbL — must attribute in about screen), Anthropic/OpenAI (user's own key, optional)

## Development Commands

These commands will apply once the Flutter project is initialized:

```bash
# Install dependencies
flutter pub get

# Run on connected device or emulator
flutter run

# Run all tests
flutter test

# Run a single test file
flutter test test/path/to/test_file.dart

# Analyze and lint
flutter analyze

# Format code
dart format .
```

For the optional Python backend (Flask):
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
flask run
```

## Architecture

### Core Design Principles

- **Rule-based logic first**: All flags and warnings are deterministic, scripted logic — never LLM-generated. LLM is a last resort for things scripted logic cannot handle.
- **Local-first**: sqflite on-device is the primary data store. Backend is optional and probably not needed for v1.
- **Informational, never prescriptive**: "Dad energy" — direct, no moralizing, no gamification, no badges, no streaks. Sensitive flags append "consider discussing with your healthcare provider" and nothing more.
- **LLM is optional**: App must be fully functional without any API key. When LLM is used, output must be clearly labeled as AI-generated. System prompt must enforce no medical advice and redirect to professionals.
- **Privacy**: API keys stored in Android Keystore / iOS Keychain only.

### Data Model

Core SQLite entities:

| Entity | Purpose |
|---|---|
| `users` | User account and goal mode (lose/maintain/gain) |
| `food_items` | Foods with kcal, macros, GI, glycemic load |
| `portions` | Portion units that resolve to actual grams |
| `recipes` | User-created recipes with auto-calculated aggregate nutrition |
| `recipe_ingredients` | Junction: recipes ↔ food_items |
| `food_log` | Daily food intake entries |
| `drink_log` | Alcohol/beverage entries — separate from food, modeled as metabolic disruptor |
| `exercise_log` | Workout entries with duration/intensity-based kcal burn |
| `pantry` | Ingredient inventory with quantities and expiry dates |
| `meal_plan` | Weekly meal planning entries |
| `flags` | Rule-based warnings with severity levels and info blurbs |
| `daily_snapshot` | Daily summary: kcal in/out, macro breakdown, GI load, alcohol impact, recovery capacity |

### Key Domain Logic

**Drink logging** is not calorie tracking — it is metabolic disruption modeling. Beer/wine/spirits/cocktails are treated differently. Each drink entry flags: fat oxidation halt, gluconeogenesis suppression, estimated duration of impact, BG crash risk (spirits). Next-day recovery impact rolls into the `daily_snapshot` via a rolling window.

**Pantry ↔ recipe matching** has three tiers: "make it now" (all ingredients in stock), "almost there" (minor gaps), "not this week" (significant gaps). Expiring pantry items are prioritized in suggestions. Auto-deduct on recipe logging prompts confirm/adjust.

**`daily_snapshot`** aggregates: kcal in/out, macro breakdown, GI load, alcohol impact, recovery capacity. It uses a rolling window — yesterday's alcohol/sleep affects today's scores.

**Flags** have severity levels and a short label + info blurb pattern. Sensitive flags get the healthcare provider disclaimer appended.

**Wger exercise data** is AGPL-licensed and must be cached locally on first launch rather than hit on every request.

**Open Food Facts** data is ODbL-licensed and must be attributed in the app's about screen.

## Explicitly Out of Scope

- Medical advice, insulin/medication guidance, diagnosing anything
- Streaks, badges, gamification, moralizing tone
