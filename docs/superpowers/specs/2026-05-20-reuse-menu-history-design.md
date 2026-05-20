# Reuse Menu History Design

## Goal

Allow a family member to reuse a previously confirmed menu from the "菜单历史" section and make it the current "今晚菜单".

## Scope

The first version supports replacing the current tonight menu with one history entry.

Included:

- A `复用` action on each history card.
- A confirmation dialog before replacement.
- Replacing `familyMenuPicker.tonightMenu` with the selected history entry's `goodsList`.
- Jumping to the "今晚菜单" tab after replacement.

Not included:

- Merging history dishes into the current menu.
- Editing history entries.
- Deleting history entries.
- Reusing only selected dishes from a history entry.

## Data Flow

`model/dishes.js` adds a helper such as `reuseMenuHistoryEntry(historyId)`.

The helper:

- finds the history entry by id from `readMenuHistory()`,
- normalizes each goods item to be selected,
- gives each item at least quantity `1`,
- writes the resulting list through `saveTonightMenu()`,
- returns the written menu list.

If the history entry does not exist, it returns an empty list.

## UI

The "菜单历史" card adds a compact `复用` button on the right side of the history header. Tapping it opens a dialog:

```text
替换今晚菜单？
会用这条历史菜单覆盖当前已选菜品。
```

Confirming performs replacement and switches to `/pages/cart/index`.

## Testing

Add a Node regression script with mocked `wx` storage:

- reusing an existing history entry writes its goods list to tonight menu,
- reused goods are selected and have a positive quantity,
- missing history id returns an empty list and does not crash.

Existing menu history and custom dish tests should keep passing.
