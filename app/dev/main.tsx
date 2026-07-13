// Dev entry: mounts the App against a sample example with in-memory storage and
// an offline transport. A thin switcher bar lets you flip between examples; the
// choice is reflected in the URL (?example=<slug>) so reloads stick.
//
// This file is for local development only — it is never bundled or published.

import { useState } from "react";
import { createRoot } from "react-dom/client";
// Source Tailwind — compiled live by @tailwindcss/vite (serve mode) so new
// utility classes hot-reload without a manual `tailwindcss` rebuild. Production
// uses the prebuilt assets/wireframe.css instead (see vite.config.ts).
import "../styles/index.css";
import "./dev.css";
import { App } from "../src/App";
import { stampModel } from "../src/model/stamp";
import { normalizeModel } from "../src/model/normalize";
import { memoryAdapter } from "../src/ports/storage";
import { createNoopTransport } from "../src/ports/transport";
import { examples, exampleList, defaultExample } from "../examples";

function initialSlug(): string {
  const q = new URLSearchParams(location.search).get("example");
  return q && examples[q] ? q : defaultExample;
}

function Dev() {
  const [slug, setSlug] = useState(initialSlug);

  const pick = (s: string) => {
    setSlug(s);
    const url = new URL(location.href);
    url.searchParams.set("example", s);
    history.replaceState(null, "", url);
  };

  // Fresh model identity + meta + storage per example, so ids and comments never
  // leak across examples. `key={slug}` remounts the App on switch.
  const model = normalizeModel(examples[slug]);
  const meta = stampModel(model);

  return (
    <>
      <div className="wfdev-bar">
        <span className="wfdev-label" title="Development mode - uses in-memory storage and a no-op transport. Comments reset on reload; 'Send feedback' copies to clipboard instead of streaming to an agent.">DEV</span>
        {exampleList.map((e) => (
          <button
            key={e.slug}
            className={slug === e.slug ? "wfdev-on" : ""}
            onClick={() => pick(e.slug)}
          >
            {e.name}
          </button>
        ))}
      </div>
      <div className="wfdev-stage">
        <App
          key={slug}
          model={model}
          meta={meta}
          storage={memoryAdapter()}
          transport={createNoopTransport()}
        />
      </div>
    </>
  );
}

createRoot(document.getElementById("wf-root")!).render(<Dev />);
