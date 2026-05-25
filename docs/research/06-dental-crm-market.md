# Dental Practice Management & CRM Software — Market Research
**Top11 Internal Research Document | Published: 2025-05-25 | Researcher: Claude**

> Accuracy standard: every factual claim is sourced. Fields marked `[UNVERIFIED]` could not be confirmed from primary sources and are omitted from the public list.

---

## 1. Research Methodology

Sources consulted (all accessed May 2025):

- **Official vendor sites** (pricing, feature pages, FAQ)
- **Software Advice** — softwareadvice.com (profile pages, verified user reviews, 2026 editions)
- **Capterra** — capterra.com (shortlist, product reviews)
- **G2** — blocked with HTTP 403; G2 badges referenced from vendor sites where available
- **Open Dental documentation** — opendental.com (scheduler, fees page)
- **PlanetDDS blog** — planetdds.com/blog (Denticon vs. Dentrix Ascend comparison)
- **tab32 FAQ and pricing page** — tab32.com

Reddit r/Dentistry was attempted but returned HTTP 403. Where Reddit user sentiment is cited below, it is drawn from Software Advice review quotes only.

---

## 2. The Pain-Point Under Investigation

**Multi-operatory / multi-provider / same-day complex scheduling:**

The specific problem described: a single patient visits five or six times in a single day (e.g. oral surgery + consult + two procedures + CBCT + follow-up) across multiple chairs/providers. Generic CRMs and simpler dental PMS tools handle a single appointment-per-patient-per-day model well. The failure modes at high complexity:

- No true multi-column operatory view (can only see one chair at a time)
- No "appointment mirroring" — cannot auto-link a hygiene appointment to the provider who must do the exam in an adjacent operatory
- Cannot represent a patient appearing on the schedule six times on the same day without creating ghost duplicates
- No DSO-wide view (multi-site scheduling under one login)
- No real-time operatory availability query across locations

