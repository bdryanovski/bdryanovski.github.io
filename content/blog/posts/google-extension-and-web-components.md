---
title: "Build Chrome Extension with Web Components"
date: 2021-07-28
slug: "/posts/build-chrome-extension-with-web-components"
tags:
  - post
  - web-components
  - typescript
  - build
---

Let's build a Chrome extension with Web Components. That is what I said last night, and to be honest I never had any idea how to do it. I know that Google Chrome has a way to run complex code inside a isolated sandbox environment, but that is it.

So as always let's set some goals and try to make it work.

* Use WebComponents - going with Lit v2 just because I don't want to have to write from scratch a Web Components framework (yet).
* Don't use any other frameworks or packages
* Keep it super simple and easy to understand
* Build it with a idea that could be used for blueprint for a new project

So I decide to go with `New Tab` extension and will go with the most basic and overly developed type of application, "A todo application". But let start with one big disclaimer - this is super minimal and basic form of "Todo/Task" application, made for a demo purpose - so lot of corner cases and features will be skipped and left for some other time.

#### Create Chrome Manifest

One important thing is the `manifest.json` file - in other terms this is the `package.json` file of Chrome Extensions. Everything that the browser must know about the extension is defined there.

```json:title=public/manifest.json
{
  "manifest_version": 2,
  "name": "Experimental New Tab Extension",
  "version": "0.0.0",
  "description": "Provide playground code",
  "icons": {
    "16": "static/icon16.png",
    "48": "static/icon48.png",
    "128": "static/icon128.png"
  },
  "chrome_url_overrides": {
    "newtab": "index.html"
  },
  "permissions": [
    "storage"
  ]
}
```

The `storage` permission is something that we gonna need later but I'm adding it now so we don't have to scroll back & front to find it later on. Oh and we will need to have some icons for our extension - this is something that I will leave to you to find.

The key thing here is `chrome_url_overrides` and the `newtab` key - this will let us overwrite the `chrome://newtab` and replace it with our `index.html` whatever it does - it's up to you. Right now it does nothing and maybe is time to change it.

#### Index page

```html:title=public/index.html
<!doctype html>
<html>

<head lang='en'>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width'>
  <title>New Tab</title>
</head>

<body>
  <app-component></app-component>
  <script type="module" src='bundle.js'></script>
</body>

</html>
```

And here again we are going too fast and we are not going to see anything cause we need to do two more things, load our extension and write our first component.

To load the extension Google Chrome have awesome documentation on the topic [here](https://developer.chrome.com/extensions/getstarted#unpacked). So I won't cover it today.


#### Root component

Let's create a simple proof of concept component. And test our new extension.

```ts:title=src/main.ts
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("app-component")
export default class AppComponent extends LitElement {
  render() {
    return html`<h1>Howdy!</h1>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-component": AppComponent;
  }
}
```

If we are sure that our extension is loaded into Chrome, opening new tab will greet us with a nice message of `Hawdy`.

Everything is working and there is nothing more that we could do. The End 👋.

Oh you are still here, huh? I want a Todo component that could persist the "todos" in a local storage and show them in a list, let me edit, delete and add new ones. And because I already done this I will start from top to bottom and leave the representation almost for the last step.

I wanted to explore how I could have a root component that could have one goal to keep the data and sync it - something common for a lot of components out there.

#### Re-Inventing the wheel - Redux

For my demo needs I don't need to have everything that redux has to offer. I need something minimal so I gonna write a cheap version of it.

```ts:title=src/store.ts
type Reducers<T> = (data: T[], action: { action: string, data: any; }) => T[];

export default class Store<T> {
  private key: string;
  private data: T[] = [];
  private onUpdateFinish = (_data: any) => { };

  private reducers: Reducers<T> = (data: T[], _action: { action: string, data: any }) => { return data }

