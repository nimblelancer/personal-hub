# Personal Hub — Project Plan

## Tổng quan

**Personal Hub** là một hệ thống web cá nhân giúp hệ thống hóa mọi hoạt động học tập, phát triển project, và sáng tạo content — biến những thứ "làm xong rồi quên" thành tài sản tích lũy được.

### Vấn đề cần giải quyết

| Vấn đề hiện tại | Hậu quả | Giải pháp |
|---|---|---|
| Học theo kiểu "fast food" — đọc/code xong không ghi chú, không ôn tập | Kiến thức rò rỉ, không áp dụng được sau 1-2 tuần | Learning Lab: ghi chú có cấu trúc + spaced repetition |
| Side project làm tùy hứng, chỉ ở local, không docs, làm xong skip | Không tích lũy giá trị, không show được cho ai | Project Workshop: docs template, lessons learned, showcase |
| Content creation (TikTok Japanese learning) chưa bắt đầu, muốn làm có hệ thống | Dễ bỏ cuộc hoặc làm không đều | Content Studio: idea → calendar → production → tracking |
| Không có portfolio tập trung | Khi cần show cho nhà tuyển dụng thì không có gì | Public Portfolio tự động tổng hợp từ 3 pillars trên |

### Đối tượng sử dụng

- **Primary user**: Chỉ mình (admin dashboard — private)
- **Secondary audience**: Nhà tuyển dụng, đồng nghiệp, cộng đồng (public portfolio)

---

## Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────┐
│  PRIVATE ADMIN DASHBOARD (auth required)                │
│                                                         │
│  ┌───────────────┐ ┌─────────────────┐ ┌─────────────┐ │
│  │  Learning Lab  │ │ Project Workshop│ │Content Studio│ │
│  │               │ │                 │ │              │ │
│  │ - TIL Notes   │ │ - Registry      │ │ - Idea bank  │ │
│  │ - Review queue│ │ - Docs template │ │ - Calendar   │ │
│  │ - Roadmap     │ │ - Lessons log   │ │ - Scripts    │ │
│  │ - Bookmarks   │ │ - Milestones    │ │ - Tracker    │ │
│  └───────┬───────┘ └────────┬────────┘ └──────┬───────┘ │
│          │                  │                  │         │
│          └──────────────────┼──────────────────┘         │
│                    Cross-linking layer                   │
│            (project ↔ notes ↔ content ideas)             │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Dashboard: review due · active projects · upcoming │ │
│  └─────────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────┘
                        │ flag as "public"
┌───────────────────────▼─────────────────────────────────┐
│  PUBLIC PORTFOLIO (no auth, SEO optimized)              │
│                                                         │
│  About Me · Projects Showcase · Blog/TIL · Resume       │
└─────────────────────────────────────────────────────────┘
```

---

## Chi tiết từng module

### Module 1: Learning Lab

**Mục tiêu**: Biến mỗi lần học thành kiến thức tích lũy được, thay vì đọc xong quên.

#### 1.1 Knowledge Notes (TIL — Today I Learned)

Mỗi note tuân theo template bắt buộc:

```markdown
# [Tiêu đề]

**Topic**: [AI/ML | English | Coding | Japanese | Other]
**Source**: [Link bài viết / video / khóa học]
**Date**: [Auto-generated]

## Tóm tắt bằng lời mình
[Viết lại bằng ngôn ngữ của mình — không copy paste]

## Key concepts
- Concept 1: [giải thích ngắn]
- Concept 2: [giải thích ngắn]

## Ví dụ / Code snippet
[Ví dụ cụ thể giúp nhớ]

## Liên kết
- Related project: [link đến project nếu có]
- Related notes: [link đến notes khác]

