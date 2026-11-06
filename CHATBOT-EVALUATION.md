# Panchang help assistant — evaluation

Status: proposal only, no chatbot, model API, account, or tracking added.

## Recommendation

Start with a curated, localized help assistant backed by Guide/FAQ content and deterministic links into the app. Add optional AI only if real support questions show a gap. An almanac's calculated dates must always come from the existing calculation API, never from a model's recollection.

| Consideration | Non-AI help assistant | AI-powered assistant |
| --- | --- | --- |
| Useful questions | Meaning of tithi, month-school differences, finding Settings, backup, PDF, installing the app | Follow-up explanations and differently worded multilingual questions |
| Token use | Zero model tokens | Each request uses prompt, retrieved context, conversation history and generated output; some models also bill reasoning tokens |
| Cost | Existing hosting plus editorial maintenance | Hosting, model inference, rate limiting, monitoring, retrieval and editorial review |
| Reliability | Approved answers, predictable coverage; must say when no match exists | Flexible but can invent ritual rules or dates; needs sourced answers and abstention |
| Privacy | Can run entirely on-device | Text usually leaves the device unless self-hosted; do not send Sankalpa names, addresses, gotra, family details or saved tithis by default |
| Offline use | Local help can work offline | Hosted model needs a connection; a self-hosted model still consumes Worker resources |
| Languages | Professionally reviewed fixed translations | Broad coverage, but Sanskrit and religious nuances still require human review |

## Concrete design

1. A Help entry in Guide with topic buttons and local search. Reuse approved, translated explanations, with links to relevant screens.
2. No claim that a chatbot is a priest, astrologer, or source of guaranteed spiritual results. No personalized predictions or promised success.
3. If later approved, an explicit “Ask AI” action explaining data use. Send only the question and minimal approved reference excerpts. Do not automatically include form fields or precise location.
4. Questions requiring dates call the deterministic Panchang API with explicit user-selected place and date. Responses link back to the calculated day, show calendar school and regional uncertainty, and do not overwrite data.
5. Enforce server-side credentials, request/token limits, daily spend cap, timeout and a non-AI fallback. No API keys in the frontend. Do not log personal questions by default.
6. Evaluate at least 100 representative questions across all supported languages, including incorrect assumptions, unknown regional festivals and adversarial prompts. Review with a knowledgeable practitioner before launch.

## Token budgeting

Example planning assumption, not a vendor quote: 1,500 input tokens (instructions + selected reference + short history) and 350 output tokens per answer. At 10,000 answers/month that is 15 million input and 3.5 million output tokens. Cost = `15 × input price per million + 3.5 × output price per million`, plus any reasoning/tool charges. At hypothetical rates of $1 input / $2 output per million, this is $22/month for inference only. Ten answers per visit or long history multiplies usage. Non-English token counts may differ; measure actual usage before choosing a model. Check current vendor pricing at procurement.

## Backup decision

Clearing cached images is not the same as clearing all website data. Local storage and IndexedDB can be removed by the user. Persistent-storage permission can help against automatic eviction, but is not a backup and cannot override a user's removal of site data. Automatic recovery after complete deletion requires an external copy and a way to identify/authenticate the owner. That would add account recovery, encryption, retention and deletion obligations. Do not introduce device fingerprinting as a workaround.

Implemented first step: versioned JSON export in Settings, explicit-confirmation restore, settings replacement plus non-destructive tithi merge, file validation and size limit. Excludes Sankalpa form fields, ad consent, credentials and cache. User stores the unencrypted file privately in Files/iCloud Drive/another chosen location; the app does not upload it. Cloud sync remains a separate future decision.

## Owners and next actions

- Codex: implement/test localized FAQ if approved; maintain calculation boundaries, privacy isolation, cost controls and evaluation cases.
- Abhishek: decide whether a chatbot is needed after collecting support themes; choose budget/vendor only if AI is warranted; arrange native-language and religious-content review.
- Both: assess help success and unresolved questions before adding inference cost or user accounts.

References: [WHATWG Storage Standard](https://storage.spec.whatwg.org/) and [MDN storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria). These distinguish storage persistence from independent backup.
