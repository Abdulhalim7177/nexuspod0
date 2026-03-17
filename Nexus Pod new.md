

## **Phase 1 — Pod Creation & Structure**

**Pod Overview:**  
 A Pod is the main workspace. Each Pod contains:

* Projects  
* Tasks  
* Members  
* Chat  
* Files

**Pod Fields:**

* Pod Title  
* Pod Summary  
* Pod profile picture (optional)  
* Pod Social Media links  
* Auto-generated Nexus Pod Number (NPN)  
   *Example: NP-00123*

Each Pod is fully isolated:

* Separate members  
* Separate tasks  
* Separate files  
* Separate chat

---

## **Phase 2 — User Roles & Permissions**

**Founder / CEO**  
 Full control. Can:

* Create Pods  
* Create Projects  
* Create Tasks  
* Assign Tasks  
* Manage Members  
* View dashboards  
* Manage integrations  
* Promote Admins

**Pod Manager**  
 Can:

* Create projects  
* Edit/delete projects  
* Create tasks  
* Assign tasks  
* Edit tasks  
* View all tasks

Cannot:

* Delete pod  
* Change pod settings  
* Remove members  
* Change roles  
* Delete pod files

**Note:** Only Founder can promote or demote Pod Managers.

**Teams & Team Lead**  
 A pod can have many teams (e.g., Marketing, Design, Customer Support).

Each team has:

* Team Lead (assigned by Pod Manager or CEO/Founder)  
* Team Members

Teams are the smallest work units inside a pod. They enable focused task allocation, chats, and team meetings per team.

**Connections:**

* Pod (branch)  
* Projects  
* Tasks created under projects (team-specific boards: pending → in progress → done)  
* Chat module (team chats, audio calls & meetings)  
* File sharing module (team-only files)  
* Dashboards (team progress view)

**Permissions:**

* Team Leads → can assign roles to their team members.  
* CEO, Founder, Pod Managers, Team Leads → can assign roles  
* Pod Representative → oversight only

**Members**  
 Can:

* View projects  
* Work on assigned tasks  
* Comment on tasks  
* Upload files  
* Chat

Cannot:

* Manage pod structure  
* Create projects (can create tasks only under existing projects)

But A member of one team can be a team lead of another team, a team lead can lead many teams and a member be members of many team.

---

## **Phase 3 — Pod Creation & Onboarding**

**Pod Structure:**

**Step 1 — Founder Creates Pod**

* Founder becomes Pod Manager and  team member and automatically a team lead.  
* Can assign a Pod manager and a team lead

**Step 2 — Members Join**

* Members join via invitation link

---

## **Phase 4 — Project & Task System**

**Projects**  
 Projects are containers for tasks.  
 Fields:

* Project Title  
* Description  
* Pod ID  
* Unlimited projects allowed

**Public Project:**

* Everyone can see tasks.  
* Anyone can comment.  
* Members can assign tasks to themselves.

**Private Project:**

* Only selected members can see tasks.  
* Only selected members can comment.  
* Members can assign tasks only to themselves.  
* Founders/admins can assign tasks to any allowed member.  
* Pod manager cannot assign tasks to founder; founder can assign tasks to admins.

# **Nexus Pod — Project Chat (Design & Behaviour)**

### **Purpose of Project Chat**

Project Chat exists to support collaboration at the project level, not task execution.  
 It is used for:

* Project-wide discussions  
* Planning and coordination  
* Sharing context before tasks are created  
* Cross-functional updates

**Tasks handle execution. Project Chat handles conversation.**

Members can only create tasks under Projects created by Founders, managers or team leads.

So only Founders, managers or team leads can create projects, so everyone and anyone can create tasks under already created projects.

---

### **Where Project Chat Lives**

Every Project automatically has:

* A dedicated Project Chat Room

Project Chat is:

* Separate from **Pod Main Chat**  
* Separate from **Task Comments**  
* Accessed from inside the Project view

