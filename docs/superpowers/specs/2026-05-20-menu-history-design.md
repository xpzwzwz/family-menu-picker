# Menu History Design

## Goal

Add a local menu history feature to the family menu picker mini program so each confirmed dinner menu is saved and visible later from the "我的菜单" page.

## Scope

The first version is local-only and read-only:

- Save one history entry whenever the user confirms tonight's menu.
- Keep the newest 20 history entries.
- Show history entries on the existing "我的菜单" tab.
- Do not add cloud sync, deletion, restore-to-menu, or history detail pages yet.

## Data Model

Menu history will be stored in `wx` storage under `familyMenuPicker.menuHistory`.

Each entry contains:

- `id`: stable string based on confirmation time.
- `confirmedAt`: timestamp in milliseconds.
- `goodsList`: confirmed dish goods list.
- `summary`: menu summary with total quantity, total cook minutes, and tags.
- `note`: optional family note.

The existing `familyMenuPicker.lastConfirmedMenu` value remains for quick summary compatibility. Confirming a menu writes both the latest menu and the history list.

## Architecture

History storage helpers live in `model/dishes.js` alongside the existing menu storage helpers. Pages should not parse or maintain history storage directly; they call helper functions.

The confirmation page calls a new `saveConfirmedMenu()` helper after validation. The user center page calls `readMenuHistory()` and renders the newest entries. Formatting for display can stay in the user center page because it is page-specific presentation.

## UI

The "我的菜单" page adds a "菜单历史" section below "最近确认". Each history card shows:

- confirmation time,
- dish count and estimated cook minutes,
- up to three dish names,
- note when present.

If there is no history, the section shows a compact empty state.

## Error Handling

Invalid or missing storage values are treated as an empty history list. Saving history should not break the confirmation flow if old storage data is malformed; the helper will overwrite with a valid bounded array.

## Testing

Add focused Node-based regression checks for `model/dishes.js` by mocking the `wx` storage API:

- `saveConfirmedMenu()` stores latest confirmation and prepends a history entry.
- `readMenuHistory()` returns entries newest-first.
- history is capped at 20 entries.
- malformed storage returns an empty history list.

Existing syntax and mini-program flow checks will still run after implementation.