## Câu hỏi tự kiểm tra
- Q1: [Câu hỏi để tự test khi ôn tập]
- Q2: [...]
```

**Tính năng**:
- Markdown editor với preview
- Tag system: topic tags + custom tags
- Full-text search
- Filter theo topic, date range, tags
- Flag note là "public" → tự động xuất hiện trên Blog/TIL của portfolio

#### 1.2 Review Queue (Spaced Repetition)

Dựa trên thuật toán spaced repetition đơn giản:
- Khi tạo note mới → tự động thêm vào review queue
- Lịch ôn: 1 ngày → 3 ngày → 7 ngày → 14 ngày → 30 ngày → 90 ngày
- Mỗi lần review: hiện câu hỏi tự kiểm tra từ note → tự đánh giá "Nhớ / Mờ mờ / Quên"
  - "Nhớ" → lên level tiếp theo
  - "Mờ mờ" → giữ nguyên level, review lại sớm hơn
  - "Quên" → reset về level 1
- Dashboard widget: "Hôm nay cần review X notes"

#### 1.3 Learning Roadmap

Visual roadmap cho mỗi learning track:
- Hiển thị dạng tree/timeline
- Mỗi node = 1 topic/skill, gắn với các notes liên quan
- Status: Not started → In progress → Learned → Mastered
- Có thể tạo nhiều roadmap: AI/ML Roadmap, English Roadmap, etc.

#### 1.4 Resource Bookmarks

- Lưu link bài viết, video, docs hay
- Gắn tags và topic
- Trạng thái: Saved → Reading → Done → Noted (đã tạo TIL note)
- Link đến TIL note nếu đã ghi chú

---

### Module 2: Project Workshop

**Mục tiêu**: Mỗi project dù nhỏ đều trở thành một "tài sản" — có docs rõ ràng, có bài học rút ra, có thể show cho người khác.

#### 2.1 Project Registry

Mỗi project có một "thẻ" chứa:

```yaml
name: "RAG Pipeline for Multi-News Summarization"
type: software_development  # software_development | learning | content_creation | personal
status: in_progress          # idea | planning | in_progress | paused | completed | archived
visibility: private          # private | public (show trên portfolio)
started_at: 2026-02-15
updated_at: 2026-03-17

# Metadata
tech_stack: [Python, LangChain, Groq, Llama3]
topics: [AI/ML, NLP, RAG]
github_url: ""
demo_url: ""
thumbnail: ""

# Quick summary
one_liner: "RAG-based multi-document news summarizer using Groq + Llama3"
```

**Tính năng**:
- Tạo project mới → auto-generate docs template (xem 2.2)
- Dashboard view: kanban board theo status HOẶC list view
- Filter theo type, status, tech stack, topics
- Khi status = completed → prompt viết Lessons Learned

#### 2.2 Docs Template (README++)

Khi tạo project mới, hệ thống auto-generate một bộ docs với structure:

```markdown
# [Project Name]

## Problem
Tại sao tôi làm project này? Vấn đề gì cần giải quyết?

## Solution
Approach của tôi là gì? Tại sao chọn cách này?

## Tech Stack
| Technology | Vai trò | Tại sao chọn |
|---|---|---|
| ... | ... | ... |

## Architecture
[Mô tả kiến trúc, có thể kèm diagram]

## How to Run
[Step-by-step setup & run]

## Key Features
[Liệt kê tính năng chính]

## Screenshots / Demo
[Screenshots, GIFs, hoặc link demo]

## What I Learned
[Điền sau khi hoàn thành — xem Lessons Learned]
```

**Tính năng**:
- Markdown editor
- Upload screenshots/images
- Có thể tùy chỉnh template cho từng project type

#### 2.3 Lessons Learned Log

Sau mỗi project (hoặc mỗi milestone), viết reflection:

```markdown
## Lessons Learned — [Project Name]

### Technical
- Điều gì mới tôi đã học?
- Có gì làm tốt về mặt kỹ thuật?
- Có gì nên làm khác?

### Process
- Cách tôi approach project có hiệu quả không?
- Thời gian ước lượng vs thực tế?

