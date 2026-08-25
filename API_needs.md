1. Downstream Needs: Group 10 (NyumbaHub) consuming GymBuddy

Based on our Part B interview, here is what our downstream partner actually needs from our API.

. Group 10 needs to read membership tiers in order to display local gym amenities and pricing on Langata property listings.

Freshness: Low -Pricing rarely changes hence can be safely cached).

Volume: High -Called every time a user views a Langata house listing).

Authority required: Public- has no sensitive data

 . Group 10 needs to create a user account in order to seamlessly register new tenants for an Evolve Fitness gym membership when they sign a lease and escrow clears.

Freshness: Real-time -Account has to be created instantly to send a welcome email.

Volume: Low- Only called when a successful lease is signed.

Authority required: Private -Requires strict API key/authentication as it involves user personal data.

. Group 10 needs to read the list of trainers in order to showcase active community fitness programs to prospective tenants browsing the neighbourhood.

Freshness: Low -Staff lists don't change daily.

Volume: Medium  -Called when users check neighbourhood details.

Authority required: Public -Trainer profiles and headshots are marketing materials.

.Group 10 needs to read member success stories in order to display verified community testimonials as social proof on their premium property listings.

Freshness: Low -Testimonials are updated occasionally.

Volume: High -Loaded alongside property views.

Authority required: Public -Testimonials are explicitly for public marketing.

2. Upstream Needs: GymBuddy consuming Group 8 (ShieldBox)
1.GymBuddy needs to create an incident report in order to allow gym members to anonymously report broken equipment, safety concerns, or empty sanitizer stations directly to gym management.
   Freshness: Real-time (Reports must be submitted the moment a member clicks send).
   Volume: Low (Occasional usage by gym members).
   Auth: Private/Restricted (Relies on ShieldBox's anonymity architecture).
2.GymBuddy needs to create an evidence file in order to allow members to securely upload photos of broken gym equipment when submitting an issue.
    Freshness: Real-time (Uploaded concurrently with the report).
    Volume: Low (Only used when visual proof is needed).
    Auth: Private (Requires secure upload to prevent exposing metadata).
3.GymBuddy needs to read report categories to accurately populate the issue-selection dropdown when a user opens the reporting form.
    Freshness: Low (System categories rarely change).
    Volume: Medium (Fetched whenever the reporting UI is loaded).
    Auth: Public (List of available categories is non-sensitive).
4.GymBuddy needs to read case statuses to allow members to check if their reported maintenance issues are pending, in review, or resolved.
  Freshness: On demand (Fetched when the user opens their 'My Reports' tab).
  Volume: Low to Medium.
  Auth: Public via unique case code lookup (No user identity attached, preserving anonymity).


3. Sanity Check: GymBuddy Feasibility (All 8 Needs)
Downstream Needs (NyumbaHub):
Looking back at our Week 1 Application Audit, we successfully mapped Downstream Needs 1, 2, 3, and 4 to our existing planned resources. Our audit explicitly lists Memberships, Users, Trainers, and Success Stories as core entities within our application architecture, proving that we are fully capable of serving NyumbaHub's data requests without changing our app's core purpose.z
However, during the interview, Group 10 assumed they could generate "Promo Codes" (e.g., 'NYUMBA20') to offer to prospective house hunters as a perk when they sign a lease. GymBuddy currently does not have a "Promotions" or "Discounts" resource listed in our Week 1 Audit of our app and membership prces are fixed as our initial scope focused strictly on workout logic (Barbell Calculator) and facility access. We are flagging this architectural gapso that everyone is aware. If we agree to support this need for Group 10, we will have to explicitly design a new Promotions resource in our Week 3 endpoint planning with calculation and application-on-payment features.
It is also worth noting that NyumbaHub has zero need for our Barbell Calculator or personal Workout Routines, confirming that we do not need to build API endpoints for those specific internal features.

Upstream Needs (ShieldBox):
While incident reporting wasn't in our original Week 1 audit, integrating ShieldBox's API is entirely possible and highly beneficial for a premium gym application. To support these 4 needs, GymBuddy will need to build two new UI components on our frontend:

A "Report an Issue" form (likely in the footer or user account page) that fetches ShieldBox's categories, allows photo uploads, and POSTs the report.

A "My Maintenance Reports" tab in the user dashboard that fetches the case status from ShieldBox using the returned case code.
Conclusion: We do not need to build backend databases for these features (ShieldBox handles that). We only need to build the frontend forms to call their API, making this 100% feasible and a great value-add to GymBuddy.

Out of Scope: It is also worth noting that NyumbaHub has zero need for our Barbell Calculator or personal Workout Routines, confirming that we do not need to build public-facing endpoints for those specific internal gym features.

4. INTERVIEW REFLECTION
Going into these interviews, we made several assumptions that were immediately challenged. On the downstream side, we assumed a house-hunting platform like NyumbaHub would have little use for a gym application, but we were surprised to learn that they could use our data to “sell” the neighborhood by highlighting premium local amenities, membership options, and fitness programs. Similarly, we assumed a whistleblower platform like ShieldBox would not fit naturally into a gym environment, but we realized that its API could support an anonymous incident and maintenance reporting system for gym members. Another important takeaway was the need to verify exactly what data and actions a partner can support rather than making assumptions based on their application's features.