Product Requirements Document (PRD): Nexus Pod

1. Vision & Purpose

Nexus Pod is a workspace and ecosystem platform designed to solve the isolation of African founders. It combines task/project management with a "Cross-Pod" Opportunity Engine, fostering collaboration, accountability, and ecosystem growth.

2. User Roles & Permissions

Founder/CEO: Root authority. Can manage Pod settings, promote Admins, and delete the Pod.

Pod Manager (Admin): Focuses on execution. Can manage projects and tasks but cannot delete the Pod or remove members.

Team Lead: Manages specific teams within a Pod. Can assign roles to their team members.

Member: The workforce. Can work on assigned tasks, comment, and chat.

3. Functional Requirements

3.1 Workspace (Pod) Management

Isolated environments for different startups/teams.

Automatic generation of Nexus Pod Number (NPN) (e.g., NP-00123).

Founder Dashboard for high-level oversight.

3.2 Project & Task System

Projects: Containers for tasks. Can be Public (workspace-wide) or Private (invite-only).

Tasks: Core units of work with Title, Description, Due Date, Assignee, and Priority.

Review Loop: Assignee marks as DONE -> Assigner APPROVES or CORRECTS (reopens task).

Momentum Score: A productivity metric (0-100) based on task completion and activity.

3.3 Collaboration Tools

Project Chat: Dedicated room per project. Ability to convert chat messages into tasks.

DMs & Voice: 1-on-1 messaging and voice notes (24h auto-delete).

Opportunity Engine: Cross-pod tab for posting hiring needs, feedback requests, or collaboration offers.

3.4 Accountability

Audit Logs: Immutable trail of "Who did what and when" (e.g., "Daniel deleted Project X").

Reminders: 72h before deadline, then every 6h via Push/Email.

4. Technical Stack

Frontend: Next.js (App Router), Tailwind CSS, Lucide React (Icons).

Backend/Database: Supabase (PostgreSQL, Auth, Storage, Realtime).

Deployment: Vercel.

5. Success Metrics

Pod Momentum: Average score across the platform.

Cross-Pod Matches: Number of opportunities successfully closed.

Retention: Daily active users within specific Pods.

Full System Description: Nexus Pod

1. The "Pod" Architecture

Nexus Pod is architected as a multi-tenant platform where each Pod acts as a virtual office. Data is strictly partitioned; a user in Pod A cannot see tasks in Pod B unless they are members of both.

2. Core Modules

A. The Execution Engine (Tasks & Projects)

Instead of a simple "In Progress/Done" status, Nexus Pod uses a Verification Loop. Work is only "Completed" when the Assigner approves the submission. This ensures quality and prevents "silent completion" of tasks.

B. The Social Core (Chat & Presence)

The system leverages Supabase Realtime to provide typing indicators, online status, and instant messaging. Project Chat is contextual, meaning discussions about a specific project stay within that project's view, reducing noise in the main Pod chat.

C. The Ecosystem Layer (Opportunity Engine)

This is the unique differentiator. Users can choose to broadcast "Opportunities" to the Nexus Network. This breaks the walls between isolated companies, allowing a developer in one Pod to find equity work in another.

D. The Motivation Layer (Gamification)

The Momentum Score and Streaks turn productivity into a game. The score is calculated via a weighted algorithm (Tasks = 5pts, Comments = 1pt, etc.), encouraging constant engagement.

3. Data Flow

Onboarding: Founder creates a Pod -> Supabase Auth generates a user -> Database creates a pods record.

Work: Tasks created in tasks table -> Subscribed to via Realtime for notifications.

Accountability: Any mutation (Update/Delete) triggers a record in the audit_logs table.

Portfolio: User activity is aggregated into a "Mini-Website" view for their public profile.

System Design Document

1. High-Level Architecture

Framework: Next.js (SSR for SEO/Dashboards, CSR for Chat/Realtime).

State Management: React Context/Query for global state; Supabase Realtime for live updates.

Auth: Supabase Auth (Email/Password + Social).

Database: PostgreSQL (Supabase).

Storage: Supabase Storage (Task attachments, compressed for mobile).

2. Database Schema (Simplified)

pods

Field

Type

Description

id

uuid (PK)

Unique ID

npn

string

Generated NP-XXXXX

title

string

Name of the Pod

founder_id

uuid (FK)

References profiles.id

projects

Field

Type

Description

id

uuid (PK)

Unique ID

pod_id

uuid (FK)

References pods.id

is_private

boolean

Visibility flag

tasks

Field

Type

Description

id

