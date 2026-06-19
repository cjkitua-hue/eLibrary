// router.js
// Lightweight client-side router for the Virtual Library app
// Responsible for mapping UI states (dashboard, reader, etc.) and coordinating view transitions
export default class Router {
  constructor({ container, eventBus, views }) {
    this.container = container;
    this.eventBus = eventBus;

    // Views are injected modules/components:
    // { dashboard: Dashboard, reader: Reader, bookshelf: Bookshelf, ... }
    this.views = views;

    this.currentView = null;
    this.currentViewName = null;

    this.viewInstances = {};

    this.init();
  }

  init() {
    this.bindEvents();
    this.navigate("dashboard");
  }

  bindEvents() {
    // Open book from dashboard → reader
    this.eventBus.on("dashboard:open-book", (book) => {
      this.navigate("reader", { book });
    });

    // Optional: global back navigation
    this.eventBus.on("router:go-dashboard", () => {
      this.navigate("dashboard");
    });
  }

  navigate(viewName, params = {}) {
    if (!this.views[viewName]) {
      throw new Error(`Router: view "${viewName}" not registered`);
    }

    this.currentViewName = viewName;

    // destroy previous view if it supports cleanup
    if (this.currentView && typeof this.currentView.destroy === "function") {
      this.currentView.destroy();
    }

    // clear container
    this.container.innerHTML = "";

    // reuse instance if already created, otherwise create once
    if (!this.viewInstances[viewName]) {
      this.viewInstances[viewName] = new this.views[viewName]({
        container: this.container,
        eventBus: this.eventBus,
        params
      });
    } else {
      // rehydrate view with new params if it supports it
      const instance = this.viewInstances[viewName];

      if (typeof instance.setParams === "function") {
        instance.setParams(params);
      }
    }

    this.currentView = this.viewInstances[viewName];

    // lifecycle hook
    if (typeof this.currentView.onEnter === "function") {
      this.currentView.onEnter(params);
    }

    this.eventBus.emit("router:navigated", {
      view: viewName,
      params
    });
  }
  getCurrentView() {
    return this.currentViewName;
  }
  backToDashboard() {
    this.navigate("dashboard");
  }
}
