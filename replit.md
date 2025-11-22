# Mikołajkowy Losowator

## Overview
A festive Secret Santa draw application built with React, TypeScript, and Express. Users enter their name to discover who they should buy a gift for in the holiday gift exchange.

## Purpose
This application automates the Secret Santa draw process with a beautiful, user-friendly interface. The draw happens automatically on first use and ensures no one draws themselves, with results persisting across sessions.

## Current State
✅ **Production Ready** - Full MVP implementation complete and tested

## Recent Changes (November 22, 2025)
- Initial implementation with festive Christmas-themed UI
- Smart draw algorithm with shuffle-retry logic
- Icon-based design using lucide-react (no emojis per design guidelines)
- Comprehensive end-to-end testing passed
- Bug fix: JSON parsing in API response handling

## Project Architecture

### Frontend (React + TypeScript)
- **Single Page Application**: Centered layout with festive design
- **Design System**: 
  - Fonts: Poppins (main), Fredoka (headings)
  - Colors: Christmas red/green theme with proper contrast
  - Icons: lucide-react (Gift, TreePine, Snowflake, Sparkles, AlertCircle)
  - Animations: Fade-in, shake, pulse-subtle
- **Key Components**:
  - `client/src/pages/home.tsx`: Main application page
  - Beautiful loading, success, and error states
  - Responsive design with proper spacing and typography

### Backend (Express + TypeScript)
- **Storage**: In-memory storage with participant list and draw results
- **Draw Algorithm**: Shuffle-retry logic ensuring valid assignments
  - No one can draw themselves
  - Results persist after first draw
- **API Endpoints**:
  - `POST /api/check-result`: Check draw result (triggers draw if needed)

### Data Model
- **Participants**: Pre-configured list (Anna, Marek, Kasia, Piotr, Zofia)
- **Draw Results**: Mapping of who drew whom
- **Schemas**: Zod validation for type safety

## User Features
1. **Name-Based Access**: Simple login with just a name (no password)
2. **Automatic Draw**: First user triggers the draw for everyone
3. **Persistent Results**: Same result on repeated checks
4. **Error Handling**: Clear messages for invalid names or empty input
5. **Festive Design**: Beautiful Christmas-themed interface

## Technical Highlights
- **Type Safety**: Full TypeScript across frontend and backend
- **Validation**: Zod schemas for request/response validation
- **State Management**: TanStack Query for API mutations
- **Design Quality**: Follows comprehensive design guidelines
- **Testing**: End-to-end tests verify all user journeys

## Running the Project
The workflow "Start application" runs `npm run dev` which starts:
- Express server on port 5000
- Vite dev server for frontend
- Hot module reloading enabled

## Next Phase Possibilities
- Admin panel to manage participant list
- Reset/redo draw functionality
- Exclusion rules (e.g., couples can't draw each other)
- Email notifications when draw is ready
- Draw history for multiple events
- Custom participant lists per event