### Reusable
- Code/pattern nào có thể tái sử dụng?
- Resource nào hữu ích? (link đến Bookmarks)
```

#### 2.4 Status & Milestones

- Mỗi project có thể chia thành milestones
- Mỗi milestone có: tên, mô tả, deadline (optional), status
- Timeline view: thấy được tiến độ tổng thể
- Không cần phức tạp như Jira — chỉ cần đủ để biết "mình đang ở đâu"

---

### Module 3: Content Studio

**Mục tiêu**: Quản lý content creation có hệ thống từ ngày đầu — đặc biệt cho kênh TikTok/YouTube Japanese learning.

> **Note**: Module này sẽ build ở v2, sau khi Learning Lab + Project Workshop ổn định.

#### 3.1 Idea Backlog

- Ghi nhanh mọi ý tưởng content
- Mỗi idea: title, mô tả ngắn, platform mục tiêu (TikTok/YouTube/Blog), priority
- Trạng thái: Idea → Approved → In Production → Published → Analyzed
- Tag system: topic (N5 grammar, N4 vocab, culture...), format (dialogue, quiz, story...)

#### 3.2 Content Calendar

- Calendar view: lên lịch đăng bài theo tuần/tháng
- Kéo thả idea từ backlog vào calendar
- Giữ nhịp đều: nhìn tổng thể xem tuần nào thiếu content
- Recurring schedule: "Mỗi T3/T5/T7 đăng 1 video"

#### 3.3 Script & Asset Storage

- Mỗi content piece có workspace riêng:
  - Script/dialogue text
  - Audio files (VoiceVox output)
  - Thumbnail images
  - VTube Studio settings
- Version history cho script
- Template script cho các format lặp lại

#### 3.4 Post Tracker

- Log mỗi bài đã đăng: platform, URL, ngày đăng
- Track metrics thủ công (vì API TikTok/YouTube có thể hạn chế): views, likes, comments, followers gained
- So sánh performance giữa các content types
- Notes: bài nào perform tốt/dở và tại sao

---

### Module 4: Cross-Linking Layer

**Mục tiêu**: Kết nối mọi thứ lại với nhau — đây là giá trị cốt lõi khiến hệ thống này khác biệt so với dùng nhiều tool riêng lẻ.

**Cách hoạt động**:
- Mỗi entity (note, project, content, bookmark) đều có thể link đến entity khác
- Ví dụ flow: Học về RAG (Learning note) → Làm RAG project cho môn NLP (Project) → Viết blog post chia sẻ kinh nghiệm (Content) — tất cả link với nhau
- Khi mở một project, thấy ngay: notes liên quan, content đã tạo từ project này
- Khi mở một note, thấy ngay: project nào dùng kiến thức này, content nào reference note này

**Implementation đơn giản**:
- Bảng `entity_links`: entity_a_type, entity_a_id, entity_b_type, entity_b_id
- UI: khi edit bất kỳ entity nào, có nút "Link to..." → search & chọn entity khác

---

### Module 5: Dashboard

**Mục tiêu**: Trang chủ khi login — nhìn tổng thể mọi thứ đang diễn ra.

**Widgets**:
- **Review due**: "Hôm nay cần ôn X notes" (từ Learning Lab)
- **Active projects**: Danh sách project đang in_progress + next milestone
- **Upcoming content**: Content sắp đến deadline trên calendar (v2)
- **Recent activity**: Timeline các hoạt động gần đây (notes, project updates, content published)
- **Quick actions**: Nút tạo nhanh: New TIL Note, New Project, New Idea

---

### Module 6: Public Portfolio

**Mục tiêu**: Tự động tổng hợp từ dữ liệu admin, không cần maintain riêng.

**Các trang**:
- **About Me**: Bio, skills, contact info (edit từ admin)
- **Projects**: Hiển thị các project có visibility = public, lấy data từ Project Registry + Docs
- **Blog / TIL**: Hiển thị các notes có flag = public, render markdown
- **Resume**: Tổng hợp từ data có sẵn (timeline projects, skills from tech stacks, education)

**Đặc điểm**:
- SSR / Static generation → SEO tốt
- Responsive design
- Không cần login để xem
- Clean, minimal design — focus vào content

---

## Tech Stack

### Core Stack

| Layer | Technology | Lý do chọn |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) | SSR cho public portfolio (SEO), client components cho admin, API routes cho backend logic. Một codebase duy nhất cho cả public + private |
| **Database** | Supabase (PostgreSQL) | Free tier rộng rãi (500MB DB, 1GB storage). Built-in auth, real-time, storage. Dễ query với SQL. Có thể self-host sau này nếu cần |
| **Auth** | Supabase Auth | Chỉ cần 1 account (chính mình). Simple email/password hoặc magic link |
| **UI** | shadcn/ui + Tailwind CSS | Build nhanh, consistent, accessible. Customizable, không bị lock-in |
| **Deploy** | Vercel | Free tier (hobby). Tích hợp hoàn hảo với Next.js. Auto preview deploys |
| **Editor** | Tiptap hoặc react-markdown | Markdown editing + preview cho notes và docs |

### Database Schema (High-level)

```
Users (chỉ 1 user — chính mình)
├── profiles (bio, avatar, contact)

