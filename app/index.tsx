// AuthGate in _layout.tsx handles all role-based redirects before <Slot> renders.
// This file is never reached in normal flow but satisfies expo-router's index requirement.
export default function Index() {
  return null;
}
