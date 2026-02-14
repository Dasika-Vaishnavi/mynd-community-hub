# MyndSo

**Mental wellness through community, not clinics.**

MyndSo is an anonymous, karma-driven mental health platform combining peer support communities, AI companions, and therapy access — real and virtual — into one cohesive experience.

---

## Platform Philosophy

Traditional mental health apps isolate users into clinical workflows. MyndSo inverts this: community is the foundation, therapy is a tool within it. Identity stays anonymous, growth is gamified through karma tiers, and an ever-present AI companion (Mynd Pet) provides continuity between sessions.

---

## Architecture Overview

```
graph TD
    subgraph Client ["Frontend (React + Vite)"]
        A[Pages] --> B[Layout Shell]
        B --> C[Sidebar Nav + Mynd Pet Widget]
        B --> D[Mobile Bottom Nav]
        A --> E[Community / Spaces]
        A --> F[Therapy Connect]
        A --> G[Profile + Pet Customizer]
        A --> H[Auth]
    end

    subgraph Backend ["Supabase"]
        I[Auth Service]
        J[PostgreSQL Database]
        K[Edge Functions]
        L[Row Level Security]
    end

    subgraph AI ["AI Layer"]
        M[Anthropic Claude — claude-sonnet-4-5]
        N[Anthropic Claude — claude-sonnet-4-5]
        O[ElevenLabs TTS — Voice Streaming]
    end

    C -->|REST + Auth Headers| J
    E -->|Supabase SDK| J
    G -->|Upsert with conflict resolution| J
    H -->|Email/Password| I
    F -->|invoke| K
    K -->|mynd-chat| M
    K -->|assistant-chat| N
    K -->|assistant-speak| O
    J -->|RLS enforced| L
```

---

## Core Modules

### 1. Authentication
- **Method**: Email/password via Supabase Auth
- **Session**: Persisted in localStorage, auto-refreshed
- **Guard**: `AuthContext` wraps the app; RLS policies enforce server-side access control
- **Anonymous by design**: No real names required; users pick display names

### 2. Community Engine

| Feature | Implementation |
|---|---|
| **Posts** | CRUD with RLS — authors edit/delete own posts only |
| **Karma system** | Integer score per user, displayed on posts and profiles |
| **Flairs** | Tag-based categorization per post |
| **Spaces** | Subreddit-style hubs (e.g., `m/ADHDWarriors`) with member counts |
| **Saved posts** | `saved_posts` table with foreign key to `posts`, user-scoped via RLS |
| **Comments** | Nested threads with author moderation privileges |

### 3. Mynd Pet (Living AI Companion)

The Mynd Pet is a persistent, customizable blob-creature rendered as animated SVG/CSS.

**Expressions**: `HAPPY`, `EXCITED`, `PROUD`, `LISTENING`, `THINKING`, `CHEERING`, `SLEEPY`, `LOVE`

**Persistence flow**:
```
User changes color/accessory
  → 1.5s debounce
    → PATCH existing row (or POST if first save)
      → mynd_pets table (on_conflict=user_id)
        → Toast: "✓ Mynd saved!"
```

**AI Chat**: The sidebar widget sends user context (karma, tier, streak, badges) to the `mynd-chat` edge function → **Anthropic Claude (claude-haiku-4-5-20251001)** for fast, lightweight companion responses → personalized response under 120 words.

> **Why Haiku for the Pet?** Claude Haiku is used here for low-latency, high-frequency companion chat. It keeps the pet feeling snappy and alive without burning through tokens on a conversational loop.

### 4. Therapy Connect (Dual System)

#### Virtual Therapists

| Therapist | Personality | Voice |
|---|---|---|
| Dr. Ava | Warm, empathetic | ElevenLabs custom voice |
| Dr. Marcus | Structured, CBT-focused | ElevenLabs custom voice |
| Dr. Luna | Creative, mindfulness-based | ElevenLabs custom voice |

**Stack**: `VirtualAssistant` component → `assistant-chat` edge function → **Anthropic Claude (claude-sonnet-4-5-20250929)** for text → `assistant-speak` edge function → ElevenLabs TTS for voice streaming.

#### Real Therapist Directory
- Browse credentials and specializations
- 4-step booking: Date → Time slot → Confirmation → Success

### 5. MyndSpaces
Discord-inspired community hubs with:
- Categorized channels (Info, Discussion, Resources, Voice)
- Moderation hierarchy: Owner → Admin → Mod → Member
- Karma-tier visibility per member

---

## Database Schema

```
erDiagram
    auth_users {
        uuid id PK
    }
    posts {
        uuid id PK
        uuid author_id FK
        text title
        text preview
        text flair
        text space
        int upvotes
        int comments
        int author_karma
        text author_name
        text pet_color
        text pet_expression
        timestamptz created_at
    }
    saved_posts {
        uuid id PK
        uuid user_id
        uuid post_id FK
        timestamptz created_at
    }
    mynd_pets {
        uuid id PK
        uuid user_id
        text base_color
        text eye_color
        text blush_color
        text accessory
        text expression
        text last_chat_expression
        timestamptz created_at
        timestamptz updated_at
    }
    auth_users ||--o{ posts : "author_id"
    auth_users ||--o{ saved_posts : "user_id"
    auth_users ||--|| mynd_pets : "user_id"
    posts ||--o{ saved_posts : "post_id"
```

