## What this bundle is

Three app-specific screen/header components from the school-app React Native (Expo) app, rendered here via react-native-web: `HeaderRight`, `NotRegisteredScreen`, `CustomHeader`. These are **not general-purpose UI primitives** (no `Button`/`Card`/`Input` kit exists in this app) — they are specific screens/header fragments tied to this app's auth and navigation flow. Compose them as-is; don't invent variants or props beyond each `<Name>.d.ts` contract.

## Wrapping and setup

- **`CustomHeader` requires a react-redux `Provider`** supplying `state.auth = { role: "admin" | "student" | null, userInfo: {...} | null, loading: boolean }` — it calls `useSelector` internally and throws without a Provider ancestor. Read `CustomHeader.prompt.md` for the exact shape. Do not reuse `window.SchoolApp.previewStore` in a real design — it's preview-only fixture data; supply a real store with the same `auth` slice shape.
- `HeaderRight` and `NotRegisteredScreen` need no provider — they render standalone.
- All three render through react-native-web (`View`/`Text`/`Pressable`/etc.), not plain HTML elements — expect `<div>`-based output with react-native-web's atomic class names (`css-view-*`, `css-text-*`), not semantic HTML.

## Styling idiom

**There is no token or utility-class system here.** Styling is plain React Native `StyleSheet`/inline style objects, hardcoded per component (colors, spacing, font weights are literal values in each component's source, e.g. `#111827`, `#4B5563`, `borderRadius: 10`). There is no shared theme, no `var(--*)` custom properties, no class vocabulary to reuse. Match a new composition's look by eye against the rendered previews, not by importing tokens — none exist.

The one shared visual element is the `MaterialCommunityIcons` icon font (`fonts/icons.css`, family `"material-community"`) — `HeaderRight` uses it for its account icon glyph.

## Where the truth lives

- `styles.css` → `fonts/fonts.css` (the icon `@font-face`). There is no static component stylesheet — react-native-web injects its atomic CSS at runtime via the JS bundle itself (`_ds_bundle.css` is an empty runtime-styles stub, expected for this kind of DS).
- Per-component API + usage: `components/general/<Name>/<Name>.d.ts` and `<Name>.prompt.md`.

## Build snippet

```tsx
import { CustomHeader, HeaderRight } from "window.SchoolApp"; // via the bound bundle
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({
  reducer: { auth: (s = { role: "student", userInfo: { fullname: "Asha Verma", class: "8", section: "B" }, loading: false }) => s },
});

<Provider store={store}>
  <CustomHeader>Attendance</CustomHeader>
</Provider>;
```
