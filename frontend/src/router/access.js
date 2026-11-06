// Shared access rules used by BOTH the route guard and the navigation menu,
// so a link is only shown if the guard would let you through.

/** Collects requirements from every matched route record (parents included). */
export function getRequirements(route) {
  const matched = route.matched || [];
  return {
    requiresAuth: matched.some((r) => r.meta.requiresAuth),
    guestOnly: matched.some((r) => r.meta.guestOnly),
    permissions: [...new Set(matched.flatMap((r) => r.meta.permissions || []))],
    // The closest record that declares roles wins.
    roles: matched.reduce((acc, r) => r.meta.roles || acc, null),
  };
}

/**
 * @returns {{ allowed: boolean, reason?: 'unauthenticated'|'forbidden',
 *             missingPermissions?: string[], requiredRoles?: string[] }}
 */
export function checkAccess(auth, route) {
  const req = getRequirements(route);

  if (req.requiresAuth && !auth.isAuthenticated) {
    return { allowed: false, reason: 'unauthenticated' };
  }

  const missingPermissions = req.permissions.filter((p) => !auth.permissions.includes(p));
  const roleOk = !req.roles || auth.hasRole(req.roles);

  if (missingPermissions.length || !roleOk) {
    return {
      allowed: false,
      reason: 'forbidden',
      missingPermissions,
      requiredRoles: roleOk ? [] : req.roles,
    };
  }
  return { allowed: true };
}