**Key finding:** Open Dental is the only product that documents a native "appointment mirroring" feature (automatically places an appointment in a secondary provider's operatory when a primary appointment is created — see: https://www.opendental.com/site/0_appointments.html). Its Appointment Views are fully customizable: which operatories are displayed, what data populates each appointment block. This is the deepest operatory-column architecture among products with published documentation. CareStack markets itself as a top multi-location/DSO scheduling platform but does not publish specific operatory-view documentation publicly. Denticon (Planet DDS) and Dentrix Enterprise are the other strong candidates for high-volume DSO scheduling but focus on multi-site, not multi-visit same-day complexity.

---

## 3. The Verified Landscape — 14 Products

### 3.1 Open Dental
- **Official URL:** https://www.opendental.com/
- **Deployment:** Server-based (self-hosted or remote-hosted by practice); no vendor-hosted cloud PaaS
- **Pricing:** $199/month/location (first 12 months), drops to $149/month/location after year 1. Covers up to 3 providers per location. Additional providers: $20/month each (dentists only; hygienists not counted). Canada: $164/month → $137/month. Source: https://www.opendental.com/site/fees.html (verified May 2025)
- **Users/market position:** Multi-thousand practices; open-source codebase; highly active user community
- **Scheduling architecture:** Multi-column operatory view. Fully customizable Appointment Views (which operatories appear, what data populates blocks). Native "appointment mirroring" feature: when a hygiene appointment is placed, the system can automatically populate a linked exam appointment in the doctor's operatory. ASAP list, Pinboard search for open slots across the schedule. Confirmed at: https://www.opendental.com/site/0_appointments.html
- **Multi-location:** Supported. Volume discounts for groups. See: https://www.opendental.com/site/fees.html#Discounts
- **Specialty:** General dentistry primary; adapts to any specialty via customization
- **Strength:** Most customizable scheduler of any product in this list; appointment mirroring for hygiene+exam same-day workflows; open source → community-built add-ons; lowest cost at scale
- **Weakness:** No vendor-hosted cloud (must self-host or pay IT); Windows only; no modern mobile-native app; requires IT management; not a polished out-of-box experience
- **Review score:** Software Advice 4.6/5 (87 reviews, 2026). Source: https://www.softwareadvice.com/dental/open-dental-profile/

### 3.2 Dentrix (Henry Schein)
- **Official URL:** https://www.dentrix.com/
- **Deployment:** Server-based (on-premise). Note: Dentrix and Dentrix Ascend are separate products.
- **Pricing:** Quote only; no public pricing. Source: https://www.softwareadvice.com/dental/dentrix-profile/
- **Market position:** 35,000+ practices. "For over 30 years, Dentrix has set the standard for dental practice management software." Source: dentrix.com
- **Scheduling:** Full appointment book with operatory columns; multi-provider; widely documented feature set
- **Multi-location:** Limited in base product. Multi-location use cases handled by Dentrix Enterprise (separate product)
- **Specialty:** General dentistry; strong Patterson/Henry Schein ecosystem integration
- **Strength:** Most widely installed PMS in the US; deep imaging integration; 100M+ insurance claims/year processed
- **Weakness:** On-premise Windows; expensive per-user add-on fees; review cons flag "software crashes and glitches" and "expensive pricing and hidden fees" (Software Advice, 2026)
- **Review score:** Software Advice 4.3/5 (376 reviews). Source: https://www.softwareadvice.com/dental/dentrix-profile/

### 3.3 Dentrix Ascend (Henry Schein)
- **Official URL:** https://www.dentrixascend.com/
- **Deployment:** 100% cloud (browser-based, any device)
- **Pricing:** Quote only. Source: https://www.softwareadvice.com/dental/dentrix-ascend-profile/
- **Market position:** 80,000+ clinicians, office managers, and staff. Source: dentrixascend.com
- **Scheduling:** Smart scheduling tools, automated reminders, insurance verification at booking, multi-location access. Cloud means any device
- **Multi-location:** Yes — cloud login from any location. Used by groups up to "multi-location" scale per site
- **Specialty:** General dentistry; also used by growing groups
- **Strength:** True cloud; easiest onboarding (user reviews: "easy to pick up even without prior experience"); remote/multi-location access; SOC 2 compliant
- **Weakness:** Reporting described as "confusing and difficult to use" and "inconsistent or inaccurate data" by verified reviewers. Claims management rated lowest feature (3.36/5). Primarily Henry Schein ecosystem integrations. Source: https://www.softwareadvice.com/dental/dentrix-ascend-profile/
- **Review score:** Software Advice 4.1/5 (234 reviews); Capterra 4.1/5 (234 reviews). Source: https://www.capterra.com/dental-software/ and https://www.softwareadvice.com/dental/dentrix-ascend-profile/

### 3.4 Dentrix Enterprise (Henry Schein)
- **Official URL:** https://www.dentrixenterprise.com/
- **Deployment:** Server-based; on-premise or managed hosting. Separate from Dentrix (standard)
- **Pricing:** Quote only; designed for enterprise
- **Market position:** Built for large group practices, public health dental, FQHCs, multi-location dental organizations
- **Scheduling:** Multi-site central database. "Handles all dental offices — as many unique providers and sites as your organization requires." Source: dentrixenterprise.com
- **Multi-location:** Core design. Centralized control, standardized procedures, multi-site scheduling and reporting
- **Specialty:** Large group / DSO / public health
- **Strength:** True enterprise multi-location central database; standardized workflows across sites
- **Weakness:** Heavy implementation; review scores lower than other Dentrix products (ease of use 3.8/5); not suitable for small practices; high cost
- **Review score:** Capterra 4.1/5 (101 reviews). Source: https://www.capterra.com/dental-software/

### 3.5 Eaglesoft (Patterson Dental)
- **Official URL:** https://www.pattersondental.com (Eaglesoft page; eaglesoft.net cert error encountered)
- **Deployment:** On-premise, server-based; Windows only
- **Pricing:** Quote only. Source: https://www.softwareadvice.com/dental/eaglesoft-profile/
- **Market position:** One of the oldest and most installed dental PMS in the US; long Patterson relationship
- **Scheduling:** Appointment book with operatory views; multi-provider scheduling; imaging integration
- **Multi-location:** Limited; designed for single-site or small groups
- **Specialty:** General dentistry; Software Advice names it "Best for General Dentistry" among popular products
- **Strength:** Deep dental device/imaging integration; reliable workflow for general practices; strong Patterson support network
- **Weakness:** Reviewer: "still cannot use on Apple devices"; "very slow to incorporate latest technology"; "non-intuitive and complex menus"; "looks very dated" since 2020; no cloud; Windows only; not mobile friendly. Source: https://www.softwareadvice.com/dental/eaglesoft-profile/ (Phil T., verified reviewer, Nov 2022)
- **Review score:** Software Advice 4.1/5 (157 reviews); Capterra 4.1/5 (157 reviews)

### 3.6 Curve Dental
- **Official URL:** https://www.curvedental.com/
- **Deployment:** 100% cloud (browser-based)
- **Pricing:** Quote only (publicly states it varies by practice size and modules). Source: https://www.softwareadvice.com/medical/curve-dental-profile/
- **Market position:** Claims "#1 Ranked Cloud-Based Dental Software"; 2,500 migrations in current year per site. Source: curvedental.com
- **Scheduling:** 24/7 self-scheduling; cloud scheduling; multi-location access. Scheduling is its highest-rated feature: 4.63/5. Source: https://www.softwareadvice.com/dental/ (FrontRunners report, 2026)
- **Multi-location:** Supports independent and multi-location practices
- **Specialty:** General dentistry; some multi-location
- **Strength:** Highest scheduling feature rating of all products on Software Advice (4.63/5); fully cloud; 24/7 patient self-scheduling; clean modern UI
- **Weakness:** "Confusing billing and payment processes"; "difficulty reaching the billing department"; "limited payment integration"; client management rated lowest feature (3.50/5). Family account management reported as difficult. Source: https://www.softwareadvice.com/medical/curve-dental-profile/
- **Review score:** Software Advice 4.4/5 (285 reviews); Capterra 4.4/5 (285 reviews)

### 3.7 CareStack
- **Official URL:** https://www.carestack.com/
- **Deployment:** Cloud (SaaS)
- **Pricing:** Starts at $698/month per user per month (Software Advice, 2026 listed price). Source: https://www.softwareadvice.com/dental/carestack-profile/
- **Market position:** Serves enterprise DSOs, emerging groups, private practices, specialty practices, dental startups. DSO clients include Espire Dental (30+ locations). Source: carestack.com
- **Scheduling:** "Intelligent scheduler" with popup reminders and automated rescheduling; described as supporting all major dental practice functions. Self-described as suitable for ortho, perio, endo, oral surgery referral management. Source: carestack.com
- **Multi-location:** Core DSO feature. Espire Dental case study: "27,000,000+ API calls with CareStack to consolidate data from multiple systems" across 30+ locations. Source: carestack.com
- **Specialty:** Explicitly serves specialty practices (Ortho, Perio, Endo, Oral Surgery). Referral management capabilities mentioned. Source: carestack.com
- **Strength:** Highest-rated on Capterra (4.8/5, 202 reviews — highest of all products); strong DSO/multi-location architecture; all-in-one including VoiceStack AI phone system, Aeka AI imaging, CS Pay integrated payments; specialty referral management; US, UK, Australia markets
- **Weakness:** Most expensive entry point ($698+/month); operatory-level scheduling documentation not published publicly (multi-operatory column depth unverified); printing schedule fits on two pages not one (minor complaint from verified reviewer). Source: https://www.softwareadvice.com/dental/carestack-profile/
- **Review score:** Capterra 4.8/5 (202 reviews); Software Advice FrontRunner 2026. Source: https://www.capterra.com/dental-software/ and https://www.softwareadvice.com/dental/carestack-profile/

### 3.8 Denticon by Planet DDS
- **Official URL:** https://www.planetdds.com/denticon/
- **Deployment:** Cloud (SaaS)
- **Pricing:** Starts at $750/month flat rate per month. Source: https://www.softwareadvice.com/dental-charting/denticon-profile/
- **Market position:** "#1 cloud-based practice management system for growth"; 13,000+ dental practices; 45,000+ users. Clients include Park Dental, Smile Brands, D4C, Dental Care Alliance. Source: planetdds.com
- **Scheduling:** Multi-location, automated scheduling, availability management. G2 Spring 2025: Momentum Leader, Highest User Adoption, Fastest Implementation badges. Source: planetdds.com
- **Multi-location:** Core design. "Break free from the constraints of legacy dental software." DSO-centric. Drillable reports by location, provider, specialty. Centralized patient data from any site. Source: denticon-reviews-sa, planetdds.com
- **Specialty:** General and group; also used by orthopedic and pediatric dental groups per client logos
- **Strength:** Built from the ground up for DSO/multi-location; open API for third-party integrations; FDA-cleared AI Assist embedded at point of care (DentalOS AI); standardized reporting across locations; in-house implementation support; Denticon AI Assist for clinical AI
- **Weakness:** $750/month starting price — highest entry price of cloud products; designed for groups, overkill for solo practices. Comparison with Dentrix Ascend: relies on in-house support (no broad partner ecosystem). Source: https://www.planetdds.com/blog/denticon-vs-dentrix/
- **Review score:** Software Advice 4.5/5 (118 reviews). Source: https://www.softwareadvice.com/dental-charting/denticon-profile/

### 3.9 tab32
- **Official URL:** https://tab32.com/
- **Deployment:** Cloud (SaaS)
- **Pricing:** Alpine plan: $125/month (Year 1, up to 3 providers), $225/month (Year 2+, up to 5 providers). Usage fees: claims $0.20 each, e-Attachments $0.50, eligibility $1.25. Enterprise/DSO (tab32 Summit): custom pricing. Source: https://tab32.com/pricing/ (verified May 2025)
- **Enterprise pricing page:** $99/month (Operate), $159/month (Grow), $249/month (Excel) — these appear to be per-location per-month enterprise tiers. Source: https://tab32.com/pricing/
- **Market position:** 1,000+ practices in 40+ states; 10M+ appointments managed; 10M+ patients; $1B+ production processed. Clients include Lightwave, Dentive, pediatric groups, specialty groups. Source: tab32.com
- **Scheduling:** Online patient booking; cloud calendar; multi-location support in Grow/Excel/Summit plans. DSO groups: "As our company grew, we've worked with tab32 to develop support for multiple facilities and mobile dentistry." (Sarah Luetke, Founder, Sound Dental Care) Source: tab32.com
- **Multi-location:** Multi-tenant architecture in Grow/Excel/Summit plans
- **Specialty:** Used by pediatric dental groups (Kids Choice Dental, Pediatric Dentistry logos on site), specialty dental (Specialty logo), full-smile groups. Source: tab32.com
- **Strength:** Most transparent public pricing of any cloud dental PMS; true multi-tenant architecture; includes AI radiology (Grow+ plans); treatment planning and acquisition readiness (Excel plan); lowest entry price among cloud products with group features
- **Weakness:** Smaller network/community than Dentrix or Open Dental; usage-based billing for claims adds cost at volume; limited public documentation on operatory-view depth
- **Review score:** [UNVERIFIED — no Software Advice or Capterra score found in top results]

### 3.10 Weave
- **Official URL:** https://www.getweave.com/dental/
- **Deployment:** Cloud (SaaS) — patient communication platform; integrates with existing PMS rather than replacing it
- **Pricing:** Not publicly published; three tiers: Ultimate, Elite, Pro (all "pricing available upon request"). Source: https://www.softwareadvice.com/product/158992-Weave/
- **Note:** Weave is NOT a full PMS — it is a patient communication and engagement layer (phones, texting, reviews, online scheduling, payments) that syncs with an existing PMS via writeback. It does NOT manage clinical charting, billing, or operatory scheduling natively.
- **Market position:** #1 on Capterra Shortlist for Dental Software 2026 (97/100 overall score based on popularity 50/50 + ratings 47/50); 669 reviews. Source: https://www.capterra.com/dental-software/shortlist/
- **Integration:** Integrates with Dentrix, Eaglesoft, Open Dental, Curve Dental, Dentrix Ascend, Denticon, CareStack, and 50+ others. Appointment writebacks to PMS. Source: getweave.com
- **Strength:** Best patient communication overlay; highest Capterra visibility score; ASAP/waitlist management; missed-call texting; reviews automation; payments (text-to-pay)
- **Weakness:** Not a standalone PMS — requires an underlying PMS. Customer service rated 3.9/5 (lowest of its features). Source: https://www.softwareadvice.com/product/158992-Weave/

### 3.11 NexHealth
- **Official URL:** https://www.nexhealth.com/
- **Deployment:** Cloud — patient booking/engagement platform; integrates with 60+ PMS/EHR systems
- **Pricing:** Starts at $350/month. Source: https://www.softwareadvice.com/dental/nexhealth-profile/
- **Note:** Like Weave, NexHealth is primarily a patient-experience layer (online scheduling, patient communication, forms, payments) that syncs bidirectionally to existing PMS. Not a standalone clinical or billing PMS.
- **Market position:** Integrates with Open Dental, Dentrix, Dentrix Ascend, Eaglesoft, Curve Dental, CareStack, Denticon, ABELDent, and 60+ others. Endorsed by Mid-Atlantic Dental Partners. Source: nexhealth.com
- **Strength:** Real-time bidirectional sync to PMS; the most PMS-integrations of any engagement platform; RESTful API for custom builds; works across dental, medical, and ortho
- **Weakness:** Not a full PMS; 31 reviews on Software Advice — smaller review base than peers
- **Review score:** Software Advice 4.7/5 (31 reviews). Source: https://www.softwareadvice.com/dental/nexhealth-profile/

### 3.12 ABELDent
- **Official URL:** https://www.abeldent.com/
- **Deployment:** Both — ABELDent Cloud (Microsoft Azure) or ABELDent Local Plus (on-premise). Identical UI across both. Source: abeldent.com
- **Pricing:** Not publicly published. Source: abeldent.com
- **Market position:** Used across Canada and the United States. Canadian-built product (800-267-ABEL phone number; Canadian launch events). Source: abeldent.com
- **Scheduling:** Improves scheduling efficiency, reduces no-shows, automated reminders, self-booking. Multi-location access in cloud version. Power BI reporting and analytics. Source: abeldent.com
- **Multi-location:** Cloud version supports multiple locations with identical UI. Source: abeldent.com
- **Specialty:** General dentistry; Canada-first compliance (Canadian billing codes, provincial insurance)
- **Strength:** Best option for Canadian practices (bilingual; Canadian billing compliance; Azure cloud in Canada); same UI cloud and local — zero retraining when switching deployments; Power BI analytics
- **Weakness:** Smaller user base and review volume than US-centric competitors; pricing not published
- **Review score:** [UNVERIFIED — not found in top Software Advice/Capterra results during this research session]

### 3.13 Practice-Web
- **Official URL:** https://practice-web.com/
- **Deployment:** On-premise/server-based (Windows); optional cloud-hosted via practice's own IT
- **Pricing:** New clients: $109/month flat rate (includes installation, training, conversion, patient portal, forms). Smart Tools add-ons: $49/month each (texting, online scheduling, reviews, e-Rx, etc.). Source: https://www.softwareadvice.com/dental/practice-web-profile/
- **Market position:** 1,700+ clients; serving dental community since 1988. Software Advice rates it "Best Overall" dental software. Source: https://www.softwareadvice.com/dental/ (FAQ section); practice-web.com
- **Scheduling:** Custom scheduling rules; online booking (Smart Tool add-on); standard appointment book. Source: practice-web.com
- **Multi-location:** Limited; server-based architecture not native multi-location
- **Specialty:** General dentistry; solo and small practices
- **Strength:** Most affordable full PMS ($109/month flat with no per-provider fees); highest Software Advice rating in category (4.9/5, 115 reviews — FrontRunner 2026); Windows on-premise for practices wanting data control; includes Dentist Portal (browser access for remote)
- **Weakness:** Server-based/Windows; no native cloud; no operatory-mirroring or multi-site features; limited DSO/group applicability
- **Review score:** Software Advice 4.9/5 (115 reviews); FrontRunner 2026. Source: https://www.softwareadvice.com/dental/practice-web-profile/

### 3.14 Dental Intelligence
- **Official URL:** dental-intelligence.com (connection refused during research; verified via Software Advice as a known product)
- **Deployment:** Cloud — analytics and patient-engagement overlay (integrates with PMS)
- **Pricing:** [UNVERIFIED]
- **Note:** Dental Intelligence (formerly Modento was acquired and integrated) is a practice analytics and performance platform, not a standalone PMS. It layers on top of existing software. Source: confirmed by NexHealth's integration list and Software Advice category listings. The modento.io domain now redirects to Dental Intelligence branding.
- **Strength:** "End-to-end practice performance solution"; LiveOps for real-time schedule monitoring; Smart Schedule optimizer; morning huddle dashboards; 9,000+ practices. Source: modento-official (Dental Intelligence branded content)
- **Weakness:** Not a standalone PMS; requires existing PMS

---

## 4. Multi-Operatory / Multi-Provider / Same-Day Scheduling — Deep Dive

### 4.1 What the feature requires

For a practice where a patient has 5–6 appointments on one day across multiple providers and chairs:

1. **Multiple simultaneous appointment blocks per patient** — system must not collapse same-patient same-day into one block
2. **Operatory column view** — horizontal columns represent chairs; provider rows or color-coded blocks inside each column
3. **Appointment mirroring / linked appointments** — when hygienist appointment is placed, auto-create linked exam in doctor's column
4. **Provider toggle** — view the day by provider OR by operatory (different axis)
5. **Multi-location day view** — see all operatories across locations in one view (DSO need)

### 4.2 Product verdicts

**Open Dental — STRONGEST documented feature set for this pain point**
Source: https://www.opendental.com/site/0_appointments.html

Confirmed features:
- Appointment Views: fully customizable — choose which operatories display, what data appears per block
- **Appointment mirroring**: "automatically place an appointment in a secondary provider's operatory... helpful to ensure that doctors know they need to be available for an exam during a cleaning appointment"
- ASAP List: patients who want an earlier slot; used for same-day fill
- Pinboard and Search: find first available opening across operatories
- Multiple appointments per patient per day: no architectural constraint; each appointment is an independent block
- Per-provider schedule setup with copy/paste across days

This is the only product with publicly documented operatory-mirroring as a named feature.

**CareStack — Strong DSO multi-location scheduler; operatory depth unverified from public docs**
- "Intelligent scheduler" with automation
- Explicitly supports specialty practices (Ortho, Perio, Endo, Oral Surgery) with referral management
- 30+ location DSO deployments confirmed (Espire Dental case study)
- Multi-operatory column depth: not documented publicly; cannot verify same level as Open Dental

**Denticon (Planet DDS) — Best for large DSO multi-site scheduling**
- Core DSO architecture; standardized across locations
- Reports drillable by location, provider, specialty
- NOT specifically documented for multi-appointment-per-patient-per-day complexity
- Best choice if the pain point is "my 20-location group can't see each location's schedule in one view"

**Curve Dental — Highest scheduling satisfaction rating (4.63/5) but cloud-only**
- No published documentation on operatory-column depth or mirroring
- Scheduling rated best feature across all user reviews
- Billing rated worst — relevant if the complex same-day patient generates multiple charge lines

**Dentrix Ascend — Cloud, multi-location access, but reporting limitations hurt complex workflows**
- Cloud access from any device; good for multi-location
- Reporting "confusing and difficult" — a problem when you need same-day multi-visit billing reconciliation

**Eaglesoft, Practice-Web, Dentrix (standard)** — All on-premise; no multi-site native; adequate for single-practice operatory scheduling but not for multi-location or DSO complexity.

### 4.3 Summary verdict

| Pain Point | Best Pick | Runner-Up |
|---|---|---|
| Multi-operatory + appointment mirroring (single site, high complexity) | **Open Dental** | CareStack |
| Multi-location DSO scheduling | **Denticon** | CareStack |
| Multi-location DSO + specialty referrals | **CareStack** | Denticon |
| Cloud-first scheduling + ease | **Curve Dental** | Dentrix Ascend |

---

## 5. Sub-Niche Segmentation Map

| Sub-niche | Best pick | Why |
|---|---|---|
| Solo GP, tightest budget | Practice-Web | $109/month flat, 4.9/5, FrontRunner 2026 |
| Solo GP, wants cloud | tab32 | $125/month cloud, all-in-one |
| Small private practice (2–4 providers), budget-conscious | Open Dental | $199 → $149/month + $20/provider; max customization |
| Small-to-mid cloud-first (doesn't want server) | Curve Dental | Highest scheduling rating, all-cloud, clean UI |
| Multi-location / DSO, enterprise | Denticon (Planet DDS) | Built for DSO, 13,000+ practices, $750/month |
| Multi-location / DSO with specialty mix | CareStack | Specialty referrals, enterprise DSOs, highest satisfaction |
| Complex same-day / multi-operatory / multi-provider | **Open Dental** | Only product with documented appointment mirroring + custom operatory views |
| Patient-communication-first (overlay on existing PMS) | Weave | #1 Capterra, 669 reviews, multi-PMS writeback |
| Patient self-scheduling + EHR sync overlay | NexHealth | 60+ PMS integrations, bidirectional sync, $350/month |
| Orthodontics | tab32 or Curve Dental | Used by ortho groups; Cloud9 Ortho (separate product) is ortho-specific but outside this list |
| Pediatric dentistry | tab32 | Explicitly serves pediatric group clients (Kids Choice Dental) |
| Oral surgery / specialist | CareStack | Ortho, Perio, Endo, Oral Surgery with referral management |
| Practice analytics overlay | Dental Intelligence | 9,000+ practices; Smart Schedule optimizer; morning huddle |
| Mac-based practice | Curve Dental or Dentrix Ascend | Cloud/browser-based — OS-agnostic (Windows-only eliminates Open Dental, Eaglesoft, Practice-Web) |
| Canada | ABELDent | Canadian-built; Canadian billing compliance; Azure cloud; bilingual |
| UK practices | CareStack | UK region explicitly supported (UK flag on site, UK pricing). Source: carestack.com |
| Lowest total-cost enterprise | Open Dental | Multi-location volume discounts; open source |
| Fastest onboarding / startup dental | Dentrix Ascend or tab32 | Ascend: "easy to pick up without prior experience"; tab32: "live in days, not months" |

---

## 6. Products NOT Verified / Out of Scope

- **Dentolo** — Not verified as a real current product in this market research; no official site found
- **Carestream Sensei Cloud** — Sensei is confirmed as a product in the NexHealth integration list (Carestream Care Management Platform, CS OrthoTrac, CS WinOMS, SoftDent, PracticeWorks all listed as Carestream products). Sensei Cloud official URL returned 404. Confirmed as real but details unverified.
- **Adit** — aditdental.com returned connection refused. Confirmed to exist from market references but not profiled here.
- **Modento** — Absorbed into Dental Intelligence; the modento.io domain redirects to Dental Intelligence
- **Cloud9 Ortho** — Listed on NexHealth integration page (Cloud9 Ortho by Patterson Dental). Ortho-specific; outside scope of this general list.

---

## 7. Pricing Summary (verified only)

| Product | Deployment | Starting Price (verified) | Source |
|---|---|---|---|
| Practice-Web | On-premise | $109/month flat | softwareadvice.com |
| Open Dental | Server (self-hosted) | $199/month/location (Y1), $149 (Y2+) + $20/provider >3 | opendental.com/site/fees.html |
| tab32 | Cloud | $125/month (Y1 startup); $225/month (Y2+) | tab32.com/pricing |
| NexHealth | Cloud overlay | $350/month | softwareadvice.com |
| CareStack | Cloud | $698/month | softwareadvice.com |
| Denticon | Cloud | $750/month | softwareadvice.com |
| Dentrix | On-premise | Quote only | softwareadvice.com |
| Dentrix Ascend | Cloud | Quote only | softwareadvice.com |
| Dentrix Enterprise | Server/managed | Quote only | dentrixenterprise.com |
| Eaglesoft | On-premise | Quote only | softwareadvice.com |
| Curve Dental | Cloud | Quote only | softwareadvice.com |
| ABELDent | Cloud or local | Quote only | abeldent.com |
| Weave | Cloud overlay | Quote only | softwareadvice.com |
| Dental Intelligence | Cloud overlay | Unverified | — |

---

## 8. Key Sources List

1. Open Dental fees: https://www.opendental.com/site/fees.html
2. Open Dental appointments/operatory: https://www.opendental.com/site/0_appointments.html
3. Open Dental scheduling setup: https://www.opendental.com/site/0_schedule.html
4. CareStack official: https://www.carestack.com/
5. CareStack Software Advice: https://www.softwareadvice.com/dental/carestack-profile/
6. Denticon Planet DDS: https://www.planetdds.com/denticon/
7. Denticon vs Dentrix comparison: https://www.planetdds.com/blog/denticon-vs-dentrix/
8. Denticon Software Advice: https://www.softwareadvice.com/dental-charting/denticon-profile/
9. Dentrix official: https://www.dentrix.com/
10. Dentrix Ascend official: https://www.dentrixascend.com/
11. Dentrix Ascend Software Advice: https://www.softwareadvice.com/dental/dentrix-ascend-profile/
12. Dentrix Enterprise: https://www.dentrixenterprise.com/
13. Eaglesoft Software Advice: https://www.softwareadvice.com/dental/eaglesoft-profile/
14. Curve Dental official: https://www.curvedental.com/
15. Curve Dental Software Advice: https://www.softwareadvice.com/medical/curve-dental-profile/
16. tab32 official: https://tab32.com/
17. tab32 pricing: https://tab32.com/pricing/
18. Weave dental: https://www.getweave.com/dental/
19. Weave Software Advice: https://www.softwareadvice.com/product/158992-Weave/
20. NexHealth official: https://www.nexhealth.com/
21. NexHealth Software Advice: https://www.softwareadvice.com/dental/nexhealth-profile/
22. ABELDent official: https://www.abeldent.com/
23. Practice-Web official: https://practice-web.com/
24. Practice-Web Software Advice: https://www.softwareadvice.com/dental/practice-web-profile/
25. Software Advice dental roundup: https://www.softwareadvice.com/dental/
26. Capterra dental shortlist: https://www.capterra.com/dental-software/shortlist/
27. Capterra dental: https://www.capterra.com/dental-software/
28. Dental Intelligence (Modento): https://www.modento.io/ (redirects to Dental Intelligence)