  constructor(key: string]) {
    this.data = [];
    this.key = key;
  }

  public dispatch(action: string, data: any) {
    this.data = this.reducers(this.data, { action, data });
    this.sync();
  }

  public onUpdate(callback: (data: T[]) => void) {
    this.onUpdateFinish = callback;

    // eslint-disable-next-line no-undef
    chrome.storage.sync.get([this.key], (result: Record<string, any>) => {
      this.data = result[this.key] || [];
      this.sync();
    });
  }

  public reduce(method: Reducers<T>) {
    this.reducers = method;
  }

  sync() {
    // eslint-disable-next-line no-undef
    chrome.storage.sync.set({ [this.key]: this.data });
    this.onUpdateFinish(this.data);
  }
}
```

`chrome.storage` is the one thing that comes with Chrome Extension API, it's a wrapper around local storage - but also let us sync between Browsers that have the same account - useful for our feature self.

We gonna create this three basic methods that gonna use inside our wrapper component that we don't have at the moment but i'll be adding it later on.

`reduce` is the method that will be used to change the reducer of the store. Or simple term - let us transform the data based on some actions. You know Redix way.

`onUpdate` is our trigger it will return the data after we transform it and let us know when we need to do something else like re-render.

`dispatch` that is easy, trigger some data change on the store.

The class will also hide the `chrome.storage` calls and will only return the data to us. Everything else is just a nice wrapper and TypeScript magic.

So let's define our data model and the reducer.

```ts:title=src/reducer.ts
export const TASK_INSERT_EVENT = "INSERT";
export const TASK_DROP_EVENT = "DROP";
export const TASK_UPDATE_EVENT = "UPDATE";

export type Task = {
  id: string;
  title: string;
  done: boolean;
};

export const reducers = (store: Task[], request: Record<string, any>) => {
  switch (request.action) {
    case TASK_INSERT_EVENT:
      // Add new task on top of the array
      store = [request.data, ...store];
      break;
    case TASK_UPDATE_EVENT:
      store = store.map((task: Task) => {
        if (task.id === request.data.id) {
          return { ...task, ...request.data };
        }
        return task;
      });
      break;
    case TASK_DROP_EVENT:
      store = store.filter((task: Task) => task.id !== request.data.id);
      break;
    default:
      break;
  }

  return store;

}
```

As additional or let's say a safety net we gonna provide a basic polyfill for the `chrome.storage` so we could even try to test our code outside of the browser.

```ts:title=src/chrome-extension.polyfill.ts
// @ts-ignore
if (chrome?.storage === undefined) {

  const methods = {
    // @ts-ignore
    get: (items: string[], callback: (result: Record<string, any>) => void) => {
      // get from local storage
      let result: Record<string, any> = {};
      for (const key in items) {
        result[items[key]] = JSON.parse(window.localStorage.getItem(items[key]) + '');
      }
      callback(result);
    },
    // @ts-ignore
    set(items: { [key: string]: any; }) {
      // set to local storage
      for (const key in items) {
        window.localStorage.setItem(key, JSON.stringify(items[key]));
      }
    }
  }

  // @ts-ignore
  chrome = {
    storage: {
      sync: methods,
      local: methods,
    }
  };
}
```

Now this will work for our development goals, but won't let us sync between browsers - and that's ok for the moment, we don't have a extension that could benefit from that anyway.

#### Wrapper

The component that will be used to wrap the store around the task component and handle all the data changes and re-renders. Starting be reuse the `main.ts` file.

```ts:title=src/main.ts
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import { reducers, Task } from './reducer';

import Store from "./store";

@customElement("app-component")
export default class AppComponent extends LitElement {

  private store!: Store<Task>;

  private tasks: Task[] = [];

  connectedCallback() {
    super.connectedCallback();

    this.store = new Store<Task>('tasks', []);
    this.store.reduce(reducers)

    this.store.onUpdate((data: Task[]) => {
      this.tasks = data;
      this.requestUpdate();
    })
  }

