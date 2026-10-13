/**
 * Utility to manage matched real name for anonymous accounts.
 * Once matched, the user is never asked again.
 */

export function getMatchedRealName(userId = null) {
  try {
    if (userId) {
      const userSpecific = localStorage.getItem(`nurai_real_name_${userId}`);
      if (userSpecific && userSpecific.trim()) return userSpecific.trim();
    }
    const generic = localStorage.getItem('nurai_user_real_name');
    if (generic && generic.trim()) return generic.trim();
  } catch (e) {}
  return '';
}

export function setMatchedRealName(userId = null, realName = '') {
  try {
    const clean = (realName || '').trim();
    if (clean) {
      if (userId) {
        localStorage.setItem(`nurai_real_name_${userId}`, clean);
      }
      localStorage.setItem('nurai_user_real_name', clean);
    } else {
      if (userId) {
        localStorage.removeItem(`nurai_real_name_${userId}`);
      }
      localStorage.removeItem('nurai_user_real_name');
    }
  } catch (e) {}
}