**RLS policies**: All tables enforce row-level security. Posts are publicly readable; writes require `auth.uid() = author_id`. Saved posts and pet configs are fully user-scoped.

---

## Edge Functions

| Function | Purpose | AI Provider | Model | Auth Required |
|---|---|---|---|---|
| `mynd-chat` | Pet companion chat | Anthropic | claude-haiku-4-5-20251001 | No |
| `assistant-chat` | Virtual therapist conversations | Anthropic | claude-sonnet-4-5-20250929 | No |
| `assistant-speak` | Text-to-speech streaming | ElevenLabs | eleven_turbo_v2 | No |

**Secrets required**: `ANTHROPIC_API_KEY`, `ELEVENLABS_API_KEY`

### Edge Function Implementation — mynd-chat

```typescript
// supabase/functions/mynd-chat/index.ts
import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

Deno.serve(async (req) => {
  const { message, history, userContext } = await req.json();

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    system: `You are the user's Mynd Pet — a tiny magical creature who loves 
    them unconditionally. You are bubbly, childlike, and endlessly enthusiastic.
    User context: karma ${userContext.karma}, tier ${userContext.tier}, 
    streak ${userContext.streak} days. Keep responses under 120 words.
    Always end with [EXPRESSION:HAPPY/EXCITED/PROUD/LOVE/CHEERING].`,
    messages: [...history, { role: 'user', content: message }]
  });

  const fullText = response.content[0].text;
  const expressionMatch = fullText.match(/\[EXPRESSION:(\w+)\]/);
  const expression = expressionMatch?.[1] || 'HAPPY';
  const reply = fullText.replace(/\[EXPRESSION:\w+\]/, '').trim();

  return Response.json({ reply, expression });
});
```

### Edge Function Implementation — assistant-chat

```typescript
// supabase/functions/assistant-chat/index.ts
import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

Deno.serve(async (req) => {
  const { message, history, systemPrompt } = await req.json();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: systemPrompt,   // per-therapist personality prompt
    messages: [...history, { role: 'user', content: message }]
  });

  return Response.json({ reply: response.content[0].text });
});
```

### Edge Function Implementation — assistant-speak

```typescript
// supabase/functions/assistant-speak/index.ts
Deno.serve(async (req) => {
  const { text, voiceId } = await req.json();

  const audio = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY')!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    }
  );

  return new Response(audio.body, {
    headers: { 'Content-Type': 'audio/mpeg' }
  });
});
```

---

## AI Utilization Map

```
┌─────────────────────────────────────────────────────────┐
│                     User Interaction                     │
├──────────────┬──────────────────────┬────────────────────┤
│  Mynd Pet    │  Virtual Therapist   │  Voice Streaming   │
│  Chat        │  Sessions            │                    │
├──────────────┼──────────────────────┼────────────────────┤
│ Anthropic    │ Anthropic            │ ElevenLabs         │
│ Claude Haiku │ Claude Sonnet        │ Turbo v2           │
│ 4.5          │ 4.5                  │                    │
├──────────────┼──────────────────────┼────────────────────┤
│ Context:     │ Context:             │ Input:             │
│ karma,       │ system prompt        │ therapist text     │
│ tier,        │ per therapist        │ response           │
│ streak,      │ personality +        │                    │
│ badges       │ chat history         │ Output:            │
│              │                      │ MP3 audio stream   │
│ Output:      │ Output:              │ with mouth-sync    │
│ ≤120 word    │ ≤1024 token          │                    │
│ response     │ response             │                    │
└──────────────┴──────────────────────┴────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui + Framer Motion |
| Backend | Supabase Auth + PostgreSQL + Edge Functions (Deno) |
| AI Text (Pet) | Anthropic Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) |
| AI Text (Therapy) | Anthropic Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`) |
| AI Voice | ElevenLabs TTS + Browser SpeechRecognition API |
| State | React Query + React Context |

---

## Local Development

```sh
git clone https://github.com/your-org/myndso
cd myndso
npm install
cp .env.example .env
# Fill in:
# VITE_SUPABASE_URL=
# VITE_SUPABASE_ANON_KEY=
# ANTHROPIC_API_KEY=
# ELEVENLABS_API_KEY=
npm run dev
```

### Supabase Edge Function Secrets

```sh
supabase secrets set ANTHROPIC_API_KEY=your_key_here
supabase secrets set ELEVENLABS_API_KEY=your_key_here
```

---

## Key Design Decisions

1. **Anonymous-first**: No real name fields anywhere in the schema
2. **Karma as social proof**: Replaces follower counts; earned through community participation
3. **Pet as continuity thread**: The Mynd Pet persists across all pages, creating emotional attachment and return motivation
4. **Dual therapy model**: AI therapists (Claude Sonnet) for accessibility + real therapist booking for clinical needs
5. **Two-tier Claude usage**: Haiku for high-frequency pet chat (speed + cost), Sonnet for therapy sessions (depth + nuance)
6. **RLS everywhere**: Every table has row-level security; no trust-the-client patterns

---

*MyndSo — Healing, together.*