Learning Lab
├── notes (TIL notes, markdown content, tags, topic, visibility)
├── review_schedule (note_id, next_review, level, last_reviewed)
├── roadmaps (name, description, topic)
├── roadmap_nodes (roadmap_id, title, status, order, parent_id)
├── bookmarks (url, title, tags, status, note_id?)

Project Workshop
├── projects (metadata, status, type, visibility, tech_stack[], topics[])
├── project_docs (project_id, markdown content — README++)
├── project_milestones (project_id, title, status, order)
├── lessons_learned (project_id, markdown content)

Content Studio (v2)
├── content_ideas (title, description, platform, status, tags)
├── content_calendar (idea_id, scheduled_date, status)
├── content_assets (idea_id, file_url, type)
├── content_posts (idea_id, platform, url, published_at, metrics_json)

Cross-linking
├── entity_links (entity_a_type, entity_a_id, entity_b_type, entity_b_id)

Activity
├── activity_log (entity_type, entity_id, action, timestamp)
```

---

## Lộ trình phát triển

### Phase 0: Project Setup (1-2 ngày)

- [ ] Init Next.js project với App Router
- [ ] Setup Supabase project (DB + Auth)
- [ ] Cài đặt shadcn/ui + Tailwind
- [ ] Setup Vercel deployment
- [ ] Tạo database schema (migration files)
- [ ] Setup layout: admin layout (sidebar + main) vs public layout
- [ ] Auth middleware: protect admin routes

### Phase 1: Learning Lab (1-2 tuần)

**v1.0 — Core**:
- [ ] CRUD TIL Notes (create, read, update, delete)
- [ ] Markdown editor + preview
- [ ] Tag system + topic categorization
- [ ] List view với search + filter
- [ ] Note detail page

**v1.1 — Review System**:
- [ ] Spaced repetition logic
- [ ] Review queue page: hiện notes cần ôn hôm nay
- [ ] Review UI: hiện câu hỏi → flip xem note → self-rate
- [ ] Dashboard widget: review count

**v1.2 — Extras**:
- [ ] Resource bookmarks CRUD
- [ ] Learning roadmap (basic tree view)
- [ ] Public flag cho notes → render trên portfolio

### Phase 2: Project Workshop (1-2 tuần)

**v2.0 — Core**:
- [ ] Project registry CRUD
- [ ] Auto-generate docs template khi tạo project mới
- [ ] Markdown editor cho project docs
- [ ] Project list view: kanban hoặc list, filter theo status/type
- [ ] Project detail page

**v2.1 — Depth**:
- [ ] Milestones management
- [ ] Lessons learned log
- [ ] Image upload cho screenshots
- [ ] Public flag → render trên portfolio

**v2.2 — Cross-linking**:
- [ ] Entity linking system
- [ ] UI: "Link to..." button trên notes và projects
- [ ] Related items sidebar trên detail pages

### Phase 3: Dashboard + Portfolio (1 tuần)

- [ ] Admin dashboard page với widgets
- [ ] Public portfolio pages: About, Projects, Blog/TIL
- [ ] SEO optimization: meta tags, OG images
- [ ] Responsive design cho mobile

### Phase 4: Content Studio (v2 — khi sẵn sàng)

- [ ] Idea backlog CRUD
- [ ] Content calendar view
- [ ] Script editor + asset upload
- [ ] Post tracker + manual metrics input
- [ ] Link content → projects và notes

---

## Cấu trúc thư mục dự kiến

```
personal-hub/
├── src/
│   ├── app/
│   │   ├── (admin)/                  # Private admin routes (auth required)
│   │   │   ├── dashboard/            # Main dashboard
│   │   │   ├── learning/
│   │   │   │   ├── notes/            # TIL notes CRUD
│   │   │   │   ├── review/           # Review queue
│   │   │   │   ├── roadmap/          # Learning roadmaps
│   │   │   │   └── bookmarks/        # Resource bookmarks
│   │   │   ├── projects/
│   │   │   │   ├── [id]/             # Project detail + docs + lessons
│   │   │   │   └── page.tsx          # Project list/kanban
│   │   │   ├── content/              # Content Studio (v2)
│   │   │   │   ├── ideas/
│   │   │   │   ├── calendar/
│   │   │   │   └── posts/
│   │   │   └── layout.tsx            # Admin layout (sidebar)
│   │   ├── (public)/                 # Public portfolio routes
│   │   │   ├── page.tsx              # Landing / About
│   │   │   ├── projects/             # Public project showcase
│   │   │   ├── blog/                 # Published TIL notes
│   │   │   └── layout.tsx            # Public layout (navbar)
│   │   ├── api/                      # API routes
│   │   └── layout.tsx                # Root layout
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── admin/                    # Admin-specific components
│   │   ├── public/                   # Portfolio components
│   │   └── shared/                   # Shared (markdown editor, etc.)
│   ├── lib/
│   │   ├── supabase/                 # Supabase client + helpers
│   │   ├── review/                   # Spaced repetition logic
│   │   └── utils.ts
│   └── types/                        # TypeScript types
├── supabase/
│   └── migrations/                   # Database migrations
├── public/                           # Static assets
└── package.json
```

---

## Nguyên tắc phát triển

### Coding Standards

- TypeScript strict mode
- Component-based architecture
- Server Components by default, Client Components chỉ khi cần interactivity
- Supabase Row Level Security (RLS) cho mọi table
- Responsive design (mobile-first)

### Content Standards (cho chính mình)

- Mỗi TIL note phải viết bằng lời mình, không copy-paste
- Mỗi project phải có ít nhất: Problem, Solution, Tech Stack, What I Learned
- Review notes đúng hẹn — hệ thống chỉ hoạt động khi mình tuân thủ
- Lessons Learned viết ngay khi hoàn thành project, không để "mai viết"

### Build Philosophy

- **Start small, iterate**: Không cần perfect từ đầu. V1 chỉ cần CRUD cơ bản + review system
- **Use it daily**: Hệ thống chỉ có giá trị khi dùng hàng ngày. Ưu tiên UX mượt mà
- **Progressive enhancement**: Thêm tính năng khi thực sự cần, không build trước
- **This project IS a portfolio piece**: Bản thân Personal Hub là một project showcase — code sạch, có docs, có lessons learned

---

## Bối cảnh cá nhân (context cho Claude Code)

- Đang sắp hoàn thành chương trình thạc sĩ tại FSB (FPT School of Business and Technology), Đà Nẵng
- Nền tảng: test automation (WebdriverIO, Jenkins), đang mở rộng sang AI/ML và NLP
- Có kinh nghiệm hands-on coding nhưng chưa có hệ thống ghi chú và tích lũy kiến thức
- Đang chuẩn bị launch kênh TikTok/YouTube về Japanese learning (N5-N4, anime aesthetic)
- Comfortable với cả tiếng Việt và tiếng Anh
- Mục tiêu dài hạn: build một "digital brain" — nơi mọi thứ mình học, làm, tạo đều được lưu trữ và kết nối có hệ thống
