import { LitElement, html } from "@polymer/lit-element";
import { setPassiveTouchGestures } from "@polymer/polymer/lib/utils/settings.js";
import { connect } from "pwa-helpers/connect-mixin.js";
import { installMediaQueryWatcher } from "pwa-helpers/media-query.js";
import { installOfflineWatcher } from "pwa-helpers/network.js";
import { installRouter } from "pwa-helpers/router.js";
import { updateMetadata } from "pwa-helpers/metadata.js";

import "./components/snack-bar";
import "./components/application-header";
import "./components/application-footer";

// redux helpers
import { store } from "./store";
import { navigate, updateOffline, updateLayout } from "./actions/app";

class MyApp extends connect(store)(LitElement) {
  _render({ appTitle, _page, _snackbarOpened, _offline }) {
    return html`
    <!-- Styles -->
    <style>
        :host {        
        display: block;
        --app-primary-color: #E91E63;
        --app-secondary-color: #293237;
        --app-dark-text-color: var(--app-secondary-color);
        --app-light-text-color: white;
        --app-section-even-color: #f7f7f7;
        --app-section-odd-color: white;
      }      
        
      main {
        display: block;
      }

      .main-content {
        padding-top: 64px;
        min-height: 100vh;
      }

      .page {
        display: none;
      }

      .page[active] {
        display: block;
      }

      @media (min-width: 460px) {        
        .main-content {
          padding-top: 107px;
        }      
      }
    </style>

    <!-- Header -->
    <application-header currentPage="${_page}" appTitle="${appTitle}"></application-header>

    <!-- Main content -->
    <main role="main" class="main-content">      
      <welcome-page class="page" active?="${_page === "welcome"}"></welcome-page>
      <counter-page class="page" active?="${_page === "counter"}"></counter-page>
      <shopping-cart class="page" active?="${_page === "shoppingCart"}"></shopping-cart>
      <page-404 class="page" active?="${_page === "404"}"></page-404>      
    </main>
    
    <!-- Footer -->
    <application-footer></application-footer>

    <!-- Snack Bar -->
    <snack-bar active?="${_snackbarOpened}">You are now ${
      _offline ? "offline" : "online"
    }.</snack-bar>    
    `;
  }

  static get properties() {
    return {
      appTitle: String,
      _page: String,
      _snackbarOpened: Boolean,
      _offline: Boolean
    };
  }

  constructor() {
    super();
    // To force all event listeners for gestures to be passive.
    // See https://www.polymer-project.org/3.0/docs/devguide/settings#setting-passive-touch-gestures
    setPassiveTouchGestures(true);
  }

  _firstRendered() {
    installRouter(location =>
      store.dispatch(navigate(window.decodeURIComponent(location.pathname)))
    );
    installOfflineWatcher(offline => store.dispatch(updateOffline(offline)));
    installMediaQueryWatcher(`(min-width: 460px)`, matches =>
      store.dispatch(updateLayout(matches))
    );
  }

  _didRender(properties, changeList) {
    if ("_page" in changeList) {
      const pageTitle = properties.appTitle + " - " + changeList._page;
      updateMetadata({
        title: pageTitle,
        description: pageTitle        
        // This object also takes an image property, that points to an img src.
      });
    }
  }

  _stateChanged(state) {
    this._page = state.app.page;
    this._offline = state.app.offline;
    this._snackbarOpened = state.app.snackbarOpened;
  }
}

window.customElements.define("my-app", MyApp);