---

### **Visibility & Access Rules**

**Who Can See Project Chat?**

* All members added to the Project  
* Even if a member has no tasks assigned, they can still:  
  * Read Project Chat  
  * Participate in discussions  
  * Add and access **files**  
* This ensures:  
  * Transparency  
  * Shared context  
  * No information silos

---

### **Relationship Between Project Chat & Tasks**

**What Project Chat Is Used For:**

* Discussing direction, scope, dependencies, priorities  
* Clarifying responsibilities and timelines  
* Sharing files, links, ideas, and decisions

**What Project Chat Is Not Used For:**

* Task progress tracking  
* Task completion updates  
* Detailed execution discussion (these live in **Task Comments**)

### **Task Creation from Project Chat**

**Create Task from Chat**

* Users can convert a message into a task or create a task directly from Project Chat

**Flow:**

1. Message is selected  
2. “Create Task” action is clicked  
3. Task opens with:  
   * Message content as task description  
   * Linked back to the Project Chat message

**Benefits:**

* Preserves context  
* Eliminates copy-paste chaos

### **Linking Tasks Inside Project Chat**

**Referencing Tasks**

* Users can type `@task` → search and link a task  
* Linked tasks appear clickable  
* Example:

   “@task Homepage UI needs review before Friday

**Task System (Core Feature)**  
 Tasks exist inside projects.

**Task Fields:**

* Required: Title, Description, Due Date, Assignee(s), Priority  
* Optional: Files, Link

**Task Status:**

* Not Started  
* Ongoing  
* Completed

**Status Rules:**

* Founder/Manager → update any task  
* Assignee → update only their tasks

**Task Comments:**  
 Fields: Text, Files (optional), Links (optional), User, Timestamp

**Rules:**

* Files & links require explanation  
* Only commenter and founder/manager can delete comments

---

## **Phase 5 — Task Completion, Review & Approval**

Nexus Pod introduces a **two-way execution and feedback loop** that replaces unclear “done” statuses.

### **Task Lifecycle**

