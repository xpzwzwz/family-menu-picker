# Family Ordering Mini Program Design

## Goal

Build a first usable WeChat mini program for family meal decisions. The app should let family members browse home dishes, get a balanced random recommendation, add dishes to tonight's menu, and confirm the final menu without payment, delivery, address, coupon, or after-sale flows.

## Existing Project

The project is based on `tdesign-miniprogram-starter-retail`, a native WeChat mini program using JavaScript, WXSS, TDesign components, and mock data under `model/` plus service wrappers under `services/`.

The first implementation should reuse the existing retail structure where it helps:

- `pages/home/home` becomes the decision homepage.
- `pages/category/index` remains the browsing entry.
- `pages/cart/index` becomes tonight's menu.
- `pages/order/order-confirm/index` becomes final menu confirmation.
- Existing goods/cart services can keep their mock-service pattern, but the data and wording should shift from retail products to dishes.

## Product Scope

The first version combines two flows:

1. Basic ordering flow: browse dishes, add dishes, adjust quantity, review tonight's menu, confirm the menu.
2. Family decision flow: show recommended dishes on the homepage, randomize a balanced table, and add the recommendation to tonight's menu.

The homepage should answer "What should we eat tonight?" quickly. It should show three recommended dishes, a randomize action, key tags such as quick, meat, vegetarian, soup, or staple, and a one-tap way to add the recommendation to tonight's menu.

## Data Model

Dish mock data should be local and deterministic. Each dish should include:

- `id`
- `name`
- `category`
- `image`
- `cookMinutes`
- `difficulty`
- `flavor`
- `servings`
- `tags`
- `notes`
- Existing retail-compatible fields where needed, such as `spuId`, `skuId`, `title`, `thumb`, `price`, `quantity`, and `stockQuantity`.

Categories for the first version:

- Quick meals
- Meat dishes
- Vegetarian dishes
- Soup
- Staples
- Takeout backups

## Decision Rules

Random recommendations should prefer a practical dinner set:

- Include at least one meat or protein dish when possible.
- Include at least one vegetarian dish when possible.
- Optionally include soup, staple, or takeout backup.
- Keep the total estimated cooking time visible.
- Avoid recommending only high-effort dishes in the same set.

This logic can stay local in JavaScript. It does not need user accounts, cloud sync, or backend calls in the first version.

## UI Changes

Navigation labels should change from retail language to family meal language:

- Home: `今晚吃什么`
- Category: `菜品`
- Cart: `今晚菜单`
- User center: `我的`

The app should remove or hide retail-only concepts from the primary path: promotions, coupons, shipping, payment, logistics, and after-sales. If removing every unused page is too risky for the first pass, unused routes can remain but should not be surfaced in the main tabs or decision flow.

## Error Handling

Because the first version is local mock data, errors are limited to empty data and failed service promises. Existing loading, retry, toast, and empty-state patterns should be reused. If the menu is empty, the app should point the user back to recommendations or dish browsing.

## Verification

The first implementation is acceptable when:

- The project opens in WeChat DevTools.
- The homepage shows family dinner recommendations.
- Randomizing changes the recommended set.
- A recommendation can be added to tonight's menu.
- Dishes can be browsed by category.
- The tonight menu page shows selected dishes and quantities.
- The confirm page shows the final menu without payment language.
- JavaScript lint or syntax checks pass for changed files where practical.
