---
title: "Lightning Web Components (LWC): A Practical Getting Started Guide"
description: "Build your first Lightning Web Component from scratch — covering component structure, decorators (@api, @track, @wire), event handling, and calling Apex methods."
pubDate: 2026-04-25
tags: ["LWC", "Lightning", "JavaScript", "Frontend"]
mcqs:
  - question: "Which decorator exposes a property or method as public so a parent component can set it?"
    options:
      - "@track"
      - "@wire"
      - "@api"
      - "@public"
    answer: 2
    explanation: "@api makes a property or method public so parent components can pass values down to the child. It is the primary mechanism for parent-to-child communication in LWC. Without @api, properties are private by default."
  - question: "What file extension is used for the template (HTML) of a Lightning Web Component?"
    options:
      - ".lwc"
      - ".html"
      - ".template"
      - ".cmp"
    answer: 1
    explanation: "Every LWC template file uses the .html extension. The file must contain a single root <template> tag. The .cmp extension belongs to Aura components, and .lwc/.template are not valid LWC extensions."
  - question: "Which decorator is used to call an Apex method and automatically wire its result to a property?"
    options:
      - "@api"
      - "@track"
      - "@wire"
      - "@apex"
    answer: 2
    explanation: "@wire automatically subscribes to Salesforce data services or Apex methods. It re-renders the component when data changes without imperative calls. The wired property receives { data, error } automatically."
  - question: "How do child components communicate UP to a parent component in LWC?"
    options:
      - "By directly modifying the parent's properties"
      - "By dispatching a CustomEvent that the parent listens to"
      - "By calling the parent's @api method directly"
      - "Using the @track decorator"
    answer: 1
    explanation: "Child components dispatch CustomEvents using this.dispatchEvent(new CustomEvent('eventname', { detail: data })). The parent listens with oneventname={handlerMethod} in the template. This maintains one-way data flow."
  - question: "What is the correct way to conditionally render an HTML block in LWC?"
    options:
      - "ng-if"
      - "v-if"
      - "lwc:if"
      - "sf:if"
    answer: 2
    explanation: "lwc:if is the LWC-specific directive for conditional rendering, introduced to replace the deprecated if:true and if:false directives. Angular uses ng-if and Vue uses v-if — neither works in LWC."
references:
  - title: "LWC Developer Guide — Salesforce Docs"
    url: "https://developer.salesforce.com/docs/component-library/documentation/en/lwc"
  - title: "Lightning Web Components Basics — Trailhead"
    url: "https://trailhead.salesforce.com/content/learn/modules/lwc-essentials"
  - title: "LWC Component Reference"
    url: "https://developer.salesforce.com/docs/component-library/overview/components"
  - title: "LWC Recipes — GitHub"
    url: "https://github.com/trailheadapps/lwc-recipes"
---

Lightning Web Components (LWC) is Salesforce's modern UI framework built on standard web technologies — HTML, JavaScript, and CSS. If you know web development, LWC will feel familiar. This guide gets you building real components fast.

## LWC Component Structure

Every LWC component is a folder with matching file names:

```
myComponent/
├── myComponent.html       ← Template (required)
├── myComponent.js         ← Controller (required)
├── myComponent.css        ← Styles (optional)
└── myComponent.js-meta.xml ← Configuration metadata (required)
```

## Your First Component

**myComponent.html**
```html
<template>
  <div class="container">
    <h1>Hello, {name}!</h1>
    <lightning-button label="Click Me" onclick={handleClick}></lightning-button>
  </div>
</template>
```

**myComponent.js**
```javascript
import { LightningElement, track } from 'lwc';

export default class MyComponent extends LightningElement {
  name = 'Salesforce Developer';

  handleClick() {
    this.name = 'World';
  }
}
```

**myComponent.js-meta.xml**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
  <apiVersion>59.0</apiVersion>
  <isExposed>true</isExposed>
  <targets>
    <target>lightning__AppPage</target>
    <target>lightning__RecordPage</target>
  </targets>
</LightningComponentBundle>
```

## The Three Key Decorators

### @api — Public Properties

Makes a property or method accessible to a parent component. Use this to pass data **down** from parent to child.

```javascript
import { LightningElement, api } from 'lwc';

export default class ContactCard extends LightningElement {
  @api recordId;    // Parent can pass the record ID
  @api contactName; // Parent can pass the name
}
```

In the parent template:
```html
<c-contact-card record-id={selectedId} contact-name="Ram Kumar"></c-contact-card>
```

### @track — Reactive Object/Array Properties

In modern LWC, primitive properties (string, number, boolean) are reactive by default. Use `@track` only when you need deep reactivity inside objects or arrays.

```javascript
import { LightningElement, track } from 'lwc';

export default class MyForm extends LightningElement {
  @track formData = { name: '', email: '' }; // deep changes tracked

  handleNameChange(event) {
    this.formData.name = event.target.value; // UI re-renders automatically
  }
}
```

### @wire — Connect to Salesforce Data

`@wire` automatically fetches data from Apex or Salesforce wire adapters and re-renders the component when data changes.

```javascript
import { LightningElement, wire, api } from 'lwc';
import getContacts from '@salesforce/apex/ContactController.getContacts';

export default class ContactList extends LightningElement {
  @api accountId;

  @wire(getContacts, { accountId: '$accountId' })
  contacts; // contacts.data and contacts.error are populated automatically
}
```

```html
<template>
  <template lwc:if={contacts.data}>
    <template for:each={contacts.data} for:item="contact">
      <p key={contact.Id}>{contact.Name}</p>
    </template>
  </template>
  <template lwc:if={contacts.error}>
    <p>Error loading contacts.</p>
  </template>
</template>
```

## Conditional Rendering

```html
<template>
  <template lwc:if={isLoading}>
    <lightning-spinner></lightning-spinner>
  </template>
  <template lwc:elseif={hasData}>
    <p>Data loaded!</p>
  </template>
  <template lwc:else>
    <p>No data found.</p>
  </template>
</template>
```

## Event Handling (Child to Parent)

Child components communicate up to parents using **CustomEvents**.

**Child component (childButton.js):**
```javascript
handleSave() {
  const event = new CustomEvent('save', {
    detail: { name: this.name, email: this.email }
  });
  this.dispatchEvent(event);
}
```

**Parent template:**
```html
<c-child-button onsave={handleChildSave}></c-child-button>
```

**Parent JS:**
```javascript
handleChildSave(event) {
  const { name, email } = event.detail;
  console.log('Received from child:', name, email);
}
```

## Calling Apex Imperatively

Use imperative Apex when you need to call a method on demand (e.g., on button click) rather than automatically on load.

```javascript
import { LightningElement } from 'lwc';
import saveRecord from '@salesforce/apex/MyController.saveRecord';

export default class MyForm extends LightningElement {
  async handleSave() {
    try {
      const result = await saveRecord({ name: 'Ram Kumar', email: 'ram@example.com' });
      console.log('Saved:', result);
    } catch (error) {
      console.error('Error:', error.body.message);
    }
  }
}
```

## Quick Reference

| Decorator | Direction | Use Case |
|---|---|---|
| `@api` | Parent → Child | Pass data down to child |
| `@track` | Internal | Deep reactivity for objects/arrays |
| `@wire` | Salesforce → Component | Auto-fetch Apex or adapter data |

LWC's standard web model means your existing JavaScript knowledge transfers directly — no proprietary framework magic. Start small, build one component at a time, and you'll be productive within days.
