# Skill: Booking UX

Goal: short path to Записатися without dead ends.

## Mobile
- Sticky dock after hero CTA exits; hide when `#booking` visible
- Form: name, tel, service select, comment
- Microcopy: admin confirms; no fake instant confirm
- Also expose `tel:` and Instagram

## Desktop
- Header CTA + pairing form with location/hours

## States
idle → validating → sent(demo) → error(fallback contacts)

Never show empty CRM slots as if live unless API connected.