uuid (PK)

Unique ID

project_id

uuid (FK)

References projects.id

assigner_id

uuid (FK)

Who created/assigned it

status

enum

NOT_STARTED, ONGOING, DONE, APPROVED

momentum_value

int

Points for completion

audit_logs

Field

Type

Description

id

uuid (PK)

Unique ID

user_id

uuid (FK)

Actor

action

string

e.g., "DELETE_PROJECT"

target_id

uuid

ID of the object changed

3. Security (Row Level Security - RLS)

Pod Isolation: CREATE POLICY "User can see Pod data if they are members" ON tasks USING (pod_id IN (SELECT pod_id FROM members WHERE user_id = auth.uid()));

Admin Rights: Only profiles.role == 'Founder' can delete projects or promote admins.

4. Edge Functions

NPN Generator: A database trigger or Edge Function to increment and format the Nexus Pod Number.

Deadline Check: A Cron job (Supabase pg_cron) that runs every hour to send reminders for tasks due in < 72 hours.


Implementation Plan

1. Development Environment Setup

Repository: GitHub (Monorepo/Standard Next.js).

Supabase: Local development using Supabase CLI for migrations.

Linting/Formatting: ESLint + Prettier.

2. Core Development Strategy

Atomic Design: Build UI components (Buttons, Inputs, Modals) first.

Database First: Finalize migrations before building complex UI logic.

Mobile-First: Use Tailwind responsive classes (sm:, md:) as task management is often done on the go.

3. Testing Strategy

Unit Testing: Vitest for utility functions (Momentum Score calculations).

E2E Testing: Playwright for critical flows (Login -> Create Pod -> Create Task -> Approve).

Manual QA: Testing the "Correction Flow" between two different user accounts.

4. Deployment Pipeline

Staging: preview branches on Vercel linked to a Supabase Staging project.

Production: main branch linked to the Production project.

CI/CD: GitHub Actions to run tests on every Pull Request.

Implementation Roadmap (Nexus Pod)

This roadmap is divided into Phased Increments. Each increment includes a build and a test phase.

Phase 1: The Foundation (Core Auth & Pods)

Sprint 1: Multi-tenant Setup

Increment 1.1: Setup Next.js + Supabase. Configure Auth (Login/Signup).

Increment 1.2: Implement "Create Pod" flow. Generate NPN (NP-00001).

Test: Can a user sign up and create a unique Pod?

Sprint 2: Member Management

Increment 1.3: Invitation link system (Email or UUID-based link).

Increment 1.4: Role assignment (Founder, Admin, Member).

Test: Can a founder invite a member and assign them the "Pod Manager" role?

Phase 2: Execution Engine (Projects & Tasks)

Sprint 3: Project Structure

Increment 2.1: Project creation (Public vs Private).

Increment 2.2: Project view with member filtering (RLS checks).

Test: Can a member see a Public project but NOT a Private one they aren't invited to?

Sprint 4: The Task Cycle & Review Loop

Increment 2.3: Kanban/List board for tasks.

Increment 2.4: Implement "REVERT" and "CORRECT" logic.

Test: If an assignee clicks DONE, does the Assigner get a notification to APPROVE?

Phase 3: Collaboration & Social

Sprint 5: Realtime Project Chat

Increment 3.1: Supabase Realtime chat rooms per project.

Increment 3.2: "Convert Message to Task" feature.

Test: Clicking a message options menu -> "Create Task" -> Auto-fills task description.

Sprint 4: Voice & Notifications

Increment 4.1: Voice note recording (24h TTL logic).

Increment 4.2: Deadline reminder system (pg_cron).

Test: Does the system send an alert 72 hours before a task is due?

Phase 4: The Ecosystem (Opportunity Engine & Stats)

Sprint 6: Cross-Pod Opportunities

Increment 5.1: Opportunities Tab (Nexus Network visibility toggle).

Increment 5.2: Audit Log implementation (History of actions).

Test: If I post a "Hiring" opportunity in Pod A, can a user in Pod B see it?

Sprint 7: Gamification (Momentum)

Increment 6.1: Calculate Momentum Score algorithm.

Increment 6.2: Founder Dashboard with global leaderboards.

Test: Does completing a task increase the Pod's Momentum Score instantly?

Phase 5: Polish & Public Presence

Sprint 8: Mini-Websites & CRM

Increment 7.1: Public Portfolio page (Next.js dynamic routes /[username]).

Increment 7.2: GitHub Sync (fetch repos via API).

Test: Does the profile page show the correct "Contributions" from the task system?