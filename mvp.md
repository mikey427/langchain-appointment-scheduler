# AI Appointment Scheduler MVP Outline

## Core Functionality

**Single appointment type** - Start with one service (e.g., "30-minute consultation"). No complex scheduling rules yet.

**Basic information gathering:**

- Customer name
- Phone number
- Preferred date/time
- Brief reason for appointment (optional)

**Simple availability system** - Use a mock calendar or basic JSON file with available slots. No real calendar integration initially.

**Confirmation flow** - Verbal confirmation of details, then log the appointment (console output or simple database).

## Technical Stack

**LangChain/LangGraph components:**

- State graph with 5 nodes: greeting → info_collection → availability_check → confirmation → completion
- Conversation memory to track collected info
- Structured output parsing for extracting dates/times from natural language

**Voice layer:**

- Twilio Voice API (easiest for testing)
- Webhook endpoint to receive calls and stream audio
- TTS for agent responses (Twilio has built-in options)
- STT for transcribing caller speech

**Simple backend:**

- FastAPI or Flask for webhooks
- SQLite or JSON file for appointments
- Python 3.11+

## State Flow

```
START
  ↓
GREETING ("Hi, I'm scheduling appointments for [Business]. Can I get your name?")
  ↓
INFO_COLLECTION (gather name, phone, date preference)
  ↓
AVAILABILITY_CHECK (query mock calendar, present 2-3 options)
  ↓
CONFIRMATION ("Just to confirm: [name] on [date] at [time]. Is that correct?")
  ↓
COMPLETION ("Great! You'll receive a confirmation text. Anything else?")
  ↓
END
```

## Minimal Features

**What to include:**

- Handle "I need an appointment next week" type requests
- Offer alternative times if first choice unavailable
- Allow user to say "yes/no" for confirmation
- Basic error handling ("I didn't catch that, could you repeat?")
- Log completed bookings

**What to skip for MVP:**

- Rescheduling/cancellation
- Multiple appointment types
- Real calendar integration
- Email confirmations (just console log)
- Complex time zone handling
- Payment collection
- Multiple providers/locations

## Success Criteria

**MVP is successful if it can:**

1. Complete a full booking flow in under 2 minutes
2. Correctly parse 80%+ of common date/time phrases
3. Handle one interruption/correction gracefully
4. Store appointment data accurately
5. Work end-to-end without crashing

## Development Phases

**Phase 1 (Week 1):** LangGraph state machine + mock conversation (text-based testing)

**Phase 2 (Week 1-2):** Integrate Twilio voice, get basic call flow working

**Phase 3 (Week 2):** Refine conversation handling, add error recovery

**Phase 4 (Week 2-3):** Testing with real calls, iterate on prompt engineering

## Quick Start Code Structure

```
appointment-scheduler/
├── app.py (FastAPI server)
├── agent/
│   ├── graph.py (LangGraph state machine)
│   ├── prompts.py (system prompts)
│   └── tools.py (availability checker)
├── data/
│   └── appointments.json
└── tests/
    └── test_conversations.py
```