  render() {
    return html`
        <h1>Todo App</h1>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-component": AppComponent;
  }
}
```

Ok so we have something but, how it works ? `this.store` will be our data holder and instance of `Store` class that we already done above. We gonna attach a function to the `onUpdate` method that will be called when the data changes and will trigger `requestUpdate` method to refresh the view.

`the.store.reduce` will get the reducers that we defined into `src/reducer.ts` and will be used to transform the data.

Everything seems to work but we still don't have a todo app at this point. Nothing is creating task and nothing is updating them. So our next goal will be to make the action component that we started all of this.

#### Task Component

So for our task component we gonna need to have a property that will accept `Array of Tasks` from outside and bubble events to our wrapper when we want to change some of them. This way our top component will deal with all data related issues and our simple task component will only solve the view problem.

```ts:title=src/task.component.ts
import { LitElement, html, svg, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { repeat } from 'lit/directives/repeat.js';

import styles from './styles.css';

import { TASK_DROP_EVENT, TASK_INSERT_EVENT, Task, TASK_UPDATE_EVENT } from './reducer';

export const TASKS_EVENT = 'DispatchChanges';

const closeIcon = svg`
<svg
  class="icon"
  fill="none"
  stroke-linecap="round"
  stroke-linejoin="round"
  stroke-width="2"
  viewBox="0 0 24 24"
  stroke="currentColor"
>
  <path d="M6 18L18 6M6 6l12 12"></path>
</svg>
`;

@customElement("app-tasks")
export default class AppTasks extends LitElement {

  static styles = unsafeCSS(styles);

  @property()
  tasks: Task[] = []

  private onEnter(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.createTask();
    }
  }

  private statusChange(id: string, checked: boolean) {
    this.dispatchEvent(new CustomEvent(TASKS_EVENT, {
      detail: {
        action: TASK_UPDATE_EVENT,
        data: { id, done: checked }
      }
    }))
  }

  private createTask() {
    const Entry = this.renderRoot.querySelector('#entry');

    // @ts-ignore
    if (Entry && Entry.value === '') {
      return;
    }

    this.dispatchEvent(new CustomEvent(TASKS_EVENT, {
      detail: {
        action: TASK_INSERT_EVENT,
        data: {
          id: `#${Math.random().toString(36).substr(2, 9)}`,
          // @ts-ignore
          title: Entry.value,
          done: false,
        }
      }
    }));

    // @ts-ignore
    Entry.value = null;
  }

  private editTask(id: string, title: string) {
    this.dispatchEvent(new CustomEvent(TASKS_EVENT, {
      detail: {
        action: TASK_UPDATE_EVENT,
        data: { id, title }
      }
    }))
  }

  private drop(id: string) {
    this.dispatchEvent(new CustomEvent(TASKS_EVENT, {
      detail: {
        action: TASK_DROP_EVENT,
        data: { id }
      }
    }))
  }

  render() {
    return html`
        <div class="container">
          <div class="card">
            <div class="title">Tasks</div>
            <div class="form">
              <input id="entry" type="text" @keyup="${this.onEnter}" placeholder="what is your plan for today" class="input" />
            </div>
            <ul class="tasks">
              ${this.tasks &&
                repeat(this.tasks, (task) => task.id, (task) => html`
                  <li id="${task.id}" class="task">
                    <div class="task-content ${classMap({ "task-done": task.done })}">
                      <input @change=${(e: any)=> this.statusChange(task.id, e.target.checked)}
                      .checked="${task.done}"
                      type="checkbox"
                      />
                      <input type="text" @blur=${(e: any)=> this.editTask(task.id, e.target.value)}
                      .value="${task.title}"
                      class="task-edit"
                      />
                    </div>
                    <button @click=${()=> this.drop(task.id)}>
                      ${closeIcon}
                    </button>
                  </li>`
                )
                }
            </ul>
          </div>
        </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-tasks": AppTasks;
  }
}
```

Our component will dispatch events for every action that we need to do and our wrapper component must handle it. Going with custom event is just so I could show how we could do that and don't mess with some of already defined events.

```ts
// Dispatch Event outside this component
this.dispatchEvent(new CustomEvent(TASKS_EVENT, {
  // Use `detail` to pass data
  detail: {
    // Action for our store
    action: TASK_INSERT_EVENT,
    data: {
      // Generate a random id for every new task
      id: GenerateId(),
      title: Entry.value,
      done: false,
    }
  }
}));
```

This event will be handle by `app-component` and passed inside the store, there it will be added to the store internal copy of the data and in the same time sync with the Chrome internal storage.

#### Modify the App Component

Let's integrate the two components into our app.

```ts:title=src/main.ts
// Add Task Component
import { TASKS_EVENT } from './task.component';

@customElement("app-component")
export default class AppComponent extends LitElement {

  // ...

  // Add additional methods to handle events
  async firstUpdated() {
    const AppTasks = this.renderRoot.querySelector('app-tasks');
    AppTasks?.addEventListener(TASKS_EVENT, this.handleChanges.bind(this))
  }

  private handleChanges(event: any) {
    const { action, data } = event.detail;
    this.store.dispatch(action, data)
  }

  // Update the render method
  render() {
    return html`
        <app-tasks .tasks=${this.tasks}></app-tasks>
    `;
  }
}
```

Now if we render the app we should see our new component working as best friends. Pretty much if this run from the first time - that is a miracle.

The result of all of this is that we have a HOC that will handle all the logic from where the data comes and how the data is modify if needed and let the Task component handle how the data is presented. We gonna have a super basic storage but in the same time a blueprint on how to implement something much more complex.

The how project could be find here in [Github Repository](https://github.com/bdryanovski/chrome-extension-webcomponent) - feel free to modify and use it as a starting point.