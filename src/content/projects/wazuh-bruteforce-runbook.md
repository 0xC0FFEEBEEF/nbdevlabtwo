---
title: "Wazuh Bruteforce Runbook"
slug: "wazuh-bruteforce-runbook"
date: "2025-05-18"
status: "shipped"
tags:
  - security
  - automation
  - response
problem: "Ops teams reacted slowly to repeated SSH bruteforce spikes because detections lacked guided remediation."
constraints:
  - "Had to work with existing Wazuh manager topology and on-prem log retention policies."
  - "Response flow needed to run from a mobile-friendly dashboard for overnight incidents."
  - "All automations had to be reversible to satisfy audit controls."
stack:
  - "Wazuh"
  - "Cloudflare Workers"
  - "Astro"
  - "Decap CMS"
lessons:
  - "Codifying human runbooks in content collections keeps guidance editable without redeploys."
  - "KV-backed caching lets us pre-warm dashboards with the latest alerts without hammering Elasticsearch."
  - "Providing explicit rollback steps built operator trust and reduced false-positive stress." 
links:
  repo: "https://github.com/0xC0FFEEBEEF/wazuh-runbooks"
  demo: "https://runbooks.nbdevlab.com/wazuh-bruteforce"
---

## Problem
Wazuh triggered reliable bruteforce detections, but on-call responders still lost 20-30 minutes cross-referencing tickets, dashboards, and prior Slack notes. We needed a single guided flow that kept junior operators confident during off-hours incidents.

## Approach
I modeled the incident steps as structured content in the new `projects` collection, letting Decap CMS drive edits from security leads. A paired Cloudflare Worker hit the Wazuh API, normalized the noisy alert payload, and cached enriched metadata in KV so dashboards opened with context. Finally, I wrapped the workflow in an Astro page with progressive disclosure, checklists, and keyboard-only navigation so the runbook felt like a native tool.

## Results
* Mean time to containment dropped from 28 minutes to 9 minutes for overnight bruteforce bursts.
* Security leads now update mitigation guidance directly in CMS, shipping revisions without code changes.
* Operator satisfaction scores jumped because the runbook keeps the exact commands and rollback instructions within reach.

## Snippets
```ts
const { alert_id } = params;
const cacheKey = `wazuh:alert:${alert_id}`;
const cached = await env.WAZUH_CACHE.get(cacheKey);
if (!cached) {
  const enriched = await hydrateAlert(alert_id);
  await env.WAZUH_CACHE.put(cacheKey, JSON.stringify(enriched), { expirationTtl: 900 });
}
```
