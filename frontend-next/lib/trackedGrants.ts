/**
 * Client-side localStorage utility for tracking grants
 * This is a temporary mock implementation until backend is ready
 */

export interface TrackedGrant {
  grantId: string;
  trackedAt: string;
}

export interface UserTrackedGrants {
  userId: string;
  grants: TrackedGrant[];
}

const STORAGE_KEY = 'tracked_grants';

/**
 * Add a grant to the user's tracked list
 */
export function addTrackedGrant(userId: string, grantId: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let data: UserTrackedGrants[] = stored ? JSON.parse(stored) : [];

    // Find user's grants
    let userGrants = data.find(item => item.userId === userId);

    if (!userGrants) {
      // Create new user entry
      userGrants = { userId, grants: [] };
      data.push(userGrants);
    }

    // Check if grant is already tracked
    const alreadyTracked = userGrants.grants.some(g => g.grantId === grantId);

    if (!alreadyTracked) {
      userGrants.grants.push({
        grantId,
        trackedAt: new Date().toISOString(),
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (error) {
    console.error('Error adding tracked grant:', error);
  }
}

/**
 * Get all tracked grants for a user
 */
export function getTrackedGrants(userId: string): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const data: UserTrackedGrants[] = JSON.parse(stored);
    const userGrants = data.find(item => item.userId === userId);

    return userGrants ? userGrants.grants.map(g => g.grantId) : [];
  } catch (error) {
    console.error('Error getting tracked grants:', error);
    return [];
  }
}

/**
 * Remove a grant from the user's tracked list
 */
export function removeTrackedGrant(userId: string, grantId: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const data: UserTrackedGrants[] = JSON.parse(stored);
    const userGrants = data.find(item => item.userId === userId);

    if (userGrants) {
      userGrants.grants = userGrants.grants.filter(g => g.grantId !== grantId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (error) {
    console.error('Error removing tracked grant:', error);
  }
}

/**
 * Check if a grant is tracked by the user
 */
export function isGrantTracked(userId: string, grantId: string): boolean {
  const trackedGrants = getTrackedGrants(userId);
  return trackedGrants.includes(grantId);
}

/**
 * Clear all tracked grants for a user
 */
export function clearTrackedGrants(userId: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    let data: UserTrackedGrants[] = JSON.parse(stored);
    data = data.filter(item => item.userId !== userId);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error clearing tracked grants:', error);
  }
}
