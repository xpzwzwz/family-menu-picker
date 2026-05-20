# Manage Custom Dishes Design

## Goal

Add a "管理菜品" flow so users can edit or delete custom dishes they previously added.

## Scope

The first version manages custom dishes only. Default built-in dishes remain read-only.

Included:

- A "管理菜品" entry on the "我的菜单" page.
- A custom dish management page listing all custom dishes.
- Editing a custom dish by reusing the existing "新增菜品" form in edit mode.
- Deleting a custom dish after confirmation.

Not included:

- Editing built-in dishes.
- Restoring deleted custom dishes.
- Updating old menu history entries when a custom dish changes.
- Image upload.
- Bulk actions.

## Data Model

`model/dishes.js` remains the single boundary for custom dish storage.

Add helpers:

- `getCustomDishById(id)`
- `updateCustomDish(id, patch)`
- `deleteCustomDish(id)`

Updating preserves the dish id and `isCustom: true`. Deleting removes only the custom dish from `familyMenuPicker.customDishes`.

## Navigation

Add a subpackage page:

```text
pages/dish/manage/index
```

The "我的菜单" action list adds "管理菜品" and navigates to this page.

The existing page:

```text
pages/dish/custom-create/index
```

accepts an optional `id` query parameter. Without `id`, it remains "新增菜品". With `id`, it becomes edit mode:

- title: "编辑菜品"
- button: "保存修改"
- initial form values loaded from the custom dish
- submit calls `updateCustomDish(id, form)`

## UI

The management page is a compact list:

- dish name
- category / cook minutes / difficulty / flavor
- notes when present
- `编辑` and `删除` actions

If there are no custom dishes, show an empty state and a button to go to "新增菜品".

## Validation

Edit mode uses the same validation as add mode:

- name required
- category required
- positive cook minutes required
- difficulty required

## Testing

Add a Node regression script with mocked `wx` storage:

- adding a custom dish still works,
- updating a custom dish preserves id and changes fields,
- deleting a custom dish removes it from custom storage and category queries,
- malformed storage remains safe.

Existing tests for menu history, custom dishes, and reuse history should keep passing.
