# Custom Dishes Design

## Goal

Add a local "新增菜品" feature so the family can add dishes that are not part of the default demo dataset. Custom dishes should appear in dish browsing and participate in dinner recommendations.

## Scope

The first version includes:

- A "新增菜品" entry on the "我的菜单" page.
- A dedicated add-dish page with a simple form.
- Local storage for custom dishes.
- Merging default dishes and custom dishes in category browsing, dish lists, and random recommendations.

The first version does not include editing, deleting, image upload, cloud sync, or ownership/permission controls.

## Form Fields

The add-dish form contains:

- `name`: dish name, required.
- `category`: required, one of 快手菜, 荤菜, 素菜, 汤, 主食, 外卖备选.
- `cookMinutes`: required positive number.
- `difficulty`: required, one of 简单, 中等, 费事.
- `flavor`: optional short text.
- `tagsText`: optional comma-separated tags.
- `notes`: optional note.

Custom dishes use the default dish image for now.

## Data Model

Custom dishes are stored in `wx` storage under `familyMenuPicker.customDishes`.

Each stored dish contains:

- `id`: generated as `custom-<timestamp>`.
- `name`
- `category`
- `image`
- `cookMinutes`
- `difficulty`
- `flavor`
- `servings`
- `tags`
- `notes`
- `isCustom: true`

Invalid storage data is treated as an empty custom dish list.

## Architecture

`model/dishes.js` remains the dish-domain boundary. It will expose helpers for reading and saving custom dishes, and dish query functions will use the merged default-plus-custom list.

Pages should not parse custom dish storage directly. The new add page calls a helper such as `addCustomDish(payload)`. Existing category, dish-list, and recommendation flows continue to call the current model helpers.

## Navigation

The app adds a subpackage page:

```text
pages/dish/custom-create/index
```

The "我的菜单" action list adds an item labeled "新增菜品" that navigates to this page.

## UI

The add page is a practical form, not a marketing page. It uses compact fields, category/difficulty selectors, and a primary save button. After saving, it shows a toast and navigates back to the dish category page so the new dish can be found immediately.

## Validation

Validation is intentionally simple:

- Missing name shows "请输入菜名".
- Missing category shows "请选择分类".
- Missing or invalid cook minutes shows "请输入预计分钟".
- Missing difficulty shows "请选择难度".

Tags are split on Chinese or English commas, trimmed, and empty values are ignored.

## Testing

Add a Node-based regression script with a mocked `wx` storage API:

- `addCustomDish()` saves a valid custom dish with generated id and parsed tags.
- `readCustomDishes()` returns valid stored custom dishes.
- dish list queries include custom dishes in the right category.
- dinner recommendations can include custom dishes through the merged dish pool.
- malformed custom dish storage returns an empty list.

Existing syntax, navigation, and project checks will run after implementation.
