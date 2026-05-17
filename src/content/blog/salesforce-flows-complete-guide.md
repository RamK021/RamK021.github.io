---
title: "Mastering Salesforce Flows: When to Use Each Flow Type"
description: "A practical guide to all five Salesforce Flow types — Screen Flows, Auto-launched Flows, Scheduled Flows, Record-Triggered Flows, and Platform Event Flows — with real-world use cases."
pubDate: 2026-05-03
tags: ["Flows", "Automation", "Admin", "No-Code"]
mcqs:
  - question: "Which Flow type is triggered automatically when a record is created, updated, or deleted?"
    options:
      - "Screen Flow"
      - "Scheduled Flow"
      - "Record-Triggered Flow"
      - "Platform Event-Triggered Flow"
    answer: 2
    explanation: "Record-Triggered Flows fire automatically when Salesforce records are created, updated, or deleted. They are the modern replacement for the retired Workflow Rules and Process Builder."
  - question: "Which Flow type is best for collecting input from users step by step?"
    options:
      - "Auto-launched Flow"
      - "Screen Flow"
      - "Scheduled Flow"
      - "Record-Triggered Flow"
    answer: 1
    explanation: "Screen Flows are designed for user interaction. They present a series of screens with input components to guide users through a process step by step — perfect for wizards, data entry forms, and guided processes."
  - question: "What is the recommended approach when choosing between a Flow and an Apex trigger for automation?"
    options:
      - "Always use Apex triggers — they are more powerful"
      - "Always use Flows — they require no code"
      - "Use Flows first; use Apex only when Flows cannot meet the requirement"
      - "Use Process Builder instead"
    answer: 2
    explanation: "Salesforce's official guidance is 'Automate with Flows first, use Apex only when Flows cannot do it.' Flows are admin-maintainable, faster to build, and declarative — saving Apex for truly complex logic."
  - question: "Which Flow element is used to retrieve records from Salesforce?"
    options:
      - "Create Records"
      - "Update Records"
      - "Get Records"
      - "Delete Records"
    answer: 2
    explanation: "The 'Get Records' element retrieves records from Salesforce based on filter criteria you define. 'Create Records', 'Update Records', and 'Delete Records' are separate elements for write operations."
  - question: "Scheduled Flows run on a defined schedule. What is a key limitation to be aware of?"
    options:
      - "They cannot send emails"
      - "They cannot update records"
      - "They process a maximum of 250,000 records per run and are subject to governor limits"
      - "They can only run once per day"
    answer: 2
    explanation: "Scheduled Flows process up to 250,000 records per scheduled run and are subject to Salesforce governor limits. For very large datasets (millions of records), Apex Batch is the more appropriate tool."
references:
  - title: "Flow Builder — Salesforce Help"
    url: "https://help.salesforce.com/s/articleView?id=sf.flow.htm"
  - title: "Automate Your Business Processes — Trailhead"
    url: "https://trailhead.salesforce.com/content/learn/modules/business_process_automation"
  - title: "Flow Best Practices — Salesforce Help"
    url: "https://help.salesforce.com/s/articleView?id=sf.flow_considerations.htm"
  - title: "Record-Triggered Flow — Salesforce Docs"
    url: "https://help.salesforce.com/s/articleView?id=sf.flow_concepts_trigger_record.htm"
---

Salesforce Flows have become the go-to tool for automation — replacing the now-retired Workflow Rules and Process Builder. Understanding which flow type to use for each scenario is a critical skill for both admins and developers.

## The Five Flow Types

### 1. Screen Flow

**Triggered by:** User clicking a button or navigating to a URL  
**User interaction:** Yes

Screen Flows guide users through a step-by-step process using screens with input components. Use them for:
- Guided setup wizards
- Data entry forms with validation
- Customer-facing guided processes in Experience Cloud

**Example:** A "New Case Intake" wizard that collects customer info, classifies the issue, and creates a Case + related records — all without code.

### 2. Auto-launched Flow (No User Interaction)

**Triggered by:** Apex code, API, another Flow, or a button  
**User interaction:** No

These flows run in the background. Use them as reusable sub-processes that other automations can call.

```apex
// Calling an Auto-launched Flow from Apex
Map<String, Object> params = new Map<String, Object>{
  'AccountId' => acc.Id,
  'Status' => 'Active'
};
Flow.Interview.My_Auto_Flow interview = new Flow.Interview.My_Auto_Flow(params);
interview.start();
```

### 3. Record-Triggered Flow

**Triggered by:** Record created, updated, or deleted  
**User interaction:** No

This is the modern replacement for Workflow Rules and Process Builder. It is the most commonly used flow type in development.

**Run options:**
- **Fast Field Updates (Before Save):** Update fields on the triggering record — fastest, no DML count
- **Actions and Related Records (After Save):** Create/update related records, send emails, call subflows

```
Trigger: Account updated
Condition: Rating changed to "Hot"
Action: Create a follow-up Task assigned to the Account Owner
```

**Best Practice:** Use "Before Save" for field updates on the same record. Use "After Save" for everything else.

### 4. Scheduled Flow

**Triggered by:** A defined schedule (daily, weekly, etc.)  
**User interaction:** No

Use Scheduled Flows to batch-process records on a recurring basis.

**Example use cases:**
- Send reminder emails to opportunities closing this week (runs every Monday at 8 AM)
- Set all Leads older than 90 days to "Stale" status (runs nightly)
- Archive old cases (runs monthly)

**Key limitation:** They operate on collections of records and are subject to governor limits. For very large datasets (millions of records), consider Apex Batch instead.

### 5. Platform Event-Triggered Flow

**Triggered by:** A Platform Event message  
**User interaction:** No

These flows respond to real-time Platform Events — useful for event-driven integrations.

**Example:** An external system publishes an `Order_Completed__e` event. The flow listens, finds the related Opportunity, and marks it Closed Won.

## Choosing the Right Flow Type

| Scenario | Flow Type |
|---|---|
| User fills out a guided form | Screen Flow |
| Record created/updated triggers automation | Record-Triggered Flow |
| Nightly data cleanup or batch update | Scheduled Flow |
| Reusable logic called from Apex | Auto-launched Flow |
| Respond to an external system event | Platform Event-Triggered Flow |

## Flow vs Apex: Which to Choose?

Follow this decision order:

1. **Can a Flow handle it?** → Use Flow (faster to build, admin-maintainable)
2. **Is complex logic needed (loops, collections, callouts)?** → Use Apex
3. **Need both simplicity and power?** → Call an Auto-launched Flow from Apex or vice versa

Salesforce's official guidance: **"Automate with Flows first. Use Apex when Flows can't do it."**

## Common Flow Pitfalls

- **Too many DML operations:** Combine actions using collections instead of looping and updating one record at a time
- **Unhandled faults:** Always add a Fault Path to log errors or notify admins
- **Order of execution confusion:** Record-triggered flows fire after Apex triggers by default (in After Save mode)
- **Infinite loops:** A flow updating a record can re-trigger itself — always add an entry condition to prevent this

Mastering Flows means you can deliver powerful automation with zero code — making you valuable to both technical and non-technical stakeholders.
