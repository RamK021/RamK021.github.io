---
title: "Apex Trigger Best Practices Every Salesforce Developer Should Know"
description: "Learn the essential patterns and anti-patterns for writing clean, bulkified, and maintainable Apex triggers — including the one-trigger-per-object pattern with handler classes."
pubDate: 2026-05-10
tags: ["Apex", "Triggers", "Best Practices"]
mcqs:
  - question: "Which Apex trigger event fires BEFORE a record is committed to the database?"
    options:
      - "after insert"
      - "before insert"
      - "on insert"
      - "pre insert"
    answer: 1
    explanation: "The 'before' trigger events fire BEFORE Salesforce writes the record to the database. This allows you to modify field values on Trigger.new before they are saved — ideal for validation and field defaulting."
  - question: "What is the recommended architectural pattern for Apex triggers?"
    options:
      - "Write all logic directly inside the trigger body"
      - "One trigger per object with a separate handler class"
      - "Multiple triggers per object for each event"
      - "Use Process Builder instead of triggers"
    answer: 1
    explanation: "The one-trigger-per-object pattern with a handler class is the industry standard. Multiple triggers on the same object fire in unpredictable order. A handler class keeps logic testable, readable, and maintainable."
  - question: "Which context variable holds the new version of records in an insert or update trigger?"
    options:
      - "Trigger.old"
      - "Trigger.oldMap"
      - "Trigger.new"
      - "Trigger.newMap"
    answer: 2
    explanation: "Trigger.new is a List<SObject> containing the new values of records being inserted or updated. Trigger.old contains the previous values and is only available in update and delete events."
  - question: "What does 'bulkification' mean in the context of Apex triggers?"
    options:
      - "Adding more fields to an object"
      - "Running SOQL queries inside for loops"
      - "Writing code that handles 1 to 200 records efficiently without hitting governor limits"
      - "Using Batch Apex for all trigger operations"
    answer: 2
    explanation: "Salesforce processes up to 200 records per transaction. Bulkification means writing code that handles all 200 efficiently — using collections and avoiding SOQL/DML inside loops to stay within governor limits."
  - question: "Which of the following is a governor limit violation pattern you must AVOID in triggers?"
    options:
      - "Using collections like Lists and Maps"
      - "Calling a SOQL query inside a for loop"
      - "Using Trigger.newMap for lookups"
      - "Delegating logic to a handler class"
    answer: 1
    explanation: "Putting a SOQL query inside a for loop is the most common governor limit violation. With 200 records, you'd execute 200 queries — far exceeding the 100-SOQL-per-transaction limit, causing a LimitException."
references:
  - title: "Apex Triggers — Salesforce Developer Docs"
    url: "https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers.htm"
  - title: "Apex Triggers — Trailhead Module"
    url: "https://trailhead.salesforce.com/content/learn/modules/apex_triggers"
  - title: "Apex Governor Limits"
    url: "https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_gov_limits.htm"
  - title: "Trigger Handler Pattern — Salesforce Well-Architected"
    url: "https://architect.salesforce.com/design/decision-guides/trigger-automation"
---

Apex triggers are at the heart of Salesforce customization. Done right, they are powerful. Done wrong, they become a maintenance nightmare and a governor limit disaster. This article covers the patterns every Salesforce developer must follow.

## The One Trigger Per Object Rule

Always have **one trigger per Salesforce object**. Multiple triggers on the same object fire in an unpredictable order — you cannot control which one runs first. This leads to bugs that are nearly impossible to debug.

```apex
// Bad — two triggers on Account
trigger AccountTrigger1 on Account (before insert) { ... }
trigger AccountTrigger2 on Account (after insert) { ... }

// Good — one trigger, all events
trigger AccountTrigger on Account (
  before insert, before update, before delete,
  after insert, after update, after delete, after undelete
) {
  AccountTriggerHandler.handle();
}
```

## The Handler Class Pattern

Never write business logic inside the trigger body itself. Move everything into a handler class. This makes code testable, readable, and reusable.

```apex
// AccountTrigger.trigger
trigger AccountTrigger on Account (before insert, after insert, before update) {
  AccountTriggerHandler handler = new AccountTriggerHandler();
  if (Trigger.isBefore && Trigger.isInsert) handler.onBeforeInsert(Trigger.new);
  if (Trigger.isAfter && Trigger.isInsert)  handler.onAfterInsert(Trigger.new, Trigger.newMap);
  if (Trigger.isBefore && Trigger.isUpdate) handler.onBeforeUpdate(Trigger.new, Trigger.oldMap);
}

// AccountTriggerHandler.cls
public class AccountTriggerHandler {
  public void onBeforeInsert(List<Account> newAccounts) {
    for (Account acc : newAccounts) {
      if (String.isBlank(acc.Phone)) {
        acc.addError('Phone number is required.');
      }
    }
  }
}
```

## Bulkification — The Most Critical Rule

Salesforce processes up to **200 records per transaction**. Your trigger must handle all of them efficiently. The golden rule: **never put SOQL or DML inside a for loop**.

```apex
// BAD — SOQL inside loop, will hit governor limits with bulk data
for (Account acc : Trigger.new) {
  List<Contact> contacts = [SELECT Id FROM Contact WHERE AccountId = :acc.Id]; // VIOLATION
}

// GOOD — query once, process in memory
Set<Id> accountIds = Trigger.newMap.keySet();
Map<Id, List<Contact>> contactsByAccount = new Map<Id, List<Contact>>();

for (Contact c : [SELECT Id, AccountId FROM Contact WHERE AccountId IN :accountIds]) {
  if (!contactsByAccount.containsKey(c.AccountId)) {
    contactsByAccount.put(c.AccountId, new List<Contact>());
  }
  contactsByAccount.get(c.AccountId).add(c);
}

for (Account acc : Trigger.new) {
  List<Contact> relatedContacts = contactsByAccount.get(acc.Id);
  // process...
}
```

## Use Trigger.oldMap for Comparisons

When detecting field changes in update triggers, always use `Trigger.oldMap` for efficient lookups instead of looping through `Trigger.old`.

```apex
public void onBeforeUpdate(List<Account> newAccounts, Map<Id, Account> oldMap) {
  for (Account acc : newAccounts) {
    Account oldAcc = oldMap.get(acc.Id);
    if (acc.Rating != oldAcc.Rating) {
      // Rating changed — take action
    }
  }
}
```

## Add Error Messages the Right Way

Use `addError()` on the record (not on a field) when you want to block a save with a clear user message.

```apex
for (Account acc : Trigger.new) {
  if (acc.AnnualRevenue < 0) {
    acc.AnnualRevenue.addError('Annual Revenue cannot be negative.');
  }
}
```

## Summary of Rules

| Rule | Why It Matters |
|---|---|
| One trigger per object | Predictable execution order |
| Use handler classes | Testable, maintainable code |
| No SOQL inside loops | Avoid governor limit exceptions |
| No DML inside loops | Avoid governor limit exceptions |
| Use collections for bulk ops | Handles 200-record batches cleanly |
| Use `Trigger.oldMap` | Efficient field-change detection |

Following these patterns will make your triggers bulletproof, scalable, and easy for any team member to maintain.
