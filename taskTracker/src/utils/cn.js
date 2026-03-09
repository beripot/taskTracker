// cn.js
// Combines multiple class names into a single string
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}