1. **Task Assigned**  
2. Assignee works on the task  
3. Assignee clicks **DONE** (although both assigner and assignee receive alert notification.

### **REVERT Action**

* After clicking **DONE**, a **REVERT** button becomes available.  
* REVERT allows the assignee to submit:  
  1. Description of work done  
  2. Link (optional)  
  3. File upload (optional: documents, images, videos, screenshots)

### **Review by Assigner**

* The assigner receives a notification.  
* The assigner can:  
  * **APPROVE** the task → task is completed  
  * **CORRECT** the task → task is returned for revision

### **Correction Flow**

When correcting a task, the assigner can add:

1. Description   
2. Comments  
3. Links  
4. File uploads  
5. Descriptive feedback  
* Once corrected, the task automatically returns to **INCOMPLETED/PROGRESS** (while in **PROGRESS**, assignee and assigner still receive alert)  
* The assignee revises the work.  
* The assignee clicks **DONE** again.  
* The cycle repeats until **APPROVED**.

**Notifications:**

* Alerts: "Task needs review" after DONE

---

## **Phase 6 — Deadline & Personal Dashboards**

**Deadline Reminder System:**

* First alert: 72 hours before deadline  
* Then: Every 6 hours until deadline  
* Sent to: Assignee & Founder  
* Channels: Email, Push notification  
* Completed tasks → reminders cancelled

**My Tasks Dashboard:**

* Shows tasks assigned to user, due dates, status, priority

**Member Dashboard:**

* Auto-filters tasks assigned to them  
* Shows accessible projects, pod files, group files  
* Shows all members, tasks, public/private projects (only the private project they are part of)   
* Chat access

---

## **Phase 7 — File Sharing, Chat & Notifications**

**File Sharing:**

* Upload in tasks & chat  
* Compressed for mobile access  
* Original stored in cloud  
* Storage depends on Pod tier

**Chat System:**

* Unlimited text chat  
* Voice recording (auto-delete 24h)  
* File sharing, audio calling  
* Online status, typing indicator, read receipts  
* Tagging (@) and pinning messages  
* Future: Google Meet integration  
* People can 1 on 1 DM.

**Notifications:**  
 Triggered by:

* Task assigned  
* Task comment added  
* Task reminder triggered  
* Task submitted for review

---

## **Phase 8 — Dashboards & Founder View**

**Founder Dashboard:**

* All pods, projects, tasks, members & invites  
* File usage, pod stats, all files, chat

**Project Structure Improvements:**

* Milestones & progress tracking  
* Visual progress representation  
* Dedicated project chat with audio call  
* Task creation & linking from chat  
* Project privacy: Public vs Private

---

## **Phase 9 — Accountability & Collaboration Layers**

## **What Is An Audit Log?**

An audit log is a recorded history of important actions taken inside a Pod.

It answers three simple questions:

• What happened?  
 • Who did it?  
 • When did it happen?

That’s it.

It is not a chat. It is not a notification feed. It is an accountability trail.

---

### 2️⃣ **Why Audit Logs Are Extremely Important**

In many startup teams (especially early-stage African teams):

• Tasks disappear  
 • Projects get edited silently  
 • Deadlines change without clarity  
 • Nobody remembers who made the change

This creates:

Confusion  
 Blame  
 Trust erosion

Audit logs remove ambiguity.

Instead of: “Who deleted this?”

You see: “Project deleted by Daniel — Feb 28, 3:45pm.”

No arguments. Just facts.

**Groups:**

* Private/Public discussion rooms  
* Features: Chat, file sharing, audio calls  
* Admin can add members, delete messages, assign admins

**Pod Notes:**

* Individual note & Pod-level notes  
* Use: meeting notes, strategy docs, marketing plans, founder thoughts

# **Opportunity Engine (The Killer Nexus Pod Feature)**

Most project tools only manage **tasks**.

They don’t help founders find:

* collaborators  
* feedback  
* opportunities  
* visibility

But your entire **Nexus Founders Circle idea** is about solving **isolation**.

So the feature becomes:

**Pods helping Pods.**

---

# **🔥 The Feature: Cross-Pod Opportunities**

Inside Nexus Pod there will be a tab:

Opportunities

Users can post things like:

### **Example Posts**

**Looking for Dev**

Startup: AgroChain  
Need: React Developer  
Type: Equity / Paid  
Deadline: 5 days

---

**Looking for Feedback**

Startup: PayFlow  
Need: UI feedback on our landing page  
Time needed: 10 minutes  
Reward: Visibility

---

**Looking for Collaboration**

Startup: LearnStack  
Need: Content creator for launch  
Offer: Revenue share

---

# **🌍 Why this is powerful**

African builders struggle with:

* isolation  
* lack of visibility  
* no support system

Jira solves **task management**.

Nexus Pod would solve **ecosystem building**.

---

# **🧠 How it works technically**

Very simple to build.

### **New database table**

Opportunities

Fields:

Title  
Description  
Pod ID  
Founder ID  
Opportunity Type  
Deadline  
Created At

Types:

Collaboration  
Feedback  
Hiring  
Funding  
Exposure

---

### **Visibility**

Each Pod can choose:

Visibility

☑ Private (only pod members)  
☑ Nexus Network

If **Nexus Network** is selected → visible across Nexus Pods.

**Builder Profiles:**

* Show skills, pods joined, projects, contributions

---

## **Phase 10 — Momentum System**

### 🔥 **Momentum Tracking (Signature Nexus Pod Feature)**

Every Pod has a **Momentum Score**.

This score shows how active and productive the team has been recently.

It updates automatically based on activity.

Example dashboard:

POD MOMENTUM: 78%

Tasks Completed (7 days): 12  
Active Members: 4  
Projects Progressing: 3  
Deadlines Hit: 5

Founders instantly see if the team is **moving forward or slowing down**.

---

### 🧠 **How the Momentum Score Works**

The score can be calculated from simple signals.

### **Example Formula**

Momentum Score \=  
(Tasks Completed × 5\)  
\+ (Tasks Created × 2\)  
\+ (Comments Posted × 1\)  
\+ (Files Uploaded × 2\)  
\+ (Members Active × 3\)

Then normalize to **0–100**.

This turns productivity into a **visible metric**.

---

### 📊 **Momentum Dashboard**

Founder view  show:

Your Pods

AgroChain  
Momentum: 82%  
Last Activity: 3 hours ago

LearnStack  
Momentum: 46%  
Last Activity: 2 days ago  
⚠ Momentum Dropping

This creates **psychological pressure to keep building**.

People naturally want their score to go up.

---

### **🏆 Pod Streaks (Gamification)**

Add streak tracking.

Example:

Build Streak: 12 days

If a team completes at least **1 task per day**, the streak continues.

Lose activity → streak resets.

People hate losing streaks, so they stay active.

### **🌍 Nexus Global Leaderboard**

Across all pods:

Top Builder Pods This Week

1\. AgroChain — Momentum 94%  
2\. LearnStack — Momentum 88%  
3\. PayFlow — Momentum 81%

This gives:

* visibility  
* competition  
* recognition

Perfect for your **Nexus Founders ecosystem**.

---

### **🚀 Weekly Build Report (Automatic)**

Every Monday Nexus Pod can send founders a report.

Example:

Your Weekly Build Report

Tasks Completed: 14  
Tasks Created: 9  
Deadlines Hit: 6  
Momentum Change: \+18%

Your team is moving faster than 72% of pods.

This makes the product feel **intelligent and alive**

---

## **Phase 11 — Mini Website & GitHub Integration**

**Mini Website:**

* Auto-generated portfolio for each user  
* Sections: Header, About, Services, Portfolio, projects   
* Example, [www.abdullah/5Point1Nexus.com](http://www.abdullah/5Point1Nexus.com)   
* Manual project upload initially; later GitHub integration

**GitHub Integration:**

* Connect GitHub, display repos, sync project activity

---

## **Phase 12 — Lightweight CRM & Multi-Founder Governance**

**CRM Modules:**

* Contacts, Deals, Activity Notes  
* Track relationships and deals pipeline

**Multi-Founder Governance:**

* Multiple founders share authority  
* Original founder cannot be removed  
* And no founder can remove other founder  
* Founders can delete their own account   
* But the pod creator remain the original founder   
* Founders can invite new founders

---

## **Phase 13 — Smart Calendar & Operations Hub**

**Smart Calendar & Reminder System:**

* Centralized pod calendar \+ personal calendar per member  
* Tracks tasks, meetings, events, deadlines

**Operations & Documentation Hub (Company OS):**

* Wiki-like documentation area  
* Stores SOPs, operating docs, onboarding, workflows, project docs, meeting notes, recurring processes

---

## **Phase 14 — Teams & Meeting/Event Management**

* Teams can schedule or start instant meetings (audio call)

**Meetings** →  
We'll start with **Google meet** integration.  
Then in phase 3, we'll build ours.

* **Team Meetings** → for team discussions  
* **Group Meetings** → for group discussions  
    
* **Pod Meetings** → for across the whole Pod 

**Event**

* You create an event and it'll be across all the pods in the ecosystem and any one can attend.  
* Also, you can record an event your business need to attend and you'll get a notification, maybe you need to attend a Google meet, you can register it.  
* Notifications for upcoming events: 7 days prior, every 12 hours via push/email


---

## **Phase 15 — Member Profiles**

**Basic Information:**

* Full name, profile picture, bio

**Skills & Expertise:**

* Input or write

**Social Links:**

* Twitter, LinkedIn, Instagram, TikTok, etc

**Interests:**

* What they like

**URL/Website**