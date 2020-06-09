import { SetMetadata } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const AllowToRoles = (...roles: ('administrator' | 'user')[]) => {
  return SetMetadata('allow_to_roles', roles);
};
