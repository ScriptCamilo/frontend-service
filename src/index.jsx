import React from "react";

import CssBaseline from "@material-ui/core/CssBaseline";
import * as Sentry from "@sentry/react";
import mixpanel from "mixpanel-browser";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { unstable_trace as trace } from 'scheduler/tracing';

import App from "./App";
import { getMixpanelToken, getSentryKey } from "./config";
import isValidURL from "./helpers/isValidURL";

Sentry.init({
  dsn: getSentryKey(),
  integrations: [
    new Sentry.BrowserTracing({
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ["deskrio.com.br"],
    }),
    new Sentry.Replay(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

if (isValidURL()) {
	mixpanel.init(getMixpanelToken(), {
		track_pageview: true,
		persistence: 'localStorage'
	})
}

trace('initial render', performance.now(), () => {
  ReactDOM.render(
  <CssBaseline>
		<BrowserRouter>
   		<App />
		</BrowserRouter>
  </CssBaseline>,
  document.getElementById('root'));
});
